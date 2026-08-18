/**
 * dataManager.js
 * ------------------------------------------------------------------------
 * Milestone 1: static, hand-verified reference data for the Sun and the
 * eight planets, sourced from public NASA/JPL fact sheets:
 *   - NASA Planetary Fact Sheets: https://nssdc.gsfc.nasa.gov/planetary/factsheet/
 *   - JPL Solar System Dynamics: https://ssd.jpl.nasa.gov/
 *
 * IMPORTANT — data provenance:
 *   Every field below is REAL retrieved data (not simulated or fabricated).
 *   Values are rounded to a sensible number of significant figures for
 *   display. Orbital elements assume simple, near-circular / low-inclination
 *   approximations suitable for Milestone 1 visualization — true elliptical
 *   Keplerian motion with eccentricity/inclination arrives in Milestone 3
 *   (Orbital Mechanics Engine).
 *
 * In later milestones, `nasaAPI.js` / `jplAPI.js` will fetch *live* data
 * (e.g. NEO feeds, ephemerides) and this file becomes the fallback /
 * offline data source, merged through the functions below.
 * ------------------------------------------------------------------------
 */

/** Physical + orbital reference data. Units are noted per field. */
export const CELESTIAL_BODIES = {
  sun: {
    id: "sun",
    name: "Sun",
    type: "Star",
    color: 0xfff2c8,
    radiusKm: 696000,
    massKg: 1.989e30,
    rotationPeriodDays: 27,
    orbitalPeriodDays: null,
    semiMajorAxisKm: 0,
    distanceFromSunKm: 0,
    eccentricity: 0,
    surfaceGravityMs2: 274,
    avgTemperatureC: 5500,
    moons: 0,
    description:
      "The Sun is a G-type main-sequence star that contains 99.8% of the Solar System's mass. Its gravity governs the orbits of every other body in this scene.",
  },
  mercury: {
    id: "mercury",
    name: "Mercury",
    type: "Terrestrial planet",
    color: 0x9c9c94,
    radiusKm: 2439.7,
    massKg: 3.3011e23,
    rotationPeriodDays: 58.6,
    orbitalPeriodDays: 88.0,
    semiMajorAxisKm: 57.9e6,
    distanceFromSunKm: 57.9e6,
    eccentricity: 0.2056,
    surfaceGravityMs2: 3.7,
    avgTemperatureC: 167,
    moons: 0,
    description:
      "The smallest and innermost planet. Mercury has almost no atmosphere, producing extreme temperature swings between its day and night sides.",
  },
  venus: {
    id: "venus",
    name: "Venus",
    type: "Terrestrial planet",
    color: 0xe6c27a,
    radiusKm: 6051.8,
    massKg: 4.8675e24,
    rotationPeriodDays: -243, // retrograde rotation
    orbitalPeriodDays: 224.7,
    semiMajorAxisKm: 108.2e6,
    distanceFromSunKm: 108.2e6,
    eccentricity: 0.0067,
    surfaceGravityMs2: 8.87,
    avgTemperatureC: 464,
    moons: 0,
    description:
      "Venus has a thick carbon-dioxide atmosphere that traps heat, giving it the hottest surface of any planet through a runaway greenhouse effect.",
  },
  earth: {
    id: "earth",
    name: "Earth",
    type: "Terrestrial planet",
    color: 0x2f6fd6,
    radiusKm: 6371.0,
    massKg: 5.972e24,
    rotationPeriodDays: 1.0,
    orbitalPeriodDays: 365.25,
    semiMajorAxisKm: 149.6e6,
    distanceFromSunKm: 149.6e6,
    eccentricity: 0.0167,
    surfaceGravityMs2: 9.81,
    avgTemperatureC: 15,
    moons: 1,
    description:
      "Our home planet, and the only known body with liquid surface water and confirmed life. Used as the reference (1 AU) for measuring other distances.",
  },
  mars: {
    id: "mars",
    name: "Mars",
    type: "Terrestrial planet",
    color: 0xc1440e,
    radiusKm: 3389.5,
    massKg: 6.4171e23,
    rotationPeriodDays: 1.03,
    orbitalPeriodDays: 687.0,
    semiMajorAxisKm: 227.9e6,
    distanceFromSunKm: 227.9e6,
    eccentricity: 0.0935,
    surfaceGravityMs2: 3.71,
    avgTemperatureC: -65,
    moons: 2,
    description:
      "The 'Red Planet', named for iron oxide dust on its surface. Mars is the primary target of ASTRA 3D's future Mission Planner (Earth → Mars transfers).",
  },
  jupiter: {
    id: "jupiter",
    name: "Jupiter",
    type: "Gas giant",
    color: 0xd9b48f,
    radiusKm: 69911,
    massKg: 1.8982e27,
    rotationPeriodDays: 0.41,
    orbitalPeriodDays: 4331,
    semiMajorAxisKm: 778.5e6,
    distanceFromSunKm: 778.5e6,
    eccentricity: 0.0489,
    surfaceGravityMs2: 24.79,
    avgTemperatureC: -110,
    moons: 95,
    description:
      "The largest planet in the Solar System — a gas giant more massive than all other planets combined. Its Great Red Spot is a storm wider than Earth.",
  },
  saturn: {
    id: "saturn",
    name: "Saturn",
    type: "Gas giant",
    color: 0xead6a8,
    radiusKm: 58232,
    massKg: 5.6834e26,
    rotationPeriodDays: 0.45,
    orbitalPeriodDays: 10747,
    semiMajorAxisKm: 1434e6,
    distanceFromSunKm: 1434e6,
    eccentricity: 0.0565,
    surfaceGravityMs2: 10.44,
    avgTemperatureC: -140,
    moons: 146,
    description:
      "Famous for its extensive, bright ring system made mostly of ice particles with a smaller amount of rocky debris and dust.",
  },
  uranus: {
    id: "uranus",
    name: "Uranus",
    type: "Ice giant",
    color: 0x9fe3e8,
    radiusKm: 25362,
    massKg: 8.681e25,
    rotationPeriodDays: -0.72,
    orbitalPeriodDays: 30589,
    semiMajorAxisKm: 2871e6,
    distanceFromSunKm: 2871e6,
    eccentricity: 0.0457,
    surfaceGravityMs2: 8.69,
    avgTemperatureC: -195,
    moons: 28,
    description:
      "An ice giant that rotates on its side, with an axial tilt of about 98°, likely the result of an ancient collision.",
  },
  neptune: {
    id: "neptune",
    name: "Neptune",
    type: "Ice giant",
    color: 0x3f5fd6,
    radiusKm: 24622,
    massKg: 1.02413e26,
    rotationPeriodDays: 0.67,
    orbitalPeriodDays: 59800,
    semiMajorAxisKm: 4495e6,
    distanceFromSunKm: 4495e6,
    eccentricity: 0.0113,
    surfaceGravityMs2: 11.15,
    avgTemperatureC: -200,
    moons: 16,
    description:
      "The outermost known planet, and the windiest — sustained winds have been measured at over 2,000 km/h.",
  },
};

