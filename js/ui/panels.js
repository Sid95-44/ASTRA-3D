/**
 * panels.js
 * ------------------------------------------------------------------------
 * Renders the left "System Objects" list and the right scientific
 * data-sheet panel. Pure DOM rendering — no Three.js here — so it stays
 * easy to extend as later milestones add asteroids, satellites, and
 * spacecraft to the same list/panel pattern.
 * ------------------------------------------------------------------------
 */
import { CELESTIAL_BODIES, PLANET_ORDER } from "../data/dataManager.js";

const numberFormatter = new Intl.NumberFormat("en-US");

function formatNumber(n, maxFractionDigits = 2) {
  if (n === null || n === undefined) return "—";
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: maxFractionDigits }).format(n);
}

function formatScientific(n) {
  if (n === null || n === undefined) return "—";
  const exp = n.toExponential(3);
  const [mantissa, power] = exp.split("e");
  const sign = power.startsWith("-") ? "-" : "";
  return `${mantissa} × 10${toSuperscript(sign + power.replace("-", "").replace("+", ""))}`;
}

function toSuperscript(str) {
  const map = { "0":"⁰","1":"¹","2":"²","3":"³","4":"⁴","5":"⁵","6":"⁶","7":"⁷","8":"⁸","9":"⁹","-":"⁻" };
  return str.split("").map((c) => map[c] ?? c).join("");
}

/**
 * Renders the left object-list panel (Sun + planets for Milestone 1).
 * @param {HTMLElement} container
 * @param {(id:string)=>void} onSelect - called with body id when a row is clicked.
 */
export function renderObjectList(container, onSelect) {
  container.innerHTML = "";

  const starGroup = document.createElement("div");
  starGroup.className = "object-list-group-label";
  starGroup.textContent = "Star";
  container.appendChild(starGroup);
  container.appendChild(buildObjectRow(CELESTIAL_BODIES.sun, onSelect));

  const planetGroup = document.createElement("div");
  planetGroup.className = "object-list-group-label";
  planetGroup.textContent = "Planets";
  container.appendChild(planetGroup);
  for (const id of PLANET_ORDER) {
    container.appendChild(buildObjectRow(CELESTIAL_BODIES[id], onSelect));
  }
}

function buildObjectRow(data, onSelect) {
  const row = document.createElement("button");
  row.className = "object-row";
  row.id = `row-${data.id}`;
  row.dataset.bodyId = data.id;

  const swatch = document.createElement("span");
  swatch.className = "object-swatch";
  swatch.style.background = `#${data.color.toString(16).padStart(6, "0")}`;
  swatch.style.color = `#${data.color.toString(16).padStart(6, "0")}`;

  const text = document.createElement("span");
  text.className = "object-row-text";
  text.innerHTML = `<span class="object-row-name">${data.name}</span><span class="object-row-type">${data.type}</span>`;

  row.appendChild(swatch);
  row.appendChild(text);
  row.addEventListener("click", () => onSelect(data.id));
  return row;
}

/** Marks a single row as selected in the left list. */
export function setSelectedRow(bodyId) {
  document.querySelectorAll(".object-row").forEach((el) => {
    el.classList.toggle("is-selected", el.dataset.bodyId === bodyId);
  });
}

/**
 * Renders the right-hand scientific data sheet for a selected body.
 */
export function renderInfoPanel(bodyId) {
  const data = CELESTIAL_BODIES[bodyId];
  const titleEl = document.getElementById("info-title");
  const subtitleEl = document.getElementById("info-subtitle");
  const bodyEl = document.getElementById("info-body");

  if (!data) {
    titleEl.textContent = "No object selected";
    subtitleEl.textContent = "Select a body to inspect its data";
    bodyEl.innerHTML = `<p class="info-placeholder">Click any planet or the Sun in the 3D view — or choose one from the <strong>System Objects</strong> list — to display its scientific data sheet here.</p>`;
    return;
  }

  titleEl.textContent = data.name;
  subtitleEl.textContent = data.type;

  const cells = [
    { label: "Mass", value: `${formatScientific(data.massKg)}`, unit: "kg" },
    { label: "Radius", value: formatNumber(data.radiusKm, 0), unit: "km" },
    { label: "Surface gravity", value: formatNumber(data.surfaceGravityMs2, 2), unit: "m/s²" },
    { label: "Avg. temperature", value: formatNumber(data.avgTemperatureC, 0), unit: "°C" },
    {
      label: "Distance from Sun",
      value: data.distanceFromSunKm ? formatNumber(data.distanceFromSunKm / 1e6, 1) : "—",
      unit: data.distanceFromSunKm ? "million km" : "",
    },
    {
      label: "Orbital period",
      value: data.orbitalPeriodDays ? formatOrbitalPeriod(data.orbitalPeriodDays) : "—",
      unit: "",
    },
    {
      label: "Rotation period",
      value: data.rotationPeriodDays ? formatNumber(Math.abs(data.rotationPeriodDays), 2) : "—",
      unit: data.rotationPeriodDays ? (Math.abs(data.rotationPeriodDays) < 1 ? "days (retrograde-aware)" : "Earth days") : "",
    },
    { label: "Moons", value: formatNumber(data.moons, 0), unit: "" },
  ];

  const escapeVelocity = estimateEscapeVelocityKmS(data.massKg, data.radiusKm);

  const gridHtml = cells
    .map(
      (c) => `
      <div class="data-cell">
        <span class="data-cell-label">${c.label}</span>
        <span class="data-cell-value">${c.value}${c.unit ? `<span class="unit">${c.unit}</span>` : ""}</span>
      </div>`
    )
    .join("");

  bodyEl.innerHTML = `
    <div class="data-badge-row">
      <span class="data-badge badge-real">Real NASA/JPL data</span>
      <span class="data-badge badge-calc">Escape velocity: calculated</span>
    </div>

    <div class="info-section-label">Overview</div>
    <p class="info-description">${data.description}</p>

    <div class="info-section-label">Physical &amp; Orbital Data</div>
    <div class="data-grid">
      ${gridHtml}
      <div class="data-cell">
        <span class="data-cell-label">Escape velocity</span>
        <span class="data-cell-value">${formatNumber(escapeVelocity, 2)}<span class="unit">km/s</span></span>
      </div>
      <div class="data-cell">
        <span class="data-cell-label">Eccentricity</span>
        <span class="data-cell-value">${data.eccentricity !== undefined ? formatNumber(data.eccentricity, 4) : "—"}</span>
      </div>
    </div>

    <div class="info-source">
      Source: NASA Planetary Fact Sheets (nssdc.gsfc.nasa.gov) &amp; JPL
      Solar System Dynamics (ssd.jpl.nasa.gov). Escape velocity is
      calculated in-app from mass and radius (v = √(2GM/r)) — see badge
      above. 3D position uses a simplified circular/elliptical orbit
      model; full Keplerian mechanics arrive in Milestone 3.
    </div>
  `;
}

function formatOrbitalPeriod(days) {
  if (days < 1) return `${formatNumber(days * 24, 1)} hours`;
  if (days < 500) return `${formatNumber(days, 1)} Earth days`;
  return `${formatNumber(days / 365.25, 2)} Earth years`;
}

/** v_escape = sqrt(2GM/r) — a real, simple calculated value, clearly labeled as such in the UI. */
function estimateEscapeVelocityKmS(massKg, radiusKm) {
  const G = 6.6743e-11;
  const radiusM = radiusKm * 1000;
  const v = Math.sqrt((2 * G * massKg) / radiusM);
  return v / 1000;
}