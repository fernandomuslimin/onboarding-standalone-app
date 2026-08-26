import { useRef, useState } from "react";
import { HistorySource } from "./data";
import { ReferenceableSection } from "../copilot/Referenceable";

/* ════════════════════════════════════════════════════════════════════
   Knowledge Center — shared UI primitives
   Reuses the design tokens defined in globals.css (--color-*, shadows,
   easing) so this feels like one continuous product with onboarding.
══════════════════════════════════════════════════════════════════════ */

export const KC_FONT = "var(--font-sans)";

/* ─── Icons ─────────────────────────────────────────────────────── */
export type IconName =
  | "building" | "globe" | "users" | "target" | "flag" | "briefcase" | "dollar"
  | "chart" | "search" | "message" | "shield" | "list" | "folder" | "phone"
  | "mail" | "linkedin" | "check" | "clock" | "external" | "chevron-down"
  | "chevron-left" | "plus" | "minus" | "trash" | "graph" | "grid" | "filter" | "brain"
  | "compass" | "layers" | "route" | "handshake" | "book" | "map" | "edit" | "info" | "close";

const ICON_PATHS: Record<IconName, React.ReactNode> = {
  building: <><path d="M4 21V4a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v17" /><path d="M15 9h4a1 1 0 0 1 1 1v11" /><path d="M9 8h.01M9 12h.01M9 16h.01M9 20h.01M18 13h.01M18 17h.01" /></>,
  globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18Z" /></>,
  users: <><circle cx="9" cy="8" r="3.2" /><path d="M3.5 20a5.5 5.5 0 0 1 11 0" /><path d="M16 8.5a3 3 0 1 1 3.2 3M15.5 14a5 5 0 0 1 5 5.5" /></>,
  target: <><circle cx="12" cy="12" r="8.5" /><circle cx="12" cy="12" r="4.5" /><circle cx="12" cy="12" r="0.7" fill="currentColor" /></>,
  flag: <><path d="M5 21V4" /><path d="M5 4h13l-3 4.5L18 13H5" /></>,
  briefcase: <><rect x="3" y="7.5" width="18" height="12" rx="1.6" /><path d="M8 7.5V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v1.5" /><path d="M3 12.5h18" /></>,
  dollar: <><circle cx="12" cy="12" r="9" /><path d="M12 6.5v11M15 9.3c0-1.3-1.4-2.3-3-2.3s-3 1-3 2.3 1.2 2 3 2.3c1.8.3 3 1 3 2.4s-1.4 2.3-3 2.3-3-.9-3-2.2" /></>,
  chart: <><path d="M4 20V9M11 20V4M18 20v-7" /><path d="M2 20h20" /></>,
  search: <><circle cx="10.5" cy="10.5" r="6.5" /><path d="M20 20l-4.8-4.8" /></>,
  message: <><path d="M4 5h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H9l-5 4v-4H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z" /></>,
  shield: <><path d="M12 3l7 3v6c0 4.5-3 8-7 9-4-1-7-4.5-7-9V6l7-3Z" /><path d="M9 12l2 2 4-4" /></>,
  list: <><path d="M8 6h13M8 12h13M8 18h13" /><path d="M3 6h.01M3 12h.01M3 18h.01" /></>,
  folder: <><path d="M3 7a1 1 0 0 1 1-1h5l2 2h9a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7Z" /></>,
  phone: <><path d="M6 3h3l1.5 5L8 10a12 12 0 0 0 6 6l2-2.5 5 1.5v3a2 2 0 0 1-2 2C10.6 20 4 13.4 4 5a2 2 0 0 1 2-2Z" /></>,
  mail: <><rect x="3" y="5" width="18" height="14" rx="1.6" /><path d="M3.5 6.5l8.5 7 8.5-7" /></>,
  linkedin: <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z M2 9h4v12H2z M4 2a2 2 0 1 1 0 4 2 2 0 0 1 0-4z" />,
  check: <path d="M20 6L9 17l-5-5" />,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.5 2" /></>,
  external: <><path d="M14 4h6v6" /><path d="M20 4l-9 9" /><path d="M19 13v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h6" /></>,
  "chevron-down": <path d="M6 9l6 6 6-6" />,
  "chevron-left": <path d="M15 18l-6-6 6-6" />,
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
  trash: <><path d="M4 7h16" /><path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" /><path d="M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13" /><path d="M10 11v6M14 11v6" /></>,
  graph: <><circle cx="4" cy="12" r="2" /><circle cx="12" cy="6" r="2" /><circle cx="12" cy="18" r="2" /><circle cx="20" cy="12" r="2" /><path d="M6 12h4M13.4 7.6L18.6 10.4M13.4 16.4L18.6 13.6" /></>,
  grid: <><rect x="3.5" y="3.5" width="7.5" height="7.5" rx="1.4" /><rect x="13" y="3.5" width="7.5" height="7.5" rx="1.4" /><rect x="3.5" y="13" width="7.5" height="7.5" rx="1.4" /><rect x="13" y="13" width="7.5" height="7.5" rx="1.4" /></>,
  filter: <path d="M4 5h16l-6.5 7.5V19l-3 1.5v-8L4 5Z" />,
  brain: <><path d="M9 4a3 3 0 0 0-3 3v.3A3 3 0 0 0 4 10a3 3 0 0 0 1 5.7V16a3 3 0 0 0 3 3 3 3 0 0 0 3-3V7a3 3 0 0 0-2-3Z" /><path d="M15 4a3 3 0 0 1 3 3v.3a3 3 0 0 1 2 2.7 3 3 0 0 1-1 5.7V16a3 3 0 0 1-3 3 3 3 0 0 1-3-3V7a3 3 0 0 1 2-3Z" /></>,
  compass: <><circle cx="12" cy="12" r="9" /><path d="M15 9l-2 6-6 2 2-6 6-2Z" /></>,
  layers: <><path d="M12 3l9 5-9 5-9-5 9-5Z" /><path d="M3 13l9 5 9-5M3 8l9 5 9-5" /></>,
  route: <><circle cx="6" cy="19" r="2.2" /><circle cx="18" cy="5" r="2.2" /><path d="M6 16.8V13a4 4 0 0 1 4-4h4a4 4 0 0 0 4-4" /></>,
  handshake: <><path d="M2 12l4-3 3 2 3-2 4 3" /><path d="M6 9v6l3 2.5L12 15M18 9v6l-3 2.5" /></>,
  book: <><path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H12v16H5.5A1.5 1.5 0 0 1 4 18.5v-13Z" /><path d="M20 5.5A1.5 1.5 0 0 0 18.5 4H12v16h6.5a1.5 1.5 0 0 0 1.5-1.5v-13Z" /></>,
  map: <><path d="M9 4L4 6v14l5-2 6 2 5-2V4l-5 2-6-2Z" /><path d="M9 4v14M15 6v14" /></>,
  edit: <><path d="M4 20l1-4.2L15.8 5a1.4 1.4 0 0 1 2 0l1.2 1.2a1.4 1.4 0 0 1 0 2L8.2 19 4 20Z" /><path d="M13.2 6.8l4 4" /></>,
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v5.5" /><path d="M12 7.5h.01" /></>,
  close: <path d="M6 6l12 12M18 6L6 18" />,
};

