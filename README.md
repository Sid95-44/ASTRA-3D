# ASTRA 3D

ASTRA 3D is a student space-science project built around a simple idea: the
Solar System is more interesting when you can play with it. Set a date, speed up
the clock, choose a planet, and see how its position and the numbers around it
change.

The model uses Kepler-inspired orbits to make the planets move, but it is not a
full physics simulation or a mission-planning tool. It leaves out things like
the gravitational pull between planets and real launch windows. Those limits
are part of the project, so they are explained in the experience as well as
here. I wanted ASTRA to make the ideas easier to explore while being honest
about what it cannot do.

## What you can explore

- **Planetary orbits:** Each planet's mean anomaly advances with the simulated
  day and its orbital period. Six Newton–Raphson steps solve Kepler's equation
  and place it on an inclined ellipse. The motion comes from the model, rather
  than from keyframes or hand-placed positions.
- **A changeable clock:** Run time from 1× to 100,000×, or jump to a date
  between 1900 and 2200.
- **Distance measurements:** Choose two bodies to measure the gap between their
  current three-dimensional positions, including orbital inclination. The
  scene stretches distances so everything fits on screen, but measurements use
  the model's positions, not the drawing.
- **Flights and transfers:** Launch an educational flight that travels along an
  arced line between two bodies, or draw an idealized Hohmann half-ellipse
  between planetary orbits. Both show useful ideas, but neither predicts a real
  spacecraft trajectory.
- **An orbit experiment:** Adjust semi-major axis, eccentricity, and inclination
  to see how each changes a separate, dashed orbit.
- **A notebook and short memory:** ASTRA can keep notes about what you looked
  at, measured, launched, drew, or asked. The notes and saved runs stay in this
  browser, and ASTRA can read recent notes back to you on a return visit.
- **ASTRA Guide:** Ask about the selected body, the clock, measurements, or the
  model. Its answers come from a fixed set of reviewed topics and current app
  data. It works without a network request or API key, and says when it does
  not know an answer.

## Try it locally

You will need Node.js and pnpm installed.

```bash
pnpm install
pnpm dev
```

Vite prints the local address when the development server starts (usually
`http://localhost:3000`). Before pushing a change, these project checks are
available:

```bash
pnpm check      # TypeScript check
pnpm test       # orbital maths, guide responses, and notebook helpers
pnpm build      # build the static site into dist/
pnpm preview    # preview the built site
```

## Publishing

Pushing to `main` runs the GitHub Pages workflow in
`.github/workflows/deploy-pages.yml`. In the repository settings, choose
**Settings → Pages → Source → GitHub Actions**. The workflow builds the site
with the `/ASTRA-3D/` base path and copies `index.html` to `404.html`, so a
direct visit to or refresh of `/simulate` works on GitHub Pages.

Netlify uses `netlify.toml` to run `pnpm build` and publish the `dist/` folder.

## How the project is put together

```text
src/
  pages/Landing.tsx                  project introduction and orbital explainer
  pages/Simulation.tsx               clock, canvas, measurements, and controls
  components/canvas/SolarSystemCanvas.tsx
                                     Three.js scene: bodies, orbits, and paths
  components/OrbitDiagram.tsx        landing-page chart using the orbit solver
  components/AstraMark.tsx           vector logo mark
  components/AstraGuide.tsx          ASTRA question-and-answer panel
  components/simulation/             flight desk, orbit tools, and notebook
  lib/orbital.ts                     orbital positions, distances, transfer time
  lib/mission.ts                     flight, transfer, and experiment logic
  lib/astraGuide.ts                  supported topics and answer text
  lib/session.ts                     notebook and memory in localStorage
  data/bodies.ts, data/moons.ts      planet and moon records
  index.css                          application styles
```

The orbital calculations and guide responses live in `lib/`, separate from the
components that display them. That keeps the guide's rules understandable and
lets its answers be tested without opening the 3D scene.

## A note on the science

ASTRA advances each planet's mean anomaly from the simulated date and orbital
period, solves Kepler's equation, and uses the result to place the planet on an
inclined ellipse. Distances are calculated from those current three-dimensional
positions and converted from astronomical units using 1 AU = 149,597,870.7 km.
The on-screen spacing is stretched to keep the outer planets visible.

The flight animation is an educational interpolation, and the Hohmann transfer
assumes idealized, roughly circular planetary orbits. Moon motion and moon
orbits are simplified too; the drawn moon paths are enlarged for readability,
not shown to true scale. ASTRA does not include N-body gravity, perturbations,
full ephemerides, or launch-window accuracy, so it is best used to explore the
main ideas rather than to make real astronomical or mission-planning decisions.

## Design choices

Colour helps separate different kinds of information. Amber marks things the
visitor adds or can change, such as a flight or experimental orbit. Cyan marks
values produced by the model, and green shows that something is running. The
rest of the interface stays close to the dark navy background.

I also tried to give each panel a clear job: show a measurement, explain a
selected world, or help you try something. If a number does not help explain
the Solar System or an action you just took, it probably does not need its own
panel.

## What is still rough

- Planets are shaded spheres without surface textures. Textures would be a nice
  next step.
- Moon paths are enlarged to stay visible beside their planets; they are not to
  scale.
- Flights and transfer times skip the complications that shape real missions,
  including launch windows and gravity assists.
- The notebook, short memory, and saved runs use this browser's `localStorage`.
  Clearing site data removes them, and some private or restricted browsing
  modes may block saving.
- `package.json` still contains scaffolded UI dependencies that are no longer
  imported by the app. Removing them would also require updating the lockfile.
- ASTRA Guide only answers from its supported topics. For anything outside
  those topics, it says it does not know.
