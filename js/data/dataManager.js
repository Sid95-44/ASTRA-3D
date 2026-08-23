/**
 * dataManager.js
 * ------------------------------------------------------------------------
 * Milestone 1 + 2: static, hand-verified reference data for the Sun, the
 * eight planets, and a selection of major moons, sourced from public
 * NASA/JPL fact sheets:
 *   - NASA Planetary Fact Sheets: https://nssdc.gsfc.nasa.gov/planetary/factsheet/
 *   - NASA Science — Moon pages: https://science.nasa.gov/
 *   - JPL Solar System Dynamics: https://ssd.jpl.nasa.gov/
 *
 * IMPORTANT — data provenance:
 *   Every field below is REAL retrieved data (not simulated or fabricated).
 *   Values are rounded to a sensible number of significant figures for
 *   display. Orbital elements assume simple, near-circular / low-inclination
 *   approximations suitable for visualization — true elliptical Keplerian
 *   motion with eccentricity/inclination arrives in Milestone 3 (Orbital
 *   Mechanics Engine).
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

// ------------------------------------------------------------------------
// Milestone 2 — Major moons
// ------------------------------------------------------------------------
// Real reference data for a curated set of major moons (the largest / most
// scientifically notable satellite of each planet that has them). Each moon
// declares its `parentId` so the 3D layer can parent its orbit pivot to the
// correct planet. `orbitalPeriodDays` is the sidereal period AROUND THE PLANET
// (not the Sun). A negative `rotationPeriodDays` marks retrograde spin; a
// `retrograde: true` flag marks a moon whose ORBIT runs opposite to its
// planet's (Triton) — handled in the visualization layer, not here.
//
// Sources: NASA Planetary Fact Sheets, NASA Science moon pages, JPL/IAU.
export const MOONS = [
  // Earth
  {
    id: "earth-moon", name: "Moon", parentId: "earth", type: "Moon",
    color: 0xbfbfbf, radiusKm: 1737.4, massKg: 7.342e22,
    orbitalPeriodDays: 27.32, rotationPeriodDays: 27.32, // tidally locked
    distanceFromPlanetKm: 384400, eccentricity: 0.0549, retrograde: false,
    discovered: "Prehistoric (known since antiquity)",
    description:
      "Earth's only natural satellite and the fifth-largest moon in the Solar System. It is tidally locked to Earth, always showing the same face, and is the only other world humans have visited.",
  },
  // Mars
  {
    id: "mars-phobos", name: "Phobos", parentId: "mars", type: "Moon",
    color: 0x8c8378, radiusKm: 11.27, massKg: 1.0659e16,
    orbitalPeriodDays: 0.31891, rotationPeriodDays: 0.31891,
    distanceFromPlanetKm: 9376, eccentricity: 0.0151, retrograde: false,
    discovered: "1877 — Asaph Hall",
    description:
      "Mars's innermost and larger moon — a small, heavily cratered body thought to be a captured asteroid. It orbits Mars faster than Mars rotates, and is slowly spiraling inward.",
  },
  {
    id: "mars-deimos", name: "Deimos", parentId: "mars", type: "Moon",
    color: 0x9a8a7a, radiusKm: 6.2, massKg: 1.4762e15,
    orbitalPeriodDays: 1.26244, rotationPeriodDays: 1.26244,
    distanceFromPlanetKm: 23463, eccentricity: 0.0002, retrograde: false,
    discovered: "1877 — Asaph Hall",
    description:
      "Mars's smaller, outer moon. Its surface is smoother than Phobos, covered by a fine regolith, and it takes about 30 hours to orbit Mars.",
  },
  // Jupiter — Galilean moons
  {
    id: "jupiter-io", name: "Io", parentId: "jupiter", type: "Moon",
    color: 0xe8dc6a, radiusKm: 1821.6, massKg: 8.9319e22,
    orbitalPeriodDays: 1.769138, rotationPeriodDays: 1.769138,
    distanceFromPlanetKm: 421700, eccentricity: 0.0041, retrograde: false,
    discovered: "1610 — Galileo Galilei",
    description:
      "The most volcanically active body in the Solar System, with hundreds of active volcanoes driven by tidal heating from Jupiter and Europa.",
  },
  {
    id: "jupiter-europa", name: "Europa", parentId: "jupiter", type: "Moon",
    color: 0xc9b79a, radiusKm: 1560.8, massKg: 4.7998e22,
    orbitalPeriodDays: 3.551181, rotationPeriodDays: 3.551181,
    distanceFromPlanetKm: 671100, eccentricity: 0.0094, retrograde: false,
    discovered: "1610 — Galileo Galilei",
    description:
      "An icy moon with a smooth surface of water ice over a suspected subsurface ocean of liquid water — a prime target in the search for habitability.",
  },
  {
    id: "jupiter-ganymede", name: "Ganymede", parentId: "jupiter", type: "Moon",
    color: 0x9a8a76, radiusKm: 2634.1, massKg: 1.4819e23,
    orbitalPeriodDays: 7.154553, rotationPeriodDays: 7.154553,
    distanceFromPlanetKm: 1070400, eccentricity: 0.0013, retrograde: false,
    discovered: "1610 — Galileo Galilei",
    description:
      "The largest moon in the Solar System — bigger than Mercury — and the only moon known to generate its own magnetic field.",
  },
  {
    id: "jupiter-callisto", name: "Callisto", parentId: "jupiter", type: "Moon",
    color: 0x736a5e, radiusKm: 2410.3, massKg: 1.0759e23,
    orbitalPeriodDays: 16.689018, rotationPeriodDays: 16.689018,
    distanceFromPlanetKm: 1882700, eccentricity: 0.0074, retrograde: false,
    discovered: "1610 — Galileo Galilei",
    description:
      "One of the most heavily cratered objects in the Solar System, with the oldest, most battered surface known — far enough from Jupiter to be relatively undisturbed by tidal heating.",
  },
  // Saturn
  {
    id: "saturn-titan", name: "Titan", parentId: "saturn", type: "Moon",
    color: 0xc8861e, radiusKm: 2574.7, massKg: 1.3452e23,
    orbitalPeriodDays: 15.945421, rotationPeriodDays: 15.945421,
    distanceFromPlanetKm: 1221870, eccentricity: 0.0288, retrograde: false,
    discovered: "1655 — Christiaan Huygens",
    description:
      "Saturn's largest moon, with a dense nitrogen atmosphere and liquid methane rivers and seas on its surface — the only moon with a substantial atmosphere.",
  },
  {
    id: "saturn-rhea", name: "Rhea", parentId: "saturn", type: "Moon",
    color: 0xcfcfcf, radiusKm: 763.8, massKg: 2.306e21,
    orbitalPeriodDays: 4.518212, rotationPeriodDays: 4.518212,
    distanceFromPlanetKm: 527100, eccentricity: 0.0012, retrograde: false,
    discovered: "1672 — Giovanni Cassini",
    description:
      "Saturn's second-largest moon, an icy body with wispy streaks across its surface from tectonic activity.",
  },
  {
    id: "saturn-dione", name: "Dione", parentId: "saturn", type: "Moon",
    color: 0xcfc6b8, radiusKm: 561.4, massKg: 1.0958e21,
    orbitalPeriodDays: 2.736915, rotationPeriodDays: 2.736915,
    distanceFromPlanetKm: 377400, eccentricity: 0.0022, retrograde: false,
    discovered: "1684 — Giovanni Cassini",
    description:
      "An icy moon of Saturn marked by bright, wispy cliffs created by tectonic fracturing of its surface ice.",
  },
  {
    id: "saturn-iapetus", name: "Iapetus", parentId: "saturn", type: "Moon",
    color: 0x8a7560, radiusKm: 734.5, massKg: 1.8056e21,
    orbitalPeriodDays: 79.3215, rotationPeriodDays: 79.3215,
    distanceFromPlanetKm: 3560400, eccentricity: 0.0286, retrograde: false,
    discovered: "1671 — Giovanni Cassini",
    description:
      "Saturn's moon with a striking two-tone surface — one hemisphere dark as soot, the other bright as snow — and a curious equatorial ridge.",
  },
  // Uranus
  {
    id: "uranus-ariel", name: "Ariel", parentId: "uranus", type: "Moon",
    color: 0xbfbfbf, radiusKm: 578.9, massKg: 1.353e21,
    orbitalPeriodDays: 2.519, rotationPeriodDays: 2.519,
    distanceFromPlanetKm: 191020, eccentricity: 0.0012, retrograde: false,
    discovered: "1851 — William Lassell",
    description:
      "Uranus's brightest moon, with a relatively young, faulted surface of water ice possibly mixed with methane ice.",
  },
  {
    id: "uranus-umbriel", name: "Umbriel", parentId: "uranus", type: "Moon",
    color: 0x8a8a8a, radiusKm: 584.7, massKg: 1.172e21,
    orbitalPeriodDays: 4.144, rotationPeriodDays: 4.144,
    distanceFromPlanetKm: 266000, eccentricity: 0.0039, retrograde: false,
    discovered: "1851 — William Lassell",
    description:
      "The darkest of Uranus's large moons, with an old, heavily cratered surface and an unusual bright ring nicknamed the 'fluorescent Cheerio'.",
  },
  {
    id: "uranus-titania", name: "Titania", parentId: "uranus", type: "Moon",
    color: 0xa89e92, radiusKm: 788.4, massKg: 3.42e21,
    orbitalPeriodDays: 8.705872, rotationPeriodDays: 8.705872,
    distanceFromPlanetKm: 435910, eccentricity: 0.0011, retrograde: false,
    discovered: "1787 — William Herschel",
    description:
      "Uranus's largest moon — its surface is crisscrossed by enormous canyons and faults from tectonic expansion as it froze.",
  },
  {
    id: "uranus-oberon", name: "Oberon", parentId: "uranus", type: "Moon",
    color: 0x938578, radiusKm: 761.4, massKg: 3.014e21,
    orbitalPeriodDays: 13.463239, rotationPeriodDays: 13.463239,
    distanceFromPlanetKm: 583520, eccentricity: 0.0014, retrograde: false,
    discovered: "1787 — William Herschel",
    description:
      "Uranus's outermost large moon, an old, cratered ice world with dark deposits on some crater floors, possibly methane.",
  },
  // Neptune
  {
    id: "neptune-triton", name: "Triton", parentId: "neptune", type: "Moon",
    color: 0xc8b8a0, radiusKm: 1353.4, massKg: 2.14e22,
    orbitalPeriodDays: 5.876854, rotationPeriodDays: -5.876854, // retrograde spin
    distanceFromPlanetKm: 354759, eccentricity: 0.000016, retrograde: true,
    discovered: "1846 — William Lassell",
    description:
      "Neptune's largest moon, orbiting backwards (retrograde) — strong evidence it was captured from the Kuiper Belt. It has active geysers of nitrogen ice despite extreme cold.",
  },
];

/** Moons grouped by parent planet id (ordered as in MOONS). */
export const MOONS_BY_PARENT = MOONS.reduce((acc, moon) => {
  (acc[moon.parentId] = acc[moon.parentId] || []).push(moon);
  return acc;
}, {});

/** Fast id → moon-data lookup. */
export const MOON_MAP = Object.fromEntries(MOONS.map((m) => [m.id, m]));

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
 * physical km/kg/etc. figures from CELESTIAL_BODIES / MOONS are shown — the
 * scaling below affects the 3D scene only.
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

  // -- Milestone 2: moon visualization scale (scene-only, NOT real data) -----
  // Moons are far smaller than planets, so they get their own compressive
  // curve and clamp range — otherwise every moon would clamp to the planet
  // minimum and all look identical. Reference radius = Earth's Moon.
  moonReferenceRadiusKm: 1737.4,
  moonRadiusMin: 0.16,
  moonRadiusMax: 0.7,
};

/**
 * Returns the reference dataset for a body id (planet, the Sun, or a moon),
 * or null if unknown. Milestone 2 extends this to cover moon ids so the
 * selection/info-panel path can look up moons through the same single entry
 * point it already used for planets.
 */
export function getBodyData(id) {
  return CELESTIAL_BODIES[id] || MOON_MAP[id] || null;
}
