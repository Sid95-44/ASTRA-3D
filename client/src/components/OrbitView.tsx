import type { CSSProperties } from "react";
import { Crosshair, Maximize2 } from "lucide-react";
import type { Body } from "@/data/bodies";
import { getVisualSemiMajorAxis } from "@/lib/orbital";

type OrbitViewProps = {
  bodies: Body[];
  selectedId: string;
  onSelect: (id: string) => void;
  guidedMode: boolean;
};

export function OrbitView({ bodies, selectedId, onSelect, guidedMode }: OrbitViewProps) {
  const planets = bodies.filter((body) => body.id !== "sun");
  return (
    <section className="observation-card" id="observation" aria-labelledby="observation-heading">
      <header className="panel-heading"><div><p className="eyebrow">01 · Primary instrument</p><h2 id="observation-heading">Orbital observation field</h2></div><div className="instrument-actions"><span className="live-pill"><i /> Live reference</span><span className="short-action"><Maximize2 size={14} /> Kepler model</span></div></header>
      <div className={`orbit-stage ${guidedMode ? "is-guided" : ""}`}>
        <div className="stage-corner corner-tl">R.A. 19h 50m</div><div className="stage-corner corner-tr">DEC −12° 18′</div><div className="stage-corner corner-bl">FRAME / HELIOCENTRIC</div><div className="stage-corner corner-br"><Crosshair size={14} /> LOCK / STABLE</div>
        {planets.map((planet) => <div className="orbit-line" key={`${planet.id}-orbit`} style={{ width: `${getVisualSemiMajorAxis(planet) * 14}%`, height: `${getVisualSemiMajorAxis(planet) * 8}%` }} aria-hidden="true" />)}
        {bodies.map((body) => {
          const visualAxis = body.id === "sun" ? 50 : 50 + Math.cos(body.phase) * getVisualSemiMajorAxis(body) * 4;
          const visualY = body.id === "sun" ? 50 : 50 + Math.sin(body.phase) * getVisualSemiMajorAxis(body) * 3;
          const style = { "--body-x": `${visualAxis}%`, "--body-y": `${visualY}%`, "--body-size": `${Math.max(8, body.visualRadius * 70)}px`, "--body-accent": body.accent } as CSSProperties;
          return <button className={`celestial-marker ${body.id === "sun" ? "sun-marker" : ""} ${selectedId === body.id ? "is-selected" : ""}`} key={body.id} style={style} onClick={() => onSelect(body.id)} aria-pressed={selectedId === body.id} aria-label={`Inspect ${body.name}`}><span className="marker-glow" /><span className="marker-orb" /><span className="marker-label"><b>{body.symbol}</b>{body.name}</span></button>;
        })}
      </div>
      <footer className="plot-caption"><span><i className="legend-dot terrestrial" /> Terrestrial</span><span><i className="legend-dot giant" /> Gas / ice giant</span><span><i className="legend-line" /> Illustrative orbital geometry</span><p>{guidedMode ? "Guided trace: Earth is the active reference." : "Select an object to inspect its baseline record."}</p></footer>
    </section>
  );
}
