/**
 * ASTRA-3D / Orbital Blueprint: Complete build field station—an asymmetric, calm scientific foundation for future WebGL simulation.
 */
import { useState } from "react";
import { Activity, ArrowRight, Atom, CirclePlay, Cpu, Menu, ScanLine, Sparkles, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/Navigation";
import { Inspector } from "@/components/Inspector";
import { OrbitView } from "@/components/OrbitView";
import { bodies, getBody } from "@/data/bodies";

const heroAsset = "/manus-storage/astra-orbital-observatory-hero_d39490e6.jpg";
const archiveAsset = "/manus-storage/astra-solar-system-plate_ddf1bd9e.jpg";

export default function Dashboard() {
  const [selectedId, setSelectedId] = useState("earth");
  const [activeSection, setActiveSection] = useState("overview");
  const [guidedMode, setGuidedMode] = useState(false);
  const [saved, setSaved] = useState<string[]>([]);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const selectedBody = getBody(selectedId);

  const selectBody = (id: string) => {
    setSelectedId(id);
    setActiveSection("observation");
  };

  const navigate = (section: string) => {
    if (section === "calibration") {
      toast("Mission controls are available in the live simulation.");
      return;
    }
    setActiveSection(section);
    setMobileNavOpen(false);
    document.getElementById(section)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const beginGuidedTrace = () => {
    setSelectedId("earth");
    setGuidedMode(true);
    setActiveSection("observation");
    document.getElementById("observation")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const toggleSave = () => {
    setSaved((current) => current.includes(selectedId) ? current.filter((id) => id !== selectedId) : [...current, selectedId]);
  };

  return (
    <div className="astra-app">
      <aside className={`command-rail ${mobileNavOpen ? "is-open" : ""}`}>
        <div className="brand-lockup">
          <img src="/manus-storage/astra-split-orbit-mark_fd8718c3.png" alt="ASTRA-3D split orbit mark" className="brand-mark" />
          <div><strong>ASTRA</strong><span>3D / FIELD STATION</span></div>
        </div>

        <Navigation activeSection={activeSection} onNavigate={navigate} />

        <div className="rail-footprint">
          <div className="signal-state"><i /><span>Receiver aligned</span></div>
          <p>Session 07—SEPT<br />Reference: HELIOCENTRIC</p>
          <div className="progress-slab"><span>Live station</span><b>ACTIVE SYSTEMS</b><i><em /></i></div>
        </div>
      </aside>

      <div className="mobile-topbar">
        <div className="brand-lockup">
          <img src="/manus-storage/astra-split-orbit-mark_fd8718c3.png" alt="" className="brand-mark" />
          <strong>ASTRA <span>3D</span></strong>
        </div>
        <button className="icon-button" onClick={() => setMobileNavOpen((open) => !open)} aria-label="Toggle mission navigation">
          {mobileNavOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <main className="station-main">
        <header className="station-topline">
          <p><span className="pulse-dot" /> Observation deck active <b>·</b> Local frame: Solar System</p>
          <div><span>UTC 2087.09.03</span><span>SYS / NOMINAL</span></div>
        </header>

        <section className="mission-intro" id="overview" style={{ backgroundImage: `linear-gradient(90deg, rgba(3, 10, 21, 0.96) 0%, rgba(3, 10, 21, 0.82) 42%, rgba(3, 10, 21, 0.22) 100%), url(${heroAsset})` }}>
          <div className="intro-gridlines" aria-hidden="true" />
          <div className="intro-copy">
            <p className="eyebrow">ASTRA-3D / LIVE STATION</p>
            <h1>Trace the system<br /><em>beyond the familiar.</em></h1>
            <p className="intro-description">A calm, interactive field station for orienting yourself within the Solar System. Establish a reference now; expand into an immersive simulation next.</p>
            <div className="intro-actions">
              <Button className="solar-button" onClick={beginGuidedTrace}><CirclePlay size={17} /> Begin guided trace</Button>
              <button className="quiet-button" onClick={() => navigate("archive")}>Read mission brief <ArrowRight size={16} /></button>
            </div>
          </div>
          <div className="mission-stamp">
            <span>OBSERVATORY LOG</span><b>001</b>
            <i />
            <small>ACTIVE / 09.03</small>
          </div>
        </section>

        <section className="instrument-layout">
          <OrbitView bodies={bodies} selectedId={selectedId} onSelect={selectBody} guidedMode={guidedMode} />
          <Inspector body={selectedBody} isSaved={saved.includes(selectedId)} onToggleSave={toggleSave} />
        </section>

        <section className="data-strip" aria-label="Foundation capabilities">
          <article><span className="strip-icon"><ScanLine size={18} /></span><div><p>Observation state</p><strong>Data-driven selection</strong></div><small>01</small></article>
          <article><span className="strip-icon"><Cpu size={18} /></span><div><p>Rendering path</p><strong>WebGL-ready modules</strong></div><small>02</small></article>
          <article><span className="strip-icon"><Atom size={18} /></span><div><p>Next activation</p><strong>3D solar simulation</strong></div><small>03</small></article>
        </section>

        <section className="archive-section" id="archive">
          <div className="archive-copy">
            <p className="eyebrow">03 · System primer</p>
            <h2>Learn the geometry<br />before you enter it.</h2>
            <p>Complete build establishes the mission vocabulary, selection patterns, and viewport rhythm that will carry into the live three-dimensional exploration environment.</p>
            <button onClick={() => navigate("roadmap")} className="text-link">Inspect development path <ArrowRight size={16} /></button>
          </div>
          <div className="archive-visual" style={{ backgroundImage: `linear-gradient(145deg, rgba(3, 10, 21, 0.13), rgba(3, 10, 21, 0.74)), url(${archiveAsset})` }}>
            <div className="archive-callout"><Sparkles size={16} /><span>Position is knowledge.<br />Context is discovery.</span></div>
          </div>
        </section>

        <section className="roadmap-section" id="roadmap">
          <header><div><p className="eyebrow">04 · Mission schedule</p><h2>From field station to deep-space instrument.</h2></div><span className="schedule-label">BUILD PATH</span></header>
          <div className="roadmap-track">
            <article className="roadmap-node is-now"><i>01</i><div><p>Current</p><h3>Foundation</h3><span>Interface system, object records, responsive observation deck.</span></div></article>
            <article className="roadmap-node"><i>02</i><div><p>Next</p><h3>Solar system</h3><span>WebGL bodies, orbital motion, camera controls, focus mode.</span></div></article>
            <article className="roadmap-node"><i>03</i><div><p>Future</p><h3>Expedition</h3><span>Moons, missions, live data, learning routes and discovery tools.</span></div></article>
          </div>
        </section>

        <footer className="station-footer"><span>ASTRA-3D / EXPLORATION INTERFACE</span><span>ACTIVE SYSTEMS BUILD · v0.1</span><span><Activity size={14} /> All primary systems nominal</span></footer>
      </main>
    </div>
  );
}
