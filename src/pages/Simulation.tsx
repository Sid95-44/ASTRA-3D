import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  Crosshair,
  Pause,
  Play,
  RotateCcw,
  Ruler,
  Target,
  Trash2,
  X,
  Zap,
} from "lucide-react";
import { Link } from "wouter";
import { AstraGuide } from "@/components/AstraGuide";
import { AstraMark } from "@/components/AstraMark";
import { SolarSystemCanvas } from "@/components/canvas/SolarSystemCanvas";
import { AmberTools } from "@/components/simulation/AmberTools";
import { FlightDesk } from "@/components/simulation/FlightDesk";
import { Notebook } from "@/components/simulation/Notebook";
import { bodies, getBody } from "@/data/bodies";
import { moons, getMoon } from "@/data/moons";
import type { GuideContext } from "@/lib/astraGuide";
import {
  DEFAULT_EXPERIMENT,
  describeExperiment,
  describeFlight,
  getMissionProgress,
  type Experiment,
  type Mission,
  type Transfer,
} from "@/lib/mission";
import {
  formatCompactDistance,
  getApproximateMissionDays,
  getCelestialName,
  getDayFromDate,
  getDistanceBetweenObjectsKm,
  getSimulatedDate,
} from "@/lib/orbital";
import {
  appendNote,
  clearNotebook,
  formatNoteTime,
  markHintSeen,
  newId,
  readMemory,
  readNotebook,
  relativeTime,
  updateMemory,
  type Memory,
  type NotebookEntry,
  type NotebookKind,
} from "@/lib/session";

const SPEEDS = [1, 10, 100, 1000, 10000, 100000];
const formatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

type SavedRun = {
  name: string;
  selectedId: string;
  simulatedDay: number;
  speedIndex: number;
  experiment: Experiment;
  mission: Mission;
  transfer: Transfer;
};

const speedText = (value: number) => `${value.toLocaleString("en-US")}×`;

