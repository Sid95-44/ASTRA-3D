import { useEffect, useState } from "react";
import { ArrowDownRight, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { AstraMark } from "@/components/AstraMark";
import { OrbitDiagram } from "@/components/OrbitDiagram";
import { bodies, getBody } from "@/data/bodies";
import { moons } from "@/data/moons";

const mars = getBody("mars");
const venus = getBody("venus");

/** Both orbits share one scale, so their sizes can be compared honestly. */
function orbitPath(semiMajorAxisAU: number, eccentricity: number) {
  const a = semiMajorAxisAU * (62 / mars.semiMajorAxisAU);
  return Array.from({ length: 97 }, (_, step) => {
    const angle = (step / 96) * Math.PI * 2;
    const radius =
      (a * (1 - eccentricity ** 2)) / (1 + eccentricity * Math.cos(angle));
    return `${radius * Math.cos(angle)},${radius * Math.sin(angle)}`;
  }).join(" ");
}

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
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.15 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [node]);

  return (
    <div
      ref={setNode}
      className={`reveal ${visible ? "is-visible" : ""} ${className}`}
      style={{ "--reveal-delay": `${delay}ms` } as React.CSSProperties}
    >
      {children}
    </div>
  );
}

const method = [
  {
    title: "Positions come from Kepler's equation",
    body: "Each planet's phase advances on its own orbital period, then a six-step Newton–Raphson iteration solves for where it sits on an inclined ellipse. No keyframes, no hand-placed dots.",
  },
  {
    title: "Time is the one variable you always control",
    body: "The clock runs from 1× to 100,000×. At 1,000× a real second covers about 1,000 simulated days, which is long enough to watch Mercury lap the Sun while Jupiter barely shifts.",
  },
  {
    title: "Distances are measured, not eyeballed",
    body: "Pick two worlds and ASTRA measures the gap between their current three-dimensional positions in kilometres. Stretched spacing in the picture never leaks into the numbers.",
  },
  {
    title: "ASTRA Guide reads the model, not the internet",
    body: "It answers from the selected body, the current date, and your live measurement. Fixed topics, no invented figures, and it says so when it does not know.",
  },
];

const rough = [
  "Planets are shaded spheres, not textured ones. Surfaces are a later job.",
  "Moon orbits are drawn at a readable size, not a true one.",
  "Flight times ignore launch windows, gravity assists, and everything that makes real mission planning hard.",
  "Guide answers come from a fixed set of reviewed topics, not a language model.",
];

