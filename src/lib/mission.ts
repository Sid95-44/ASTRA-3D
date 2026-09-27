/**
 * The three things a visitor can add on top of the base model: a flight, a
 * Hohmann transfer, and an experimental orbit. They share one shape definition
 * so the canvas, the panels, and ASTRA always agree on what is switched on.
 */

export type Mission = {
  from: string;
  to: string;
  launchedAt: number;
  travelDays: number;
} | null;

export type Transfer = { from: string; to: string } | null;

export type Experiment = {
  semiMajorAxisAU: number;
  eccentricity: number;
  inclination: number;
  active: boolean;
};

export const DEFAULT_EXPERIMENT: Experiment = {
  semiMajorAxisAU: 1,
  eccentricity: 0.2,
  inclination: 8,
  active: false,
};

export const EXPERIMENT_RANGES = [
  {
    key: "semiMajorAxisAU",
    label: "Semi-major axis",
    min: 0.4,
    max: 2.4,
    step: 0.1,
    unit: " AU",
    decimals: 1,
  },
  {
    key: "eccentricity",
    label: "Eccentricity",
    min: 0,
    max: 0.8,
    step: 0.01,
    unit: "",
    decimals: 2,
  },
  {
    key: "inclination",
    label: "Inclination",
    min: 0,
    max: 30,
    step: 1,
    unit: "°",
    decimals: 0,
  },
] as const;

export function getMissionProgress(mission: Mission, simulatedDay: number) {
  if (!mission) return 0;
  const travelled = simulatedDay - mission.launchedAt;
  return Math.min(
    100,
    Math.max(0, Math.round((travelled / mission.travelDays) * 100))
  );
}

export function getMissionDaysLeft(mission: Mission, simulatedDay: number) {
  if (!mission) return 0;
  const left = mission.travelDays - (simulatedDay - mission.launchedAt);
  return Math.max(0, Math.round(left));
}

/** Plain language, used by the notebook, the hints, and ASTRA's asides. */
export function describeExperiment(experiment: Experiment) {
  return `${experiment.semiMajorAxisAU.toFixed(1)} AU out, eccentricity ${experiment.eccentricity.toFixed(
    2
  )}, inclined ${experiment.inclination.toFixed(0)}°`;
}

export function describeFlight(
  mission: Mission,
  simulatedDay: number,
  nameOf: (id: string) => string
) {
  if (!mission) return null;
  const progress = getMissionProgress(mission, simulatedDay);
  if (progress >= 100)
    return `${nameOf(mission.from)} → ${nameOf(mission.to)}, arrived`;
  return `${nameOf(mission.from)} → ${nameOf(mission.to)}, ${progress}% of the way there`;
}
