export interface CelestialBody {
  id: string;
  name: string;
  type: 'star' | 'planet' | 'moon';
  radius: number;
  orbitRadius: number;
  orbitSpeed: number;
  textureUrl: string;
  moons?: CelestialBody[];
}

export const CELESTIAL_BODIES: CelestialBody[] = [
  {
    id: 'sun',
    name: 'Sun',
    type: 'star',
    radius: 10,
    orbitRadius: 0,
    orbitSpeed: 0,
    textureUrl: '/textures/sun.jpg',
  },
  {
    id: 'earth',
    name: 'Earth',
    type: 'planet',
    radius: 1,
    orbitRadius: 25,
    orbitSpeed: 0.01,
    textureUrl: '/textures/earth.jpg',
    moons: [
      {
        id: 'moon',
        name: 'Moon',
        type: 'moon',
        radius: 0.27,
        orbitRadius: 2.5,
        orbitSpeed: 0.03,
        textureUrl: '/textures/moon.jpg',
      },
    ],
  },
];
