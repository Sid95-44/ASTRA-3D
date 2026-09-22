import { useEffect, useState } from "react";
import { ArrowDownRight, ArrowRight, CircleDot, Orbit, Play, ScanLine, TimerReset } from "lucide-react";
import { Link } from "wouter";

const heroAsset = "/manus-storage/astra-orbital-observatory-hero_d39490e6.jpg";

type RevealProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
};

function Reveal({ children, className = "", delay = 0 }: RevealProps) {
  const [visible, setVisible] = useState(false);
  const [node, setNode] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!node) return undefined;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.18 });
    observer.observe(node);
    return () => observer.disconnect();
  }, [node]);

  return (
    <div ref={setNode} className={`reveal ${visible ? "is-visible" : ""} ${className}`} style={{ "--reveal-delay": `${delay}ms` } as React.CSSProperties}>
      {children}
    </div>
  );
}

export default function Landing() {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(maxScroll > 0 ? Math.min(1, window.scrollY / maxScroll) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToSection = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <main className="landing-page" style={{ "--scroll-progress": scrollProgress } as React.CSSProperties}>
      <div className="landing-noise" aria-hidden="true" />
      <header className="landing-nav">
        <Link href="/" className="landing-brand" aria-label="ASTRA 3D home">
          <img src="/manus-storage/astra-split-orbit-mark_fd8718c3.png" alt="" />
          <span>ASTRA <b>3D</b></span>
        </Link>
        <nav aria-label="Landing page navigation">
          <button onClick={() => scrollToSection("method")}>Method</button>
          <button onClick={() => scrollToSection("signals")}>Signals</button>
          <Link href="/simulate" className="nav-launch">Launch simulation <ArrowRight size={14} /></Link>
        </nav>
      </header>

      <section className="landing-hero" style={{ backgroundImage: `linear-gradient(90deg, rgba(3, 10, 21, 0.98) 0%, rgba(3, 10, 21, 0.85) 43%, rgba(3, 10, 21, 0.25) 100%), url(${heroAsset})` }}>
        <div className="hero-grid" aria-hidden="true" />
        <div className="hero-copy">
          <p className="eyebrow">ASTRA 3D / ORBITAL FIELD STATION</p>
          <h1>Explore.<br /><em>Simulate.</em><br />Understand.</h1>
          <p className="hero-lede">A student-built Solar System you can read as a living system—follow orbital motion, test time, and see the geometry behind the textbook diagrams.</p>
          <div className="hero-actions">
            <Link href="/simulate" className="primary-action"><Play size={16} fill="currentColor" /> Enter ASTRA</Link>
            <button className="text-action" onClick={() => scrollToSection("method")}>Read the field brief <ArrowDownRight size={16} /></button>
          </div>
          <div className="hero-meta"><span><i className="status-dot" /> Model online</span><span>8 planetary records</span><span>Kepler-inspired propagation</span></div>
        </div>
        <div className="hero-instrument" aria-label="Illustrative orbital geometry">
          <div className="instrument-axis axis-x" /><div className="instrument-axis axis-y" />
          <div className="landing-orbit orbit-a" /><div className="landing-orbit orbit-b" /><div className="landing-orbit orbit-c" />
          <div className="landing-sun"><span>☉</span></div>
          <div className="landing-planet planet-earth"><span>⊕</span></div>
          <div className="landing-planet planet-mars"><span>♂</span></div>
          <div className="instrument-label label-top">REFERENCE FRAME / HELIOCENTRIC</div>
          <div className="instrument-label label-bottom">DISTANCES VISUALIZED · NOT TO SCALE</div>
        </div>
        <div className="hero-scroll-cue"><span>Scroll to calibrate</span><i /></div>
      </section>

      <section className="landing-section intro-section" id="method">
        <Reveal className="section-heading">
          <p className="eyebrow">01 · The field station</p>
          <h2>Not a poster of planets.<br /><em>A system you can question.</em></h2>
        </Reveal>
        <Reveal className="intro-grid" delay={80}>
          <p className="section-lede">ASTRA 3D turns the Solar System into a calm, explorable instrument. The display stretches distances for legibility, while the underlying relationships stay anchored to published planetary parameters.</p>
          <div className="principle-list">
            <article><span>01</span><div><strong>Observe</strong><p>Select a world and read the numbers behind its appearance.</p></div></article>
            <article><span>02</span><div><strong>Accelerate</strong><p>Move from days to decades with a clock that stays visible.</p></div></article>
            <article><span>03</span><div><strong>Make sense</strong><p>See eccentricity, inclination, and velocity as motion—not jargon.</p></div></article>
          </div>
        </Reveal>
      </section>

      <section className="landing-section signal-section" id="signals">
        <Reveal className="signal-copy">
          <p className="eyebrow">02 · Three live readouts</p>
          <h2>Every control earns<br /><em>its place in the story.</em></h2>
          <p>There is no black-box “AI” layer hiding the science. The model stays small enough to explain in a Class 12 viva and rich enough to make orbital mechanics visible.</p>
        </Reveal>
        <Reveal className="signal-cards" delay={120}>
          <article className="signal-card signal-card-wide"><div className="card-icon"><Orbit size={19} /></div><p className="eyebrow">Orbital geometry</p><h3>Kepler's laws,<br />in motion.</h3><div className="mini-orbit"><i /><i /><b /></div><span>Mean anomaly + eccentricity</span></article>
          <article className="signal-card"><div className="card-icon"><TimerReset size={19} /></div><p className="eyebrow">Simulation clock</p><strong>1,000×</strong><span>One real second = 1,000 simulated days.</span></article>
          <article className="signal-card"><div className="card-icon"><ScanLine size={19} /></div><p className="eyebrow">Field measure</p><strong>AU / km</strong><span>Compare two bodies as they move.</span></article>
        </Reveal>
      </section>

      <section className="landing-section cta-section">
        <Reveal className="cta-panel">
          <div><p className="eyebrow">03 · Enter the instrument</p><h2>Set a reference.<br /><em>Then move the universe.</em></h2></div>
          <div className="cta-side"><p>Drag the camera. Select Earth. Turn the vectors on. ASTRA is ready when you are.</p><Link href="/simulate" className="primary-action">Launch ASTRA 3D <ArrowRight size={16} /></Link></div>
        </Reveal>
      </section>

      <footer className="landing-footer"><span>ASTRA 3D / STUDENT SPACE-SCIENCE PLATFORM</span><span>BUILT WITH REACT + THREE.JS</span><span><CircleDot size={12} /> SYSTEM NOMINAL</span></footer>
    </main>
  );
}
