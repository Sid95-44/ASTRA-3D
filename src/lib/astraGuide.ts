import { ASTRONOMICAL_UNIT_KM } from "@/lib/orbital";
export type GuideIntent =
  | "help" | "selected_overview" | "orbital_period" | "orbital_speed" | "kepler_motion"
  | "eccentricity" | "inclination" | "astronomical_unit" | "distance_explanation"
  | "distance_comparison" | "simulation_time" | "visual_scale" | "limitations" | "greeting" | "fallback";
export type GuideConfidence = "high" | "medium" | "fallback";
export type GuideBody = {
  id: string; name: string; category: string; description: string; fact: string;
  orbitalPeriod: string; orbitalPeriodDays: number; orbitalVelocity: string;
  semiMajorAxisAU: number; eccentricity: number; inclination: number;
};
export type GuideMeasurement = {
  firstName: string; secondName: string; distanceKm: number; formattedDistance: string; previousDistanceKm?: number;
};
export type GuideContext = {
  selectedBody: GuideBody; simulatedDay: number; simulatedDateLabel: string;
  speedMultiplier: number; measurement: GuideMeasurement | null;
};
export type GuideAnswer = { text: string; intent: GuideIntent; confidence: GuideConfidence; suggestedPrompts?: string[] };
export type GuideMessage = { id: string; role: "user" | "assistant"; text: string; intent?: GuideIntent; createdAt: number };

export const GUIDE_PROMPTS = [
  "Tell me about the selected planet",
  "Why is Mercury faster?",
  "What does eccentricity mean?",
  "Explain this distance",
];

