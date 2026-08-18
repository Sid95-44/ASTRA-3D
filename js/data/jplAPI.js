/**
 * jplAPI.js
 * ------------------------------------------------------------------------
 * NOT USED YET. Reserved for Milestone 4+ (Space Objects) and Milestone 5
 * (Mission Planner), where ASTRA 3D will fetch precise ephemerides and
 * small-body orbital elements from JPL's Solar System Dynamics services
 * (e.g. SBDB, Horizons).
 *
 * Kept as an empty module now so the project structure matches the target
 * architecture. Importing this file currently has no side effects.
 * ------------------------------------------------------------------------
 */

export const JPL_SSD_BASE = "https://ssd-api.jpl.nasa.gov";

// Implemented in a later milestone.
export async function fetchSmallBodyData(designation) {
  throw new Error("jplAPI.fetchSmallBodyData() is not implemented until Milestone 4.");
}