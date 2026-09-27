/**
 * Everything ASTRA remembers outside the component tree: a notebook of what the
 * user actually did, plus the small amount of state needed to greet them next
 * time. Stored in this browser only — there is no server to store it on.
 */

export type NotebookKind =
  | "looked"
  | "measured"
  | "flight"
  | "experiment"
  | "clock"
  | "saved"
  | "asked";

export type NotebookEntry = {
  id: string;
  kind: NotebookKind;
  /** When it happened in real time. */
  at: number;
  /** The model's own date label, so the note keeps its scientific context. */
  modelDate: string;
  text: string;
};

export type Memory = {
  visits: number;
  lastBodyName: string | null;
  lastSeenAt: number | null;
  hintsSeen: string[];
};

/** One id strategy, used by every component that needs to label a message or a note. */
export function newId() {
  return (
    globalThis.crypto?.randomUUID?.() ??
    `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
  );
}

const NOTEBOOK_KEY = "astra-notebook";
const MEMORY_KEY = "astra-memory";
const NOTEBOOK_LIMIT = 60;

const emptyMemory: Memory = {
  visits: 0,
  lastBodyName: null,
  lastSeenAt: null,
  hintsSeen: [],
};

/**
 * localStorage throws in private windows and sandboxed frames. Memory is a
 * nicety here, so a failure should quietly cost us nothing.
 */
function read<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* Memory is best-effort. */
  }
}

export function readNotebook(): NotebookEntry[] {
  const entries = read<NotebookEntry[]>(NOTEBOOK_KEY, []);
  return Array.isArray(entries) ? entries : [];
}

const DUPLICATE_WINDOW_MS = 10 * 60_000;

/**
 * Writes a note, but never the same sentence twice in a row within ten minutes —
 * reloading the page shouldn't pad the notebook with repeats.
 */
export function appendNote(entry: NotebookEntry) {
  const current = readNotebook();
  const last = current[current.length - 1];
  if (
    last &&
    last.text === entry.text &&
    entry.at - last.at < DUPLICATE_WINDOW_MS
  ) {
    return current;
  }
  const next = [...current, entry].slice(-NOTEBOOK_LIMIT);
  write(NOTEBOOK_KEY, next);
  return next;
}

export function clearNotebook() {
  write(NOTEBOOK_KEY, []);
}

export function readMemory(): Memory {
  const memory = read<Partial<Memory>>(MEMORY_KEY, {});
  return {
    visits: memory.visits ?? 0,
    lastBodyName: memory.lastBodyName ?? null,
    lastSeenAt: memory.lastSeenAt ?? null,
    hintsSeen: Array.isArray(memory.hintsSeen) ? memory.hintsSeen : [],
  };
}

export function updateMemory(patch: Partial<Memory>) {
  const next = { ...readMemory(), ...patch };
  write(MEMORY_KEY, next);
  return next;
}

export function markHintSeen(id: string) {
  const memory = readMemory();
  if (memory.hintsSeen.includes(id)) return;
  updateMemory({ hintsSeen: [...memory.hintsSeen, id] });
}

/** "just now" reads better than "0 minutes ago" when ASTRA is speaking. */
export function relativeTime(at: number, now = Date.now()) {
  const seconds = Math.max(0, Math.round((now - at) / 1000));
  if (seconds < 45) return "just now";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.round(hours / 24);
  if (days === 1) return "yesterday";
  if (days < 30) return `${days} days ago`;
  return "a while back";
}

export function formatNoteTime(entry: NotebookEntry) {
  const days = (Date.now() - entry.at) / 86_400_000;
  return days < 1 ? relativeTime(entry.at) : entry.modelDate;
}

/**
 * One honest sentence about the current visit, built from real entries rather
 * than from counters that look good on a dashboard.
 */
export function summarizeVisit(entries: NotebookEntry[], now = Date.now()) {
  const today = entries.filter(entry => now - entry.at < 12 * 3_600_000);
  if (!today.length) return null;
  const first = today[0];
  const span = relativeTime(first.at, now);
  const kinds = today.reduce<Record<string, number>>((counts, entry) => {
    counts[entry.kind] = (counts[entry.kind] ?? 0) + 1;
    return counts;
  }, {});
  const shape =
    today.length === 1
      ? "one note"
      : `${today.length} notes, mostly ${dominantKind(kinds)}`;
  const latest = today[today.length - 1];
  return `Started ${span} — ${shape}. Last thing: ${lowerFirst(latest.text)}`;
}

function dominantKind(counts: Record<string, number>) {
  const winner = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0];
  return (
    {
      looked: "looking around",
      measured: "measuring",
      flight: "flying to somewhere",
      experiment: "trying orbits",
      clock: "moving the clock",
      saved: "saving runs",
      asked: "asking questions",
    }[winner ?? ""] ?? "looking around"
  );
}

function lowerFirst(text: string) {
  return text.charAt(0).toLowerCase() + text.slice(1).replace(/\.$/, "");
}
