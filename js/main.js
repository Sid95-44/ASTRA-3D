/**
 * main.js
 * ------------------------------------------------------------------------
 * ASTRA 3D — Milestone 1 entry point.
 *
 * Responsibilities:
 *   1. Boot the Three.js scene, camera, lighting, and starfield.
 *   2. Build the Sun + planets from real reference data.
 *   3. Wire the DOM chrome (panels, docks, toggles) to that scene.
 *   4. Run a single render/simulation loop, driven by TimeSystem.
 *
 * Nothing here does physics or DOM string-building directly — those live
 * in physics/, data/, and ui/ respectively. main.js is orchestration only.
 * ------------------------------------------------------------------------
 */
import * as THREE from "three";

import { createScene, createRenderer, createStarfield, bindResize } from "./3d/scene.js";
import { createCamera, createControls, CameraFocuser } from "./3d/camera.js";
import { createLighting } from "./3d/lighting.js";
import { createCelestialBodies, updateCelestialBodies } from "./3d/planets.js";
import { createOrbitPaths } from "./3d/orbits.js";

import { TimeSystem } from "./systems/timeSystem.js";

import { renderObjectList, renderInfoPanel } from "./ui/panels.js";
import {
  setupSelection,
  applySelection,
  setupTimeDock,
  setupViewDock,
  setupLayerToggles,
  setupFpsReadout,
} from "./ui/controls.js";

// --------------------------------------------------------------------------
// Loading screen helper
// --------------------------------------------------------------------------
const loadingFill = document.getElementById("loading-bar-fill");
const loadingStatus = document.getElementById("loading-status");
const loadingScreen = document.getElementById("loading-screen");

function setLoading(percent, statusText) {
  loadingFill.style.width = `${percent}%`;
  if (statusText) loadingStatus.textContent = statusText;
}

async function boot() {
  setLoading(10, "Initializing renderer…");

  const canvas = document.getElementById("astra-canvas");
  const scene = createScene();
  const renderer = createRenderer(canvas);
  const camera = createCamera();
  const controls = createControls(camera, renderer.domElement);
  const focuser = new CameraFocuser(camera, controls);

  setLoading(30, "Building starfield…");
  scene.add(createStarfield());

  setLoading(45, "Placing light sources…");
  createLighting(scene);

  setLoading(60, "Constructing Solar System bodies…");
  const registry = createCelestialBodies(scene);
  const { group: orbitGroup, orbitLines } = createOrbitPaths(scene);

  setLoading(80, "Wiring interface…");
  const timeSystem = new TimeSystem();

  renderObjectList(document.getElementById("object-list"), handleSelect);
  setupTimeDock(timeSystem);
  const viewDockButtons = setupViewDock({ onSelect: handleSelect, onReset: resetView });
  setupLayerToggles({ orbitGroup, registry });
  const sampleFps = setupFpsReadout();

  const stopSelection = setupSelection({
    canvas: renderer.domElement,
    camera,
    registry,
    orbitLines,
    onSelect: handleSelect,
  });

  const stopResize = bindResize(renderer, camera);

  let selectedId = null;

  function handleSelect(bodyId) {
    selectedId = bodyId;
    applySelection(bodyId, { registry, orbitLines, focuser, viewDockButtons });
  }

  function resetView() {
    selectedId = null;
    renderInfoPanel(null);
    document.querySelectorAll(".object-row").forEach((el) => el.classList.remove("is-selected"));
    viewDockButtons.forEach((btn) => btn.classList.remove("is-active"));
    Object.values(registry).forEach((b) => b.halo && (b.halo.material.opacity = 0));
    focuser.focusOn(registry.sun.mesh, 62);
    controls.target.set(0, 0, 0);
  }

  // Default selection: Earth, matching the initial "is-active" state in the HTML.
  handleSelect("earth");

  setLoading(100, "Ready.");
  setTimeout(() => loadingScreen.classList.add("is-hidden"), 350);

  // ------------------------------------------------------------------------
  // Render / simulation loop
  // ------------------------------------------------------------------------
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);

    const dt = Math.min(clock.getDelta(), 0.1); // clamp to avoid huge jumps on tab-switch
    const prevElapsedDays = timeSystem.elapsedDays;
    timeSystem.tick(dt);
    const deltaSimDays = timeSystem.elapsedDays - prevElapsedDays;

    updateCelestialBodies(registry, timeSystem.elapsedDays, deltaSimDays);

    focuser.update(dt);
    if (!focuser.active) controls.update();

    renderer.render(scene, camera);
    sampleFps();
  }
  animate();

  // Expose a couple of things for debugging in the browser console.
  window.__ASTRA__ = { scene, camera, registry, timeSystem };
}

boot().catch((err) => {
  console.error("ASTRA 3D failed to start:", err);
  setLoading(100, "Failed to start — see console for details.");
});