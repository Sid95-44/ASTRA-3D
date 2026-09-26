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
- ASTRA Guide, a bounded client-side assistant for the selected body, orbital model, simulated time, and current distance measurements.
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
src/
  components/canvas/SolarSystemCanvas.tsx  Three.js scene, camera, moons, and mission paths
  data/bodies.ts                          Sun and planetary records
  data/moons.ts                           Selected major satellite records
  lib/orbital.ts                          Kepler propagation, positions, distances, transfer math
  pages/Landing.tsx                       Scroll-driven field brief and launch CTA
  pages/Simulation.tsx                    Observation deck, telemetry, and simulation controls
  index.css                               ASTRA visual system and responsive styles
  App.tsx                                 Routes and application providers
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

## ASTRA Guide

ASTRA Guide is a deterministic educational assistant. It matches a question to a reviewed topic and builds a short response from local body records, the current simulation date and speed, and the existing distance calculation. It covers selected-body telemetry, orbital period and speed, Kepler-inspired motion, eccentricity, inclination, astronomical units, measured distances, simulation time, visual scale, and model limitations. Unsupported questions receive a bounded fallback with suggested prompts.

The guide runs in the browser without a network request, login, or API key. Conversation messages remain in React state for the current simulation session and are cleared when the simulation route is unloaded or the user clears the chat. The guide cannot change simulation state and is not a general-purpose chatbot or mission-planning tool.

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

## Publish with GitHub Pages

This repository is configured to publish to GitHub Pages whenever a change is pushed to `main`. In the GitHub repository, open **Settings → Pages** and choose **GitHub Actions** as the build and deployment source. After the workflow completes, the site will be available at `https://sid95-44.github.io/ASTRA-3D/`. The workflow builds the static site and includes a fallback page so routes such as `/simulate` continue to work when opened directly or refreshed.

## Known Limitations and Future Improvements

The visual scale is not physical, moon orbits are not to scale, and mission paths are illustrative. Future student-friendly extensions could include a launch-window lesson, more satellite records, texture maps, exportable measurement notes, and optional barycentric comparisons.
