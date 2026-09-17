import type { Body } from "@/data/bodies";

export type Moon = {
  id: string;
  name: string;
  parentId: string;
  symbol: string;
  diameter: string;
  orbitalPeriodDays: number;
  distanceFromParentKm: number;
  description: string;
  fact: string;
  color: number;
  accent: string;
  visualRadius: number;
};

export const moons: Moon[] = [
  { id: "moon", name: "Moon", parentId: "earth", symbol: "◐", diameter: "3,475 km", orbitalPeriodDays: 27.3, distanceFromParentKm: 384_400, description: "Earth's natural satellite and a practical first stop for mission planning.", fact: "The Moon is tidally locked, so the same side generally faces Earth.", color: 0xbfc7cf, accent: "#BFC7CF", visualRadius: 0.06 },
  { id: "io", name: "Io", parentId: "jupiter", symbol: "○", diameter: "3,643 km", orbitalPeriodDays: 1.77, distanceFromParentKm: 421_700, description: "A volcanically active moon shaped by Jupiter's strong tides.", fact: "Io is the most volcanically active world known.", color: 0xd6ba75, accent: "#D6BA75", visualRadius: 0.055 },
  { id: "europa", name: "Europa", parentId: "jupiter", symbol: "○", diameter: "3,122 km", orbitalPeriodDays: 3.55, distanceFromParentKm: 671_100, description: "An icy moon whose cracked surface may cover a global ocean.", fact: "Europa's ice shell makes it an important target in planetary science.", color: 0xc8b99b, accent: "#C8B99B", visualRadius: 0.05 },
  { id: "ganymede", name: "Ganymede", parentId: "jupiter", symbol: "○", diameter: "5,268 km", orbitalPeriodDays: 7.15, distanceFromParentKm: 1_070_400, description: "The largest moon in the Solar System, even larger than Mercury by diameter.", fact: "Ganymede is the only moon known to have its own magnetic field.", color: 0x9f927f, accent: "#9F927F", visualRadius: 0.065 },
  { id: "callisto", name: "Callisto", parentId: "jupiter", symbol: "○", diameter: "4,821 km", orbitalPeriodDays: 16.69, distanceFromParentKm: 1_882_700, description: "A heavily cratered outer Galilean moon.", fact: "Callisto's surface is one of the most heavily cratered in the Solar System.", color: 0x786b63, accent: "#786B63", visualRadius: 0.052 },
  { id: "titan", name: "Titan", parentId: "saturn", symbol: "○", diameter: "5,150 km", orbitalPeriodDays: 15.95, distanceFromParentKm: 1_221_870, description: "A hazy moon with a thick atmosphere and lakes of liquid hydrocarbons.", fact: "Titan is the only moon known to have a dense, nitrogen-rich atmosphere.", color: 0xc99f62, accent: "#C99F62", visualRadius: 0.06 },
];

export function getMoon(id: string) { return moons.find((moon) => moon.id === id); }
export function getMoonParent(moon: Moon, bodies: Body[]) { return bodies.find((body) => body.id === moon.parentId) ?? bodies[0]; }