export default function Simulation() {
  const [selectedId, setSelectedId] = useState("earth");
  const [isPlaying, setIsPlaying] = useState(true);
  const [speedIndex, setSpeedIndex] = useState(2);
  const [simulatedDay, setSimulatedDay] = useState(0);
  const [showOrbits, setShowOrbits] = useState(true);
  const [showVelocity, setShowVelocity] = useState(false);
  const [cameraTargetId, setCameraTargetId] = useState<string | null>(null);
  const [measurementPair, setMeasurementPair] = useState<string[]>([]);
  const [dateInput, setDateInput] = useState("2025-01-01");
  const [flightFrom, setFlightFrom] = useState("earth");
  const [flightTo, setFlightTo] = useState("mars");
  const [mission, setMission] = useState<Mission>(null);
  const [transfer, setTransfer] = useState<Transfer>(null);
  const [experiment, setExperiment] = useState<Experiment>(DEFAULT_EXPERIMENT);
  const [runs, setRuns] = useState<SavedRun[]>([]);
  const [status, setStatus] = useState(
    "Nothing drawn yet. The clock starts at the model epoch, 1 Jan 2025."
  );
  const [guideOpen, setGuideOpen] = useState(false);
  const [entries, setEntries] = useState<NotebookEntry[]>([]);
  const [memory, setMemory] = useState<Memory>({
    visits: 0,
    lastBodyName: null,
    lastSeenAt: null,
    hintsSeen: [],
  });
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [storageWorks, setStorageWorks] = useState(true);

  const speed = SPEEDS[speedIndex];
  const simulatedDate = getSimulatedDate(simulatedDay);
  const dateLabel = formatter.format(simulatedDate);
  const selectedBody = getBody(selectedId);
  const selectedMoon = getMoon(selectedId);
  const selectedRecord = selectedMoon ?? selectedBody;
  const selectedName = selectedRecord.name;
  const nameOf = useCallback(
    (id: string) => getCelestialName(id, bodies, moons),
    []
  );

  const measurementDistance =
    measurementPair.length === 2
      ? getDistanceBetweenObjectsKm(
          measurementPair[0],
          measurementPair[1],
          bodies,
          moons,
          simulatedDay
        )
      : null;
  const measurementKey =
    measurementPair.length === 2
      ? `${measurementPair[0]}:${measurementPair[1]}`
      : "";

  // A previous reading for the same pair, so ASTRA can compare instead of hedging.
  const [sample, setSample] = useState<{
    key: string;
    km: number;
    formatted: string;
  } | null>(null);

  // Refs that outlive renders: the notebook writer, the mount guard, and the
  // clock/distance values read from inside timers.
  const dateLabelRef = useRef(dateLabel);
  dateLabelRef.current = dateLabel;
  const nameRef = useRef(selectedName);
  nameRef.current = selectedName;
  const distanceRef = useRef<number | null>(measurementDistance);
  distanceRef.current = measurementDistance;
  const mountGuard = useRef(false);
  const lastLookRef = useRef<string | null>(null);

  const note = useCallback(
    (kind: NotebookKind, text: string) => {
      if (!storageWorks) return;
      const entry: NotebookEntry = {
        id: newId(),
        kind,
        at: Date.now(),
        modelDate: dateLabelRef.current,
        text,
      };
      setEntries(appendNote(entry));
    },
    [storageWorks]
  );

  // --- clock ----------------------------------------------------------------
  useEffect(() => {
    if (!isPlaying) return undefined;
    const timer = window.setInterval(
      () => setSimulatedDay(day => day + speed * 0.22),
      220
    );
    return () => window.clearInterval(timer);
  }, [isPlaying, speed]);

  useEffect(() => {
    setDateInput(simulatedDate.toISOString().slice(0, 10));
  }, [simulatedDate]);

  // --- what this browser remembers -----------------------------------------
  useEffect(() => {
    if (mountGuard.current) return;
    mountGuard.current = true;
    try {
      setRuns(
        JSON.parse(localStorage.getItem("astra-runs") ?? "[]") as SavedRun[]
      );
      setEntries(readNotebook());
    } catch {
      setStorageWorks(false);
      setStatus(
        "This browser is blocking local storage, so saved runs and notebook notes are off."
      );
    }
    const stored = readMemory();
    setMemory(stored);
    updateMemory({ visits: stored.visits + 1, lastSeenAt: Date.now() });
    return () => {
      const name = nameRef.current;
      updateMemory({ lastBodyName: name, lastSeenAt: Date.now() });
    };
  }, []);

  // --- notebook: only write down things that actually happened --------------
  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (lastLookRef.current === selectedName) return;
      lastLookRef.current = selectedName;
      note("looked", `Looked at ${selectedName}.`);
    }, 2_500);
    return () => window.clearTimeout(timer);
  }, [selectedName, note]);

  useEffect(() => {
    if (!experiment.active) return undefined;
    const timer = window.setTimeout(
      () =>
        note(
          "experiment",
          `Set the experimental orbit to ${describeExperiment(experiment)}.`
        ),
      1_400
    );
    return () => window.clearTimeout(timer);
  }, [experiment, note]);

  const arrivalRef = useRef<string | null>(null);
  const missionProgress = getMissionProgress(mission, simulatedDay);
  useEffect(() => {
    if (!mission || missionProgress < 100) return;
    const key = `${mission.from}:${mission.to}:${mission.launchedAt}`;
    if (arrivalRef.current === key) return;
    arrivalRef.current = key;
    note("flight", `The flight to ${nameOf(mission.to)} arrived.`);
  }, [mission, missionProgress, nameOf, note]);

  // A comparison sample is only ever an *earlier* reading: the first one lands
  // about half a minute after a pair is chosen, never at the moment of choice,
  // so "are they getting closer?" compares against the past, not against
  // itself.
  useEffect(() => {
    if (!measurementKey) {
      setSample(null);
      return undefined;
    }
    const read = () => {
      const km = distanceRef.current;
      if (km === null) return;
      setSample({
        key: measurementKey,
        km,
        formatted: formatCompactDistance(km),
      });
    };
    const timer = window.setInterval(read, 30_000);
    return () => window.clearInterval(timer);
  }, [measurementKey]);

  // --- guide context --------------------------------------------------------
  const guideContext: GuideContext = useMemo(
    () => ({
      selectedBody,
      simulatedDay,
      simulatedDateLabel: dateLabel,
      speedMultiplier: speed,
      measurement:
        measurementPair.length === 2 && measurementDistance !== null
          ? {
              firstName: nameOf(measurementPair[0]),
              secondName: nameOf(measurementPair[1]),
              distanceKm: measurementDistance,
              formattedDistance: formatCompactDistance(measurementDistance),
              previousFormattedDistance:
                sample?.key === measurementKey ? sample.formatted : undefined,
              previousDistanceKm:
                sample?.key === measurementKey ? sample.km : undefined,
            }
          : null,
      activity: {
        experiment: experiment.active ? describeExperiment(experiment) : null,
        flight:
          mission && missionProgress < 100
            ? describeFlight(mission, simulatedDay, nameOf)
            : null,
        transfer: transfer
          ? `${nameOf(transfer.from)} to ${nameOf(transfer.to)}`
          : null,
      },
      memory: {
        recent: [...entries]
          .reverse()
          .slice(0, 3)
          .map(entry => ({ text: entry.text, when: formatNoteTime(entry) })),
        visits: memory.visits,
        lastBodyName: memory.lastBodyName,
        lastSeenLabel: memory.lastSeenAt
          ? relativeTime(memory.lastSeenAt)
          : null,
      },
    }),
    [
      selectedBody,
      simulatedDay,
      dateLabel,
      speed,
      measurementPair,
      measurementDistance,
      sample,
      nameOf,
      experiment,
      mission,
      missionProgress,
      transfer,
      entries,
      memory,
    ]
  );

  // --- actions --------------------------------------------------------------
  const selectBody = (id: string) => {
    setSelectedId(id);
    setCameraTargetId(null);
  };

  const launchMission = () => {
    if (flightFrom === flightTo) {
      setStatus("That's the same world twice. Pick two different ones.");
      return;
    }
    const travelDays = getApproximateMissionDays(
      flightFrom,
      flightTo,
      bodies,
      moons
    );
    setMission({
      from: flightFrom,
      to: flightTo,
      launchedAt: simulatedDay,
      travelDays,
    });
    setStatus(
      `Launched: ${nameOf(flightFrom)} → ${nameOf(flightTo)}, about ${travelDays.toLocaleString(
        "en-US"
      )} days of interpolated travel.`
    );
    note(
      "flight",
      `Launched a flight from ${nameOf(flightFrom)} to ${nameOf(flightTo)}, about ${travelDays.toLocaleString("en-US")} days.`
    );
  };

  const drawTransfer = () => {
    if (flightFrom === flightTo) {
      setStatus("That's the same world twice. Pick two different ones.");
      return;
    }
    if (moons.some(moon => moon.id === flightFrom || moon.id === flightTo)) {
      setTransfer(null);
      setStatus(
        "Hohmann transfers only make sense between planetary orbits — swap the moon for a planet."
      );
      return;
    }
    const days = getApproximateMissionDays(flightFrom, flightTo, bodies, moons);
    setTransfer({ from: flightFrom, to: flightTo });
    setStatus(
      `Transfer drawn: ${nameOf(flightFrom)} → ${nameOf(flightTo)}, roughly ${days.toLocaleString(
        "en-US"
      )} days on the half-ellipse.`
    );
    note(
      "experiment",
      `Drew a Hohmann transfer from ${nameOf(flightFrom)} to ${nameOf(flightTo)} — about ${days.toLocaleString("en-US")} days.`
    );
  };

  const resetView = () => {
    setIsPlaying(false);
    setSpeedIndex(0);
    setSimulatedDay(0);
    setMission(null);
    setTransfer(null);
    setDateInput("2025-01-01");
    setStatus("Reset. Back to 1 Jan 2025, 1× speed, nothing drawn.");
  };

  const toggleMeasure = (id: string) => {
    setMeasurementPair(pair => {
      const next = pair.includes(id)
        ? pair.filter(item => item !== id)
        : pair.length === 2
          ? [pair[1], id]
          : [...pair, id];
      if (next.length === 2) {
        const km = getDistanceBetweenObjectsKm(
          next[0],
          next[1],
          bodies,
          moons,
          simulatedDay
        );
        note(
          "measured",
          `Measured ${nameOf(next[0])} → ${nameOf(next[1])}: ${formatCompactDistance(km)}.`
        );
        setStatus(
          `${nameOf(next[0])} and ${nameOf(next[1])} are ${formatCompactDistance(km)} apart in the model right now.`
        );
      }
      return next;
    });
  };

  const saveRun = () => {
    const name = `${nameOf(flightFrom)} → ${nameOf(flightTo)}`;
    const next = [
      ...runs.filter(run => run.name !== name),
      {
        name,
        selectedId,
        simulatedDay,
        speedIndex,
        experiment,
        mission,
        transfer,
      },
    ];
    setRuns(next);
    if (storageWorks) localStorage.setItem("astra-runs", JSON.stringify(next));
    setStatus(`Saved this run as “${name}”. It lives in this browser only.`);
    note("saved", `Saved the run “${name}” at ${dateLabel}.`);
  };

  const loadRun = (run: SavedRun) => {
    setSelectedId(run.selectedId);
    setSimulatedDay(run.simulatedDay);
    setSpeedIndex(run.speedIndex);
    setExperiment(run.experiment);
    setMission(run.mission);
    setTransfer(run.transfer);
    setStatus(
      `Loaded “${run.name}” — date, speed, and geometry all came back.`
    );
  };

  const deleteRun = (name: string) => {
    const next = runs.filter(run => run.name !== name);
    setRuns(next);
    if (storageWorks) localStorage.setItem("astra-runs", JSON.stringify(next));
    setStatus(`Deleted “${name}”.`);
  };

  const dismissHint = (id: string) => {
    markHintSeen(id);
    setDismissed(current =>
      current.includes(id) ? current : [...current, id]
    );
    setMemory(current => ({
      ...current,
      hintsSeen: [...current.hintsSeen, id],
    }));
  };

  const hint = useMemo(() => {
    const hidden = new Set([...dismissed, ...memory.hintsSeen]);
    const returning =
      memory.visits > 1 && memory.lastBodyName && memory.lastSeenAt;
    if (returning && !hidden.has("return")) {
      return {
        id: "return",
        text: `Last visit you were on ${memory.lastBodyName} ${relativeTime(
          memory.lastSeenAt!
        )}. The notebook kept the notes, so nothing here starts from zero.`,
      };
    }
    if (entries.length === 0 && !hidden.has("stage")) {
      return {
        id: "stage",
        text: "Click a world to select it. Drag to walk the camera around, scroll to zoom in.",
      };
    }
    if (measurementPair.length === 1) {
      return {
        id: "measure",
        text: "One more: pick a second world and ASTRA measures the gap between their live positions.",
      };
    }
    if (experiment.active && !transfer && !mission) {
      return {
        id: "experiment",
        text: "That amber ring is your orbit, not a planet's. Move a slider and compare it with the real paths.",
      };
    }
    if (!guideOpen && selectedId !== "earth" && !hidden.has("guide")) {
      return {
        id: "guide",
        text: `ASTRA reads the model underneath — try asking it about ${selectedName}.`,
      };
    }
    return null;
  }, [
    dismissed,
    memory,
    entries.length,
    measurementPair.length,
    experiment.active,
    transfer,
    mission,
    guideOpen,
    selectedId,
    selectedName,
  ]);

  const selectedReadings = useMemo(
    () =>
      selectedMoon
        ? [
            ["Diameter", selectedMoon.diameter],
            ["Parent", nameOf(selectedMoon.parentId)],
            ["Orbital period", `${selectedMoon.orbitalPeriodDays} days`],
            [
              "Distance from parent",
              `${selectedMoon.distanceFromParentKm.toLocaleString()} km`,
            ],
          ]
        : [
            ["Diameter", selectedBody.diameter],
            ["Mass", selectedBody.mass],
            ["Distance from the Sun", selectedBody.solarDistance],
            ["Orbital period", selectedBody.orbitalPeriod],
            ["Orbital velocity", selectedBody.orbitalVelocity],
            ["Eccentricity", selectedBody.eccentricity.toFixed(3)],
            ["Inclination", `${selectedBody.inclination.toFixed(2)}°`],
            ["Moons", String(selectedBody.moons)],
          ],
    [selectedBody, selectedMoon, nameOf]
  );

  const flightOptions = [
    ...bodies
      .filter(body => body.id !== "sun")
      .map(body => ({ id: body.id, name: body.name })),
    ...moons.map(moon => ({
      id: moon.id,
      name: `${moon.name} (moon of ${nameOf(moon.parentId)})`,
    })),
  ];

  return (
    <main className="page simulation">
      <header className="page-bar">
        <Link href="/" className="brand">
          <AstraMark className="brand-mark" />
          <span className="brand-name">
            ASTRA <b>3D</b>
          </span>
        </Link>
        <p className="bar-note">
          Everything below is computed in your browser. Nothing is uploaded.
        </p>
        <Link href="/" className="btn is-quiet">
          <ArrowLeft size={15} /> Back to the story
        </Link>
      </header>

      <div className="tool">
        <aside className="rail">
          <div className="rail-head">
            <p className="panel-eyebrow">Heliocentric reference frame</p>
            <h1>
              The Solar System,
              <br />
              <em>running on your clock.</em>
            </h1>
            <p className="rail-help">
              Drag to orbit the camera. Scroll to zoom. Click a body to read its
              numbers.
            </p>
          </div>

          <div className="rail-group">
            <p className="rail-label">
              Bodies <span>{bodies.length + moons.length}</span>
            </p>
            <div className="register">
              {bodies.map(body => (
                <button
                  key={body.id}
                  type="button"
                  className={`register-row ${selectedId === body.id ? "is-selected" : ""}`}
                  onClick={() => selectBody(body.id)}
                >
                  <i style={{ background: body.accent }} aria-hidden="true" />
                  <span>{body.name}</span>
                  <small>
                    {body.id === "sun"
                      ? "star"
                      : `${body.semiMajorAxisAU.toFixed(2)} AU`}
                  </small>
                </button>
              ))}
              {moons.map(moon => (
                <button
                  key={moon.id}
                  type="button"
                  className={`register-row is-moon ${selectedId === moon.id ? "is-selected" : ""}`}
                  onClick={() => selectBody(moon.id)}
                >
                  <i style={{ background: moon.accent }} aria-hidden="true" />
                  <span>{moon.name}</span>
                  <small>{nameOf(moon.parentId)}</small>
                </button>
              ))}
            </div>
          </div>

          <div className="rail-note">
            <p>
              <strong>On the drawing</strong>
              Spacing is log-stretched so Mercury and Neptune fit on one screen.
              Measurements use the model's real positions, never the pixels.
            </p>
          </div>
        </aside>

        <section className="main">
          <div className="main-head">
            <div>
              <p className="panel-eyebrow">Reference plane · heliocentric</p>
              <h2>Kepler-inspired motion, live</h2>
            </div>
            <div className="head-actions">
              <span className="live">
                <i aria-hidden="true" />{" "}
                {isPlaying ? "Clock running" : "Clock paused"}
              </span>
              <button
                type="button"
                className="btn is-primary is-small"
                onClick={() => setGuideOpen(open => !open)}
                aria-expanded={guideOpen}
                aria-controls="astra-guide-panel"
              >
                Ask ASTRA
              </button>
            </div>
          </div>

          <AstraGuide
            context={guideContext}
            open={guideOpen}
            onOpenChange={setGuideOpen}
            onAsk={question => note("asked", `Asked ASTRA: “${question}”`)}
          />

          <FlightDesk
            from={flightFrom}
            to={flightTo}
            onFromChange={setFlightFrom}
            onToChange={setFlightTo}
            options={flightOptions}
            estimateDays={getApproximateMissionDays(
              flightFrom,
              flightTo,
              bodies,
              moons
            )}
            mission={mission}
            simulatedDay={simulatedDay}
            nameOf={nameOf}
            onLaunch={launchMission}
            onEnd={() => {
              setMission(null);
              setStatus("Flight ended. The model is back to planets only.");
            }}
          />

          <section className="stage">
            <SolarSystemCanvas
              bodies={bodies}
              moons={moons}
              simulatedDay={simulatedDay}
              selectedId={selectedId}
              showOrbits={showOrbits}
              showVelocity={showVelocity}
              cameraTargetId={cameraTargetId}
              mission={mission}
              transfer={transfer}
              experiment={experiment}
              onSelect={selectBody}
            />
            <div className="stage-label is-top-left">
              <span>Model date</span>
              <b>{dateLabel}</b>
            </div>
            <div className="stage-label is-top-right">
              <span>Clock speed</span>
              <b>{speedText(speed)}</b>
            </div>
            <div className="stage-label is-bottom-left">
              <span>{selectedName}</span>
              <b>
                {selectedMoon
                  ? `${selectedMoon.orbitalPeriodDays} days per orbit`
                  : `${selectedBody.orbitalVelocity} · e ${selectedBody.eccentricity.toFixed(3)}`}
              </b>
            </div>
            <div className="stage-tools">
              <button
                type="button"
                className={showOrbits ? "is-on" : ""}
                onClick={() => setShowOrbits(value => !value)}
                aria-pressed={showOrbits}
              >
                <span className="orbit-glyph" aria-hidden="true">
                  <i />
                </span>
                Orbit lines
              </button>
              <button
                type="button"
                className={showVelocity ? "is-on" : ""}
                onClick={() => setShowVelocity(value => !value)}
                aria-pressed={showVelocity}
              >
                <Zap size={13} /> Velocity arrows
              </button>
              <button
                type="button"
                onClick={() => setCameraTargetId(selectedId)}
              >
                <Target size={13} /> Focus on {selectedName}
              </button>
            </div>
          </section>

          {hint && (
            <aside className="hint" role="note">
              <p>{hint.text}</p>
              <button
                type="button"
                onClick={() => dismissHint(hint.id)}
                aria-label="Stop showing this hint"
              >
                <X size={14} />
              </button>
            </aside>
          )}

          <div className="console">
            <div className="console-main">
              <button
                type="button"
                className="icon-btn is-primary"
                onClick={() => setIsPlaying(playing => !playing)}
                aria-label={isPlaying ? "Pause the clock" : "Start the clock"}
              >
                {isPlaying ? <Pause size={17} /> : <Play size={17} />}
              </button>
              <button
                type="button"
                className="icon-btn"
                onClick={resetView}
                aria-label="Reset the view"
              >
                <RotateCcw size={16} />
              </button>
              <div className="clock">
                <span>
                  <CalendarDays size={13} /> Model date
                </span>
                <strong>{dateLabel}</strong>
              </div>
            </div>
            <div className="speeds">
              <span className="console-label">Clock speed</span>
              <div>
                {SPEEDS.map((option, index) => (
                  <button
                    key={option}
                    type="button"
                    className={speedIndex === index ? "is-selected" : ""}
                    onClick={() => setSpeedIndex(index)}
                  >
                    {speedText(option)}
                  </button>
                ))}
              </div>
            </div>
            <label className="field is-right">
              <span>Jump to a date</span>
              <input
                type="date"
                value={dateInput}
                min="1900-01-01"
                max="2200-12-31"
                onChange={event => {
                  setDateInput(event.target.value);
                  setSimulatedDay(getDayFromDate(event.target.value));
                  note(
                    "clock",
                    `Jumped the clock to ${formatter.format(
                      getSimulatedDate(getDayFromDate(event.target.value))
                    )}.`
                  );
                }}
              />
            </label>
          </div>

          <div className="panels">
            <section className="panel" aria-labelledby="measure-title">
              <header className="panel-head">
                <div>
                  <p className="panel-eyebrow">Measure</p>
                  <h2 id="measure-title">
                    <Ruler size={15} aria-hidden="true" /> The gap between two
                    worlds
                  </h2>
                </div>
                {measurementPair.length > 0 && (
                  <button
                    type="button"
                    className="btn is-quiet is-small"
                    onClick={() => setMeasurementPair([])}
                  >
                    Clear
                  </button>
                )}
              </header>
              <p className="panel-note">
                {measurementPair.length === 2
                  ? `${nameOf(measurementPair[0])} → ${nameOf(measurementPair[1])}`
                  : measurementPair.length === 1
                    ? `${nameOf(measurementPair[0])} selected — add one more.`
                    : "Pick two bodies. The reading follows them as the clock runs."}
              </p>
              {measurementDistance !== null ? (
                <p className="reading">
                  {formatCompactDistance(measurementDistance)}
                </p>
              ) : (
                <p className="empty">
                  Measured from the current inclined positions, so it changes as
                  the worlds move.
                </p>
              )}
              <div className="pick">
                {bodies.slice(0, 6).map(body => (
                  <button
                    key={body.id}
                    type="button"
                    className={
                      measurementPair.includes(body.id) ? "is-selected" : ""
                    }
                    onClick={() => toggleMeasure(body.id)}
                  >
                    {body.name}
                  </button>
                ))}
                {moons.slice(0, 2).map(moon => (
                  <button
                    key={moon.id}
                    type="button"
                    className={
                      measurementPair.includes(moon.id) ? "is-selected" : ""
                    }
                    onClick={() => toggleMeasure(moon.id)}
                  >
                    {moon.name}
                  </button>
                ))}
              </div>
            </section>

            <section className="panel" aria-labelledby="telemetry-title">
              <header className="panel-head">
                <div>
                  <p className="panel-eyebrow">Selected body</p>
                  <h2 id="telemetry-title">
                    <Crosshair size={15} aria-hidden="true" /> {selectedName}
                  </h2>
                </div>
                <button
                  type="button"
                  className="btn is-quiet is-small"
                  onClick={() => setCameraTargetId(selectedId)}
                >
                  Focus
                </button>
              </header>
              <p className="object-line">
                <span
                  className="emblem"
                  style={
                    {
                      "--emblem": selectedMoon?.accent ?? selectedBody.accent,
                    } as React.CSSProperties
                  }
                  aria-hidden="true"
                >
                  {selectedMoon?.symbol ?? selectedBody.symbol}
                </span>
                {selectedMoon ? "Major moon" : selectedBody.category}
              </p>
              <p className="panel-note">
                {selectedMoon?.description ?? selectedBody.description}
              </p>
              <dl className="stats">
                {selectedReadings.map(([label, value]) => (
                  <div key={label}>
                    <dt>{label}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
              <p className="fact">
                <strong>Worth knowing</strong>
                {selectedMoon?.fact ?? selectedBody.fact}
              </p>
            </section>

            <div className="span-2">
              <Notebook
                entries={entries}
                onClear={() => {
                  clearNotebook();
                  setEntries([]);
                  setStatus("Notebook cleared. A fresh page.");
                }}
              />
            </div>

            <AmberTools
              experiment={experiment}
              onExperimentChange={setExperiment}
              transfer={transfer}
              transferDays={getApproximateMissionDays(
                transfer?.from ?? flightFrom,
                transfer?.to ?? flightTo,
                bodies,
                moons
              )}
              routeLabel={`${nameOf(transfer?.from ?? flightFrom)} → ${nameOf(
                transfer?.to ?? flightTo
              )}`}
              onDrawTransfer={drawTransfer}
              onClearTransfer={() => {
                setTransfer(null);
                setStatus(
                  "Transfer cleared. The field is back to the real orbits."
                );
              }}
            />

            <section className="panel" aria-labelledby="runs-title">
              <header className="panel-head">
                <div>
                  <p className="panel-eyebrow">Saved runs</p>
                  <h2 id="runs-title">Come back to a configuration</h2>
                </div>
                <button
                  type="button"
                  className="btn is-small"
                  onClick={saveRun}
                >
                  Save this one
                </button>
              </header>
              {runs.length === 0 ? (
                <p className="empty">
                  Nothing saved yet. A saved run keeps the date, the clock
                  speed, the flight, and the experiment, so you can restart a
                  demonstration without rebuilding it.
                </p>
              ) : (
                <ul className="runs">
                  {runs.map(run => (
                    <li key={run.name}>
                      <button
                        type="button"
                        className="linkish"
                        onClick={() => loadRun(run)}
                      >
                        {run.name}
                      </button>
                      <span>
                        {formatter.format(getSimulatedDate(run.simulatedDay))}
                      </span>
                      <button
                        type="button"
                        className="icon-btn is-tiny"
                        onClick={() => deleteRun(run.name)}
                        aria-label={`Delete ${run.name}`}
                      >
                        <Trash2 size={13} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <footer className="panel-foot">
                {storageWorks
                  ? "Kept in this browser. No account, no server, nothing to sign into."
                  : "This browser is blocking local storage, so saving won't work here."}
              </footer>
            </section>
          </div>

          <div className="statusbar" role="status">
            <span>{status}</span>
            <span>
              Educational model: Kepler-inspired orbits, no N-body physics, no
              launch windows.
            </span>
          </div>
        </section>
      </div>
    </main>
  );
}
