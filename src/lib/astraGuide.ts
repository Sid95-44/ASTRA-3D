import { ASTRONOMICAL_UNIT_KM } from "@/lib/orbital";

export type GuideIntent =
  | "help"
  | "greeting"
  | "selected_overview"
  | "orbital_period"
  | "orbital_speed"
  | "kepler_motion"
  | "eccentricity"
  | "inclination"
  | "astronomical_unit"
  | "distance_explanation"
  | "distance_comparison"
  | "simulation_time"
  | "visual_scale"
  | "limitations"
  | "session_recall"
  | "fallback";

export type GuideConfidence = "high" | "medium" | "fallback";

export type GuideBody = {
  id: string;
  name: string;
  category: string;
  description: string;
  fact: string;
  orbitalPeriod: string;
  orbitalPeriodDays: number;
  orbitalVelocity: string;
  semiMajorAxisAU: number;
  eccentricity: number;
  inclination: number;
};

export type GuideMeasurement = {
  firstName: string;
  secondName: string;
  distanceKm: number;
  formattedDistance: string;
  /** The previous sample for this same pair, when the session has one. */
  previousDistanceKm?: number;
  previousFormattedDistance?: string;
};

export type GuideMemory = {
  /** Notes from this browser's notebook, newest first. */
  recent: Array<{ text: string; when: string }>;
  visits: number;
  lastBodyName: string | null;
  lastSeenLabel: string | null;
};

export type GuideActivity = {
  /** Plain descriptions of whatever is switched on right now. */
  experiment: string | null;
  flight: string | null;
  transfer: string | null;
};

export type GuideContext = {
  selectedBody: GuideBody;
  simulatedDay: number;
  simulatedDateLabel: string;
  speedMultiplier: number;
  measurement: GuideMeasurement | null;
  activity?: GuideActivity;
  memory?: GuideMemory;
};

export type GuideAnswer = {
  text: string;
  intent: GuideIntent;
  confidence: GuideConfidence;
  suggestedPrompts?: string[];
};

export type GuideMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  intent?: GuideIntent;
  createdAt: number;
};

export const GUIDE_PROMPTS = [
  "What am I looking at?",
  "Why is Mercury faster?",
  "What does eccentricity actually mean?",
  "What have I been doing?",
];

