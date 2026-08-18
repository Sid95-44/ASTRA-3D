/**
 * scene.js
 * ------------------------------------------------------------------------
 * Owns the Three.js Scene and WebGLRenderer, plus the starfield backdrop.
 * Keeps rendering setup isolated from simulation/physics logic (see
 * project performance guidelines: separate simulation from rendering).
 * ------------------------------------------------------------------------
 */
import * as THREE from "three";

export function createScene() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x03040a);
  scene.fog = new THREE.FogExp2(0x03040a, 0.0009);
  return scene;
}

export function createRenderer(canvas) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    logarithmicDepthBuffer: true, // scene spans small planets to huge orbit radii
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  return renderer;
}

/**
 * Builds a starfield of small points distributed on a large sphere shell,
 * used as a lightweight, GPU-cheap background (no big texture required).
 */
export function createStarfield(count = 6000, radius = 4000) {
  const positions = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    // Uniform distribution on a sphere shell.
    const u = Math.random();
    const v = Math.random();
    const theta = 2 * Math.PI * u;
    const phi = Math.acos(2 * v - 1);
    const r = radius * (0.85 + Math.random() * 0.15);

    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

  const material = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 1.4,
    sizeAttenuation: false,
    transparent: true,
    opacity: 0.85,
  });

  return new THREE.Points(geometry, material);
}

/** Handles canvas + camera resizing on window resize. */
export function bindResize(renderer, camera) {
  function onResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener("resize", onResize);
  return () => window.removeEventListener("resize", onResize);
}