const FILLED_ICONS = new Set<IconName>(["linkedin"]);

export function Icon({ name, size = 16, color = "currentColor", strokeWidth = 2 }: { name: IconName; size?: number; color?: string; strokeWidth?: number }) {
  if (FILLED_ICONS.has(name)) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill={color} fillRule="evenodd">
        {ICON_PATHS[name]}
      </svg>
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      {ICON_PATHS[name]}
    </svg>
  );
}

/* ─── Confidence badge ──────────────────────────────────────────── */
export function ConfidenceBadge({ value }: { value?: number }) {
  if (value == null) return null;
  const tone = value >= 85 ? "var(--color-success)" : value >= 65 ? "var(--color-warning)" : "var(--color-muted)";
  const bg = value >= 85 ? "rgba(7,188,12,0.1)" : value >= 65 ? "rgba(241,196,15,0.15)" : "var(--color-surface)";
  return (
    <span style={{ display: "inline-flex", alignItems: "center", fontSize: 10.5, fontWeight: 700, color: tone, background: bg, border: `1px solid ${tone}33`, borderRadius: 999, padding: "1px 7px", lineHeight: 1.6, whiteSpace: "nowrap" }}>
      {value}%
    </span>
  );
}

/* ─── Match badge (list rows) ───────────────────────────────────── */
export function MatchBadge({ value }: { value: number }) {
  const tone = value >= 80 ? "var(--color-success)" : value >= 55 ? "var(--color-warning)" : "var(--color-muted)";
  return (
    <span style={{ fontSize: 12, fontWeight: 700, color: tone, fontVariantNumeric: "tabular-nums" }}>{value}%</span>
  );
}

