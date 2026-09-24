import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowUp, Sparkles, Trash2, X } from "lucide-react";
import { answerQuestion, GUIDE_PROMPTS } from "@/lib/astraGuide";
import type { GuideContext, GuideMessage } from "@/lib/astraGuide";

type Props = { context: GuideContext; open: boolean; onOpenChange: (open: boolean) => void };
const makeId = () => globalThis.crypto?.randomUUID?.() ?? String(Date.now()) + Math.random().toString(36).slice(2);

export function AstraGuide({ context, open, onOpenChange }: Props) {
  const [messages, setMessages] = useState<GuideMessage[]>([]);
  const [input, setInput] = useState("");
  const [isAnswering, setIsAnswering] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);
  useEffect(() => () => { if (timerRef.current !== null) window.clearTimeout(timerRef.current); }, []);
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onOpenChange]);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }, [messages, isAnswering]);

  function submit(questionText: string) {
    const question = questionText.trim().slice(0, 240);
    if (!question || isAnswering) return;
    const answer = answerQuestion(question, context);
    const now = Date.now();
    const userMessage: GuideMessage = { id: makeId(), role: "user", text: question, createdAt: now };
    const assistantMessage: GuideMessage = { id: makeId(), role: "assistant", text: answer.text, intent: answer.intent, createdAt: now + 1 };
    setMessages((current) => [...current, userMessage]);
    setInput("");
    setIsAnswering(true);
    setAnnouncement("");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    timerRef.current = window.setTimeout(() => {
      setMessages((current) => [...current, assistantMessage]);
      setAnnouncement(answer.text);
      setIsAnswering(false);
      timerRef.current = null;
    }, reducedMotion ? 0 : 240);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submit(input);
  }

  if (!open) return null;

  return (
    <aside id="astra-guide-panel" hidden={!open} className="astra-guide-panel" aria-label="ASTRA Guide">
      <header className="astra-guide-header">
        <div className="astra-guide-title"><Sparkles size={16} aria-hidden="true" /><div><p className="astra-guide-kicker">Educational model · Core Edition</p><h2>ASTRA Guide</h2></div></div>
        <div className="astra-guide-header-actions">
          <button type="button" className="astra-guide-icon-button" onClick={() => { setMessages([]); setAnnouncement(""); }} aria-label="Clear chat" disabled={messages.length === 0}><Trash2 size={15} /></button>
          <button type="button" className="astra-guide-icon-button" onClick={() => onOpenChange(false)} aria-label="Close ASTRA Guide"><X size={17} /></button>
        </div>
      </header>
      <p className="astra-guide-description">Ask about the planets, the orbital model, time, or distance.</p>
      <div className="astra-guide-messages" aria-label="Conversation">
        {messages.length === 0 ? (
          <div className="astra-guide-empty">
            <p>Explore the live model with a bounded, local guide. Answers use the selected body and the simulation’s current values.</p>
            <div className="astra-guide-prompts" aria-label="Suggested questions">
              {GUIDE_PROMPTS.map((prompt) => <button type="button" key={prompt} onClick={() => submit(prompt)} disabled={isAnswering}>{prompt}</button>)}
            </div>
          </div>
        ) : (
          <div className="astra-guide-message-list">
            {messages.map((message) => <article key={message.id} className={"astra-guide-message is-" + message.role}>
              {message.role === "assistant" && <span className="astra-guide-role">ASTRA GUIDE</span>}
              <p>{message.text}</p>
            </article>)}
            {isAnswering && <p className="astra-guide-thinking" role="status">ASTRA Guide is preparing a response…</p>}
            {messages[messages.length - 1]?.intent === "fallback" && <div className="astra-guide-prompts" aria-label="Suggested questions">{GUIDE_PROMPTS.map((prompt) => <button type="button" key={prompt} onClick={() => submit(prompt)} disabled={isAnswering}>{prompt}</button>)}</div>}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="astra-guide-live" aria-live="polite" aria-atomic="true">{announcement}</div>
      <form className="astra-guide-form" onSubmit={handleSubmit}>
        <label className="sr-only" htmlFor="astra-guide-question">Ask ASTRA Guide a question</label>
        <div className="astra-guide-input-row">
          <input ref={inputRef} id="astra-guide-question" value={input} maxLength={240} onChange={(event) => setInput(event.target.value)} placeholder="Ask about the model..." autoComplete="off" />
          <button type="submit" aria-label="Send question" disabled={isAnswering || !input.trim()}><ArrowUp size={17} /></button>
        </div>
        <div className="astra-guide-form-meta"><span>Educational answers from this model · not mission-planning software</span><span>{input.length}/240</span></div>
      </form>
    </aside>
  );
}
