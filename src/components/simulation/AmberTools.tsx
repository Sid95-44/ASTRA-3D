import { RotateCcw } from "lucide-react";
import {
  DEFAULT_EXPERIMENT,
  EXPERIMENT_RANGES,
  describeExperiment,
  type Experiment,
  type Transfer,
} from "@/lib/mission";

type Props = {
  experiment: Experiment;
  onExperimentChange: (next: Experiment) => void;
  transfer: Transfer;
  transferDays: number;
  routeLabel: string;
  onDrawTransfer: () => void;
  onClearTransfer: () => void;
};

export function AmberTools({
  experiment,
  onExperimentChange,
  transfer,
  transferDays,
  routeLabel,
  onDrawTransfer,
  onClearTransfer,
}: Props) {
  return (
    <section className="panel amber-panel" aria-labelledby="amber-title">
      <header className="panel-head">
        <div>
          <p className="panel-eyebrow">Your own geometry</p>
          <h2 id="amber-title">Two ways to draw an orbit yourself</h2>
        </div>
        <span className="swatch">solid = transfer · dashed = your orbit</span>
      </header>

      <div className="amber-group">
        <h3>Hohmann transfer</h3>
        <p className="panel-note">
          The efficient half-ellipse between two planetary orbits, assuming both
          are roughly circular and in the same plane. Drawn solid, in amber.
          Real missions wait for a launch window; this one doesn't.
        </p>
        <p className="amber-reading">
          <strong>
            {transfer ? `~${transferDays.toLocaleString("en-US")} days` : "—"}
          </strong>
          <span>
            {transfer
              ? routeLabel
              : "Nothing drawn yet — the flight desk sets the route."}
          </span>
        </p>
        <div className="panel-actions">
          <button type="button" className="btn" onClick={onDrawTransfer}>
            {transfer ? "Redraw it" : "Draw the transfer"}
          </button>
          {transfer && (
            <button
              type="button"
              className="btn is-quiet"
              onClick={onClearTransfer}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="amber-group">
        <h3>
          Change one orbit
          <button
            type="button"
            className="btn is-quiet is-small"
            onClick={() => onExperimentChange(DEFAULT_EXPERIMENT)}
          >
            <RotateCcw size={13} /> Reset
          </button>
        </h3>
        <p className="panel-note">
          Move the sliders and watch the dashed amber ring. Nothing else in the
          model moves — that's the point of a controlled experiment.
        </p>
        {EXPERIMENT_RANGES.map(range => (
          <label className="slider" key={range.key}>
            <span>
              {range.label}
              <b>
                {experiment[range.key].toFixed(range.decimals)}
                {range.unit}
              </b>
            </span>
            <input
              type="range"
              min={range.min}
              max={range.max}
              step={range.step}
              value={experiment[range.key]}
              onChange={event =>
                onExperimentChange({
                  ...experiment,
                  [range.key]: Number(event.target.value),
                  active: true,
                })
              }
            />
          </label>
        ))}
        <p className="panel-note">
          {experiment.active
            ? `Current ring: ${describeExperiment(experiment)}. ${
                experiment.eccentricity > 0.35
                  ? "That's a noticeably stretched ellipse."
                  : "Still close to circular."
              }`
            : "No experimental ring yet. Any slider will add one."}
        </p>
      </div>
    </section>
  );
}
