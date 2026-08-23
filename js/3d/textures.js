/**
 * textures.js
 * ------------------------------------------------------------------------
 * Milestone 2 — planet texture loading with a guaranteed flat-color
 * fallback. This module owns ONLY asset-loading concerns: it knows the
 * texture file paths and how to attach a texture to an existing material
 * without touching the material's base color.
 *
 * Safety model (matches the Milestone 2 brief: "keep the current flat-color
 * material as a safe fallback if any texture fails to load"):
 *   - Every planet mesh is first created in planets.js with a flat-color
 *     MeshStandardMaterial (exactly as in Milestone 1). That material is
 *     fully valid and rendered immediately.
 *   - loadBodyTexture() then attempts to load the texture asynchronously.
 *     On success it sets `material.map` and flags `needsUpdate`; the texture
 *     pops in over the existing flat color.
 *   - On error (file missing, 404, CORS, network) it logs a warning and does
 *     nothing — the flat-color material remains in place. No throw, no crash,
 *     no broken scene.
 *
 * No real scientific data lives here. Paths are visualization/asset concerns
 * only. The intended asset layout is:
 *
 *   assets/textures/planets/<id>.jpg
 *
 * These are equirectangular ("sphere-mapped") color textures. The repo
 * ships without them on purpose; see the Milestone 2 notes / README for the
 * list of public NASA / Solar System Scope sources to download them from.
 * ------------------------------------------------------------------------
 */
import * as THREE from "three";

// Single shared loader — TextureLoader is cheap to hold but reusing one
// avoids spawning a loader per body and lets the browser cache requests.
const textureLoader = new THREE.TextureLoader();

/**
 * Relative (to index.html) equirectangular texture paths per body id.
 * Only planets + the Sun are textured; moons keep flat colors in Milestone 2.
 */
export const BODY_TEXTURE_PATHS = {
  sun: "assets/textures/planets/sun.jpg",
  mercury: "assets/textures/planets/mercury.jpg",
  venus: "assets/textures/planets/venus.jpg",
  earth: "assets/textures/planets/earth.jpg",
  mars: "assets/textures/planets/mars.jpg",
  jupiter: "assets/textures/planets/jupiter.jpg",
  saturn: "assets/textures/planets/saturn.jpg",
  uranus: "assets/textures/planets/uranus.jpg",
  neptune: "assets/textures/planets/neptune.jpg",
};

/**
 * Attempts to load the texture for `bodyId` and attach it to `material`.
 * Leaves the material untouched on failure (flat-color fallback).
 *
 * @param {string} bodyId - id matching a key in BODY_TEXTURE_PATHS.
 * @param {THREE.Material} material - existing flat-color material to enhance.
 */
export function loadBodyTexture(bodyId, material) {
  const path = BODY_TEXTURE_PATHS[bodyId];
  if (!path) return; // no texture configured for this body → flat color stays

  textureLoader.load(
    path,
    // onLoad: swap the texture in over the existing flat color.
    (texture) => {
      texture.colorSpace = THREE.SRGBColorSpace; // correct color for color maps
      texture.anisotropy = 8; // sharper detail at glancing angles (clamped by GPU)
      texture.wrapS = THREE.RepeatWrapping;
      material.map = texture;
      material.needsUpdate = true;
    },
    // onProgress: intentionally unused — keep the flat color until fully loaded.
    undefined,
    // onError: keep the flat-color fallback; warn once in the console.
    (err) => {
      console.warn(
        `[ASTRA 3D] Texture for "${bodyId}" failed to load (${path}); using flat-color fallback.`,
        err && err.message ? err.message : err
      );
    }
  );
}
