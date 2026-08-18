/**
 * lighting.js
 * ------------------------------------------------------------------------
 * A single strong point light at the Sun's position (the actual light
 * source for the Solar System), plus a very low ambient fill so the
 * night sides of planets aren't pure black — a visualization concession
 * for readability, not a physical claim.
 * ------------------------------------------------------------------------
 */
import * as THREE from "three";

export function createLighting(scene) {
  const sunLight = new THREE.PointLight(0xfff2d6, 3.2, 0, 0); // no distance falloff cutoff
  sunLight.position.set(0, 0, 0);
  scene.add(sunLight);

  const ambient = new THREE.AmbientLight(0x1a2230, 1.1);
  scene.add(ambient);

  // Faint rim/fill so the far side of the scene reads as more than silhouette.
  const fill = new THREE.HemisphereLight(0x223355, 0x050608, 0.25);
  scene.add(fill);

  return { sunLight, ambient, fill };
}