export const PLANET_ORDER = [
  "mercury", "venus", "earth", "mars", "jupiter", "saturn", "uranus", "neptune",
];

/**
 * Visualization scale configuration.
 *
 * The real Solar System cannot be rendered at literal 1:1 scale and remain
 * usable (Neptune would be ~4.5 billion km from a Sun that is ~1.4 million
 * km wide — either the Sun disappears to a pixel or the scene becomes many
 * kilometers "wide" in scene units). ASTRA 3D therefore uses two independent,
 * clearly-labeled non-linear scales:
 *
 *   1. SIZE scale — planet radii are scaled with a compressive (power) curve
 *      so small terrestrial planets remain visible next to gas giants.
 *   2. DISTANCE scale — orbital distances use a different compressive curve
 *      so all eight planets fit in a navigable scene, while preserving the
 *      correct ORDER and relative spacing trend (each planet is farther
 *      out than the last, roughly following real proportions on a log-ish
 *      curve rather than a literal linear km scale).
 *
 * Anywhere real values are displayed to the user (info panels), the actual
 * physical km/kg/etc. figures from CELESTIAL_BODIES are shown — the scaling
 * below affects the 3D scene only.
 */
export const SCALE = {
  // 1 scene unit per this many km of *radius*, before the compressive curve.
  sunDisplayRadius: 9,
  planetRadiusMin: 0.55,
  planetRadiusMax: 3.4,

  // Orbit radii, in scene units, hand-tuned per planet for a navigable,
  // readable layout while preserving real ordering and relative spacing.
  orbitDisplayRadius: {
    mercury: 16,
    venus: 22,
    earth: 29,
    mars: 37,
    jupiter: 54,
    saturn: 72,
    uranus: 90,
    neptune: 106,
  },
};

/**
 * Returns the reference dataset for a body id, or null if unknown.
 */
export function getBodyData(id) {
  return CELESTIAL_BODIES[id] || null;
}