/* ─── Progress bar ──────────────────────────────────────────────── */
export function ProgressBar({ pct, height = 6 }: { pct: number; height?: number }) {
  const clamped = Math.max(0, Math.min(100, pct));
  return (
    <div style={{ width: "100%", height, borderRadius: 999, background: "var(--color-border)", overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${clamped}%`, background: "var(--color-brand)", borderRadius: 999, transition: "width 300ms var(--ease-apple)" }} />
    </div>
  );
}

/* ─── Card section (icon + heading wrapper) ────────────────────── */
export function CardSection({ icon, title, sectionId, children, right }: { icon: IconName; title: string; sectionId?: string; children: React.ReactNode; right?: React.ReactNode }) {
  const card = (
    <div style={{ background: "var(--color-page)", border: "1px solid var(--color-border)", borderRadius: 14, padding: "20px 22px", boxShadow: "var(--shadow-card)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <div style={{ width: 26, height: 26, borderRadius: 8, background: "var(--color-brand-tint)", color: "var(--color-brand)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Icon name={icon} size={14} />
          </div>
          <h3 style={{ fontSize: 14.5, fontWeight: 700, margin: 0 }}>{title}</h3>
        </div>
        {right}
      </div>
      {children}
    </div>
  );
  if (!sectionId) return card;
  return <ReferenceableSection id={sectionId} label={title} style={{ borderRadius: 14 }}>{card}</ReferenceableSection>;
}

/* ─── Low-confidence indicator ───────────────────────────────────
   A small dot for Primary summary blocks whose source confidence is
   below threshold — cheaper than a full ConfidenceBadge, meant to sit
   inline next to a value without competing with it for attention. */
export function LowConfidenceMark({ value, threshold = 70 }: { value?: number; threshold?: number }) {
  if (value == null || value >= threshold) return null;
  return (
    <span title={`Lower-confidence field (${value}%) — worth a second look`}
      style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "var(--color-warning)", flexShrink: 0 }} />
  );
}

/* ─── Accordion block (Secondary/expandable summary sections) ────
   Same shell as CardSection but collapsed by default — used for
   summary-view blocks the spec marks "Secondary (expandable)": on
   the page, but tucked behind a show-more so Primary blocks stay
   above the fold. */
export function AccordionBlock({ icon, title, sectionId, children, defaultOpen = false }: {
  icon: IconName; title: string; sectionId?: string; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const card = (
    <div style={{ background: "var(--color-page)", border: "1px solid var(--color-border)", borderRadius: 14, boxShadow: "var(--shadow-card)", overflow: "hidden" }}>
      <button type="button" onClick={() => setOpen((o) => !o)} className="kc-list-row"
        style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: sectionId ? "14px 38px 14px 20px" : "14px 20px", background: "transparent", border: "none", cursor: "pointer", fontFamily: KC_FONT, textAlign: "left" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <div style={{ width: 26, height: 26, borderRadius: 8, background: "var(--color-brand-tint)", color: "var(--color-brand)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Icon name={icon} size={14} />
          </div>
          <h3 style={{ fontSize: 14.5, fontWeight: 700, margin: 0 }}>{title}</h3>
        </div>
        <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, fontWeight: 700, color: "var(--color-muted)" }}>
          {open ? "Show less" : "Show more"}
          <span style={{ display: "flex", transform: open ? "rotate(180deg)" : "none", transition: "transform 150ms var(--ease-apple)" }}>
            <Icon name="chevron-down" size={13} />
          </span>
        </span>
      </button>
      {open && <div style={{ padding: "0 22px 20px" }}>{children}</div>}
    </div>
  );
  if (!sectionId) return card;
  return <ReferenceableSection id={sectionId} label={title} style={{ borderRadius: 14 }}>{card}</ReferenceableSection>;
}

/* ─── Currency formatting ────────────────────────────────────────── */
export function formatCurrencyShort(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(value % 1_000_000 === 0 ? 0 : 2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(value % 1_000 === 0 ? 0 : 1)}k`;
  return `$${value}`;
}

/* ─── Stat tile (count / currency, no progress bar) ─────────────── */
export function StatTile({ icon, label, value }: { icon: IconName; label: string; value: string }) {
  return (
    <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 12, padding: "14px 16px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <div style={{ width: 22, height: 22, borderRadius: 7, background: "var(--color-brand-tint)", color: "var(--color-brand)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon name={icon} size={12} />
        </div>
        <span style={{ fontSize: 10.5, fontWeight: 700, color: "var(--color-muted)", letterSpacing: "0.05em", textTransform: "uppercase" }}>{label}</span>
      </div>
      <div style={{ fontSize: 20, fontWeight: 800, color: "var(--color-heading)" }}>{value}</div>
    </div>
  );
}

/* ─── Field label ───────────────────────────────────────────────── */
export function FieldLabel({ children, confidence }: { children: React.ReactNode; confidence?: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
      <span style={{ fontSize: 10.5, fontWeight: 700, color: "var(--color-muted)", letterSpacing: "0.05em", textTransform: "uppercase" }}>{children}</span>
      <ConfidenceBadge value={confidence} />
    </div>
  );
}

/* ─── Read-only field value (text or bullet list) ──────────────── */
export function FieldValue({ value }: { value: string | string[] }) {
  if (Array.isArray(value)) {
    return (
      <ul style={{ margin: 0, padding: "0 0 0 16px", display: "flex", flexDirection: "column", gap: 3 }}>
        {value.map((v, i) => (
          <li key={i} style={{ fontSize: 12.5, color: "var(--color-heading)", lineHeight: 1.5 }}>{v}</li>
        ))}
      </ul>
    );
  }
  return <p style={{ margin: 0, fontSize: 12.5, color: "var(--color-heading)", lineHeight: 1.6 }}>{value}</p>;
}

/* ─── Editable text (input / textarea) ───────────────────────────
   `onCommit` is an optional history hook: it fires once per focus→blur
   edit session (not per keystroke) when the value actually changed,
   letting callers log a single "manual edit" entry per commit instead
   of one per character typed. */
export function EditableField({ value, onChange, multiline = false, rows = 2, onCommit }: {
  value: string; onChange: (v: string) => void; multiline?: boolean; rows?: number;
  onCommit?: (oldValue: string, newValue: string) => void;
}) {
  const focusValueRef = useRef(value);
  function handleFocus() { focusValueRef.current = value; }
  function handleBlur() {
    if (onCommit && value !== focusValueRef.current) onCommit(focusValueRef.current, value);
  }

  const style: React.CSSProperties = {
    width: "100%", fontFamily: KC_FONT, fontSize: 13, color: "var(--color-heading)",
    background: "var(--color-surface)", border: "1px solid transparent", borderRadius: 8,
    padding: "8px 10px", outline: "none", resize: multiline ? ("vertical" as const) : undefined,
    lineHeight: 1.5,
  };
  if (multiline) {
    return <textarea className="kc-input" rows={rows} value={value} onChange={(e) => onChange(e.target.value)} onFocus={handleFocus} onBlur={handleBlur} style={style} />;
  }
  return <input className="kc-input" value={value} onChange={(e) => onChange(e.target.value)} onFocus={handleFocus} onBlur={handleBlur} style={style} />;
}

/* ─── Mock revise ──────────────────────────────────────────────────
   Field-scoped heuristic rewrite — no live model call (mirrors the
   mocked AI patterns used elsewhere in the app). Kept local to this
   file rather than shared with onboarding-shell.tsx's own copy, since
   that file belongs to a different, disconnected part of the app.
   Exported so the copilot's Knowledge Center adapter slices can reuse
   it instead of reimplementing revision logic. */
function firstSentence(s: string): string {
  const m = s.match(/^.*?[.!?](?=\s|$)/);
  return m ? m[0] : s;
}
export function reviseText(text: string, instruction: string): string {
  const lower = instruction.toLowerCase();
  if (/shorter|concise|tighten|trim/.test(lower)) return firstSentence(text);
  if (/more formal|formal tone/.test(lower)) return text.replace(/—/g, ",");
  if (/casual|friendlier|informal/.test(lower)) return text.replace(/\.(\s|$)/g, "!$1");
  const setTo = instruction.match(/(?:set|change|update|rewrite)(?:\s+this)?\s+to\s+(.+)/i);
  if (setTo) return setTo[1].trim();
  return `${text.replace(/[.\s]+$/, "")} — ${instruction}`;
}

/* ─── Text field with history tracking ───────────────────────────
   Bundles FieldLabel + EditableField for the common case: a single
   labeled, editable text field whose manual edits need to be logged.
   AI-driven edits now flow through the floating copilot instead of a
   per-field trigger here. `onLogChange` receives one entry per commit
   (blur) — callers just fill in the entity/field context around it. */
export function HistoryTextField({ label, value, onChange, confidence, multiline, rows, onLogChange }: {
  label: string; value: string; onChange: (v: string) => void; confidence?: number;
  multiline?: boolean; rows?: number;
  onLogChange: (change: { oldValue: string; newValue: string; source: HistorySource; prompt?: string }) => void;
}) {
  return (
    <div>
      <FieldLabel confidence={confidence}>{label}</FieldLabel>
      <EditableField value={value} onChange={onChange} multiline={multiline} rows={rows}
        onCommit={(oldValue, newValue) => onLogChange({ oldValue, newValue, source: "manual" })} />
    </div>
  );
}

/* ─── Tag / chip list with an Add input ─────────────────────────── */
export function ChipList({ items, onChange, placeholder = "Add…" }: { items: string[]; onChange: (items: string[]) => void; placeholder?: string }) {
  const [draft, setDraft] = useState("");

  function commit() {
    const v = draft.trim();
    if (v) onChange([...items, v]);
    setDraft("");
  }

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
      {items.map((item, i) => (
        <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--color-heading)", background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 999, padding: "4px 6px 4px 11px" }}>
          {item}
          <button type="button" onClick={() => onChange(items.filter((_, idx) => idx !== i))} aria-label={`Remove ${item}`}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 15, height: 15, borderRadius: "50%", border: "none", background: "var(--color-border)", color: "var(--color-muted)", cursor: "pointer", padding: 0 }}>
            <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </span>
      ))}
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); commit(); } }}
        onBlur={commit}
        placeholder={placeholder}
        className="kc-input"
        style={{ flex: "1 0 120px", minWidth: 100, fontFamily: KC_FONT, fontSize: 12, color: "var(--color-heading)", background: "transparent", border: "1px dashed var(--color-border-strong)", borderRadius: 999, padding: "5px 12px", outline: "none" }}
      />
    </div>
  );
}

