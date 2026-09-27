import { useState } from "react";
import { Notebook as NotebookIcon } from "lucide-react";
import {
  formatNoteTime,
  summarizeVisit,
  type NotebookEntry,
} from "@/lib/session";

type Props = {
  entries: NotebookEntry[];
  onClear: () => void;
};

const SHOWN = 5;

/**
 * A record of what actually happened, written in sentences. This is also the
 * thing ASTRA reads from when you ask what you have been doing.
 */
export function Notebook({ entries, onClear }: Props) {
  const [expanded, setExpanded] = useState(false);
  const summary = summarizeVisit(entries);
  const newestFirst = [...entries].reverse();
  const visible = expanded ? newestFirst : newestFirst.slice(0, SHOWN);
  const hidden = newestFirst.length - visible.length;

  return (
    <section className="panel notebook" aria-labelledby="notebook-title">
      <header className="panel-head">
        <div>
          <p className="panel-eyebrow">Notebook</p>
          <h2 id="notebook-title">
            <NotebookIcon size={16} aria-hidden="true" /> What you've tried so
            far
          </h2>
        </div>
        {entries.length > 0 && (
          <button
            type="button"
            className="btn is-quiet is-small"
            onClick={onClear}
          >
            Start a fresh page
          </button>
        )}
      </header>

      {summary && <p className="notebook-summary">{summary}</p>}

      {entries.length === 0 ? (
        <p className="empty">
          Nothing written down yet. Select a world, measure between two of them,
          or start a flight — ASTRA keeps the notes as you go, and can read them
          back to you.
        </p>
      ) : (
        <ol className="notes">
          {visible.map(entry => (
            <li key={entry.id} className={`note is-${entry.kind}`}>
              <span className="note-time">{formatNoteTime(entry)}</span>
              <span className="note-text">{entry.text}</span>
              <span className="note-model">{entry.modelDate}</span>
            </li>
          ))}
        </ol>
      )}

      <footer className="panel-foot">
        {entries.length > 0
          ? `${entries.length} note${entries.length === 1 ? "" : "s"} kept in this browser. `
          : ""}
        {hidden > 0 && !expanded && (
          <button
            type="button"
            className="linkish"
            onClick={() => setExpanded(true)}
          >
            Show {hidden} older
          </button>
        )}
        {expanded && (
          <button
            type="button"
            className="linkish"
            onClick={() => setExpanded(false)}
          >
            Show fewer
          </button>
        )}
      </footer>
    </section>
  );
}
