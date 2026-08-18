# ASTRA 3D

**Explore. Analyze. Simulate. Understand.**

An interactive 3D space-science and mission-analysis platform. ASTRA 3D is
**not a game** — it's an educational tool for exploring the Solar System,
inspecting real planetary data, and (in later milestones) analyzing orbital
mechanics, asteroids, satellites, and hypothetical missions.

This repository is being built incrementally, in milestones, as a ~120-hour
project for the NASA Stardance Challenge.

---

## Current status: Milestone 1 — Foundation

- ✅ Full-screen interactive 3D scene (Three.js)
- ✅ Sun + 8 planets, built from real NASA/JPL reference data
- ✅ Simplified elliptical orbital motion, driven by a universal simulation
  clock (play/pause/speed/jump-to-date)
- ✅ Orbit path visualization, toggleable
- ✅ Object selection (click in 3D, or from the side list) with a
  scientific data-sheet panel
- ✅ Camera controls: orbit, zoom, pan, and smooth "focus on object"
- ✅ Object labels, layer toggles, and a scale-disclosure notice
- 🚧 Orbital mechanics engine, asteroids, satellites, missions, Earth
  observation, space weather, ASTRA AI, and reports arrive in later
  milestones (see roadmap below)

---

## Running it locally

This is a static, frontend-only project for Milestone 1 — no build step,
no backend yet. It uses native ES modules, so it must be served over
HTTP(S) (opening `index.html` directly with `file://` will fail because
browsers block ES module imports from the filesystem).

Pick any of these:

```bash
# Option A — Python (built into most systems)
cd ASTRA-3D
python3 -m http.server 8000
# then open http://localhost:8000

# Option B — Node.js
cd ASTRA-3D
npx serve .
# then open the URL it prints

# Option C — VS Code
# Install the "Live Server" extension, right-click index.html → "Open with Live Server"
```

Three.js itself is loaded from a CDN (jsDelivr) via an import map in
`index.html` — no `npm install` is required for Milestone 1.

---

## Project structure

```text
ASTRA-3D/
├── index.html              # Page shell: canvas + all HUD-adjacent chrome
├── README.md
│
├── css/
│   ├── main.css             # Tokens, resets, loading screen
│   ├── dashboard.css        # Layout: topbar, docks, side panels
│   └── components.css       # Object list rows, data-sheet cards, toggles
│
├── js/
│   ├── main.js               # App entry point / orchestration + render loop
│   │
│   ├── 3d/
│   │   ├── scene.js          # Scene, renderer, starfield, resize
│   │   ├── camera.js         # Camera, OrbitControls, focus-on-object
│   │   ├── lighting.js       # Sun point light + ambient/fill
│   │   ├── planets.js        # Builds Sun + planet meshes, labels, updates them
│   │   └── orbits.js         # Orbit path lines + highlight/toggle
│   │
│   ├── physics/
│   │   └── orbitalMechanics.js  # Kepler's-equation position solver (simplified for M1)
│   │
│   ├── data/
│   │   ├── dataManager.js    # Real NASA/JPL reference data + scale config
│   │   ├── nasaAPI.js        # Placeholder — implemented in Milestone 4+
│   │   └── jplAPI.js         # Placeholder — implemented in Milestone 4+
│   │
│   ├── ui/
│   │   ├── panels.js         # Object list + info/data-sheet rendering
│   │   └── controls.js       # DOM wiring: selection, docks, toggles, FPS
│   │
│   └── systems/
│       └── timeSystem.js     # Universal simulation clock
│
└── assets/
    ├── textures/   (empty — planets currently use flat colors; Milestone 2 adds textures)
    ├── models/     (empty — reserved for spacecraft/probe models)
    └── icons/      (empty — reserved for UI icons)
```

---

## What each major piece does

- **`main.js`** boots everything in order (renderer → lighting → bodies →
  UI → render loop) and owns the single `requestAnimationFrame` loop. It
  intentionally contains no physics or DOM-string logic itself.
- **`timeSystem.js`** is the *one* simulation clock. Every simulated motion
  (currently just planets) reads its elapsed-days value from here, so
  later milestones (spacecraft, asteroids, satellites) can share the same
  clock instead of drifting out of sync with separate timers.
- **`orbitalMechanics.js`** solves Kepler's equation to place each planet
  on a real elliptical path (correct eccentricity), scaled for display.
  This is deliberately the *simplified* version — the full engine
  (gravity, vis-viva, Hohmann transfers, delta-v) is Milestone 3.
- **`dataManager.js`** is the single source of truth for physical/orbital
  data. All values are real, sourced from NASA's Planetary Fact Sheets and
  JPL Solar System Dynamics (see in-file citation). It also defines the
  *visualization* scale — separate from the real data — because the literal
  Solar System is too large to render usably.
- **`planets.js`** turns that data into Three.js meshes: a compressive
  radius curve keeps Mercury and Jupiter both visible in the same scene,
  and each mesh carries `userData.bodyId` so clicking it can look up its
  real data.
