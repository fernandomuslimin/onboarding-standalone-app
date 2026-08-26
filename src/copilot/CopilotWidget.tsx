import { useState } from "react";
import { useCopilot } from "./CopilotContext";
import { classifyIntent, describeValue } from "./intent";
import { COPILOT_REF_STYLES } from "./Referenceable";

interface Message { role: "user" | "assistant"; text: string }

const SPARKLE_PATH = (
  <>
    <path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72Z" />
    <path d="m14 7 3 3" /><path d="M5 6v4" /><path d="M19 14v4" />
  </>
);

const UNAVAILABLE = "this reference is no longer available — reopen it and re-pin";

export function CopilotWidget() {
  const { pinned, unpin, isOpen, open, close, toggle, resolve, applyEdit } = useCopilot();
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);

  async function send() {
    const text = draft.trim();
    if (!text || busy) return;
    setMessages((m) => [...m, { role: "user", text }]);
    setDraft("");

    if (pinned.length === 0) {
      setMessages((m) => [...m, { role: "assistant", text: "Hover a section or field and click the pin icon to reference it, then ask me something." }]);
      return;
    }

    if (classifyIntent(text) === "question") {
      const answer = pinned.map((ref) => {
        const resolved = resolve(ref.id);
        return resolved ? describeValue(resolved.label, resolved.value) : `${ref.label}: ${UNAVAILABLE}.`;
      }).join("\n\n");
      setMessages((m) => [...m, { role: "assistant", text: answer }]);
      return;
    }

    setBusy(true);
    // Only prefix with the reference's label when more than one is pinned —
    // with a single reference the summary already names what changed, so
    // prefixing would just repeat it ("Description: updated \"Description\"").
    const prefix = (label: string) => (pinned.length > 1 ? `${label}: ` : "");
    const results = await Promise.all(pinned.map(async (ref) => {
      const result = await applyEdit(ref.id, text);
      return result ? `${prefix(ref.label)}${result.changedSummary}` : `${prefix(ref.label)}${UNAVAILABLE}.`;
    }));
    setBusy(false);
    setMessages((m) => [...m, { role: "assistant", text: results.join("\n\n") }]);
  }

  return (
    <>
      <style>{COPILOT_REF_STYLES}</style>
      <div style={{ position: "fixed", right: 20, bottom: 20, zIndex: 100, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 12, fontFamily: "var(--font-sans)" }}>
        {isOpen && (
          <div style={{
            width: 340, maxHeight: 480, display: "flex", flexDirection: "column", background: "var(--color-page)",
            border: "1px solid var(--color-border)", borderRadius: 16, boxShadow: "var(--shadow-elevated)", overflow: "hidden",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", borderBottom: "1px solid var(--color-border)" }}>
              <span style={{ fontSize: 13.5, fontWeight: 700, color: "var(--color-heading)" }}>Copilot</span>
              <button type="button" onClick={close} title="Close"
                style={{ background: "none", border: "none", cursor: "pointer", padding: 2, lineHeight: 0, color: "var(--color-muted)" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
              </button>
            </div>

            <div style={{ flex: 1, minHeight: 120, overflowY: "auto", padding: "12px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
              {messages.length === 0 ? (
                <p style={{ fontSize: 12.5, color: "var(--color-muted)", lineHeight: 1.5, margin: 0 }}>
                  Hover any section or field on the page and click the pin icon to reference it here, then ask a question or tell me what to change.
                </p>
              ) : (
                messages.map((m, i) => (
                  <div key={i} style={{
                    alignSelf: m.role === "user" ? "flex-end" : "flex-start", maxWidth: "88%",
                    background: m.role === "user" ? "var(--color-brand)" : "var(--color-surface)",
                    color: m.role === "user" ? "#fff" : "var(--color-heading)",
                    borderRadius: 10, padding: "8px 11px", fontSize: 12.5, lineHeight: 1.5, whiteSpace: "pre-wrap" as const,
                  }}>
                    {m.text}
                  </div>
                ))
              )}
              {busy && <div style={{ fontSize: 12, color: "var(--color-muted)", fontStyle: "italic" }}>Thinking…</div>}
            </div>

            {pinned.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, padding: "8px 14px", borderTop: "1px solid var(--color-border)" }}>
                {pinned.map((ref) => (
                  <span key={ref.id} style={{
                    display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 600, color: "var(--color-brand)",
                    background: "var(--color-brand-tint)", border: "1px solid var(--color-border)", borderRadius: 999, padding: "3px 5px 3px 10px",
                  }}>
                    {ref.label}
                    <button type="button" onClick={() => unpin(ref.id)} aria-label={`Remove ${ref.label}`}
                      style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 14, height: 14, borderRadius: "50%", border: "none", background: "rgba(0,0,0,0.08)", color: "inherit", cursor: "pointer", padding: 0 }}>
                      <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
                    </button>
                  </span>
                ))}
              </div>
            )}

            <div style={{ display: "flex", gap: 8, padding: "10px 14px", borderTop: "1px solid var(--color-border)" }}>
              <input
                value={draft} onChange={(e) => setDraft(e.target.value)} disabled={busy}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); send(); } }}
                placeholder={pinned.length > 0 ? "Ask about it, or tell me what to change…" : "Pin something to reference first…"}
                style={{ flex: 1, minWidth: 0, fontSize: 12.5, border: "1px solid var(--color-border)", borderRadius: 8, padding: "8px 10px", outline: "none", fontFamily: "inherit", background: "var(--color-surface)", color: "var(--color-heading)" }}
              />
              <button type="button" onClick={send} disabled={busy || !draft.trim()}
                style={{ flexShrink: 0, fontSize: 12, fontWeight: 600, borderRadius: 8, border: "none", padding: "0 14px", background: "var(--color-brand)", color: "#fff", cursor: busy || !draft.trim() ? "default" : "pointer", opacity: busy || !draft.trim() ? 0.6 : 1, fontFamily: "inherit" }}>
                Send
              </button>
            </div>
          </div>
        )}

        <button
          type="button" onClick={toggle} title="Copilot"
          style={{
            position: "relative", width: 52, height: 52, borderRadius: "50%", border: "none", background: "var(--color-brand)", color: "#fff",
            display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "var(--shadow-elevated)",
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {SPARKLE_PATH}
          </svg>
          {pinned.length > 0 && !isOpen && (
            <span style={{
              position: "absolute", top: -4, right: -4, minWidth: 18, height: 18, borderRadius: 999, background: "var(--color-error)",
              color: "#fff", fontSize: 10.5, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 4px",
            }}>
              {pinned.length}
            </span>
          )}
        </button>
      </div>
    </>
  );
}