export function normalizeQuestion(input: string) {
  return input.trim().toLowerCase().replace(/[?!.,;:]+/g, " ").replace(/\s+/g, " ").trim();
}
const rules: Array<{ intent: GuideIntent; matches: RegExp[] }> = [
  { intent: "help", matches: [/\b(help|what can you explain|what can you do|what should i ask)\b/] },
  { intent: "distance_comparison", matches: [/\b(closer|farther|further|getting close|getting far|increasing|decreasing)\b/] },
  { intent: "distance_explanation", matches: [/\b(distance|far|separation|apart|how many km)\b/] },
  { intent: "eccentricity", matches: [/\b(eccentricity|elliptic|ellipse|oval|elongated|what is e)\b/] },
  { intent: "inclination", matches: [/\b(inclination|tilt|tilted|orbital plane)\b/] },
  { intent: "astronomical_unit", matches: [/\b(au|astronomical unit|astronomical units)\b/] },
  { intent: "simulation_time", matches: [/(?:\d+(?:\s\d{3})?\s*[x×])|\b(date|time|speed|multiplier|how much time|simulated day)\b/] },
  { intent: "orbital_period", matches: [/\b(orbital period|period|year|how long.*orbit|one orbit)\b/] },
  { intent: "orbital_speed", matches: [/\b(orbital speed|move faster|moves faster|faster|slower|speed of.*orbit)\b/] },
  { intent: "kepler_motion", matches: [/\b(kepler|mean anomaly|how.*planet.*move|how.*move.*planet|how.*model.*move|how.*orbit|heliocentric|orbital motion)\b/] },
  { intent: "visual_scale", matches: [/\b(scale|stretched|real size|real distance|to scale)\b/] },
  { intent: "limitations", matches: [/\b(nasa|accurate|accuracy|mission plan|launch window|life on|aliens|current.*astronomy)\b/] },
  { intent: "selected_overview", matches: [/\b(selected planet|selected body|this planet|this world|tell me about|what am i looking at|overview)\b/] },
  { intent: "greeting", matches: [/^(hi|hello|hey|good morning|good afternoon|good evening)( astra)?$/] },
];
export function classifyIntent(normalizedQuestion: string): GuideIntent {
  for (const rule of rules) if (rule.matches.some((pattern) => pattern.test(normalizedQuestion))) return rule.intent;
  return "fallback";
}
const fallbackText = "I can explain the selected planet, orbital motion, eccentricity, inclination, simulated time, astronomical units, and current distances. Try one of the suggested questions below.";
function buildAnswer(intent: GuideIntent, context: GuideContext): GuideAnswer {
  const body = context.selectedBody;
  switch (intent) {
    case "help": return { intent, confidence: "high", text: "I can explain the selected planet, orbital period and speed, Kepler-inspired motion, eccentricity, inclination, AU, the current date and speed, measured distances, visual scale, and this model’s limits. Ask about the highlighted body or try one of the suggested prompts." };
    case "greeting": return { intent, confidence: "high", text: "Hello. I’m ASTRA Guide. I can explain " + body.name + ", its orbit, the current simulation, or a distance measurement. What would you like to explore?", suggestedPrompts: GUIDE_PROMPTS };
    case "selected_overview": return { intent, confidence: "high", text: body.name + " is a " + body.category.toLowerCase() + ". " + body.description + " Its orbital period is " + body.orbitalPeriod + ", and its average orbital speed is " + body.orbitalVelocity + ". The model uses eccentricity " + body.eccentricity.toFixed(3) + " and inclination " + body.inclination.toFixed(1) + "°. Field note: " + body.fact };
    case "orbital_period": return { intent, confidence: "high", text: body.name + " takes " + body.orbitalPeriod + " to complete one orbit in this model. The orbital period is the time a body takes to travel once around the Sun. ASTRA advances each orbit using the period and the Kepler-inspired orbital calculation; the result is an educational approximation, not a precision ephemeris." };
    case "orbital_speed": return { intent, confidence: "high", text: body.name + " has an average orbital speed of " + body.orbitalVelocity + ". In a Keplerian model, a planet closer to the Sun generally has a shorter orbital period and must travel faster to complete its orbit. Speed also changes along an elliptical orbit: a planet moves faster near the Sun and slower farther away." };
    case "kepler_motion": return { intent, confidence: "high", text: "ASTRA models " + body.name + " on an inclined ellipse around the Sun. It advances the orbital phase from the simulated day and orbital period, then solves Kepler’s equation to estimate the planet’s position. This is heliocentric, Kepler-inspired motion. The simulation is simplified and does not calculate full gravitational interactions between every body." };
    case "eccentricity": return { intent, confidence: "high", text: body.name + " has an eccentricity of " + body.eccentricity.toFixed(3) + ". Eccentricity describes how much an orbit differs from a circle: 0 is circular, while larger values make the ellipse more stretched. ASTRA uses this value in its Kepler-inspired model, so the orbit is an educational approximation rather than a high-precision ephemeris." };
    case "inclination": return { intent, confidence: "high", text: body.name + " has an orbital inclination of " + body.inclination.toFixed(1) + "°. Inclination describes the tilt of its orbital plane relative to the reference plane used by the model. ASTRA includes this tilt when calculating the body’s three-dimensional position; the result is simplified for learning." };
    case "astronomical_unit": return { intent, confidence: "high", text: "An astronomical unit (AU) is the average Earth–Sun distance. ASTRA uses " + ASTRONOMICAL_UNIT_KM.toLocaleString("en-US", { maximumFractionDigits: 1 }) + " km for 1 AU when converting calculated orbital distances to kilometres. AU is a convenient scale for comparing distances across the Solar System." };
    case "distance_explanation":
      if (!context.measurement) return { intent, confidence: "medium", text: "There is no active distance measurement yet. Select two objects in the Measure between worlds panel. ASTRA will calculate their current separation from the model’s three-dimensional positions, including orbital inclination." };
      return { intent, confidence: "high", text: "The current model distance between " + context.measurement.firstName + " and " + context.measurement.secondName + " is " + context.measurement.formattedDistance + ". ASTRA calculates it from their current three-dimensional positions, including inclination, then converts the result to kilometres. The positions come from a simplified orbital model, so this is an educational measurement." };
    case "distance_comparison":
      if (!context.measurement) return { intent, confidence: "medium", text: "Select two objects in the Measure between worlds panel, then advance the simulation. ASTRA can show their current calculated separation; without an active pair and an earlier sample, I can’t tell whether it is increasing or decreasing." };
      if (context.measurement.previousDistanceKm === undefined) return { intent, confidence: "medium", text: context.measurement.firstName + " and " + context.measurement.secondName + " are currently " + context.measurement.formattedDistance + " apart in the model. I need an earlier sample for this same pair before I can say whether the distance is increasing or decreasing." };
      return { intent, confidence: "high", text: context.measurement.firstName + " and " + context.measurement.secondName + " are currently " + context.measurement.formattedDistance + " apart. Compared with the previous sample for this pair, their calculated separation is " + (context.measurement.distanceKm > context.measurement.previousDistanceKm ? "increasing" : context.measurement.distanceKm < context.measurement.previousDistanceKm ? "decreasing" : "unchanged") + ". This comparison uses ASTRA’s simplified three-dimensional orbital positions." };
    case "simulation_time": return { intent, confidence: "high", text: "The simulation date is " + context.simulatedDateLabel + ", and the selected time multiplier is " + context.speedMultiplier.toLocaleString("en-US") + "×. The multiplier controls how quickly the model advances compared with real time; it does not change the orbital data. ASTRA starts from its configured simulation epoch." };
    case "visual_scale": return { intent, confidence: "high", text: "The displayed distances and sizes are stretched so the Solar System is easier to see on screen. That visual scale is separate from ASTRA’s calculated positions: distance measurements use the orbital model’s three-dimensional AU positions, not the spacing of pixels or rendered objects." };
    case "limitations": return { intent, confidence: "high", text: "ASTRA is an educational model, not NASA mission-planning software. It uses simplified heliocentric Keplerian orbits, stretched visual scale, and approximate motion; it does not calculate full N-body physics or high-precision ephemerides. Use its values to explore orbital ideas, not to plan a real mission." };
    case "fallback": return { intent, confidence: "fallback", text: fallbackText, suggestedPrompts: GUIDE_PROMPTS };
  }
}
export function answerQuestion(question: string, context: GuideContext): GuideAnswer {
  return buildAnswer(classifyIntent(normalizeQuestion(question)), context);
}