- **`panels.js`** renders the left object list and the right data sheet.
  Every displayed value is labeled as either real retrieved data or a
  calculated value (currently just escape velocity, computed live from
  mass and radius) — see Section 17 of the project brief on scientific
  accuracy.
- **`controls.js`** is the only file that touches both DOM elements and
  Three.js objects — it's the glue between "the user clicked something"
  and "the scene/panels update."

---

## Testing checklist

Open the app in a modern browser (Chrome, Firefox, Edge, Safari) and verify:

- [ ] Loading screen appears briefly, then fades out
- [ ] Starfield, Sun, and all 8 planets are visible on load
- [ ] Left-drag rotates the camera; scroll/pinch zooms; right-drag pans
- [ ] Clicking a planet (or the Sun) in the 3D view:
  - [ ] Highlights it with a thin halo ring
  - [ ] Updates the right-hand data-sheet panel with its real data
  - [ ] Highlights the matching row in the left "System Objects" list
  - [ ] Smoothly moves the camera to focus on it
- [ ] Clicking a name in the left list does the same thing
- [ ] Clicking a button in the bottom view dock (Mercury, Venus, …) does
      the same thing, and the button highlights as active
- [ ] "Reset View" returns the camera to the default wide view
- [ ] The time dock's ❚❚/▶ button pauses and resumes planetary motion
- [ ] The « / » buttons change the simulation speed shown in "RATE"
- [ ] "NOW" jumps the simulated date back to the real current date
- [ ] Unchecking "Orbital paths" hides the orbit ellipses
- [ ] Unchecking "Object labels" hides the floating planet names
- [ ] Unchecking "Scale disclosure" hides the bottom scale-notice banner
- [ ] FPS readout in the top-right updates and stays reasonably smooth
      (a modern laptop should comfortably hold 60 FPS with this scene)
- [ ] Resizing the browser window keeps the scene filling the viewport
      without distortion

### Common errors & fixes

| Symptom | Likely cause | Fix |
|---|---|---|
| Blank page, console error about `import` / CORS | Opened `index.html` directly via `file://` | Serve the folder over HTTP (see "Running it locally") |
| Console error `Failed to resolve module specifier "three"` | Import map didn't load, or browser is too old | Use a recent Chrome/Firefox/Edge/Safari; check the `<script type="importmap">` block in `index.html` loaded (Network tab) |
| Scene is black, nothing renders | WebGL unavailable/disabled | Check `chrome://gpu` (or equivalent) — hardware acceleration must be on |
| Planets don't move | Sim is paused | Click the ❚❚/▶ button in the time dock |
| Clicking a planet does nothing | Click landed on empty space, not the mesh | Zoom in slightly — Mercury/Venus/Earth/Mars are small at the default view distance |
| Layout looks cramped/overlapping | Viewport narrower than ~720px | Expected for Milestone 1 — full responsive/mobile polish is scheduled for Milestone 8 |

---

## Roadmap

| Phase | Hours | Focus |
|---|---|---|
| **1 — Foundation** | 0–10 | *(this milestone)* Scene, camera, lighting, Sun + planets, basic orbits |
| 2 — Solar System | 10–25 | Textures, richer info panels, moons, simulation clock UI polish |
| 3 — Orbital Mechanics | 25–45 | Full physics engine, interactive orbit parameters, Hohmann transfers |
| 4 — Space Objects | 45–60 | Live JPL/NASA data, asteroids, spacecraft, satellites |
| 5 — Mission Planner | 60–80 | Earth → Mars mission creation, trajectory visualization |
| 6 — Earth + Space Weather | 80–95 | Earth observation data, space weather status |
| 7 — Intelligence | 95–107 | ASTRA AI scientific assistant |
| 8 — Reports + Polish | 107–120 | Report generator, PDF export, performance, accessibility |

Data sources will be added to `nasaAPI.js` / `jplAPI.js` as each milestone
requires them; free-tier NASA API keys (from api.nasa.gov) are never
hard-coded into frontend code — that will be covered explicitly when
Milestone 4 introduces the first live API calls.

---

## Scientific accuracy notes (Milestone 1)

- All physical and orbital data in `dataManager.js` comes from NASA's
  Planetary Fact Sheets and JPL Solar System Dynamics — real, cited,
  unmodified figures (rounded for display).
- Escape velocity is the one *calculated* value shown so far — it's
  computed live from mass and radius (`v = √(2GM/r)`) and explicitly
  labeled "calculated" in the UI, distinct from the "real NASA/JPL data"
  badge on the retrieved fields.
- Orbital motion uses real eccentricity values, solved via Kepler's
  equation — but ignores inclination and perturbations for now. This is
  stated in-code and will be superseded by the full engine in Milestone 3.
- 3D sizes and distances are **visually scaled** (two independent
  compressive curves for radius and orbit distance) so the scene is
  navigable. This is disclosed to the user via the persistent scale-notice
  banner, not hidden.