/* ─── Read-only tag list (no add input) ─────────────────────────── */
export function TagRow({ items }: { items: string[] }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
      {items.map((item, i) => (
        <span key={i} style={{ fontSize: 11.5, color: "var(--color-heading)", border: "1px solid var(--color-border)", borderRadius: 999, padding: "3px 10px" }}>{item}</span>
      ))}
    </div>
  );
}

/* ─── Checkbox pill group (firmographic filters) ────────────────── */
export function CheckboxPills({ options, selected, onChange }: { options: string[]; selected: string[]; onChange: (v: string[]) => void }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
      {options.map((opt) => {
        const active = selected.includes(opt);
        return (
          <button key={opt} type="button"
            onClick={() => onChange(active ? selected.filter((s) => s !== opt) : [...selected, opt])}
            style={{
              fontSize: 12, fontWeight: 600, borderRadius: 999, padding: "5px 12px", cursor: "pointer", fontFamily: KC_FONT,
              border: active ? "1px solid var(--color-brand)" : "1px solid var(--color-border)",
              background: active ? "var(--color-brand-tint)" : "var(--color-page)",
              color: active ? "var(--color-brand)" : "var(--color-body)",
            }}>
            {opt}
          </button>
        );
      })}
    </div>
  );
}

/* ─── Buttons ────────────────────────────────────────────────────── */
export const KC_PRIMARY_BTN: React.CSSProperties = {
  display: "inline-flex", alignItems: "center", gap: 7, fontFamily: KC_FONT, fontSize: 13, fontWeight: 600,
  color: "#fff", background: "var(--color-brand)", border: "none", borderRadius: 10, padding: "9px 18px",
  cursor: "pointer", whiteSpace: "nowrap",
};

