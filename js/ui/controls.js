/**
 * controls.js
 * ------------------------------------------------------------------------
 * Wires DOM chrome (time dock, view dock, layer toggles, canvas clicks) to
 * the 3D scene, the TimeSystem, and the info/object-list panels. This is
 * the "glue" layer — it owns no simulation state of its own.
 * ------------------------------------------------------------------------
 */
import * as THREE from "three";
import { CELESTIAL_BODIES, PLANET_ORDER } from "../data/dataManager.js";
import { renderInfoPanel, setSelectedRow } from "./panels.js";
import { setActiveOrbit, setOrbitPathsVisible } from "../3d/orbits.js";

export function setupSelection({ canvas, camera, registry, orbitLines, onSelect }) {
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();

  const pickableMeshes = Object.values(registry).map((b) => b.mesh);

  function handlePointerDown(event) {
    const rect = canvas.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(pickableMeshes, false);
    if (hits.length > 0) {
      const id = hits[0].object.userData.bodyId;
      if (id) onSelect(id);
    }
  }

  canvas.addEventListener("pointerdown", handlePointerDown);
  return () => canvas.removeEventListener("pointerdown", handlePointerDown);
}

/** Applies a selection: updates info panel, list highlight, orbit highlight, and halo. */
export function applySelection(bodyId, { registry, orbitLines, focuser, viewDockButtons }) {
  renderInfoPanel(bodyId);
  setSelectedRow(bodyId);
  setActiveOrbit(orbitLines, bodyId === "sun" ? null : bodyId);

  for (const [id, body] of Object.entries(registry)) {
    if (body.halo) {
      body.halo.material.opacity = id === bodyId ? 0.9 : 0;
    }
  }

  viewDockButtons.forEach((btn) => {
    btn.classList.toggle("is-active", btn.dataset.target === bodyId);
  });

  const body = registry[bodyId];
  if (body && focuser) {
    const viewDistance = Math.max(body.displayRadius * 6, 4);
    focuser.focusOn(body.mesh, viewDistance);
  }
}

/** Wires the bottom time dock (play/pause, speed, now) to a TimeSystem instance. */
export function setupTimeDock(timeSystem) {
  const playPauseBtn = document.getElementById("btn-play-pause");
  const rewindBtn = document.getElementById("btn-rewind");
  const fastBtn = document.getElementById("btn-fast");
  const nowBtn = document.getElementById("btn-now");
  const dateReadout = document.getElementById("sim-date-readout");
  const speedReadout = document.getElementById("sim-speed-readout");

  playPauseBtn.addEventListener("click", () => {
    const paused = timeSystem.togglePlayPause();
    playPauseBtn.textContent = paused ? "▶" : "❚❚";
  });
  rewindBtn.addEventListener("click", () => timeSystem.slowDown());
  fastBtn.addEventListener("click", () => timeSystem.speedUp());
  nowBtn.addEventListener("click", () => timeSystem.jumpToNow());

  timeSystem.onChange((state) => {
    dateReadout.textContent = timeSystem.formatDate();
    const speedLabel = state.speed >= 1 ? `${state.speed}×` : `${state.speed}×`;
    speedReadout.textContent = `${speedLabel} day/s`;
  });

  // Initial paint.
  dateReadout.textContent = timeSystem.formatDate();
  speedReadout.textContent = `${timeSystem.speed}× day/s`;
}

/** Wires the bottom view dock (jump-to-planet buttons) + reset view. */
export function setupViewDock({ onSelect, onReset }) {
  const buttons = Array.from(document.querySelectorAll(".view-btn[data-target]"));
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => onSelect(btn.dataset.target));
  });
  document.getElementById("btn-reset-view").addEventListener("click", onReset);
  return buttons;
}

/** Wires the "Orbital paths" / "Object labels" / "Scale disclosure" layer toggles. */
export function setupLayerToggles({ orbitGroup, registry }) {
  const orbitsToggle = document.getElementById("toggle-orbits");
  const labelsToggle = document.getElementById("toggle-labels");
  const scaleToggle = document.getElementById("toggle-scale-note");
  const scaleNote = document.getElementById("scale-note");

  orbitsToggle.addEventListener("change", () => {
    setOrbitPathsVisible(orbitGroup, orbitsToggle.checked);
  });

  labelsToggle.addEventListener("change", () => {
    Object.values(registry).forEach((body) => {
      if (body.label) body.label.visible = labelsToggle.checked;
    });
  });

  scaleToggle.addEventListener("change", () => {
    scaleNote.style.display = scaleToggle.checked ? "" : "none";
  });
}

/** Simple FPS readout, sampled every ~500ms to avoid jitter. */
export function setupFpsReadout() {
  const el = document.getElementById("fps-readout");
  let frames = 0;
  let lastSample = performance.now();

  return function tick() {
    frames++;
    const now = performance.now();
    const elapsed = now - lastSample;
    if (elapsed >= 500) {
      const fps = Math.round((frames * 1000) / elapsed);
      el.textContent = `${fps} FPS`;
      frames = 0;
      lastSample = now;
    }
  };
}