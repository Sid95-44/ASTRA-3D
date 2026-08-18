/**
 * planets.js
 * ------------------------------------------------------------------------
 * Builds the Sun and eight planets as Three.js meshes using the
 * visualization scale defined in dataManager.js, and advances their
 * positions each frame from the orbital mechanics helper.
 *
 * Selection support: each mesh gets `userData.bodyId` so raycasting in
 * controls.js can map a click straight back to CELESTIAL_BODIES[id].
 * ------------------------------------------------------------------------
 */
import * as THREE from "three";
import { CELESTIAL_BODIES, PLANET_ORDER, SCALE } from "../data/dataManager.js";
import { computeOrbitPosition } from "../physics/orbitalMechanics.js";

// Compressive radius curve so Mercury and Jupiter are both readable in the
// same scene. Explicitly a *display* transform — real radiusKm is preserved
// in CELESTIAL_BODIES and shown as-is in the info panel.
function scaledPlanetRadius(radiusKm) {
  const earthRadiusKm = CELESTIAL_BODIES.earth.radiusKm;
  const ratio = radiusKm / earthRadiusKm;
  const compressed = Math.pow(ratio, 0.42); // power curve compresses gas giants
  const earthDisplayRadius = 0.9;
  const raw = compressed * earthDisplayRadius;
  return THREE.MathUtils.clamp(raw, SCALE.planetRadiusMin, SCALE.planetRadiusMax);
}

/**
 * Creates all celestial body meshes and adds them to the scene.
 * Returns a registry keyed by body id with mesh + orbit metadata, used by
 * the update loop and by selection/focus logic.
 */