export const KC_GHOST_BTN: React.CSSProperties = {
  display: "inline-flex", alignItems: "center", gap: 7, fontFamily: KC_FONT, fontSize: 13, fontWeight: 600,
  color: "var(--color-body)", background: "var(--color-page)", border: "1px solid var(--color-border-strong)", borderRadius: 10, padding: "9px 16px",
  cursor: "pointer", whiteSpace: "nowrap",
};

export const KC_DANGER_BTN: React.CSSProperties = {
  display: "inline-flex", alignItems: "center", gap: 7, fontFamily: KC_FONT, fontSize: 13, fontWeight: 600,
  color: "var(--color-error)", background: "var(--color-page)", border: "1px solid rgba(231,76,60,0.35)", borderRadius: 10, padding: "9px 16px",
  cursor: "pointer", whiteSpace: "nowrap",
};

export function IconButton({ icon, onClick, title, tone = "muted" }: { icon: IconName; onClick?: () => void; title?: string; tone?: "muted" | "brand" }) {
  return (
    <button type="button" onClick={onClick} title={title} className="kc-icon-btn"
      style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 32, height: 32, borderRadius: 9, border: "1px solid var(--color-border)", background: "var(--color-page)", color: tone === "brand" ? "var(--color-brand)" : "var(--color-muted)", cursor: "pointer" }}>
      <Icon name={icon} size={15} />
    </button>
  );
}

