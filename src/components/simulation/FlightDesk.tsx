import { Play, Rocket, X } from "lucide-react";
import {
  getMissionDaysLeft,
  getMissionProgress,
  type Mission,
} from "@/lib/mission";

type Option = { id: string; name: string };

type Props = {
  from: string;
  to: string;
  onFromChange: (id: string) => void;
  onToChange: (id: string) => void;
  options: Option[];
  estimateDays: number;
  mission: Mission;
  simulatedDay: number;
  nameOf: (id: string) => string;
  onLaunch: () => void;
  onEnd: () => void;
};

export function FlightDesk({
  from,
  to,
  onFromChange,
  onToChange,
  options,
  estimateDays,
  mission,
  simulatedDay,
  nameOf,
  onLaunch,
  onEnd,
}: Props) {
  const progress = getMissionProgress(mission, simulatedDay);
  const daysLeft = getMissionDaysLeft(mission, simulatedDay);
  const state = !mission
    ? "On the pad"
    : progress >= 100
      ? "Arrived"
      : "In flight";

  return (
    <section className="flightdesk" aria-labelledby="flightdesk-title">
      <header className="flightdesk-head">
        <div>
          <p className="panel-eyebrow">Flight desk</p>
          <h2 id="flightdesk-title">
            <Rocket size={16} aria-hidden="true" /> Send something across the
            system
          </h2>
        </div>
        <span className={`flight-state ${mission ? "is-live" : ""}`}>
          <i aria-hidden="true" /> {state}
        </span>
      </header>

      <div className="flightdesk-row">
        <label className="field">
          <span>Leave from</span>
          <select
            className="select"
            value={from}
            onChange={event => onFromChange(event.target.value)}
          >
            {options.map(option => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>
        </label>
        <span className="flight-arrow" aria-hidden="true">
          →
        </span>
        <label className="field">
          <span>Arrive at</span>
          <select
            className="select"
            value={to}
            onChange={event => onToChange(event.target.value)}
          >
            {options.map(option => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>
        </label>
        <div className="estimate">
          <span>If it flew today</span>
          <strong>
            {estimateDays.toLocaleString("en-US")}
            <small> days</small>
          </strong>
        </div>
        <button
          type="button"
          className={`btn is-primary ${mission ? "is-secondary" : ""}`}
          onClick={mission ? onEnd : onLaunch}
        >
          {mission ? (
            <>
              <X size={15} /> End flight
            </>
          ) : (
            <>
              <Play size={14} fill="currentColor" /> Launch
            </>
          )}
        </button>
      </div>

      <div className="flight-progress">
        <div className="track">
          <i style={{ width: `${mission ? progress : 0}%` }} />
        </div>
        {mission ? (
          <p className="flight-progress-text">
            <span>
              {nameOf(mission.from)} <b>→</b> {nameOf(mission.to)}
            </span>
            <span>
              {progress >= 100
                ? "It arrived. The spacecraft stayed on the line the model drew."
                : `${progress}% there · about ${daysLeft.toLocaleString("en-US")} simulated days left`}
            </span>
          </p>
        ) : (
          <p className="flight-progress-text">
            <span>Nothing launched yet</span>
            <span>
              The craft travels in a straight, gently arced line — an
              educational shortcut, not a real trajectory.
            </span>
          </p>
        )}
      </div>
    </section>
  );
}
