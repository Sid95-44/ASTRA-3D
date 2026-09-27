import { useEffect, useRef } from "react";
import * as THREE from "three";
import type { Body } from "@/data/bodies";
import type { Moon } from "@/data/moons";
import type { Experiment, Mission, Transfer } from "@/lib/mission";
import { getOrbitalPosition, getVisualSemiMajorAxis } from "@/lib/orbital";

type Props = {
  bodies: Body[];
  moons: Moon[];
  simulatedDay: number;
  selectedId: string;
  showOrbits: boolean;
  showVelocity: boolean;
  cameraTargetId: string | null;
  mission: Mission;
  transfer: Transfer;
  experiment: Experiment;
  onSelect: (id: string) => void;
};
type Node = {
  id: string;
  mesh: THREE.Mesh;
  orbit?: THREE.LineLoop;
  velocity?: THREE.ArrowHelper;
};

const HOME = new THREE.Vector3(0, 7.8, 10.5);
const BACKDROP = 0x050a12;
/**
 * Sphere radii are halved against the data so that every orbit stays visibly
 * wider than the world inside it. The numbers that matter are unaffected —
 * distances are measured from the orbital model, not from this drawing.
 */
const BODY_SCALE = 0.5;
const MIN_PICK_RADIUS = 0.16;
const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

/**
 * A moon's drawn orbit has to clear its planet's drawn sphere, otherwise Io
 * disappears inside Jupiter. Kept in one place so the ring and the moon itself
 * can never disagree.
 */
function moonOrbitRadius(moon: Moon, parent?: Body) {
  const parentRadius = (parent?.visualRadius ?? 0.2) * BODY_SCALE;
  return (
    parentRadius * 1.4 +
    0.1 +
    Math.min(0.3, moon.distanceFromParentKm / 6_000_000)
  );
}

/** Invisible, slightly oversized click target so small worlds stay selectable. */
function pickSphere(id: string, radius: number) {
  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(Math.max(radius, MIN_PICK_RADIUS), 10, 8),
    new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0,
      depthWrite: false,
    })
  );
  mesh.userData.bodyId = id;
  return mesh;
}

/**
 * A fixed random source for the star field: the sky is dressing, but it should
 * be the same sky every time the page loads.
 */
function seededRandom(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

function planetMaterial(color: number) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: 0.86,
    metalness: 0.03,
    emissive: color,
    emissiveIntensity: 0.035,
  });
}
function orbitLine(points: THREE.Vector3[], color = 0x70c9dc, opacity = 0.18) {
  const line = new THREE.LineLoop(
    new THREE.BufferGeometry().setFromPoints(points),
    new THREE.LineBasicMaterial({ color, transparent: true, opacity })
  );
  return line;
}

/** Dashed so a visitor's own experimental orbit never reads as a real one. */
function dashedLine(points: THREE.Vector3[], color: number, opacity: number) {
  const line = new THREE.LineLoop(
    new THREE.BufferGeometry().setFromPoints(points),
    new THREE.LineDashedMaterial({
      color,
      transparent: true,
      opacity,
      dashSize: 0.16,
      gapSize: 0.12,
    })
  );
  line.computeLineDistances();
  return line;
}
function orbitPoints(
  a: number,
  eccentricity: number,
  inclination: number,
  offset = 0
) {
  const points: THREE.Vector3[] = [];
  const tilt = (inclination * Math.PI) / 180;
  for (let i = 0; i <= 160; i += 1) {
    const angle = (i / 160) * Math.PI * 2;
    const radius =
      (a * (1 - eccentricity ** 2)) / (1 + eccentricity * Math.cos(angle));
    points.push(
      new THREE.Vector3(
        radius * Math.cos(angle + offset),
        radius * Math.sin(angle + offset) * Math.sin(tilt),
        radius * Math.sin(angle + offset) * Math.cos(tilt)
      )
    );
  }
  return points;
}
function moonPosition(moon: Moon, parent: Body, day: number) {
  const parentPos = getOrbitalPosition(parent, day);
  const angle = (day / moon.orbitalPeriodDays) * Math.PI * 2;
  const radius = moonOrbitRadius(moon, parent);
  return new THREE.Vector3(
    parentPos.x + Math.cos(angle) * radius,
    parentPos.y + Math.sin(angle) * radius * 0.2,
    parentPos.z + Math.sin(angle) * radius
  );
}

function celestialPosition(
  id: string,
  bodies: Body[],
  moons: Moon[],
  day: number
) {
  const body = bodies.find(item => item.id === id);
  if (body) {
    const position = getOrbitalPosition(body, day);
    return new THREE.Vector3(position.x, position.y, position.z);
  }

  const moon = moons.find(item => item.id === id);
  const parent = moon && bodies.find(item => item.id === moon.parentId);
  return moon && parent ? moonPosition(moon, parent, day) : null;
}

