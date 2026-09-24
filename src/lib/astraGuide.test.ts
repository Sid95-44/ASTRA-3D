import { describe, expect, it } from "vitest";
import { answerQuestion, classifyIntent, normalizeQuestion } from "./astraGuide";
import type { GuideContext, GuideIntent } from "./astraGuide";

const context: GuideContext = {
  selectedBody: {
    id: "mars", name: "Mars", category: "Terrestrial planet", description: "A rocky world with a thin atmosphere.",
    fact: "Mars has two small moons.", orbitalPeriod: "687 days", orbitalPeriodDays: 687,
    orbitalVelocity: "24.1 km/s", semiMajorAxisAU: 1.524, eccentricity: 0.093, inclination: 1.85,
  },
  simulatedDay: 365, simulatedDateLabel: "01 Jan 2026", speedMultiplier: 1000,
  measurement: { firstName: "Earth", secondName: "Mars", distanceKm: 78_000_000, formattedDistance: "78.00 million km" },
};
const intentCases: Array<[string, GuideIntent]> = [
  ["What can you explain?", "help"],
  ["Tell me about Mars", "selected_overview"],
  ["How long is a year on Mars?", "orbital_period"],
  ["Why is Mercury faster?", "orbital_speed"],
  ["How does the model move planets?", "kepler_motion"],
  ["Explain eccentricity", "eccentricity"],
  ["What is inclination?", "inclination"],
  ["What is an astronomical unit?", "astronomical_unit"],
  ["Explain this distance", "distance_explanation"],
  ["Are they getting closer?", "distance_comparison"],
  ["What date is this?", "simulation_time"],
  ["Why are orbits stretched?", "visual_scale"],
  ["Is ASTRA NASA accurate?", "limitations"],
  ["Hi ASTRA", "greeting"],
  ["Can you plan a launch window?", "limitations"],
];

describe("ASTRA Guide question handling", () => {
  it("normalizes questions without dropping scientific symbols", () => {
    expect(normalizeQuestion("  What is E?  ")).toBe("what is e");
    expect(normalizeQuestion("What does 1,000× mean?")).toBe("what does 1 000× mean");
  });

  it.each(intentCases)("classifies %s as %s", (question, expected) => {
    expect(classifyIntent(normalizeQuestion(question))).toBe(expected);
  });

  it("uses dynamic selected-body values in overview and eccentricity answers", () => {
    expect(answerQuestion("Tell me about Mars", context).text).toContain("687 days");
    expect(answerQuestion("Explain eccentricity", context).text).toContain("0.093");
  });

  it("uses the active measurement and handles a missing measurement", () => {
    expect(answerQuestion("Explain this distance", context).text).toContain("78.00 million km");
    const noMeasurement = { ...context, measurement: null };
    expect(answerQuestion("Explain this distance", noMeasurement).text).toContain("Select two objects");
  });

  it("explains the live simulation date and speed, including numeric multiplier prompts", () => {
    expect(answerQuestion("What date is this?", context).text).toContain("01 Jan 2026");
    expect(answerQuestion("What does 1,000× mean?", context).intent).toBe("simulation_time");
    expect(answerQuestion("What does 1,000× mean?", context).text).toContain("1,000×");
  });

  it("returns a bounded fallback for unsupported questions", () => {
    const answer = answerQuestion("Tell me a joke", context);
    expect(answer.intent).toBe("fallback");
    expect(answer.confidence).toBe("fallback");
    expect(answer.suggestedPrompts?.length).toBeGreaterThan(0);
  });

  it("keeps responses under 120 words and as plain text", () => {
    for (const [question] of intentCases) {
      const text = answerQuestion(question, context).text;
      expect(text.split(/\s+/).length).toBeLessThanOrEqual(120);
      expect(text).not.toMatch(/<[^>]+>/);
    }
  });
});
