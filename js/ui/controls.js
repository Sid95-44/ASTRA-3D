/**
 * controls.js
 * ------------------------------------------------------------------------
 * Wires DOM chrome (time dock, view dock, layer toggles, canvas clicks) to
 * the 3D scene, the TimeSystem, and the info/object-list panels. This is
 * the "glue" layer — it owns no simulation state of its own.
 *
 * Milestone 2 changes (additive / minimal):
 *   - Selection now also handles moons. Selecting a moon still works with the
 *     existing halo + camera-focus path; the only change is that moons don't
 *     have a planet orbit-line to highlight, so the orbit highlight is
 *     cleared instead of pointing at a nonexistent line.
 *   - A new "Moons" layer toggle hides/shows every moon's pivot group.
 *   - The time dock now shows a richer readout: weekday in the date, a
 *     pluralized "days/s" rate, a LIVE/PAUSED status badge, and a speed-step
 *     pip bar. Play/pause/speed/now behavior is unchanged.
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

  // Moons have no planet orbit-line of their own; clear the highlight instead
  // of pointing at a line that doesn't exist.
  const selected = registry[bodyId];
  const isMoon = !!(selected && selected.isMoon);
  setActiveOrbit(orbitLines, !bodyId || bodyId === "sun" || isMoon ? null : bodyId);

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
  const statusBadge = document.getElementById("sim-status-badge");
  const stepPips = document.getElementById("sim-step-pips");

  // Build the speed-step pips once (one pip per available speed step).
  if (stepPips && !stepPips.childElementCount) {
    for (let i = 0; i < timeSystem.totalSteps; i++) {
      const pip = document.createElement("span");
      pip.className = "time-step-pip";
      stepPips.appendChild(pip);
    }
  }

  function renderTimeDock(state) {
    dateReadout.textContent = timeSystem.formatDate();
    speedReadout.textContent = timeSystem.formatSpeed();

    if (statusBadge) {
      statusBadge.textContent = state.isPaused ? "PAUSED" : (timeSystem.isRealtime ? "LIVE" : "RUNNING");
      statusBadge.classList.toggle("is-paused", state.isPaused);
    }

    if (stepPips) {
      Array.from(stepPips.children).forEach((pip, i) => {
        pip.classList.toggle("is-active", i <= timeSystem.speedStep);
      });
    }
  }

  playPauseBtn.addEventListener("click", () => {
    const paused = timeSystem.togglePlayPause();
    playPauseBtn.textContent = paused ? "▶" : "❚❚";
    playPauseBtn.classList.toggle("is-paused", paused);
  });
  rewindBtn.addEventListener("click", () => timeSystem.slowDown());
  fastBtn.addEventListener("click", () => timeSystem.speedUp());
  nowBtn.addEventListener("click", () => timeSystem.jumpToNow());

  timeSystem.onChange(renderTimeDock);

  // Initial paint.
  renderTimeDock(timeSystem.getState());
  playPauseBtn.textContent = timeSystem.isPaused ? "▶" : "❚❚";
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
  const moonsToggle = document.getElementById("toggle-moons");
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

  // Milestone 2 — "Moons" toggle. Hides each moon's pivot group, which
  // takes its mesh, label, and halo with it. Raycasting already skips
  // invisible objects, so hidden moons also stop being pickable.
  if (moonsToggle) {
    moonsToggle.addEventListener("change", () => {
      Object.values(registry).forEach((body) => {
        if (body.isMoon && body.pivot) body.pivot.visible = moonsToggle.checked;
      });
    });
  }
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