export function SolarSystemCanvas({
  bodies,
  moons,
  simulatedDay,
  selectedId,
  showOrbits,
  showVelocity,
  cameraTargetId,
  mission,
  transfer,
  experiment,
  onSelect,
}: Props) {
  const mountRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef(selectedId);
  const targetRef = useRef(cameraTargetId);
  const dayRef = useRef(simulatedDay);
  const orbitVisibleRef = useRef(showOrbits);
  const velocityVisibleRef = useRef(showVelocity);
  const missionRef = useRef(mission);
  const transferRef = useRef(transfer);
  const experimentRef = useRef(experiment);
  const onSelectRef = useRef(onSelect);
  selectedRef.current = selectedId;
  targetRef.current = cameraTargetId;
  dayRef.current = simulatedDay;
  orbitVisibleRef.current = showOrbits;
  velocityVisibleRef.current = showVelocity;
  missionRef.current = mission;
  transferRef.current = transfer;
  experimentRef.current = experiment;
  onSelectRef.current = onSelect;

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(BACKDROP);
    scene.fog = new THREE.Fog(BACKDROP, 18, 35);
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 60);
    camera.position.copy(HOME);
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);
    scene.add(new THREE.AmbientLight(0x93c5d8, 0.72));
    const sunLight = new THREE.PointLight(0xffd49a, 4.2, 30, 1.3);
    scene.add(sunLight);
    const stars = new THREE.BufferGeometry();
    const starPositions = new Float32Array(480 * 3);
    const random = seededRandom(20250101);
    for (let i = 0; i < 480; i += 1) {
      const r = 16 + random() * 22;
      const t = random() * Math.PI * 2;
      const p = Math.acos(2 * random() - 1);
      starPositions[i * 3] = r * Math.sin(p) * Math.cos(t);
      starPositions[i * 3 + 1] = r * Math.cos(p);
      starPositions[i * 3 + 2] = r * Math.sin(p) * Math.sin(t);
    }
    stars.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
    scene.add(
      new THREE.Points(
        stars,
        new THREE.PointsMaterial({
          color: 0xb9e4ec,
          size: 0.035,
          transparent: true,
          opacity: 0.62,
        })
      )
    );
    const nodes: Node[] = [];
    const pickables: THREE.Object3D[] = [];
    const sun = bodies.find(body => body.id === "sun");
    if (sun) {
      // The star is the one body here that emits rather than reflects, so it is
      // drawn self-lit instead of shaded.
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(sun.visualRadius * BODY_SCALE, 24, 16),
        new THREE.MeshBasicMaterial({ color: 0xffd79a })
      );
      mesh.userData.bodyId = sun.id;
      const picker = pickSphere(sun.id, sun.visualRadius * BODY_SCALE + 0.06);
      mesh.add(picker);
      pickables.push(picker);
      scene.add(mesh);
      scene.add(
        new THREE.Mesh(
          new THREE.SphereGeometry(sun.visualRadius * BODY_SCALE * 1.7, 20, 14),
          new THREE.MeshBasicMaterial({
            color: 0xf0a343,
            transparent: true,
            opacity: 0.14,
            side: THREE.BackSide,
          })
        )
      );
      nodes.push({ id: sun.id, mesh });
    }
    for (const body of bodies.filter(item => item.id !== "sun")) {
      const radius = body.visualRadius * BODY_SCALE;
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(radius, 14, 10),
        planetMaterial(body.color)
      );
      mesh.userData.bodyId = body.id;
      const picker = pickSphere(body.id, radius + 0.03);
      mesh.add(picker);
      pickables.push(picker);
      const orbit = orbitLine(
        orbitPoints(
          getVisualSemiMajorAxis(body),
          body.eccentricity,
          body.inclination
        )
      );
      const velocity = new THREE.ArrowHelper(
        new THREE.Vector3(1, 0, 0),
        new THREE.Vector3(),
        0.7,
        body.color,
        0.14,
        0.08
      );
      scene.add(mesh, orbit, velocity);
      nodes.push({ id: body.id, mesh, orbit, velocity });
      if (body.id === "saturn") {
        const ring = new THREE.Mesh(
          new THREE.RingGeometry(radius * 1.35, radius * 2.05, 30),
          new THREE.MeshBasicMaterial({
            color: 0xc6b47f,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.62,
          })
        );
        ring.rotation.x = Math.PI / 2.55;
        mesh.add(ring);
      }
    }
    const moonNodes = moons.map(moon => {
      const parent = bodies.find(body => body.id === moon.parentId);
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(moon.visualRadius * BODY_SCALE, 10, 8),
        planetMaterial(moon.color)
      );
      mesh.userData.bodyId = moon.id;
      const radius = moonOrbitRadius(moon, parent);
      const picker = pickSphere(moon.id, Math.min(0.15, radius * 0.5));
      mesh.add(picker);
      pickables.push(picker);
      // The ring belongs around the parent, so it is parented to that planet.
      const orbit = orbitLine(orbitPoints(radius, 0, 18), moon.color, 0.22);
      (parent
        ? nodes.find(node => node.id === parent.id)?.mesh
        : undefined
      )?.add(orbit);
      scene.add(mesh);
      return { moon, mesh, orbit, parent };
    });
    let transferLine: THREE.LineLoop | null = null;
    let experimentLine: THREE.LineLoop | null = null;
    let lastTransferKey = "";
    let lastExperimentKey = "";
    const spacecraft = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.12, 0),
      new THREE.MeshBasicMaterial({ color: 0xf6a744 })
    );
    spacecraft.visible = false;
    scene.add(spacecraft);
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let down = false;
    let lastX = 0;
    let lastY = 0;
    let azimuth = 0;
    let elevation = 0.45;
    let distance = HOME.length();
    let cameraGoal = new THREE.Vector3();
    const focusPoint = new THREE.Vector3();
    let frame = 0;
    const resize = () => {
      const width = mount.clientWidth || 1;
      const height = mount.clientHeight || 1;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    const pick = (event: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      return raycaster.intersectObjects(pickables, false)[0]?.object.userData
        .bodyId as string | undefined;
    };
    const onDown = (event: PointerEvent) => {
      down = true;
      lastX = event.clientX;
      lastY = event.clientY;
      renderer.domElement.setPointerCapture(event.pointerId);
    };
    const onMove = (event: PointerEvent) => {
      if (!down) return;
      azimuth -= (event.clientX - lastX) * 0.008;
      elevation = clamp(
        elevation - (event.clientY - lastY) * 0.005,
        -0.15,
        1.3
      );
      lastX = event.clientX;
      lastY = event.clientY;
    };
    const onUp = (event: PointerEvent) => {
      down = false;
      renderer.domElement.releasePointerCapture(event.pointerId);
    };
    const onClick = (event: MouseEvent) => {
      const id = pick(event as PointerEvent);
      if (id) onSelectRef.current(id);
    };
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      distance = clamp(distance + event.deltaY * 0.008, 4.2, 20);
    };
    renderer.domElement.addEventListener("pointerdown", onDown);
    renderer.domElement.addEventListener("pointermove", onMove);
    renderer.domElement.addEventListener("pointerup", onUp);
    renderer.domElement.addEventListener("click", onClick);
    renderer.domElement.addEventListener("wheel", onWheel, { passive: false });
    const observer = new ResizeObserver(resize);
    observer.observe(mount);
    resize();
    const animate = () => {
      frame = requestAnimationFrame(animate);
      const day = dayRef.current;
      for (const node of nodes) {
        const body = bodies.find(item => item.id === node.id);
        if (!body) continue;
        const pos = getOrbitalPosition(body, day);
        node.mesh.position.set(pos.x, pos.y, pos.z);
        // Spin tied to the model clock, so rotation reads as "time is running"
        // rather than as an idle animation.
        node.mesh.rotation.y = day * 0.35;
        if (node.orbit) node.orbit.visible = orbitVisibleRef.current;
        if (node.velocity) {
          node.velocity.visible = velocityVisibleRef.current;
          const next = getOrbitalPosition(body, day + 0.7);
          const vector = new THREE.Vector3(
            next.x - pos.x,
            next.y - pos.y,
            next.z - pos.z
          );
          node.velocity.position.copy(node.mesh.position);
          if (vector.length()) {
            node.velocity.setDirection(vector.normalize());
            node.velocity.setLength(
              Math.min(0.75, 0.16 + vector.length() * 2.5)
            );
          }
        }
        const material = node.mesh.material as THREE.MeshStandardMaterial;
        material.emissiveIntensity =
          selectedRef.current === node.id ? 0.15 : 0.035;
        node.mesh.scale.setScalar(selectedRef.current === node.id ? 1.18 : 1);
      }
      for (const item of moonNodes) {
        if (item.parent) {
          item.mesh.position.copy(moonPosition(item.moon, item.parent, day));
        }
        item.orbit.visible = orbitVisibleRef.current;
        item.mesh.scale.setScalar(
          selectedRef.current === item.moon.id ? 1.35 : 1
        );
      }
      const missionNow = missionRef.current;
      if (missionNow) {
        const start = celestialPosition(
          missionNow.from,
          bodies,
          moons,
          missionNow.launchedAt
        );
        const end = celestialPosition(
          missionNow.to,
          bodies,
          moons,
          missionNow.launchedAt + missionNow.travelDays
        );
        if (start && end) {
          const progress = clamp(
            (day - missionNow.launchedAt) / missionNow.travelDays,
            0,
            1
          );
          spacecraft.position.copy(start).lerp(end, progress);
          spacecraft.position.y += Math.sin(progress * Math.PI) * 1.2;
          spacecraft.visible = true;
        }
      } else spacecraft.visible = false;
      const nextTransfer = transferRef.current;
      const transferKey = nextTransfer
        ? `${nextTransfer.from}:${nextTransfer.to}`
        : "";
      if (nextTransfer && transferKey !== lastTransferKey) {
        const from = bodies.find(body => body.id === nextTransfer.from);
        const to = bodies.find(body => body.id === nextTransfer.to);
        if (from && to) {
          const mid =
            (getVisualSemiMajorAxis(from) + getVisualSemiMajorAxis(to)) / 2;
          const nextPoints = orbitPoints(
            mid,
            Math.abs(
              getVisualSemiMajorAxis(to) - getVisualSemiMajorAxis(from)
            ) /
              (getVisualSemiMajorAxis(to) + getVisualSemiMajorAxis(from)),
            0
          );
          if (!transferLine) {
            transferLine = orbitLine(nextPoints, 0xf6a744, 0.65);
            scene.add(transferLine);
          } else {
            transferLine.geometry.dispose();
            transferLine.geometry = new THREE.BufferGeometry().setFromPoints(
              nextPoints
            );
          }
        }
        lastTransferKey = transferKey;
      }
      if (transferLine) transferLine.visible = Boolean(nextTransfer);
      const exp = experimentRef.current;
      const experimentKey = exp.active
        ? `${exp.semiMajorAxisAU}:${exp.eccentricity}:${exp.inclination}`
        : "";
      if (exp.active && experimentKey !== lastExperimentKey) {
        const a = getVisualSemiMajorAxis({
          semiMajorAxisAU: exp.semiMajorAxisAU,
          eccentricity: exp.eccentricity,
          inclination: exp.inclination,
        } as Body);
        const points = orbitPoints(a, exp.eccentricity, exp.inclination);
        if (!experimentLine) {
          experimentLine = dashedLine(points, 0xf0a343, 0.85);
          scene.add(experimentLine);
        } else {
          experimentLine.geometry.dispose();
          experimentLine.geometry = new THREE.BufferGeometry().setFromPoints(
            points
          );
          experimentLine.computeLineDistances();
        }
        lastExperimentKey = experimentKey;
      }
      if (experimentLine) experimentLine.visible = Boolean(exp.active);
      const focusedNode = targetRef.current
        ? nodes.find(node => node.id === targetRef.current)?.mesh.position
        : undefined;
      const focusedMoon = targetRef.current
        ? moonNodes.find(item => item.moon.id === targetRef.current)?.mesh
            .position
        : undefined;
      const focused = focusedNode ?? focusedMoon;
      cameraGoal.copy(focused ?? new THREE.Vector3());
      if (targetRef.current) {
        const targetBody = bodies.find(body => body.id === targetRef.current);
        distance +=
          ((targetBody?.id === "sun"
            ? 6.5
            : targetBody && targetBody.visualRadius > 0.4
              ? 7.2
              : focusedMoon
                ? 4.2
                : 5.4) -
            distance) *
          0.035;
      }
      const cameraPos = new THREE.Vector3(
        Math.cos(azimuth) * Math.cos(elevation) * distance,
        Math.sin(elevation) * distance,
        Math.sin(azimuth) * Math.cos(elevation) * distance
      ).add(cameraGoal);
      camera.position.lerp(cameraPos, 0.06);
      focusPoint.lerp(cameraGoal, 0.07);
      camera.lookAt(focusPoint);
      renderer.render(scene, camera);
    };
    animate();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      renderer.domElement.removeEventListener("pointerdown", onDown);
      renderer.domElement.removeEventListener("pointermove", onMove);
      renderer.domElement.removeEventListener("pointerup", onUp);
      renderer.domElement.removeEventListener("click", onClick);
      renderer.domElement.removeEventListener("wheel", onWheel);
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, [bodies, moons]);
  return (
    <div
      ref={mountRef}
      className="solar-canvas"
      aria-label="Interactive three-dimensional Solar System with selectable planets, moons, missions, and orbital experiments."
    />
  );
}
