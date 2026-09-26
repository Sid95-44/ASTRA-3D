export type Moon = {
  id: string;
  name: string;
  parentId: string;
  diameter: string;
  orbitalPeriodDays: number;
  distanceFromParentKm: number;
  accent: string;
  symbol: string;
  description: string;
  fact: string;
  color: number;
  visualRadius: number;
};
export const moons: Moon[] = [
  {
    id: "moon",
    name: "Moon",
    parentId: "earth",
    diameter: "3,475 km",
    orbitalPeriodDays: 27.3217,
    distanceFromParentKm: 384400,
    accent: "#d5d9dc",
    symbol: "☾",
    description:
      "Earth's natural satellite, tidally locked so the same hemisphere generally faces Earth.",
    fact: "The Moon's orbital period relative to the stars is about 27.3 days.",
    color: 0xc6cbd0,
    visualRadius: 0.075,
  },
  {
    id: "io",
    name: "Io",
    parentId: "jupiter",
    diameter: "3,643 km",
    orbitalPeriodDays: 1.769138,
    distanceFromParentKm: 421800,
    accent: "#e7c75e",
    symbol: "Io",
    description:
      "A volcanic moon whose surface is continually reshaped by intense tidal heating.",
    fact: "Io is the most volcanically active world known.",
    color: 0xe5c768,
    visualRadius: 0.08,
  },
  {
    id: "europa",
    name: "Europa",
    parentId: "jupiter",
    diameter: "3,122 km",
    orbitalPeriodDays: 3.551181,
    distanceFromParentKm: 671100,
    accent: "#d8c8a9",
    symbol: "Eu",
    description:
      "An icy moon with strong evidence for a salty ocean beneath its surface.",
    fact: "Europa's ocean may contain more water than all Earth's oceans combined.",
    color: 0xd9c9a8,
    visualRadius: 0.07,
  },
  {
    id: "ganymede",
    name: "Ganymede",
    parentId: "jupiter",
    diameter: "5,262 km",
    orbitalPeriodDays: 7.154553,
    distanceFromParentKm: 1070400,
    accent: "#9d9a91",
    symbol: "Ga",
    description:
      "The largest moon in the Solar System and the only moon known to generate its own magnetic field.",
    fact: "Ganymede is larger than Mercury.",
    color: 0x9c988f,
    visualRadius: 0.1,
  },
  {
    id: "callisto",
    name: "Callisto",
    parentId: "jupiter",
    diameter: "4,821 km",
    orbitalPeriodDays: 16.689017,
    distanceFromParentKm: 1882700,
    accent: "#777a7b",
    symbol: "Ca",
    description:
      "An ancient, heavily cratered moon orbiting Jupiter beyond the Galilean moons.",
    fact: "Callisto's surface is among the most heavily cratered in the Solar System.",
    color: 0x777a7b,
    visualRadius: 0.09,
  },
  {
    id: "titan",
    name: "Titan",
    parentId: "saturn",
    diameter: "5,150 km",
    orbitalPeriodDays: 15.945,
    distanceFromParentKm: 1221870,
    accent: "#dc9c54",
    symbol: "Ti",
    description:
      "Saturn's largest moon, with a thick nitrogen-rich atmosphere and lakes of liquid hydrocarbons.",
    fact: "Titan has lakes and seas made of liquid methane and ethane.",
    color: 0xd99a57,
    visualRadius: 0.095,
  },
];
export function getMoon(id: string): Moon {
  return moons.find(moon => moon.id === id) ?? moons[0];
}
