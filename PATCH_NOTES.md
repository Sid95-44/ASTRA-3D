# ASTRA 3D — Milestone 2 Patch (drop-in)

Drop these files onto your existing repository root (they overwrite the
matching Milestone 1 files and add two new ones). No Milestone 1 file is
deleted; `main.js`, `scene.js`, `camera.js`, `lighting.js`, `orbits.js`,
`orbitalMechanics.js`, `nasaAPI.js`, `jplAPI.js`, `main.css`, `README.md`,
`LICENSE`, `.gitignore` are unchanged.

## Files in this patch

New files:
- `js/3d/textures.js` — texture loader with flat-color fallback.
- `assets/textures/planets/README.md` — where to download planet textures.

Modified files (additive changes, original logic preserved):
- `js/data/dataManager.js` — `MOONS`, `MOONS_BY_PARENT`, `MOON_MAP`, moon
  SCALE fields, extended `getBodyData`.
- `js/3d/planets.js` — `buildMoons`, moon update, top-level moon registration.
- `js/ui/panels.js` — nested moon rows + `renderMoonInfoPanel`.
- `js/ui/controls.js` — moon focus/halo, Moons toggle, rewritten time dock.
- `js/systems/timeSystem.js` — weekday `formatDate`, `formatSpeed`, getters.
- `index.html` — time-dock status block, Moons toggle, M2 subtitle.
- `css/components.css` — moon rows + moon badge.
- `css/dashboard.css` — time-dock status / badge / step pips.

## How to apply

From the repo root:

```
unzip astra-3d-m2-patch.zip
```

(Overwrites the files above; preserves everything else.)

## Run locally

```
python3 -m http.server 8000
# open http://localhost:8000
```

## Optional: add real planet textures

Download `.jpg` equirectangular textures (e.g. from
https://www.solarsystemscope.com/textures/ ) and place them in
`assets/textures/planets/` named exactly:

`sun.jpg earth.jpg mars.jpg jupiter.jpg saturn.jpg uranus.jpg neptune.jpg`

If a file is missing or fails to load, the body keeps its flat color — no
errors, the sim still runs.

## What Milestone 2 adds

- Major moons (16) orbiting their correct parent planet; Triton retrograde.
- Planet textures with safe flat-color fallback.
- Richer planet + moon info panels (real NASA/JPL data).
- Improved sim clock: weekday date, pluralized "days/s", LIVE/PAUSED badge,
  speed-step pips, plus `totalSteps` / `speedStep` / `isRealtime` getters.
- New "Moons" layer toggle.
