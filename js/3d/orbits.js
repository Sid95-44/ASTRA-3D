/**
 * orbits.js
 * ------------------------------------------------------------------------
 * Draws the elliptical orbit path for each planet as a thin line loop, so
 * users can see the trajectory a planet will travel, not just its current
 * position. Also exposes a toggle for the "Orbital paths" layer checkbox.
 * ------------------------------------------------------------------------
 */
import * as THREE from "three";
import { PLANET_ORDER, SCALE, CELESTIAL_BODIES } from "../data/dataManager.js";
import { generateOrbitPathPoints } from "../physics/orbitalMechanics.js";

export function createOrbitPaths(scene) {
  const orbitLines = {};
  const group = new THREE.Group();
  group.name = "orbit-paths";
  scene.add(group);

  for (const id of PLANET_ORDER) {
    const data = CELESTIAL_BODIES[id];
    const orbitRadius = SCALE.orbitDisplayRadius[id];
    const points2D = generateOrbitPathPoints(orbitRadius, data.eccentricity, 160);

    const points3D = points2D.map((p) => new THREE.Vector3(p.x, 0, p.z));
    const geometry = new THREE.BufferGeometry().setFromPoints(points3D);
    const material = new THREE.LineBasicMaterial({
      color: 0x35506a,
      transparent: true,
      opacity: 0.55,
    });
    const line = new THREE.LineLoop(geometry, material);
    line.userData.bodyId = id;
    group.add(line);
    orbitLines[id] = line;
  }

  return { group, orbitLines };
}

export function setOrbitPathsVisible(group, visible) {
  group.visible = visible;
}

/** Highlights the orbit line belonging to the currently-selected body. */
export function setActiveOrbit(orbitLines, activeId) {
  for (const [id, line] of Object.entries(orbitLines)) {
    const isActive = id === activeId;
    line.material.color.set(isActive ? 0x4fd6e8 : 0x35506a);
    line.material.opacity = isActive ? 0.95 : 0.4;
  }
}