# Planet textures — Milestone 2

Planet (and Sun) meshes are created with a flat-color material first, then
`js/3d/textures.js` tries to load an equirectangular texture from this
folder and swap it in. If a texture file is missing or fails to load, the
flat-color material stays — **the app still works**; you just don't see the
surface detail. So downloading these assets is optional, not required.

## Expected files

Place equirectangular ("sphere-mapped") JPGs here, one per body, named
exactly as below (paths are defined in `js/3d/textures.js`):

```
assets/textures/planets/sun.jpg
assets/textures/planets/mercury.jpg
assets/textures/planets/venus.jpg
assets/textures/planets/earth.jpg
assets/textures/planets/mars.jpg
assets/textures/planets/jupiter.jpg
assets/textures/planets/saturn.jpg
assets/textures/planets/uranus.jpg
assets/textures/planets/neptune.jpg
```

Use 2:1 aspect ratio equirectangular maps (e.g. 1024×512 or 2048×1024).
JPGs keep the repo small; PNGs work too if you update the extension in
`js/3d/textures.js`.

## Where to get them (free, public-domain / NASA-friendly)

Solar System Scope provides free, usable equirectangular planet textures:

- Solar System Scope — Textures: https://www.solarsystemscope.com/textures/

NASA image sources (public domain) for individual bodies:

- NASA Solar System Exploration: https://science.nasa.gov/solar-system/
- NASA Planetary Photojournal: https://photojournal.jpl.nasa.gov/
- NASA Scientific Visualization Studio: https://svs.gsfc.nasa.gov/

For each planet, pick a "surface map" / "color map" equirectangular image,
rename it to the matching file above, and drop it in this folder. No code
change is needed — `textures.js` already points at these paths and falls
back to flat colors if a file is absent.

## Why local files (not remote URLs)

Loading textures from a remote URL at runtime can fail due to CORS headers
or source-site availability, and it makes the app depend on the network.
Local files under `assets/textures/planets/` are the most reliable option
and keep the project fully static, matching the Milestone 1 design.