export function createCelestialBodies(scene) {
  const registry = {};

  // -- Sun ---------------------------------------------------------------
  const sunData = CELESTIAL_BODIES.sun;
  const sunGeometry = new THREE.SphereGeometry(SCALE.sunDisplayRadius, 48, 48);
  const sunMaterial = new THREE.MeshBasicMaterial({ color: sunData.color });
  const sunMesh = new THREE.Mesh(sunGeometry, sunMaterial);
  sunMesh.userData.bodyId = "sun";
  scene.add(sunMesh);

  // Soft glow sprite behind the Sun (cheap fake bloom).
  const glowTexture = createRadialGlowTexture();
  const glowMaterial = new THREE.SpriteMaterial({
    map: glowTexture,
    color: 0xfff2c8,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const glowSprite = new THREE.Sprite(glowMaterial);
  glowSprite.scale.setScalar(SCALE.sunDisplayRadius * 7);
  sunMesh.add(glowSprite);

  const sunLabel = createLabelSprite(sunData.name);
  sunLabel.position.set(0, SCALE.sunDisplayRadius * 1.6, 0);
  sunMesh.add(sunLabel);

  registry.sun = {
    id: "sun",
    mesh: sunMesh,
    label: sunLabel,
    displayRadius: SCALE.sunDisplayRadius,
    orbitRadius: 0,
  };

  // -- Planets -------------------------------------------------------------
  for (const id of PLANET_ORDER) {
    const data = CELESTIAL_BODIES[id];
    const displayRadius = scaledPlanetRadius(data.radiusKm);
    const orbitRadius = SCALE.orbitDisplayRadius[id];

    const pivot = new THREE.Group(); // orbit pivot at the Sun
    scene.add(pivot);

    const geometry = new THREE.SphereGeometry(displayRadius, 40, 40);
    const material = new THREE.MeshStandardMaterial({
      color: data.color,
      roughness: 0.85,
      metalness: 0.05,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.userData.bodyId = id;
    mesh.position.set(orbitRadius, 0, 0);
    pivot.add(mesh);

    // Small axial tilt / rotation indicator ring (very subtle) — purely
    // decorative selection halo, hidden until selected (see controls.js).
    const haloGeometry = new THREE.RingGeometry(displayRadius * 1.35, displayRadius * 1.5, 48);
    const haloMaterial = new THREE.MeshBasicMaterial({
      color: 0x4fd6e8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0,
    });
    const halo = new THREE.Mesh(haloGeometry, haloMaterial);
    halo.rotation.x = Math.PI / 2.4;
    mesh.add(halo);

    // Saturn's rings, since the brief calls out a visually distinct scene.
    let ringMesh = null;
    if (id === "saturn") {
      ringMesh = createSaturnRings(displayRadius);
      mesh.add(ringMesh);
    }

    // Floating name label (billboard sprite), toggled by the "Object labels" layer.
    const label = createLabelSprite(data.name);
    label.position.set(0, displayRadius * 1.9 + 0.6, 0);
    mesh.add(label);

    registry[id] = {
      id,
      mesh,
      pivot,
      halo,
      label,
      displayRadius,
      orbitRadius,
      eccentricity: data.eccentricity,
      orbitalPeriodDays: data.orbitalPeriodDays,
      rotationPeriodDays: data.rotationPeriodDays,
      // Spread starting phases around the circle so planets don't launch aligned.
      phaseOffset: PLANET_ORDER.indexOf(id) * 0.9,
    };
  }

  return registry;
}

function createLabelSprite(text) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const fontSize = 40;
  ctx.font = `500 ${fontSize}px 'Space Grotesk', sans-serif`;
  const width = Math.ceil(ctx.measureText(text).width) + 24;
  const height = fontSize + 20;
  canvas.width = width;
  canvas.height = height;

  ctx.font = `500 ${fontSize}px 'Space Grotesk', sans-serif`;
  ctx.fillStyle = "rgba(231,236,242,0.92)";
  ctx.textBaseline = "middle";
  ctx.fillText(text, 12, height / 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthTest: false,
  });
  const sprite = new THREE.Sprite(material);
  const scale = 0.014;
  sprite.scale.set(width * scale, height * scale, 1);
  sprite.userData.isLabel = true;
  sprite.renderOrder = 999;
  return sprite;
}

/**
 * Advances every planet's orbital position and axial rotation.
 * @param {number} elapsedDays - total simulated days since epoch (drives orbit position).
 * @param {number} deltaSimDays - simulated days advanced THIS frame (drives axial spin rate).
 */
export function updateCelestialBodies(registry, elapsedDays, deltaSimDays) {
  for (const id of PLANET_ORDER) {
    const body = registry[id];
    const { x, z } = computeOrbitPosition(
      body.orbitRadius,
      body.eccentricity,
      body.orbitalPeriodDays,
      elapsedDays,
      body.phaseOffset
    );
    body.mesh.position.set(x, 0, z);

    if (body.rotationPeriodDays) {
      const dir = Math.sign(body.rotationPeriodDays) || 1;
      const rotationFraction = deltaSimDays / Math.abs(body.rotationPeriodDays);
      body.mesh.rotation.y += rotationFraction * Math.PI * 2 * dir;
    }
  }

  // Sun self-rotation for a touch of life (not physically driven by sim time).
  registry.sun.mesh.rotation.y += 0.0015 * Math.max(deltaSimDays, 0.001);
}

function createSaturnRings(planetRadius) {
  const inner = planetRadius * 1.3;
  const outer = planetRadius * 2.3;
  const geometry = new THREE.RingGeometry(inner, outer, 64, 1);

  // RingGeometry UVs aren't ideal for radial gradients; remap radially.
  const pos = geometry.attributes.position;
  const uv = geometry.attributes.uv;
  const v3 = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v3.fromBufferAttribute(pos, i);
    const radius = v3.length();
    const t = (radius - inner) / (outer - inner);
    uv.setXY(i, t, 1);
  }

  const material = new THREE.MeshBasicMaterial({
    color: 0xd8c9a3,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.75,
  });
  const ring = new THREE.Mesh(geometry, material);
  ring.rotation.x = Math.PI / 2.15;
  return ring;
}

function createRadialGlowTexture() {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, "rgba(255,242,200,0.9)");
  gradient.addColorStop(0.35, "rgba(255,220,150,0.35)");
  gradient.addColorStop(1, "rgba(255,200,120,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}