export function normalizeQuestion(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/[?!.,;:]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const rules: Array<{ intent: GuideIntent; matches: RegExp[] }> = [
  {
    intent: "help",
    matches: [
      /\b(help|what can you explain|what can you do|what should i ask|what do you know)\b/,
    ],
  },
  {
    intent: "session_recall",
    matches: [
      /\b(notebook|remind me|what have i|what did i|what did we|last time|earlier|history|so far)\b/,
    ],
  },
  {
    intent: "distance_comparison",
    matches: [
      /\b(closer|farther|further|getting close|getting far|increasing|decreasing)\b/,
    ],
  },
  {
    intent: "distance_explanation",
    matches: [/\b(distance|far|separation|apart|how many km)\b/],
  },
  {
    intent: "eccentricity",
    matches: [/\b(eccentricity|elliptic|ellipse|oval|elongated|what is e)\b/],
  },
  {
    intent: "inclination",
    matches: [/\b(inclination|tilt|tilted|orbital plane)\b/],
  },
  {
    intent: "astronomical_unit",
    matches: [/\b(au|astronomical unit|astronomical units)\b/],
  },
  {
    intent: "simulation_time",
    matches: [
      /(?:\d+(?:\s\d{3})?\s*[x×])|\b(date|time|speed|multiplier|how much time|simulated day)\b/,
    ],
  },
  {
    intent: "orbital_period",
    matches: [/\b(orbital period|period|year|how long.*orbit|one orbit)\b/],
  },
  {
    intent: "orbital_speed",
    matches: [
      /\b(orbital speed|move faster|moves faster|faster|slower|speed of.*orbit)\b/,
    ],
  },
  {
    intent: "kepler_motion",
    matches: [
      /\b(kepler|mean anomaly|how.*planet.*move|how.*move.*planet|how.*model.*move|how.*orbit|heliocentric|orbital motion)\b/,
    ],
  },
  {
    intent: "visual_scale",
    matches: [/\b(scale|stretched|real size|real distance|to scale)\b/],
  },
  {
    intent: "limitations",
    matches: [
      /\b(nasa|accurate|accuracy|mission plan|launch window|life on|aliens|current.*astronomy)\b/,
    ],
  },
  {
    intent: "selected_overview",
    matches: [
      /\b(selected planet|selected body|this planet|this world|tell me about|what am i looking at|overview)\b/,
    ],
  },
  {
    intent: "greeting",
    matches: [
      /^(hi|hello|hey|good morning|good afternoon|good evening)( astra)?$/,
    ],
  },
];

export function classifyIntent(normalizedQuestion: string): GuideIntent {
  for (const rule of rules) {
    if (rule.matches.some(pattern => pattern.test(normalizedQuestion)))
      return rule.intent;
  }
  return "fallback";
}

/**
 * One line of live context, used only where it reads as conversation rather than
 * as a status readout. Silence is fine; not every answer needs an aside.
 */
function contextLine(context: GuideContext) {
  const { activity, memory } = context;
  if (activity?.flight)
    return `You've still got a flight running: ${activity.flight}.`;
  if (activity?.experiment)
    return `Your experimental orbit is up, at ${activity.experiment}.`;
  if (activity?.transfer)
    return `The ${activity.transfer} transfer is drawn on the field.`;
  if (memory?.recent[0]) {
    const latest = memory.recent[0];
    return `Latest notebook note: ${latest.text.replace(/\.$/, "")} (${latest.when}).`;
  }
  return "";
}

function greeting(context: GuideContext) {
  const { memory, selectedBody } = context;
  if (!memory || memory.visits <= 1) {
    return `Hello. I'm ASTRA — I read this model rather than the internet, so my range is narrow and specific. Right now that means ${selectedBody.name}, the clock, and anything you measure.`;
  }
  if (memory.lastBodyName && memory.lastBodyName !== selectedBody.name) {
    const when = memory.lastSeenLabel ? ` ${memory.lastSeenLabel}` : "";
    return `Hello again. Last time you were on ${memory.lastBodyName}${when}; now it's ${selectedBody.name}. What are we looking at?`;
  }
  return `Back on ${selectedBody.name}, I see. Ask away.`;
}

function buildAnswer(intent: GuideIntent, context: GuideContext): GuideAnswer {
  const body = context.selectedBody;
  const aside = contextLine(context);
  const withAside = (text: string) => (aside ? `${text} ${aside}` : text);

  switch (intent) {
    case "help":
      return {
        intent,
        confidence: "high",
        text: withAside(
          `I read this model: the body you have selected, the simulated clock, your measurement, the sliders, and any flight in progress. That's my whole world — I can't look anything up. Orbits, eccentricity, inclination, AU, simulated time, and visual scale are what I answer best.`
        ),
      };
    case "greeting":
      return { intent, confidence: "high", text: greeting(context) };
    case "selected_overview":
      return {
        intent,
        confidence: "high",
        text: withAside(
          `${body.name} is a ${body.category.toLowerCase()}. ${body.description} In this model its year is ${body.orbitalPeriodDays.toLocaleString("en-US")} days long, it averages ${body.orbitalVelocity}, and its orbit carries an eccentricity of ${body.eccentricity.toFixed(3)} at an inclination of ${body.inclination.toFixed(2)}°. The fact sheet version: ${body.fact}`
        ),
      };
    case "orbital_period":
      return {
        intent,
        confidence: "high",
        text: `${body.name} takes ${body.orbitalPeriod} to come back around. ASTRA gets that by starting the body at a fixed phase and adding a full turn per orbital period as the clock runs, then solving Kepler's equation to place it on the ellipse. The periods are published values; the placement is an approximation, not an ephemeris.`,
      };
    case "orbital_speed":
      return {
        intent,
        confidence: "high",
        text: `${body.name} averages ${body.orbitalVelocity}. Distance sets the pace — Mercury has to run at 47.36 km/s to stay where it is. Speed also changes along one orbit: a planet covers more ground near perihelion and slows as it climbs away. That's Kepler's second law, and you can watch it if you drop the clock to 100× and follow the selected body.`,
      };
    case "kepler_motion":
      return {
        intent,
        confidence: "high",
        text: `Every body here runs on its own clock. ASTRA advances a mean anomaly from the simulated day and the orbital period, then solves Kepler's equation in six Newton–Raphson steps to place the body on an inclined ellipse. That's why the paths come out elliptical and tilted without anyone animating them. What's missing is gravity between the planets — no N-body, so long runs slowly drift from reality.`,
      };
    case "eccentricity":
      return {
        intent,
        confidence: "high",
        text: `${body.name} sits at ${body.eccentricity.toFixed(3)}. Eccentricity is how far an orbit departs from a circle: 0 is a perfect circle, 0.093 (Mars) is mildly oval, 0.21 (Mercury) is visibly stretched. The value is baked into the ellipse ASTRA draws, so the shape you see is the number you're reading.`,
      };
    case "inclination":
      return {
        intent,
        confidence: "high",
        text: `${body.name} is tilted ${body.inclination.toFixed(2)}° against the reference plane. Inclination is the angle between its orbital plane and the plane the rest of the model is measured from. Small tilts are almost invisible head-on, which is why ASTRA keeps them in the 3D positions — Mercury's 7.00° is the reason it swings above and below the other planets.`,
      };
    case "astronomical_unit": {
      const km = ASTRONOMICAL_UNIT_KM.toLocaleString("en-US", {
        maximumFractionDigits: 1,
      });
      return {
        intent,
        confidence: "high",
        text: `An astronomical unit is the average Earth–Sun distance: ${km} km in this model. It exists because raw kilometres stop being useful past Mars. When you measure two planets, ASTRA works in AU and converts at the end, so the number you read comes from the geometry rather than from anything on screen.`,
      };
    }
    case "distance_explanation":
      if (!context.measurement) {
        return {
          intent,
          confidence: "medium",
          text: `I don't have a measurement to read yet. Pick two worlds in the measure panel and I'll use their live positions in the model — the three-dimensional ones, inclinations included.`,
        };
      }
      return {
        intent,
        confidence: "high",
        text: `${context.measurement.firstName} and ${context.measurement.secondName} are ${context.measurement.formattedDistance} apart in the model right now. That's the gap between their current positions, converted to kilometres. Real separations swing a long way over a year, so let the clock run and ask me again.`,
      };
    case "distance_comparison":
      if (!context.measurement) {
        return {
          intent,
          confidence: "medium",
          text: `For that I need two worlds and two samples. Select a pair in the measure panel, let the clock move, then ask again — I'd rather tell you which way the gap is going than guess.`,
        };
      }
      if (context.measurement.previousDistanceKm === undefined) {
        return {
          intent,
          confidence: "medium",
          text: `${context.measurement.firstName} and ${context.measurement.secondName} are ${context.measurement.formattedDistance} apart. I've only got one reading for this pair so far, so I can't say which way it's heading yet. Give me a second sample.`,
        };
      }
      return {
        intent,
        confidence: "high",
        text: `${context.measurement.firstName} and ${context.measurement.secondName} are ${context.measurement.formattedDistance} apart, ${
          context.measurement.distanceKm >
          context.measurement.previousDistanceKm
            ? "up"
            : context.measurement.distanceKm <
                context.measurement.previousDistanceKm
              ? "down"
              : "unchanged"
        } from ${context.measurement.previousFormattedDistance ?? "the previous sample"}. Both are moving on their own ellipses, so this is geometry you're watching, not a forecast.`,
      };
    case "simulation_time":
      return {
        intent,
        confidence: "high",
        text: `The model is at ${context.simulatedDateLabel}, running at ${context.speedMultiplier.toLocaleString("en-US")}×. The multiplier only changes how fast the clock runs — it never touches the orbital data. Everything is dated from ASTRA's epoch, 1 Jan 2025, and the date field will jump you anywhere between 1900 and 2200.`,
      };
    case "visual_scale":
      return {
        intent,
        confidence: "high",
        text: `The spacing on screen is log-stretched, otherwise Mercury and Neptune can't share a screen. Nothing in the measurement path uses that drawing: distances come from the model's three-dimensional AU positions, so the picture is squashed while the numbers stay straight.`,
      };
    case "limitations":
      return {
        intent,
        confidence: "high",
        text: `No, and it isn't pretending to be. ASTRA is Kepler-inspired heliocentric motion — no N-body gravity between planets, no perturbations, no launch windows, no real ephemerides. It's good for explaining why planets move the way they do; it's no good for pointing a telescope or planning a mission.`,
      };
    case "session_recall": {
      const recent = context.memory?.recent ?? [];
      if (!recent.length) {
        return {
          intent,
          confidence: "high",
          text: `The notebook is empty so far. Select a world, measure something, or start a flight and I'll begin keeping notes — stored in this browser, not on a server, because there isn't one.`,
        };
      }
      const lines = recent
        .slice(0, 3)
        .map(entry => `${entry.text.replace(/\.$/, "")} — ${entry.when}`)
        .join(". ");
      return {
        intent,
        confidence: "high",
        text: `From the notebook: ${lines}. Ask about any of it and I'll use the same numbers I used then.`,
      };
    }
    case "fallback":
      return {
        intent,
        confidence: "fallback",
        text: `I don't know that one. My answers come from a fixed set of reviewed topics about this model, so I'd rather say so than improvise. I can talk about ${body.name}, orbital motion, eccentricity, inclination, AU, the clock, and whatever you're measuring.`,
        suggestedPrompts: GUIDE_PROMPTS,
      };
  }
}

export function answerQuestion(
  question: string,
  context: GuideContext
): GuideAnswer {
  return buildAnswer(classifyIntent(normalizeQuestion(question)), context);
}
