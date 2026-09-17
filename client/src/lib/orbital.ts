import type { Body } from "@/data/bodies";

export const ASTRONOMICAL_UNIT_KM = 149_597_870.7;
export const SIMULATION_EPOCH = new Date("2025-01-01T00:00:00Z");

export type Vector3Like = { x: number; y: number; z: number };

/** Solve Kepler's equation with a short Newton-Raphson iteration. */
export function solveEccentricAnomaly(meanAnomaly: number, eccentricity: number) {
  let eccentricAnomaly = meanAnomaly;
  for (let iteration = 0; iteration < 6; iteration += 1) {
    eccentricAnomaly -=
      (eccentricAnomaly - eccentricity * Math.sin(eccentricAnomaly) - meanAnomaly) /
      (1 - eccentricity * Math.cos(eccentricAnomaly));
  }
  return eccentricAnomaly;
}

export function getOrbitalAngle(body: Body, simulatedDay: number) {
  if (body.id === "sun") return 0;
  const meanMotion = (Math.PI * 2) / body.orbitalPeriodDays;
  const meanAnomaly = (body.phase + meanMotion * simulatedDay) % (Math.PI * 2);
  const eccentricAnomaly = solveEccentricAnomaly(meanAnomaly, body.eccentricity);
  return 2 * Math.atan2(
    Math.sqrt(1 + body.eccentricity) * Math.sin(eccentricAnomaly / 2),
    Math.sqrt(1 - body.eccentricity) * Math.cos(eccentricAnomaly / 2),
  );
}

function getRadiusAU(body: Body, simulatedDay: number) {
  if (body.id === "sun") return 0;
  const angle = getOrbitalAngle(body, simulatedDay);
  return (body.semiMajorAxisAU * (1 - body.eccentricity ** 2)) /
    (1 + body.eccentricity * Math.cos(angle));
}

/** Real heliocentric position in AU, including the body's orbital inclination. */
export function getOrbitalPositionAU(body: Body, simulatedDay: number): Vector3Like {
  if (body.id === "sun") return { x: 0, y: 0, z: 0 };
  const angle = getOrbitalAngle(body, simulatedDay);
  const radius = getRadiusAU(body, simulatedDay);
  const inclination = (body.inclination * Math.PI) / 180;
  return {
    x: radius * Math.cos(angle),
    y: radius * Math.sin(angle) * Math.sin(inclination),
    z: radius * Math.sin(angle) * Math.cos(inclination),
  };
}

export function getVisualSemiMajorAxis(body: Body) {
  if (body.id === "sun") return 0;
  return 1.1 + Math.log1p(body.semiMajorAxisAU) * 1.35;
}

/** Position used by Three.js. Distances are stretched for a readable scene. */
export function getOrbitalPosition(body: Body, simulatedDay: number): Vector3Like {
  const real = getOrbitalPositionAU(body, simulatedDay);
  if (body.id === "sun") return real;
  const visualScale = getVisualSemiMajorAxis(body) / body.semiMajorAxisAU;
  return { x: real.x * visualScale, y: real.y * visualScale, z: real.z * visualScale };
}

/** Distance from the actual current 3D positions, not circular placeholders. */
export function getDistanceKm(first: Body, second: Body, simulatedDay: number) {
  const a = getOrbitalPositionAU(first, simulatedDay);
  const b = getOrbitalPositionAU(second, simulatedDay);
  return Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z) * ASTRONOMICAL_UNIT_KM;
}

export function getSimulatedDate(simulatedDay: number) {
  return new Date(SIMULATION_EPOCH.getTime() + simulatedDay * 86_400_000);
}

export function getDayFromDate(dateValue: string) {
  const date = new Date(`${dateValue}T00:00:00Z`);
  return Number.isNaN(date.getTime()) ? 0 : (date.getTime() - SIMULATION_EPOCH.getTime()) / 86_400_000;
}

/** Idealized Hohmann transfer time between two circular orbits. */
export function getHohmannTransferDays(departure: Body, destination: Body) {
  if (departure.id === destination.id || departure.semiMajorAxisAU === 0 || destination.semiMajorAxisAU === 0) return 0;
  const inner = Math.min(departure.semiMajorAxisAU, destination.semiMajorAxisAU);
  const outer = Math.max(departure.semiMajorAxisAU, destination.semiMajorAxisAU);
  const transferPeriodYears = Math.sqrt(((inner + outer) / 2) ** 3);
  return Math.round(182.62 * transferPeriodYears);
}

export function getTransferSemiMajorAxis(departure: Body, destination: Body) {
  return (departure.semiMajorAxisAU + destination.semiMajorAxisAU) / 2;
}

export function formatCompactDistance(distanceKm: number) {
  if (distanceKm >= 1_000_000_000) return `${(distanceKm / 1_000_000_000).toFixed(2)} billion km`;
  if (distanceKm >= 1_000_000) return `${(distanceKm / 1_000_000).toFixed(2)} million km`;
  return `${Math.round(distanceKm).toLocaleString()} km`;
}


import type { Moon } from "@/data/moons";

export type CelestialRecord = Body | Moon;

export function getMoonPositionAU(moon: Moon, bodies: Body[], simulatedDay: number): Vector3Like {
  const parent = bodies.find((body) => body.id === moon.parentId) ?? bodies[0];
  const parentPosition = getOrbitalPositionAU(parent, simulatedDay);
  const angle = (simulatedDay / moon.orbitalPeriodDays) * Math.PI * 2;
  const radiusAU = moon.distanceFromParentKm / ASTRONOMICAL_UNIT_KM;
  return {
    x: parentPosition.x + Math.cos(angle) * radiusAU,
    y: parentPosition.y + Math.sin(angle) * radiusAU * 0.18,
    z: parentPosition.z + Math.sin(angle) * radiusAU,
  };
}

export function getCelestialPositionAU(object: CelestialRecord, bodies: Body[], moons: Moon[], simulatedDay: number): Vector3Like {
  return "parentId" in object ? getMoonPositionAU(object, bodies, simulatedDay) : getOrbitalPositionAU(object, simulatedDay);
}

export function getCelestialName(id: string, bodies: Body[], moons: Moon[]) {
  return bodies.find((body) => body.id === id)?.name ?? moons.find((moon) => moon.id === id)?.name ?? id;
}

export function getDistanceBetweenObjectsKm(firstId: string, secondId: string, bodies: Body[], moons: Moon[], simulatedDay: number) {
  const first = bodies.find((body) => body.id === firstId) ?? moons.find((moon) => moon.id === firstId);
  const second = bodies.find((body) => body.id === secondId) ?? moons.find((moon) => moon.id === secondId);
  if (!first || !second) return 0;
  const a = getCelestialPositionAU(first, bodies, moons, simulatedDay);
  const b = getCelestialPositionAU(second, bodies, moons, simulatedDay);
  return Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z) * ASTRONOMICAL_UNIT_KM;
}

export function getApproximateMissionDays(fromId: string, toId: string, bodies: Body[], moons: Moon[]) {
  const from = bodies.find((body) => body.id === fromId);
  const to = bodies.find((body) => body.id === toId);
  const fromMoon = moons.find((moon) => moon.id === fromId);
  const toMoon = moons.find((moon) => moon.id === toId);
  if (from && to) return Math.max(30, getHohmannTransferDays(from, to));
  if (fromMoon || toMoon) return fromId === "earth" || toId === "earth" ? 5 : 18;
  return 30;
}
