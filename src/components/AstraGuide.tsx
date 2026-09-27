import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { ArrowUp, Trash2, X } from "lucide-react";
import { AstraMark } from "@/components/AstraMark";
import { answerQuestion, GUIDE_PROMPTS } from "@/lib/astraGuide";
import type { GuideContext, GuideMessage } from "@/lib/astraGuide";
import { newId } from "@/lib/session";

type Props = {
  context: GuideContext;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Lets the notebook record what was asked. */
  onAsk?: (question: string) => void;
};

export function AstraGuide({ context, open, onOpenChange, onAsk }: Props) {
  const [messages, setMessages] = useState<GuideMessage[]>([]);
  const [input, setInput] = useState("");
  const [isAnswering, setIsAnswering] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<number | null>(null);

  // ASTRA says hello in its own voice, using what it remembers, instead of
  // showing an empty panel with instructions.
  const greeting = useMemo(
    () => answerQuestion("hello", context).text,
    [context]
  );

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(
    () => () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    },
    []
  );

  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onOpenChange]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
  }, [messages, isAnswering]);

  function submit(questionText: string) {
    const question = questionText.trim().slice(0, 240);
    if (!question || isAnswering) return;
    const answer = answerQuestion(question, context);
    const now = Date.now();
    setMessages(current => [
      ...current,
      { id: newId(), role: "user", text: question, createdAt: now },
    ]);
    setInput("");
    setIsAnswering(true);
    setAnnouncement("");
    onAsk?.(question);
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    timerRef.current = window.setTimeout(
      () => {
        setMessages(current => [
          ...current,
          {
            id: newId(),
            role: "assistant",
            text: answer.text,
            intent: answer.intent,
            createdAt: now + 1,
          },
        ]);
        setAnnouncement(answer.text);
        setIsAnswering(false);
        timerRef.current = null;
      },
      reducedMotion ? 0 : 260
    );
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submit(input);
  }

  if (!open) return null;

  const lastIntent = messages[messages.length - 1]?.intent;

  return (
    <aside id="astra-guide-panel" className="guide" aria-label="ASTRA">
      <header className="guide-head">
        <div className="guide-title">
          <AstraMark size={22} />
          <div>
            <h2>ASTRA</h2>
            <p>Reads this model only — no internet, no guesswork</p>
          </div>
        </div>
        <div className="guide-actions">
          <button
            type="button"
            className="icon-btn is-tiny"
            onClick={() => {
              setMessages([]);
              setAnnouncement("");
            }}
            aria-label="Clear this conversation"
            disabled={messages.length === 0}
          >
            <Trash2 size={14} />
          </button>
          <button
            type="button"
            className="icon-btn is-tiny"
            onClick={() => onOpenChange(false)}
            aria-label="Close ASTRA"
          >
            <X size={15} />
          </button>
        </div>
      </header>

      <div className="guide-body" aria-label="Conversation">
        {messages.length === 0 && (
          <article className="guide-msg is-assistant">
            <span className="guide-role">ASTRA</span>
            <p>{greeting}</p>
          </article>
        )}
        {messages.map(message => (
          <article key={message.id} className={`guide-msg is-${message.role}`}>
            {message.role === "assistant" && (
              <span className="guide-role">ASTRA</span>
            )}
            <p>{message.text}</p>
          </article>
        ))}
        {isAnswering && (
          <p className="guide-thinking" role="status">
            Reading the model…
          </p>
        )}
        {(messages.length === 0 || lastIntent === "fallback") && (
          <div className="guide-prompts" aria-label="Starting questions">
            {GUIDE_PROMPTS.map(prompt => (
              <button
                type="button"
                key={prompt}
                onClick={() => submit(prompt)}
                disabled={isAnswering}
              >
                {prompt}
              </button>
            ))}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="sr-live" aria-live="polite" aria-atomic="true">
        {announcement}
      </div>

      <form className="guide-form" onSubmit={handleSubmit}>
        <label className="sr-only" htmlFor="astra-guide-question">
          Ask ASTRA a question
        </label>
        <div className="guide-input">
          <input
            ref={inputRef}
            id="astra-guide-question"
            value={input}
            maxLength={240}
            onChange={event => setInput(event.target.value)}
            placeholder="Ask about what's on screen…"
            autoComplete="off"
          />
          <button
            type="submit"
            aria-label="Send question"
            disabled={isAnswering || !input.trim()}
          >
            <ArrowUp size={17} />
          </button>
        </div>
        <div className="guide-meta">
          <span>
            Answers are written from this model, not mission planning.
          </span>
          <span>{input.length}/240</span>
        </div>
      </form>
    </aside>
  );
}