/* ─── Empty state ────────────────────────────────────────────────── */
export function EmptyState({ icon, title, subtitle, action }: { icon: IconName; title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "48px 24px", gap: 6 }}>
      <div style={{ width: 44, height: 44, borderRadius: 12, background: "var(--color-surface)", color: "var(--color-subtle)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 6 }}>
        <Icon name={icon} size={20} />
      </div>
      <div style={{ fontSize: 14, fontWeight: 700, color: "var(--color-heading)" }}>{title}</div>
      {subtitle && <div style={{ fontSize: 12.5, color: "var(--color-muted)", maxWidth: 360, lineHeight: 1.5 }}>{subtitle}</div>}
      {action && <div style={{ marginTop: 10 }}>{action}</div>}
    </div>
  );
}

/* ─── Pagination ─────────────────────────────────────────────────── */
export function Pagination({ page, pageCount, onChange }: { page: number; pageCount: number; onChange: (p: number) => void }) {
  if (pageCount <= 1) return null;
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, paddingTop: 14 }}>
      <button type="button" disabled={page === 1} onClick={() => onChange(page - 1)} className="kc-page-btn"
        style={{ width: 28, height: 28, borderRadius: 8, border: "1px solid var(--color-border)", background: "var(--color-page)", color: "var(--color-muted)", cursor: page === 1 ? "not-allowed" : "pointer", opacity: page === 1 ? 0.4 : 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon name="chevron-left" size={13} />
      </button>
      {Array.from({ length: pageCount }, (_, i) => i + 1).map((p) => (
        <button key={p} type="button" onClick={() => onChange(p)}
          style={{
            minWidth: 28, height: 28, borderRadius: 8, fontSize: 12.5, fontWeight: 700, cursor: "pointer", fontFamily: KC_FONT,
            border: p === page ? "1px solid var(--color-brand)" : "1px solid var(--color-border)",
            background: p === page ? "var(--color-brand-tint)" : "var(--color-page)",
            color: p === page ? "var(--color-brand)" : "var(--color-muted)",
          }}>
          {p}
        </button>
      ))}
      <button type="button" disabled={page === pageCount} onClick={() => onChange(page + 1)}
        style={{ width: 28, height: 28, borderRadius: 8, border: "1px solid var(--color-border)", background: "var(--color-page)", color: "var(--color-muted)", cursor: page === pageCount ? "not-allowed" : "pointer", opacity: page === pageCount ? 0.4 : 1, display: "flex", alignItems: "center", justifyContent: "center", transform: "rotate(180deg)" }}>
        <Icon name="chevron-left" size={13} />
      </button>
    </div>
  );
}

