import { useMemo } from "react";
import { bodies } from "@/data/bodies";
import { getOrbitalPosition, getVisualSemiMajorAxis } from "@/lib/orbital";

/**
 * A top-down look at the same model the simulation runs: every planet at its
 * real orbital position for the given day, drawn with the inclinations and
 * eccentricities that are actually in the data. Distances are log-stretched,
 * exactly as they are in the 3D scene, so the outer planets stay on screen.
 */
export function OrbitDiagram({
  day = 0,
  highlight = [],
  className,
}: {
  day?: number;
  highlight?: string[];
  className?: string;
}) {
  const scene = useMemo(() => {
    const extent = getVisualSemiMajorAxis(bodies[bodies.length - 1]);
    const scale = 88 / extent;
    const rings = bodies
      .filter(body => body.id !== "sun")
      .map(body => {
        const tilt = (body.inclination * Math.PI) / 180;
        const a = getVisualSemiMajorAxis(body) * scale;
        const points: string[] = [];
        for (let step = 0; step <= 96; step += 1) {
          const angle = (step / 96) * Math.PI * 2;
          const radius =
            (a * (1 - body.eccentricity ** 2)) /
            (1 + body.eccentricity * Math.cos(angle));
          points.push(
            `${(radius * Math.cos(angle)).toFixed(2)},${(
              radius *
              Math.sin(angle) *
              Math.cos(tilt)
            ).toFixed(2)}`
          );
        }
        return { id: body.id, points: points.join(" ") };
      });
    const bodies_ = bodies
      .filter(body => body.id !== "sun")
      .map(body => {
        const position = getOrbitalPosition(body, day);
        return {
          id: body.id,
          name: body.name,
          accent: body.accent,
          radius: 1.3 + body.visualRadius * 4.6,
          x: position.x * scale,
          y: position.z * scale,
        };
      });
    return { rings, bodies: bodies_ };
  }, [day]);

  return (
    <svg
      className={className}
      viewBox="-104 -104 208 208"
      aria-label="Top-down view of the modelled orbits at the model epoch"
    >
      {scene.rings.map(ring => (
        <polygon
          key={ring.id}
          points={ring.points}
          fill="none"
          stroke="currentColor"
          strokeWidth="0.4"
          opacity={highlight.length && highlight.includes(ring.id) ? 0.6 : 0.22}
        />
      ))}
      <circle cx="0" cy="0" r="4.6" fill="#f0a343" />
      <circle
        cx="0"
        cy="0"
        r="7.4"
        fill="none"
        stroke="#f0a343"
        opacity="0.3"
      />
      {scene.bodies.map(body => (
        <g key={body.id}>
          <circle cx={body.x} cy={body.y} r={body.radius} fill={body.accent} />
          <title>{body.name}</title>
        </g>
      ))}
    </svg>
  );
}
