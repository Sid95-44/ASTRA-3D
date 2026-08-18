/**
 * orbitalMechanics.js
 * ------------------------------------------------------------------------
 * Milestone 1 scope: just enough orbital math to place planets on their
 * (visually-scaled) elliptical paths and advance them through the
 * simulation clock. This is a SIMPLIFIED model:
 *
 *   - Orbits are treated as fixed ellipses (real eccentricity, but no
 *     perturbations, inclination, or n-body effects).
 *   - Position is computed by solving Kepler's equation for eccentric
 *     anomaly, which is the same core method the full engine will use.
 *
 * The full Orbital Mechanics Engine (gravity, vis-viva, Hohmann transfers,
 * delta-v, interactive parameter changes) is built in Milestone 3. This
 * file will be extended, not replaced.
 *
 * Reference: Curtis, "Orbital Mechanics for Engineering Students"; standard
 * two-body Keplerian orbit propagation.
 * ------------------------------------------------------------------------
 */

const TWO_PI = Math.PI * 2;

/**
 * Solves Kepler's equation M = E - e*sin(E) for the eccentric anomaly E,
 * given the mean anomaly M (radians) and eccentricity e, using
 * Newton-Raphson iteration.
 */
function solveEccentricAnomaly(meanAnomaly, eccentricity, tolerance = 1e-6, maxIter = 30) {
  let E = eccentricity < 0.8 ? meanAnomaly : Math.PI;
  for (let i = 0; i < maxIter; i++) {
    const dE = (E - eccentricity * Math.sin(E) - meanAnomaly) / (1 - eccentricity * Math.cos(E));
    E -= dE;
    if (Math.abs(dE) < tolerance) break;
  }
  return E;
}

/**
 * Computes a body's position on its orbital ellipse at a given time.
 *
 * @param {number} semiMajorAxisDisplay - orbit radius in SCENE units (already scaled for display).
 * @param {number} eccentricity - orbital eccentricity (0 = circle).
 * @param {number} orbitalPeriodDays - real orbital period, used only to derive angular speed.
 * @param {number} elapsedDays - simulated elapsed days since epoch.
 * @param {number} phaseOffset - initial mean anomaly offset (radians), so planets don't all start aligned.
 * @returns {{x:number, z:number, angle:number}} position in the XZ plane (Y = 0 for Milestone 1).
 */
export function computeOrbitPosition(semiMajorAxisDisplay, eccentricity, orbitalPeriodDays, elapsedDays, phaseOffset = 0) {
  if (!orbitalPeriodDays || orbitalPeriodDays <= 0) {
    // Sun / stationary body.
    return { x: 0, z: 0, angle: 0 };
  }

  const meanMotion = TWO_PI / orbitalPeriodDays; // rad/day
  const meanAnomaly = (meanMotion * elapsedDays + phaseOffset) % TWO_PI;

  const E = solveEccentricAnomaly(meanAnomaly, eccentricity);

  // Position in the orbital plane, semi-major axis "a" = semiMajorAxisDisplay,
  // semi-minor axis "b" = a * sqrt(1 - e^2). Center offset by a*e so the
  // focus (the Sun) sits at the origin, matching real Keplerian geometry.
  const a = semiMajorAxisDisplay;
  const b = a * Math.sqrt(1 - eccentricity * eccentricity);

  const x = a * (Math.cos(E) - eccentricity);
  const z = b * Math.sin(E);

  const angle = Math.atan2(z, x);
  return { x, z, angle };
}

/**
 * Generates an array of {x,z} points tracing a full orbital ellipse, for
 * drawing the orbit path line.
 */
export function generateOrbitPathPoints(semiMajorAxisDisplay, eccentricity, segments = 128) {
  const points = [];
  const a = semiMajorAxisDisplay;
  const b = a * Math.sqrt(1 - eccentricity * eccentricity);
  for (let i = 0; i <= segments; i++) {
    const E = (i / segments) * TWO_PI;
    const x = a * (Math.cos(E) - eccentricity);
    const z = b * Math.sin(E);
    points.push({ x, z });
  }
  return points;
}