import { describe, expect, it } from "vitest";
import { relativeTime, summarizeVisit } from "./session";
import type { NotebookEntry } from "./session";

const now = new Date("2026-09-27T12:00:00Z").getTime();
const minutes = (count: number) => count * 60_000;

function note(partial: Partial<NotebookEntry>): NotebookEntry {
  return {
    id: partial.id ?? "n1",
    kind: partial.kind ?? "looked",
    at: partial.at ?? now - minutes(5),
    modelDate: partial.modelDate ?? "01 Jan 2026",
    text: partial.text ?? "Looked at Mars.",
  };
}

describe("session memory helpers", () => {
  it("reads naturally at every scale", () => {
    expect(relativeTime(now - 5_000, now)).toBe("just now");
    expect(relativeTime(now - minutes(12), now)).toBe("12 min ago");
    expect(relativeTime(now - minutes(180), now)).toBe("3 h ago");
    expect(relativeTime(now - minutes(60 * 30), now)).toBe("yesterday");
    expect(relativeTime(now - minutes(60 * 24 * 4), now)).toBe("4 days ago");
  });

  it("summarises the visit in one plain sentence", () => {
    const summary = summarizeVisit(
      [
        note({
          kind: "looked",
          text: "Looked at Titan.",
          at: now - minutes(40),
        }),
        note({
          id: "n2",
          kind: "measured",
          text: "Measured Earth → Mars.",
          at: now - minutes(10),
        }),
        note({
          id: "n3",
          kind: "measured",
          text: "Measured Earth → Venus.",
          at: now - minutes(2),
        }),
      ],
      now
    );
    expect(summary).toContain("40 min ago");
    expect(summary).toContain("3 notes");
    expect(summary).toContain("mostly measuring");
    expect(summary).toMatch(/Last thing: measured Earth → Venus/);
  });

  it("stays quiet when the notebook only holds older sessions", () => {
    expect(
      summarizeVisit([note({ at: now - minutes(60 * 24 * 3) })], now)
    ).toBeNull();
  });
});