export default function Landing() {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(
        maxScroll > 0 ? Math.min(1, window.scrollY / maxScroll) : 0
      );
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToSection = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <main
      className="page landing"
      style={{ "--scroll-progress": scrollProgress } as React.CSSProperties}
    >
      <header className="page-bar landing-bar">
        <Link href="/" className="brand" aria-label="ASTRA 3D home">
          <AstraMark className="brand-mark" />
          <span className="brand-name">
            ASTRA <b>3D</b>
          </span>
        </Link>
        <nav className="nav-links" aria-label="Page sections">
          <button
            className="nav-link"
            onClick={() => scrollToSection("method")}
          >
            How it works
          </button>
          <button className="nav-link" onClick={() => scrollToSection("rough")}>
            What's rough
          </button>
          <Link href="/simulate" className="btn is-primary">
            Open the model <ArrowRight size={14} />
          </Link>
        </nav>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Class 12 space-science project</p>
          <h1>
            Not a picture of the
            <br />
            Solar System.
            <br />
            <em>A model of it.</em>
          </h1>
          <p className="lede">
            ASTRA runs a Kepler-inspired orbital model in your browser. Set a
            date, change the speed, click any world, and read the numbers behind
            what you're seeing. It was built for one school demonstration, so
            every part of it can be explained out loud.
          </p>
          <div className="hero-actions">
            <Link href="/simulate" className="btn is-primary">
              Open the model <ArrowRight size={15} />
            </Link>
            <button
              className="btn is-quiet"
              onClick={() => scrollToSection("method")}
            >
              How the maths works <ArrowDownRight size={15} />
            </button>
          </div>
          <dl className="hero-meta">
            <div>
              <dt>Worlds</dt>
              <dd>
                {bodies.length - 1} planets, {moons.length} moons
              </dd>
            </div>
            <div>
              <dt>Solver</dt>
              <dd>Kepler + Newton–Raphson</dd>
            </div>
            <div>
              <dt>Data</dt>
              <dd>Stays in your browser</dd>
            </div>
          </dl>
        </div>

        <figure className="hero-visual">
          <OrbitDiagram className="hero-diagram" day={0} />
          <figcaption className="hero-caption">
            <span>Top-down, at the model's epoch — 1 Jan 2025</span>
            <span>Spacing log-stretched so Neptune stays on screen</span>
          </figcaption>
        </figure>
      </section>

      <section className="section" id="method">
        <Reveal className="section-head">
          <p className="eyebrow">01 · How it works</p>
          <h2>
            Small enough to explain.
            <br />
            <em>Honest about the rest.</em>
          </h2>
        </Reveal>
        <Reveal className="section-body split" delay={60}>
          <p className="lede">
            There is no black box in here. Four pieces of ordinary maths and one
            dataset of published planetary parameters carry the whole thing —
            and the places where the model gives up are written down instead of
            hidden.
          </p>
          <ol className="method-list">
            {method.map((item, index) => (
              <li key={item.title}>
                <span aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </Reveal>
      </section>

      <section className="section" id="inside">
        <Reveal className="section-head">
          <p className="eyebrow">02 · What's inside</p>
          <h2>
            Things you can do
            <br />
            <em>in the first five minutes.</em>
          </h2>
        </Reveal>
        <Reveal className="cards" delay={80}>
          <article className="card card-wide">
            <h3>See eccentricity instead of reading it</h3>
            <p>
              A planet's orbit is drawn from its real semi-major axis and
              eccentricity, tilted by its inclination. Mars runs an eccentricity
              of {mars.eccentricity.toFixed(3)}, Venus just{" "}
              {venus.eccentricity.toFixed(3)} — the difference is visible in the
              shape of the path long before you look at the number.
            </p>
            <svg
              className="card-sketch"
              viewBox="-74 -74 148 148"
              aria-hidden="true"
            >
              {[mars, venus].map(body => (
                <polygon
                  key={body.id}
                  points={orbitPath(body.semiMajorAxisAU, body.eccentricity)}
                  fill="none"
                  stroke={body.accent}
                  strokeWidth="1.1"
                  opacity={body.id === "venus" ? 0.7 : 0.85}
                />
              ))}
              <circle cx="0" cy="0" r="3.6" fill="#f0a343" />
            </svg>
            <span className="card-foot">
              Venus and Mars at true relative distance — the Sun sits off-centre
              in the outer one
            </span>
          </article>
          <article className="card">
            <h3>Plan a rough transfer</h3>
            <p>
              Choose a departure and a destination and ASTRA draws an idealized
              Hohmann ellipse with an approximate flight time. Useful for
              teaching the geometry. Not a launch window.
            </p>
          </article>
          <article className="card">
            <h3>Ask about what you're looking at</h3>
            <p>
              The Guide answers using the body you have selected, the simulated
              date, and your current measurement — so "why is this one faster?"
              means something specific.
            </p>
          </article>
        </Reveal>
      </section>

      <section className="section" id="rough">
        <Reveal className="panel-pair">
          <div className="section-lead">
            <p className="eyebrow">03 · What's still rough</p>
            <h2>Known gaps, kept in plain sight.</h2>
            <p className="lede">
              A model that hides its assumptions teaches the wrong lesson. These
              are the shortcuts ASTRA takes, written the same way I wrote them
              in the viva notes.
            </p>
          </div>
          <ul className="honest-list">
            {rough.map(item => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </Reveal>
      </section>

      <section className="section">
        <Reveal className="cta">
          <div>
            <p className="eyebrow">04 · Try it</p>
            <h2>
              Set a date.
              <br />
              <em>Then move the universe.</em>
            </h2>
          </div>
          <div className="cta-side">
            <p>
              Drag to orbit the camera, scroll to zoom, click a world to read
              it. Everything saves locally, nothing is uploaded, and no account
              is involved.
            </p>
            <Link href="/simulate" className="btn is-primary">
              Open the model <ArrowRight size={15} />
            </Link>
          </div>
        </Reveal>
      </section>

      <footer className="page-foot">
        <span>
          ASTRA 3D — built by a student, still being worked on. React, Three.js,
          no backend.
        </span>
        <a
          href="https://github.com/sid95-44/ASTRA-3D"
          target="_blank"
          rel="noreferrer"
        >
          Source on GitHub
        </a>
      </footer>
    </main>
  );
}
