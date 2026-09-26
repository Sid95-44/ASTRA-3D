export type Body = {
  id: string;
  name: string;
  category: string;
  description: string;
  fact: string;
  diameter: string;
  mass: string;
  solarDistance: string;
  orbitalPeriod: string;
  orbitalPeriodDays: number;
  orbitalVelocity: string;
  semiMajorAxisAU: number;
  eccentricity: number;
  inclination: number;
  phase: number;
  moons: number;
  accent: string;
  symbol: string;
  color: number;
  visualRadius: number;
};
// Rounded planetary fact-sheet values. Initial phases are illustrative.
const raw: Array<
  Omit<
    Body,
    | "category"
    | "description"
    | "fact"
    | "diameter"
    | "mass"
    | "solarDistance"
    | "orbitalPeriod"
    | "orbitalVelocity"
    | "accent"
    | "symbol"
    | "color"
    | "visualRadius"
  > & {
    category: string;
    description: string;
    fact: string;
    diameter: string;
    mass: string;
    solarDistance: string;
    orbitalPeriod: string;
    orbitalVelocity: string;
    accent: string;
    symbol: string;
    color: number;
    visualRadius: number;
  }
> = [
  {
    id: "sun",
    name: "Sun",
    category: "G-type star",
    description:
      "The star at the center of the Solar System and its dominant source of light and heat.",
    fact: "The Sun contains about 99.8% of the Solar System's mass.",
    diameter: "1,392,700 km",
    mass: "1.989 × 10³⁰ kg",
    solarDistance: "0 km",
    orbitalPeriod: "—",
    orbitalPeriodDays: 0,
    orbitalVelocity: "—",
    semiMajorAxisAU: 0,
    eccentricity: 0,
    inclination: 0,
    phase: 0,
    moons: 0,
    accent: "#f4ad56",
    symbol: "☉",
    color: 0xffc16b,
    visualRadius: 0.58,
  },
  {
    id: "mercury",
    name: "Mercury",
    category: "Terrestrial planet",
    description: "The smallest planet and closest to the Sun.",
    fact: "Mercury completes an orbit in about 88 Earth days.",
    diameter: "4,879 km",
    mass: "3.301 × 10²³ kg",
    solarDistance: "0.387 AU",
    orbitalPeriod: "87.97 days",
    orbitalPeriodDays: 87.969,
    orbitalVelocity: "47.36 km/s",
    semiMajorAxisAU: 0.38709893,
    eccentricity: 0.20563069,
    inclination: 7.00487,
    phase: 1.2,
    moons: 0,
    accent: "#b6aaa0",
    symbol: "☿",
    color: 0xa99d96,
    visualRadius: 0.13,
  },
  {
    id: "venus",
    name: "Venus",
    category: "Terrestrial planet",
    description:
      "A rocky world with a dense carbon-dioxide atmosphere and intense surface heat.",
    fact: "Venus is the hottest planet in the Solar System.",
    diameter: "12,104 km",
    mass: "4.867 × 10²⁴ kg",
    solarDistance: "0.723 AU",
    orbitalPeriod: "224.70 days",
    orbitalPeriodDays: 224.701,
    orbitalVelocity: "35.02 km/s",
    semiMajorAxisAU: 0.72333199,
    eccentricity: 0.00677323,
    inclination: 3.39471,
    phase: 4.1,
    moons: 0,
    accent: "#e6b875",
    symbol: "♀",
    color: 0xd9a96c,
    visualRadius: 0.19,
  },
  {
    id: "earth",
    name: "Earth",
    category: "Terrestrial planet",
    description:
      "An ocean-rich rocky planet with a nitrogen-oxygen atmosphere and diverse environments.",
    fact: "Earth is the only world currently known to support life.",
    diameter: "12,756 km",
    mass: "5.972 × 10²⁴ kg",
    solarDistance: "1.000 AU",
    orbitalPeriod: "365.26 days",
    orbitalPeriodDays: 365.256,
    orbitalVelocity: "29.78 km/s",
    semiMajorAxisAU: 1.00000011,
    eccentricity: 0.01671022,
    inclination: 0.00005,
    phase: 2.1,
    moons: 1,
    accent: "#64aee8",
    symbol: "⊕",
    color: 0x438bd0,
    visualRadius: 0.2,
  },
  {
    id: "mars",
    name: "Mars",
    category: "Terrestrial planet",
    description:
      "A cold desert world with ancient river-shaped terrain, volcanoes, and polar caps.",
    fact: "Olympus Mons on Mars is the Solar System's largest volcano.",
    diameter: "6,792 km",
    mass: "6.417 × 10²³ kg",
    solarDistance: "1.524 AU",
    orbitalPeriod: "686.98 days",
    orbitalPeriodDays: 686.98,
    orbitalVelocity: "24.08 km/s",
    semiMajorAxisAU: 1.52366231,
    eccentricity: 0.09341233,
    inclination: 1.85061,
    phase: 5.1,
    moons: 2,
    accent: "#e47f63",
    symbol: "♂",
    color: 0xd66b50,
    visualRadius: 0.16,
  },
  {
    id: "jupiter",
    name: "Jupiter",
    category: "Gas giant",
    description:
      "The largest planet, a hydrogen-helium giant with rings and many moons.",
    fact: "Jupiter's Great Red Spot is a long-lived giant atmospheric storm.",
    diameter: "142,984 km",
    mass: "1.898 × 10²⁷ kg",
    solarDistance: "5.203 AU",
    orbitalPeriod: "11.86 years",
    orbitalPeriodDays: 4332.589,
    orbitalVelocity: "13.06 km/s",
    semiMajorAxisAU: 5.20336301,
    eccentricity: 0.04839266,
    inclination: 1.3053,
    phase: 0.3,
    moons: 95,
    accent: "#d9a879",
    symbol: "♃",
    color: 0xc99d72,
    visualRadius: 0.42,
  },
  {
    id: "saturn",
    name: "Saturn",
    category: "Gas giant",
    description:
      "A gas giant whose broad, bright rings are made mostly of water ice and rock fragments.",
    fact: "Saturn's rings span a vast distance but are very thin compared with their width.",
    diameter: "120,536 km",
    mass: "5.683 × 10²⁶ kg",
    solarDistance: "9.537 AU",
    orbitalPeriod: "29.45 years",
    orbitalPeriodDays: 10755.699,
    orbitalVelocity: "9.67 km/s",
    semiMajorAxisAU: 9.53707032,
    eccentricity: 0.0541506,
    inclination: 2.48446,
    phase: 3.3,
    moons: 146,
    accent: "#d5c28d",
    symbol: "♄",
    color: 0xc8b780,
    visualRadius: 0.37,
  },
  {
    id: "uranus",
    name: "Uranus",
    category: "Ice giant",
    description:
      "A cold ice giant with a hydrogen, helium, and methane atmosphere.",
    fact: "Uranus rotates on its side, with an axial tilt of about 98 degrees.",
    diameter: "51,118 km",
    mass: "8.681 × 10²⁵ kg",
    solarDistance: "19.191 AU",
    orbitalPeriod: "84.02 years",
    orbitalPeriodDays: 30685.4,
    orbitalVelocity: "6.79 km/s",
    semiMajorAxisAU: 19.19126393,
    eccentricity: 0.04716771,
    inclination: 0.76986,
    phase: 2.7,
    moons: 28,
    accent: "#84d5dc",
    symbol: "♅",
    color: 0x7bcbd4,
    visualRadius: 0.28,
  },
  {
    id: "neptune",
    name: "Neptune",
    category: "Ice giant",
    description:
      "A distant, cold ice giant with powerful winds and a dynamic atmosphere.",
    fact: "Neptune is the most distant of the eight planets from the Sun.",
    diameter: "49,528 km",
    mass: "1.024 × 10²⁶ kg",
    solarDistance: "30.069 AU",
    orbitalPeriod: "164.8 years",
    orbitalPeriodDays: 60189.018,
    orbitalVelocity: "5.45 km/s",
    semiMajorAxisAU: 30.06896348,
    eccentricity: 0.00858587,
    inclination: 1.76917,
    phase: 5.7,
    moons: 16,
    accent: "#648ce4",
    symbol: "♆",
    color: 0x527bd6,
    visualRadius: 0.27,
  },
];
export const bodies: Body[] = raw;
export function getBody(id: string): Body {
  return (
    bodies.find(body => body.id === id) ??
    bodies.find(body => body.id === "earth")!
  );
}
