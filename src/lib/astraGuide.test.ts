import { describe, expect, it } from "vitest";
import {
  answerQuestion,
  classifyIntent,
  normalizeQuestion,
} from "./astraGuide";
import type { GuideContext, GuideIntent } from "./astraGuide";

const baseContext: GuideContext = {
  selectedBody: {
    id: "mars",
    name: "Mars",
    category: "Terrestrial planet",
    description: "A rocky world with a thin atmosphere.",
    fact: "Mars has two small moons.",
    orbitalPeriod: "687 days",
    orbitalPeriodDays: 687,
    orbitalVelocity: "24.1 km/s",
    semiMajorAxisAU: 1.524,
    eccentricity: 0.093,
    inclination: 1.85,
  },
  simulatedDay: 365,
  simulatedDateLabel: "01 Jan 2026",
  speedMultiplier: 1000,
  measurement: {
    firstName: "Earth",
    secondName: "Mars",
    distanceKm: 78_000_000,
    formattedDistance: "78.00 million km",
  },
};

const context = baseContext;

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
  ["What have I been doing?", "session_recall"],
  ["Remind me what I looked at earlier", "session_recall"],
];

describe("ASTRA Guide question handling", () => {
  it("normalizes questions without dropping scientific symbols", () => {
    expect(normalizeQuestion("  What is E?  ")).toBe("what is e");
    expect(normalizeQuestion("What does 1,000× mean?")).toBe(
      "what does 1 000× mean"
    );
  });

  it.each(intentCases)("classifies %s as %s", (question, expected) => {
    expect(classifyIntent(normalizeQuestion(question))).toBe(expected);
  });

  it("uses dynamic selected-body values in overview and eccentricity answers", () => {
    expect(answerQuestion("Tell me about Mars", context).text).toContain(
      "687 days"
    );
    expect(answerQuestion("Explain eccentricity", context).text).toContain(
      "0.093"
    );
  });

  it("uses the active measurement and handles a missing measurement", () => {
    expect(answerQuestion("Explain this distance", context).text).toContain(
      "78.00 million km"
    );
    const noMeasurement = { ...context, measurement: null };
    expect(
      answerQuestion("Explain this distance", noMeasurement).text
    ).toContain("measure panel");
  });

  it("compares against an earlier sample for the same pair instead of guessing", () => {
    const withSample = {
      ...context,
      measurement: {
        ...context.measurement!,
        previousDistanceKm: 61_200_000,
        previousFormattedDistance: "61.20 million km",
      },
    };
    const answer = answerQuestion("Are they getting closer?", withSample);
    expect(answer.confidence).toBe("high");
    expect(answer.text).toContain("61.20 million km");
    expect(answer.text).toContain("up");
    expect(answerQuestion("Are they getting closer?", context).confidence).toBe(
      "medium"
    );
  });

  it("explains the live simulation date and speed, including numeric multiplier prompts", () => {
    expect(answerQuestion("What date is this?", context).text).toContain(
      "01 Jan 2026"
    );
    expect(answerQuestion("What does 1,000× mean?", context).intent).toBe(
      "simulation_time"
    );
    expect(answerQuestion("What does 1,000× mean?", context).text).toContain(
      "1,000×"
    );
  });

  it("greets a returning visitor using what it remembers", () => {
    const returning: GuideContext = {
      ...context,
      memory: {
        recent: [],
        visits: 4,
        lastBodyName: "Titan",
        lastSeenLabel: "yesterday",
      },
    };
    const text = answerQuestion("Hello", returning).text;
    expect(text).toContain("Titan");
    expect(text).toContain("Mars");
    expect(text).toContain("yesterday");
    const first: GuideContext = {
      ...context,
      memory: {
        recent: [],
        visits: 1,
        lastBodyName: null,
        lastSeenLabel: null,
      },
    };
    expect(answerQuestion("Hello", first).text).not.toContain("Last time");
  });

  it("mentions whatever the user has switched on, without inventing activity", () => {
    const flying: GuideContext = {
      ...context,
      activity: {
        experiment: null,
        flight: "Earth → Titan, 42% of the way there",
        transfer: null,
      },
    };
    expect(answerQuestion("Tell me about Mars", flying).text).toContain(
      "flight running"
    );
    expect(answerQuestion("Tell me about Mars", context).text).not.toContain(
      "flight"
    );
    expect(answerQuestion("What can you explain?", context).text).not.toContain(
      "still got"
    );
  });

  it("reads back the notebook when asked about the session", () => {
    const withNotes: GuideContext = {
      ...context,
      memory: {
        recent: [
          {
            text: "Measured Earth → Mars: 78.00 million km.",
            when: "just now",
          },
          { text: "Looked at Titan.", when: "12 min ago" },
        ],
        visits: 2,
        lastBodyName: "Titan",
        lastSeenLabel: "12 min ago",
      },
    };
    const answer = answerQuestion("What have I been doing?", withNotes);
    expect(answer.text).toContain("Measured Earth → Mars");
    expect(answer.text).toContain("12 min ago");
    expect(answerQuestion("What have I been doing?", context).text).toContain(
      "notebook is empty"
    );
  });

  it("admits what it does not know instead of improvising", () => {
    const answer = answerQuestion("Tell me a joke", context);
    expect(answer.intent).toBe("fallback");
    expect(answer.confidence).toBe("fallback");
    expect(answer.text).toContain("I don't know that one");
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