/* ─── Drawer ──────────────────────────────────────────────────────── */
export function Drawer({ open, onClose, title, children, width = 480 }: {
  open: boolean; onClose: () => void; title?: string; children: React.ReactNode; width?: number;
}) {
  if (!open) return null;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 60, display: "flex", justifyContent: "flex-end" }}>
      <div onClick={(e) => { e.stopPropagation(); onClose(); }} className="kc-drawer-backdrop" style={{ position: "absolute", inset: 0, background: "rgba(15, 18, 25, 0.4)" }} />
      <div className="kc-drawer-panel" style={{
        position: "relative", width, maxWidth: "92vw", height: "100%", background: "var(--color-page)",
        borderLeft: "1px solid var(--color-border)", boxShadow: "var(--shadow-card)", overflowY: "auto",
        padding: "20px 24px 28px",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: "var(--color-heading)" }}>{title}</span>
          <IconButton icon="close" title="Close" onClick={onClose} />
        </div>
        {children}
      </div>
    </div>
  );
}

/* ─── Shared style constants ─────────────────────────────────────── */
export const KC_STYLES = `
.kc-input:focus { background: var(--color-page) !important; border-color: var(--color-brand) !important; box-shadow: var(--shadow-focus); }
.kc-nav-item:hover { background: var(--color-surface); }
.kc-icon-btn:hover { background: var(--color-surface); color: var(--color-heading); }
.kc-page-btn:hover:not(:disabled) { background: var(--color-surface); }
.kc-list-row:hover { background: var(--color-surface); }
.kc-primary-btn:hover { background: var(--color-brand-hover) !important; }
.kc-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
.kc-scrollbar::-webkit-scrollbar-thumb { background: var(--color-border-strong); border-radius: 999px; }
@media (max-width: 900px) {
  .kc-sidebar { display: none !important; }
}
@media (max-width: 1024px) {
  .kc-company-grid { grid-template-columns: 1fr !important; }
}
@keyframes kc-drawer-slide-in { from { transform: translateX(100%); } to { transform: translateX(0); } }
@keyframes kc-drawer-fade-in { from { opacity: 0; } to { opacity: 1; } }
.kc-drawer-panel { animation: kc-drawer-slide-in 0.22s ease-out; }
.kc-drawer-backdrop { animation: kc-drawer-fade-in 0.22s ease-out; }
`;
