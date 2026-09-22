/**
 * ASTRA-3D / Orbital Blueprint: a compact expandable record panel for selected celestial data.
 */
import { motion } from "framer-motion";
import { ArrowUpRight, Bookmark, CircleDashed } from "lucide-react";
import type { Body } from "@/data/bodies";

type InspectorProps = {
  body: Body;
  isSaved: boolean;
  onToggleSave: () => void;
};

export function Inspector({ body, isSaved, onToggleSave }: InspectorProps) {
  const readings = [
    ["Classification", body.category],
    ["Mean diameter", body.diameter],
    ["Solar distance", body.solarDistance],
    ["Orbital period", body.orbitalPeriod],
  ];

  return (
    <aside className="inspector-card" aria-live="polite" aria-labelledby="inspector-heading">
      <div className="panel-heading inspector-topline">
        <div>
          <p className="eyebrow">02 · Object record</p>
          <span className="record-id">SOL / {body.id.toUpperCase()} / 0{body.id.length + 3}</span>
        </div>
        <button className={`icon-button ${isSaved ? "is-active" : ""}`} onClick={onToggleSave} aria-label={`${isSaved ? "Remove" : "Save"} ${body.name} from field notes`}>
          <Bookmark size={16} fill={isSaved ? "currentColor" : "none"} />
        </button>
      </div>

      <motion.div
        className="selected-object"
        key={body.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
      >
        <div className="object-emblem" style={{ "--emblem-color": body.accent } as React.CSSProperties}>
          <span>{body.symbol}</span>
          <i />
        </div>
        <div>
          <p className="eyebrow">Selected body</p>
          <h2 id="inspector-heading">{body.name}</h2>
          <p className="body-category">{body.category}</p>
        </div>
      </motion.div>

      <p className="object-summary">{body.description}</p>

      <dl className="data-readings">
        {readings.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>

      <div className="fact-note">
        <CircleDashed size={16} />
        <p><strong>Field note</strong>{body.fact}</p>
      </div>

      <button className="inspector-link" onClick={() => document.getElementById("archive")?.scrollIntoView({ behavior: "smooth" })}>
        Read archive brief <ArrowUpRight size={15} />
      </button>
    </aside>
  );
}
