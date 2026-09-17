# ASTRA 3D

ASTRA 3D is a student-built space-science platform for exploring the Solar System as a moving system rather than a static diagram. It combines a scroll-driven field brief with an interactive Three.js observation deck that is suitable for a Class 12 demonstration and explainable without professional mission-planning software.

## Features

- Three.js Solar System with the Sun, eight planets, and six major moons.
- Kepler-inspired elliptical orbits using semi-major axis, eccentricity, inclination, and mean anomaly.
- Play, pause, reset, accelerated time from 1× to 100,000×, and date jumping.
- Planet and moon selection with live scientific telemetry.
- Current inclined 3D distance measurement in km, million km, or billion km.
- Camera orbit, wheel zoom, and smooth focus behavior.
- Simplified spacecraft mission mode with departure, destination, trajectory, progress, and reset.
- Simplified Hohmann transfer visualization with approximate transfer time.
- Orbit experiment mode for semi-major axis, eccentricity, and inclination.
- Optional step-by-step field tutorial.
- Save, load, and delete mission scenarios using browser local storage.
- Responsive landing and simulation layouts with reduced-motion support.

## Technology

- React 19, TypeScript, and Vite
- Three.js for the interactive scene
- Wouter for routing
- Tailwind CSS 4 and the existing shadcn/ui component set
- Space Grotesk and IBM Plex Mono for the Orbital Blueprint visual language

## Architecture

```text
client/src/
  components/SolarSystemCanvas.tsx  Three.js scene, camera, moons, missions, transfer orbit, experiment orbit
  data/bodies.ts                    Sun and planetary records
  data/moons.ts                     Selected major satellite records
  lib/orbital.ts                   Kepler propagation, 3D positions, distances, transfer math
  screens/Landing.tsx              Scroll-driven field brief and launch CTA
  screens/Simulation.tsx           Observation deck, telemetry, controls, missions, scenarios
  index.css                        ASTRA visual system and responsive enhancement layer
  App.tsx                          Routes and application providers
```

## Orbital Mechanics

For each planet, ASTRA calculates mean anomaly from its orbital period, solves Kepler's equation using a short Newton–Raphson iteration, converts the result into an inclined elliptical position, and places the body in the visual scene. The distance tool uses the actual current 3D heliocentric positions, including inclination:

```text
distance = |positionA - positionB|
```

Positions are converted from astronomical units to kilometres using 1 AU = 149,597,870.7 km. The rendered scene stretches distances so that outer planets remain visible on a normal screen.

## Spacecraft Missions and Hohmann Transfers

Mission mode interpolates a spacecraft between the current departure and destination positions, with a gentle educational arc and a progress readout. Hohmann transfer time is estimated from the two semi-major axes using the idealized transfer ellipse. These are teaching models: they do not include launch windows, perturbations, burns, barycentric motion, or full ephemerides.

## Orbit Experiment

The experiment changes semi-major axis, eccentricity, and inclination for a separate highlighted orbit. The controls prevent invalid values through bounded sliders. Increasing eccentricity makes the orbit more elongated; increasing inclination tilts it relative to the reference plane.

## Moons and Telemetry

ASTRA includes Earth's Moon, Io, Europa, Ganymede, Callisto, and Titan. Each follows a simple parent-centred orbit driven by the simulation clock and can be selected from the object register. Telemetry combines physical records with live simulation date and speed.

## Mission Scenarios

Scenarios are stored in `localStorage` only. A saved scenario contains the selected object, simulated date, speed, experiment values, transfer state, and active spacecraft mission. No backend or account is required.

## Landing Page

The landing page uses an Orbital Blueprint direction: near-black vacuum blue, restrained blueprint cyan, and perihelion amber for action. Scroll progress drives the hero instrument and scientific story while the final CTA routes to the real `/simulate` instrument.

## Scientific Simplifications

ASTRA is realistic enough to teach the main ideas but is not NASA-grade software. It uses simplified heliocentric Keplerian motion, visual scale stretching, approximate moon motion, idealized transfer paths, and an educational spacecraft interpolation. It does not claim full N-body physics, high-precision ephemerides, launch-window accuracy, or professional mission planning.

## Skills Used

The enhancement followed the web design engineering, web design review, interactive 3D/game development, code review, humanized writing, and Nothing-inspired restraint guidance. The existing Orbital Blueprint direction was retained; Nothing-inspired principles were applied selectively through flat technical controls, readable hierarchy, and restrained instrumentation rather than replacing the ASTRA identity.

## Installation and Running

```bash
pnpm install
pnpm dev
```

Useful validation commands:

```bash
pnpm check
pnpm build
```

## Known Limitations and Future Improvements

The visual scale is not physical, moon orbits are not to scale, and mission paths are illustrative. Future student-friendly extensions could include a launch-window lesson, more satellite records, texture maps, exportable measurement notes, and optional barycentric comparisons.
