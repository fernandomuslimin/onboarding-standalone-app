import { useState, useEffect, useRef } from "react";

/* ─── Standalone shims ──────────────────────────────────────────────
   The real app imports these from next/navigation and next/link.
   To drop this file back into the Next.js app: delete this block,
   re-add "use client" at the top of the file, and restore:
     import { useRouter } from "next/navigation";
     import Link from "next/link";
──────────────────────────────────────────────────────────────────── */
function useRouter() {
  function navigate(path: string) {
    console.log("[standalone] would navigate to:", path);
    alert(`Onboarding complete! In the real app this would navigate to "${path}".`);
  }
  return {
    push: navigate,
    replace: navigate,
  };
}

function Link({ href, children, ...rest }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; children: React.ReactNode }) {
  return <a href={href} {...rest}>{children}</a>;
}

/* ─── Keyframes & shared interaction states ────────────────────────
   Layout/spacing stays inline; hover/focus pseudo-states that inline
   styles can't express live here as small utility classes.          */
const STYLES = `
@keyframes ob-fadeInUp {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes ob-spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
.ob-input::placeholder { color: var(--color-muted); opacity: 1; }
.ob-primary-btn:hover:not(:disabled) { background: var(--color-brand-hover); box-shadow: var(--shadow-elevated); }
.ob-primary-btn:active:not(:disabled) { transform: scale(0.98); }
.ob-ghost-btn:hover:not(:disabled) { background: var(--color-surface); color: var(--color-heading); }
.ob-link-btn:hover { color: var(--color-brand-hover); }
.ob-editable:hover { background: var(--color-surface); }

@media (max-width: 640px) {
  .ob-shell { align-items: flex-start !important; }
  .ob-shell-content { padding: 64px 16px 32px !important; }
  .ob-card { padding: 24px 20px !important; border-radius: 14px !important; }
  .ob-logo-link { top: 16px !important; left: 16px !important; }
}
@media (max-width: 480px) {
  .ob-card { padding: 20px 16px !important; }
}
`;

/* ─── Tokens ────────────────────────────────────────────────────── */
const PAGE_STYLE: React.CSSProperties = {
  minHeight: "100vh",
  background: "var(--color-surface)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  position: "relative",
  overflow: "hidden",
};

const CARD: React.CSSProperties = {
  background: "var(--color-page)",
  borderRadius: 16,
  padding: "36px 32px",
  boxShadow: "var(--shadow-card)",
  width: "100%",
  position: "relative",
  zIndex: 1,
  animation: "ob-fadeInUp 0.5s var(--ease-apple) both",
};

const INPUT: React.CSSProperties = {
  width: "100%",
  background: "var(--color-surface)",
  border: "1px solid transparent",
  borderRadius: 11,
  padding: "12px 14px",
  fontSize: 14,
  color: "var(--color-heading)",
  outline: "none",
  boxSizing: "border-box" as const,
  fontFamily: "inherit",
  transition: "border-color 150ms, box-shadow 150ms",
};

const LABEL: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 600,
  letterSpacing: "-0.008em",
  color: "var(--color-body)",
  display: "block",
  marginBottom: 6,
};

const PRIMARY_BTN: React.CSSProperties = {
  width: "100%",
  background: "var(--color-brand)",
  borderRadius: 999,
  color: "#fff",
  fontSize: 14,
  fontWeight: 600,
  padding: "14px 0",
  border: "none",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  fontFamily: "inherit",
  transition: "background-color 150ms, box-shadow 150ms, transform 150ms",
};

const GHOST_BTN: React.CSSProperties = {
  width: "100%",
  border: "none",
  background: "transparent",
  color: "var(--color-muted)",
  borderRadius: 999,
  fontSize: 14,
  fontWeight: 500,
  padding: "12px 0",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  fontFamily: "inherit",
  transition: "background-color 150ms, color 150ms",
};

/* ─── Types ─────────────────────────────────────────────────────── */
interface Product {
  name: string;
  variant: string;
  description: string;
  link: string;
  files: File[];
}

type PackageKey = "starter" | "growth" | "scale";

const PACKAGES = [
  { key: "starter" as PackageKey, label: "Starter",  domains: 15, mailboxes: 45  },
  { key: "growth"  as PackageKey, label: "Growth",   domains: 34, mailboxes: 100 },
  { key: "scale"   as PackageKey, label: "Scale",    domains: 67, mailboxes: 201 },
];

interface Sender {
  first: string;
  last: string;
  pct: number;
}

interface Invitee {
  email: string;
  role: string;
}

/* ─── Helpers ───────────────────────────────────────────────────── */
function isValidUrl(val: string) {
  const trimmed = val.trim();
  if (!trimmed) return false;
  let url: URL;
  try { url = new URL(/^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`); }
  catch { return false; }
  if (!/^https?:$/.test(url.protocol)) return false;
  if (url.username || url.password) return false;
  const hostname = url.hostname.toLowerCase();
  return /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*\.[a-z]{2,}$/.test(hostname);
}

function isValidEmail(val: string) {
  return /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/.test(val.trim());
}

function isValidDomain(val: string) {
  const v = val.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "");
  return /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z]{2,})+$/.test(v);
}

function redistributePct(senders: Sender[]): Sender[] {
  const n = senders.length;
  const base = Math.floor(100 / n);
  const rem = 100 - base * n;
  return senders.map((s, i) => ({ ...s, pct: i === n - 1 ? base + rem : base }));
}

function focusStyle(id: string, focused: string | null): React.CSSProperties {
  return { ...INPUT, ...(focused === id ? { borderColor: "var(--color-border-strong)", boxShadow: "var(--shadow-focus)" } : {}) };
}

/* ─── Domain generation ─────────────────────────────────────────── */
const DOMAIN_PREFIXES = ["get","try","use","go","meet","with","hey","my","the","join","we","its","hi","hello","lets","run","do","be","on","up"];
const DOMAIN_SUFFIXES = ["app","hq","io","now","pro","hub","co","ai","ly","360","365","inc","team","group","labs","cloud"];

function extractDomain(website: string): string {
  return website.trim().toLowerCase()
    .replace(/^https?:\/\//, "").replace(/^www\./, "")
    .replace(/[/?#].*$/, "");
}

function extractBase(domain: string): string {
  return domain.trim().toLowerCase()
    .replace(/^https?:\/\//, "").replace(/^www\./, "")
    .replace(/\.[a-z]{2,}$/, "").replace(/[^a-z0-9-]/g, "");
}

function generateDomainSuggestions(base: string, count: number): string[] {
  if (!base || count <= 0) return [];
  const pool: string[] = [];
  for (const p of DOMAIN_PREFIXES) pool.push(`${p}${base}.com`);
  for (const s of DOMAIN_SUFFIXES) pool.push(`${base}${s}.com`);
  outer: for (const p of DOMAIN_PREFIXES) {
    for (const s of DOMAIN_SUFFIXES) {
      pool.push(`${p}${base}${s}.com`);
      if (pool.length >= count * 3) break outer;
    }
  }
  return pool.slice(0, count);
}

type AvailStatus = "checking" | "available" | "taken";

function getMailboxesForDomain(domain: string, senders: Sender[]): string[] {
  return senders.flatMap((s) => {
    const f = s.first.trim().toLowerCase();
    const l = s.last.trim().toLowerCase();
    const out: string[] = [];
    if (f) out.push(`${f}@${domain}`);
    if (l) out.push(`${l}@${domain}`);
    if (f && l) out.push(`${f}.${l}@${domain}`);
    return out;
  });
}

/* ─── Shared sub-components ─────────────────────────────────────── */
function Spinner({ inverted = false }: { inverted?: boolean }) {
  const track = inverted ? "rgba(255,255,255,0.35)" : "var(--color-border)";
  const arc = inverted ? "#fff" : "var(--color-brand)";
  return (
    <svg style={{ animation: "ob-spin 0.8s linear infinite" }} width="14" height="14" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke={track} strokeWidth="3" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke={arc} strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function StepIcon({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ width: 40, height: 40, background: "var(--color-brand-faint)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18 }}>
      {children}
    </div>
  );
}

function PageChrome() {
  return (
    <>
      <div style={{ position: "absolute", top: -160, left: "50%", transform: "translateX(-50%)", width: 900, height: 480, borderRadius: "50%", background: "radial-gradient(ellipse, var(--color-brand-faint) 0%, transparent 70%)", pointerEvents: "none" }} />
      <Link href="/login" className="ob-logo-link" style={{ position: "absolute", top: 28, left: 36, display: "flex", alignItems: "center", gap: 10, textDecoration: "none", zIndex: 10 }}>
        <div style={{ width: 32, height: 32, background: "var(--color-brand)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 2C10.5 2 13 4 13.5 7C14 10 12.5 12.5 10 13.5C7.5 14.5 5 13.5 3.5 11.5C2 9.5 2.5 6.5 4 4.5C5 3 6.5 2 8 2Z" fill="white" fillOpacity="0.2" />
            <path d="M6.5 10.5L4.5 12.5M9.5 5.5C9.5 5.5 11.5 5 12 7.5C12.5 10 11 11 11 11L8.5 8.5M9.5 5.5L7 8M9.5 5.5L8 4" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="7" cy="9" r="1.2" fill="white" />
          </svg>
        </div>
        <span style={{ fontSize: 15, fontWeight: 600, color: "var(--color-heading)", letterSpacing: "-0.01em" }}>B2B Rocket</span>
      </Link>
    </>
  );
}

/* ─── Progress bar ──────────────────────────────────────────────── */
const PHASES: { label: string; steps: StepName[] }[] = [
  { label: "AI Agent Research", steps: ["website", "products", "research_summary"] },
  { label: "Infrastructure", steps: ["primary_domain", "forwarding_domain", "volume", "senders", "split", "infra_summary"] },
  { label: "Connections", steps: ["connect", "connect_linkedin", "connect_calendar", "invite", "connections_summary"] },
  { label: "Review & Approve", steps: ["review_order", "researching", "company_research", "products_services", "tam_icp", "personas", "outreach_campaign"] },
];

function PhaseStepper({ step }: { step: StepName }) {
  const currentPhaseIdx = PHASES.findIndex((p) => p.steps.includes(step));
  if (currentPhaseIdx === -1) return null;
  const currentPhase = PHASES[currentPhaseIdx];

  return (
    <div style={{ width: "100%", maxWidth: 420, marginBottom: 28, display: "flex", flexDirection: "column", alignItems: "center", gap: 10, position: "relative", zIndex: 1 }}>
      <div style={{ display: "flex", gap: 6, width: "100%" }}>
        {PHASES.map((phase, i) => {
          const done = i < currentPhaseIdx;
          const active = i === currentPhaseIdx;
          const stepInPhase = active ? phase.steps.indexOf(step) : 0;
          const pct = done ? 100 : active ? ((stepInPhase + 1) / phase.steps.length) * 100 : 0;
          return (
            <div key={phase.label} style={{ flex: 1, height: 4, borderRadius: 999, background: "var(--color-border)", overflow: "hidden" }}>
              <div style={{ height: "100%", background: "var(--color-brand)", borderRadius: 999, width: `${pct}%`, transition: "width 300ms var(--ease-apple)" }} />
            </div>
          );
        })}
      </div>
      <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--color-heading)", letterSpacing: "-0.005em" }}>{currentPhase.label}</span>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   SPLASH — Landing page shown before onboarding starts
══════════════════════════════════════════════════════════════════════ */
function StepSplash({ onNext }: { onNext: () => void }) {
  return (
    <div className="ob-card" style={{ ...CARD, maxWidth: 480, textAlign: "center" as const }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/b2brocket-logo.png" alt="B2B Rocket — powered by BlackPearl" style={{ height: 40, margin: "0 auto 28px", display: "block" }} />
      <p style={{ fontSize: 15, color: "var(--color-body)", lineHeight: 1.6, margin: "0 0 32px" }}>
        Answer a few quick questions and your AI agents get to work — prospecting, personalizing, and booking meetings for you.
      </p>
      <button onClick={onNext} style={PRIMARY_BTN} className="ob-primary-btn">
        Get started
      </button>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   WELCOME — Intro to the AI agent research process
══════════════════════════════════════════════════════════════════════ */
const WELCOME_BULLETS = [
  "Your website & offerings",
  "Any docs to learn from",
  "AI research & knowledge base",
  "Your ideal customer profile",
];

function StepWelcome({ onNext }: { onNext: () => void }) {
  return (
    <div className="ob-card" style={{ ...CARD, maxWidth: 480, textAlign: "center" as const }}>
      <span style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--color-brand)", letterSpacing: "0.05em", textTransform: "uppercase" as const, marginBottom: 8 }}>
        Section 1 of 4
      </span>
      <h1 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 10px" }}>AI Agent Research</h1>
      <p style={{ fontSize: 14, color: "var(--color-body)", lineHeight: 1.6, margin: "0 0 24px" }}>
        First, tell us about your business. Your agents read it, research your market, and draft everything they need to sound like you.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, textAlign: "left" as const, marginBottom: 28 }}>
        {WELCOME_BULLETS.map((item, i) => (
          <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
            <span style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--color-brand)", marginTop: 7, flexShrink: 0 }} />
            <span style={{ fontSize: 12.5, color: "var(--color-heading)", lineHeight: 1.5 }}>{item}</span>
          </div>
        ))}
      </div>
      <button onClick={onNext} style={PRIMARY_BTN} className="ob-primary-btn">
        Continue
      </button>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   INFRA INTRO — Intro to the infrastructure setup process
══════════════════════════════════════════════════════════════════════ */
const INFRA_INTRO_BULLETS = [
  "Your sending domain",
  "Volume & mailboxes",
  "Who's sending & the split",
];

function StepInfraIntro({ onNext }: { onNext: () => void }) {
  return (
    <div className="ob-card" style={{ ...CARD, maxWidth: 480, textAlign: "center" as const }}>
      <span style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--color-brand)", letterSpacing: "0.05em", textTransform: "uppercase" as const, marginBottom: 8 }}>
        Section 2 of 4
      </span>
      <h1 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 10px" }}>Infrastructure</h1>
      <p style={{ fontSize: 14, color: "var(--color-body)", lineHeight: 1.6, margin: "0 0 24px" }}>
        Now let&apos;s set up how you send — the domains and mailboxes your agents send from.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, textAlign: "left" as const, marginBottom: 28 }}>
        {INFRA_INTRO_BULLETS.map((item, i) => (
          <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
            <span style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--color-brand)", marginTop: 7, flexShrink: 0 }} />
            <span style={{ fontSize: 12.5, color: "var(--color-heading)", lineHeight: 1.5 }}>{item}</span>
          </div>
        ))}
      </div>
      <button onClick={onNext} style={PRIMARY_BTN} className="ob-primary-btn">
        Continue
      </button>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   STEP 1 — Company website
══════════════════════════════════════════════════════════════════════ */
function StepWebsite({ onNext }: { onNext: (website: string) => void }) {
  const [website, setWebsite] = useState("");
  const [focused, setFocused] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isValid = isValidUrl(website);

  function addFiles(newFiles: FileList | null) {
    if (!newFiles) return;
    setFiles((prev) => [...prev, ...Array.from(newFiles)]);
  }

  function removeFile(fileIdx: number) {
    setFiles((prev) => prev.filter((_, i) => i !== fileIdx));
  }

  return (
    <div className="ob-card" style={{ ...CARD, maxWidth: 480 }}>
      <span style={{ fontSize: 12, fontWeight: 700, color: "var(--color-brand)", letterSpacing: "0.05em", textTransform: "uppercase" as const }}>Your Business</span>
      <h1 style={{ fontSize: 24, margin: "8px 0 8px" }}>What is your company website?</h1>
      <p style={{ fontSize: 14, color: "var(--color-body)", lineHeight: 1.6, margin: "0 0 28px" }}>We'll scan it to learn your business</p>
      <div style={{ marginBottom: 20 }}>
        <label style={LABEL}>Company website</label>
        <div style={{ position: "relative" }}>
          <input
            className="ob-input"
            type="url"
            placeholder="https://yourcompany.com"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onKeyDown={(e) => { if (e.key === "Enter" && isValid) onNext(website); }}
            style={{ ...INPUT, ...(focused ? { borderColor: "var(--color-border-strong)", boxShadow: "var(--shadow-focus)" } : {}), ...(website && isValid ? { borderColor: "rgba(7,188,12,0.5)" } : website && !isValid ? { borderColor: "rgba(231,76,60,0.5)" } : {}) }}
          />
          {website && (
            <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", fontSize: 12, fontWeight: 600, color: isValid ? "var(--color-success)" : "var(--color-error)" }}>
              {isValid ? "✓" : "✗"}
            </span>
          )}
        </div>
        {website && !isValid && (
          <p style={{ fontSize: 12, color: "var(--color-error)", margin: "6px 0 0" }}>Enter a valid website, e.g. yourcompany.com</p>
        )}
      </div>
      <div style={{ marginBottom: 20 }}>
        <label style={LABEL}>Docs to learn from <span style={{ color: "var(--color-subtle)", fontWeight: 400 }}>(optional)</span></label>
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); }}
          style={{ border: `2px dashed ${dragging ? "var(--color-brand)" : "var(--color-border-strong)"}`, borderRadius: 10, padding: "16px", textAlign: "center" as const, cursor: "pointer", background: dragging ? "var(--color-brand-tint)" : "var(--color-surface)", transition: "all 200ms" }}
        >
          <input ref={fileInputRef} type="file" multiple style={{ display: "none" }} onChange={(e) => addFiles(e.target.files)} />
          <p style={{ fontSize: 12.5, color: "var(--color-body)", margin: 0 }}>
            Drag &amp; drop or <span style={{ color: "var(--color-brand)", fontWeight: 600 }}>click to browse</span>
          </p>
          <p style={{ fontSize: 11, color: "var(--color-subtle)", margin: "3px 0 0" }}>Decks, one-pagers, or briefs about your company</p>
        </div>
        {files.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
            {files.map((f, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderRadius: 8, background: "var(--color-surface)" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
                </svg>
                <span style={{ fontSize: 12, color: "var(--color-heading)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</span>
                <span style={{ fontSize: 11, color: "var(--color-muted)", flexShrink: 0 }}>{(f.size / 1024).toFixed(0)} KB</span>
                <button type="button" onClick={() => removeFile(i)} style={{ background: "none", border: "none", color: "var(--color-muted)", cursor: "pointer", padding: 0, lineHeight: 0, flexShrink: 0 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      <button onClick={() => onNext(website)} disabled={!isValid} className="ob-primary-btn" style={{ ...PRIMARY_BTN, opacity: !isValid ? 0.5 : 1, cursor: !isValid ? "not-allowed" : "pointer" }}>
        Continue
      </button>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   STEP 2 — Product details (dynamic list, add more from within)
══════════════════════════════════════════════════════════════════════ */
const PRODUCTS_MODE_OPTIONS = [
  { key: "text" as const, label: "Describe in text" },
  { key: "list" as const, label: "Add one by one" },
];

function StepProducts({ initialProducts, onNext, onBack }: {
  initialProducts: Product[];
  onNext: (products: Product[]) => void;
  onBack: () => void;
}) {
  const [stage, setStage] = useState<"intro" | "detail">("intro");
  const [mode, setMode] = useState<"text" | "list">(initialProducts.length > 1 ? "list" : "text");
  const [freeText, setFreeText] = useState("");
  const [count, setCount] = useState(initialProducts.length > 1 ? initialProducts.length : 1);
  const [localProducts, setLocalProducts] = useState<Product[]>(initialProducts);
  const [index, setIndex] = useState(0);
  const [focused, setFocused] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [stage, index]);

  function startList() {
    setLocalProducts((prev) => Array.from({ length: count }, (_, i) => prev[i] ?? { name: "", variant: "", description: "", link: "", files: [] }));
    setIndex(0);
    setStage("detail");
  }

  function submitText() {
    onNext([{ name: "", variant: "", description: freeText.trim(), link: "", files: [] }]);
  }

  const current = localProducts[index];
  const linkValid = current?.link.trim().length === 0 || isValidUrl(current?.link ?? "");
  const canProceed = !!current && current.name.trim().length > 0 && current.description.trim().length > 0 && linkValid;
  const isLast = index === localProducts.length - 1;

  function update(field: keyof Product, val: string) {
    setLocalProducts((prev) => prev.map((p, i) => i === index ? { ...p, [field]: val } : p));
  }

  function addFiles(newFiles: FileList | null) {
    if (!newFiles) return;
    setLocalProducts((prev) => prev.map((p, i) => i === index ? { ...p, files: [...p.files, ...Array.from(newFiles)] } : p));
  }

  function removeFile(fileIdx: number) {
    setLocalProducts((prev) => prev.map((p, i) => i === index ? { ...p, files: p.files.filter((_, j) => j !== fileIdx) } : p));
  }

  function goNext() {
    setIndex(index + 1);
    setFocused(null);
  }

  function addProduct() {
    setLocalProducts((prev) => [...prev, { name: "", variant: "", description: "", link: "", files: [] }]);
    setIndex(index + 1);
    setFocused(null);
  }

  function goBackWithinStep() {
    if (index > 0) { setIndex(index - 1); setFocused(null); }
    else setStage("intro");
  }

  if (stage === "intro") {
    return (
      <div className="ob-card" style={{ ...CARD, maxWidth: 480 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: "var(--color-brand)", letterSpacing: "0.05em", textTransform: "uppercase" as const }}>Products & Services</span>
        <h1 style={{ fontSize: 24, margin: "8px 0 8px" }}>What do you sell?</h1>
        <p style={{ fontSize: 14, color: "var(--color-body)", lineHeight: 1.6, margin: "0 0 24px" }}>
          Tell the AI what to pitch. Describe everything in your own words, or add each offering one by one.
        </p>
        <div style={{ display: "flex", background: "var(--color-surface)", borderRadius: 999, padding: 4, gap: 4, marginBottom: 28 }}>
          {PRODUCTS_MODE_OPTIONS.map(({ key, label }) => (
            <button key={key} type="button" onClick={() => setMode(key)} style={{
              flex: 1, border: "none", borderRadius: 999, padding: "12px 0", fontSize: 13.5, fontWeight: 600, fontFamily: "inherit", cursor: "pointer", transition: "all 150ms",
              background: mode === key ? "var(--color-page)" : "transparent",
              color: mode === key ? "var(--color-brand)" : "var(--color-muted)",
              boxShadow: mode === key ? "var(--shadow-card)" : "none",
            }}>
              {label}
            </button>
          ))}
        </div>

        {mode === "text" ? (
          <>
            <div style={{ marginBottom: 20 }}>
              <label style={LABEL}>Your products & services <span style={{ color: "var(--color-error)" }}>*</span></label>
              <textarea className="ob-input" placeholder="Describe each product or service you want the AI to pitch — what it does, who it's for, and any variations you sell (by plan, tier, or segment)." value={freeText}
                onChange={(e) => setFreeText(e.target.value)}
                onFocus={() => setFocused("free-text")} onBlur={() => setFocused(null)}
                rows={7}
                style={{ ...focusStyle("free-text", focused), resize: "vertical" as const, lineHeight: 1.5 }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <button onClick={submitText} disabled={!freeText.trim()} className="ob-primary-btn" style={{ ...PRIMARY_BTN, opacity: !freeText.trim() ? 0.5 : 1, cursor: !freeText.trim() ? "not-allowed" : "pointer" }}>
                Continue
              </button>
              <button onClick={onBack} className="ob-ghost-btn" style={{ ...GHOST_BTN, color: "var(--color-subtle)" }}>Back</button>
            </div>
          </>
        ) : (
          <>
            <p style={{ fontSize: 13.5, color: "var(--color-body)", lineHeight: 1.6, margin: "0 0 20px", textAlign: "center" as const }}>
              How many offerings do you sell? Count each distinct product or service — and each way you sell one (by plan, tier, or segment). You&apos;ll describe them one at a time next.
            </p>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 28, marginBottom: 28 }}>
              <button type="button" onClick={() => setCount((c) => Math.max(1, c - 1))} style={{ width: 44, height: 44, borderRadius: "50%", border: "none", background: "var(--color-surface)", color: "var(--color-brand)", fontSize: 18, fontWeight: 700, fontFamily: "inherit", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                −
              </button>
              <span style={{ fontSize: 34, fontWeight: 800, color: "var(--color-heading)", minWidth: 40, textAlign: "center" as const }}>{count}</span>
              <button type="button" onClick={() => setCount((c) => Math.min(20, c + 1))} style={{ width: 44, height: 44, borderRadius: "50%", border: "none", background: "var(--color-surface)", color: "var(--color-brand)", fontSize: 18, fontWeight: 700, fontFamily: "inherit", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                +
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <button onClick={startList} className="ob-primary-btn" style={PRIMARY_BTN}>
                Continue
              </button>
              <button onClick={onBack} className="ob-ghost-btn" style={{ ...GHOST_BTN, color: "var(--color-subtle)" }}>Back</button>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="ob-card" style={{ ...CARD, maxWidth: 520 }}>
      <span style={{ fontSize: 12, fontWeight: 700, color: "var(--color-brand)", letterSpacing: "0.05em", textTransform: "uppercase" as const }}>Products & Services</span>
      <h1 style={{ fontSize: 24, margin: "8px 0 8px" }}>
        Product / service {index + 1} of {localProducts.length}
      </h1>
      <p style={{ fontSize: 14, color: "var(--color-body)", lineHeight: 1.6, margin: "0 0 24px" }}>
        Name it and describe what it does. If it's a variation of another offering, note how it's sold
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 20 }}>
        <div>
          <label style={LABEL}>Product name <span style={{ color: "var(--color-error)" }}>*</span></label>
          <input className="ob-input" type="text" placeholder="e.g. Revenue Intelligence Platform" value={current.name}
            onChange={(e) => update("name", e.target.value)}
            onFocus={() => setFocused("name")} onBlur={() => setFocused(null)}
            style={focusStyle("name", focused)} />
        </div>
        <div>
          <label style={LABEL}>Variant or segment <span style={{ color: "var(--color-subtle)", fontWeight: 400 }}>(optional)</span></label>
          <input className="ob-input" type="text" placeholder="e.g. Enterprise, SMB, SaaS" value={current.variant}
            onChange={(e) => update("variant", e.target.value)}
            onFocus={() => setFocused("variant")} onBlur={() => setFocused(null)}
            style={focusStyle("variant", focused)} />
        </div>
        <div>
          <label style={LABEL}>Description <span style={{ color: "var(--color-error)" }}>*</span></label>
          <textarea className="ob-input" placeholder="What does it do? Who is it for? What problems does it solve?" value={current.description}
            onChange={(e) => update("description", e.target.value)}
            onFocus={() => setFocused("desc")} onBlur={() => setFocused(null)}
            rows={3}
            style={{ ...focusStyle("desc", focused), resize: "vertical" as const, lineHeight: 1.5 }} />
        </div>
        <div>
          <label style={LABEL}>Product link <span style={{ color: "var(--color-subtle)", fontWeight: 400 }}>(optional)</span></label>
          <div style={{ position: "relative" }}>
            <input className="ob-input" type="url" placeholder="https://yourcompany.com/product" value={current.link}
              onChange={(e) => update("link", e.target.value)}
              onFocus={() => setFocused("link")} onBlur={() => setFocused(null)}
              style={{ ...focusStyle("link", focused), ...(current.link && linkValid ? { borderColor: "rgba(7,188,12,0.5)" } : current.link && !linkValid ? { borderColor: "rgba(231,76,60,0.5)" } : {}) }} />
            {current.link && (
              <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", fontSize: 12, fontWeight: 600, color: linkValid ? "var(--color-success)" : "var(--color-error)" }}>
                {linkValid ? "✓" : "✗"}
              </span>
            )}
          </div>
          {current.link && !linkValid && (
            <p style={{ fontSize: 12, color: "var(--color-error)", margin: "6px 0 0" }}>Enter a valid link, e.g. yourcompany.com/product</p>
          )}
        </div>
        <div>
          <label style={LABEL}>Related files <span style={{ color: "var(--color-subtle)", fontWeight: 400 }}>(optional)</span></label>
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); }}
            style={{ border: `2px dashed ${dragging ? "var(--color-brand)" : "var(--color-border-strong)"}`, borderRadius: 10, padding: "16px", textAlign: "center" as const, cursor: "pointer", background: dragging ? "var(--color-brand-tint)" : "var(--color-surface)", transition: "all 200ms" }}
          >
            <input ref={fileInputRef} type="file" multiple style={{ display: "none" }} onChange={(e) => addFiles(e.target.files)} />
            <p style={{ fontSize: 12.5, color: "var(--color-body)", margin: 0 }}>
              Drag &amp; drop or <span style={{ color: "var(--color-brand)", fontWeight: 600 }}>click to browse</span>
            </p>
            <p style={{ fontSize: 11, color: "var(--color-subtle)", margin: "3px 0 0" }}>Specs, decks, or briefs for this product</p>
          </div>
          {current.files.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
              {current.files.map((f, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderRadius: 8, background: "var(--color-surface)" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
                  </svg>
                  <span style={{ fontSize: 12, color: "var(--color-heading)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</span>
                  <span style={{ fontSize: 11, color: "var(--color-muted)", flexShrink: 0 }}>{(f.size / 1024).toFixed(0)} KB</span>
                  <button type="button" onClick={() => removeFile(i)} style={{ background: "none", border: "none", color: "var(--color-muted)", cursor: "pointer", padding: 0, lineHeight: 0, flexShrink: 0 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {isLast ? (
          <>
            <button onClick={() => onNext(localProducts)} disabled={!canProceed} className="ob-primary-btn" style={{ ...PRIMARY_BTN, opacity: !canProceed ? 0.5 : 1, cursor: !canProceed ? "not-allowed" : "pointer" }}>
              Continue
            </button>
            <button onClick={addProduct} disabled={!canProceed} className="ob-ghost-btn" style={{ ...GHOST_BTN, opacity: !canProceed ? 0.5 : 1, cursor: !canProceed ? "not-allowed" : "pointer" }}>
              + Add another product
            </button>
          </>
        ) : (
          <button onClick={goNext} disabled={!canProceed} className="ob-primary-btn" style={{ ...PRIMARY_BTN, opacity: !canProceed ? 0.5 : 1, cursor: !canProceed ? "not-allowed" : "pointer" }}>
            Next product →
          </button>
        )}
        <button onClick={goBackWithinStep} className="ob-ghost-btn" style={{ ...GHOST_BTN, color: "var(--color-subtle)" }}>Back</button>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   Research summary — quick review of what was captured before AI
   research kicks off.
══════════════════════════════════════════════════════════════════════ */
function StepResearchSummary({ website, products, onNext, onBack }: {
  website: string;
  products: Product[];
  onNext: () => void;
  onBack: () => void;
}) {
  const domain = extractDomain(website) || website || "—";
  const productNames = products.map((p) => p.name.trim()).filter(Boolean);
  const fallbackDescription = products[0]?.description.trim() || "";
  const productsValue = productNames.length
    ? productNames.join(", ")
    : fallbackDescription
    ? (fallbackDescription.length > 60 ? `${fallbackDescription.slice(0, 60)}…` : fallbackDescription)
    : "—";
  const totalFiles = products.reduce((sum, p) => sum + p.files.length, 0);

  const rows = [
    { label: "Website", value: domain },
    { label: "Products / services", value: productsValue },
    { label: "Files shared", value: totalFiles > 0 ? `${totalFiles} file${totalFiles > 1 ? "s" : ""}` : "None" },
  ];

  return (
    <div className="ob-card" style={{ ...CARD, maxWidth: 480 }}>
      <span style={{ fontSize: 12, fontWeight: 700, color: "var(--color-brand)", letterSpacing: "0.05em", textTransform: "uppercase" as const }}>AI Agent Research</span>
      <h1 style={{ fontSize: 24, margin: "8px 0 8px" }}>Your research, at a glance</h1>
      <p style={{ fontSize: 14, color: "var(--color-body)", lineHeight: 1.6, margin: "0 0 24px" }}>
        Here&apos;s what your agents will work from.
      </p>
      <div style={{ borderRadius: 14, border: "1px solid var(--color-border)", overflow: "hidden", marginBottom: 24 }}>
        {rows.map(({ label, value }, i) => (
          <div key={label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, padding: "16px 18px", borderBottom: i < rows.length - 1 ? "1px solid var(--color-border)" : "none" }}>
            <span style={{ fontSize: 13.5, color: "var(--color-muted)" }}>{label}</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: "var(--color-heading)", textAlign: "right" as const, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const, maxWidth: "60%" }}>{value}</span>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <button onClick={onNext} className="ob-primary-btn" style={PRIMARY_BTN}>
          Looks good — continue
        </button>
        <button onClick={onBack} className="ob-ghost-btn" style={GHOST_BTN}>Back</button>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   Transition — AI research kicks off in the background, then straight
   into Setup Infrastructure. Brief and auto-advancing, no user input.
══════════════════════════════════════════════════════════════════════ */
function StepStartingResearch({ onNext }: { onNext: () => void }) {
  useEffect(() => {
    const t = setTimeout(onNext, 1800);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="ob-card" style={{ ...CARD, maxWidth: 440, textAlign: "center" as const }}>
      <div style={{ width: 40, height: 40, margin: "0 auto 18px", background: "var(--color-brand-faint)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg style={{ animation: "ob-spin 0.8s linear infinite" }} width="20" height="20" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="var(--color-border)" strokeWidth="3" />
          <path d="M12 2a10 10 0 0 1 10 10" stroke="var(--color-brand)" strokeWidth="3" strokeLinecap="round" />
        </svg>
      </div>
      <h1 style={{ fontSize: 20, margin: "0 0 8px" }}>Starting AI research…</h1>
      <p style={{ fontSize: 14, color: "var(--color-body)", lineHeight: 1.6, margin: 0 }}>
        We're kicking off research on your company and products in the background. Let's set up your sending infrastructure next.
      </p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   STEP 3 — Primary domain
══════════════════════════════════════════════════════════════════════ */
function StepPrimaryDomain({ website, onNext }: { website: string; onNext: (domain: string) => void }) {
  const [domain, setDomain] = useState(() => extractDomain(website));
  const [focused, setFocused] = useState(false);
  const valid = isValidDomain(domain);

  return (
    <div className="ob-card" style={{ ...CARD, maxWidth: 480 }}>
      <span style={{ fontSize: 12, fontWeight: 700, color: "var(--color-brand)", letterSpacing: "0.05em", textTransform: "uppercase" as const }}>Sending Setup</span>
      <h1 style={{ fontSize: 24, margin: "8px 0 8px" }}>What's your primary domain?</h1>
      <p style={{ fontSize: 14, color: "var(--color-body)", lineHeight: 1.6, margin: "0 0 28px" }}>
        Your main company domain — used as a reference for generating sending domain variations.
      </p>
      <div style={{ marginBottom: 20 }}>
        <label style={LABEL}>Domain</label>
        <div style={{ position: "relative" }}>
          <input
            className="ob-input"
            type="text"
            placeholder="yourcompany.com"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onKeyDown={(e) => { if (e.key === "Enter" && valid) onNext(domain.trim()); }}
            style={{ ...INPUT, ...(focused ? { borderColor: "var(--color-border-strong)", boxShadow: "var(--shadow-focus)" } : {}), ...(domain && valid ? { borderColor: "rgba(7,188,12,0.5)" } : domain && !valid ? { borderColor: "rgba(231,76,60,0.5)" } : {}) }}
          />
          {domain && (
            <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", fontSize: 12, fontWeight: 600, color: valid ? "var(--color-success)" : "var(--color-error)" }}>
              {valid ? "✓" : "✗"}
            </span>
          )}
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <button onClick={() => onNext(domain.trim())} disabled={!valid} className="ob-primary-btn" style={{ ...PRIMARY_BTN, opacity: !valid ? 0.5 : 1, cursor: !valid ? "not-allowed" : "pointer" }}>Continue</button>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   STEP 4 — Forwarding domain
══════════════════════════════════════════════════════════════════════ */
function StepForwardingDomain({ primaryDomain, onNext, onBack }: {
  primaryDomain: string;
  onNext: (domain: string) => void;
  onBack: () => void;
}) {
  const [sameAsPrimary, setSameAsPrimary] = useState(true);
  const [domain, setDomain] = useState("");
  const [focused, setFocused] = useState(false);

  const effectiveDomain = sameAsPrimary ? primaryDomain : domain;
  const valid = isValidDomain(effectiveDomain);

  return (
    <div className="ob-card" style={{ ...CARD, maxWidth: 480 }}>
      <span style={{ fontSize: 12, fontWeight: 700, color: "var(--color-brand)", letterSpacing: "0.05em", textTransform: "uppercase" as const }}>Sending Setup</span>
      <h1 style={{ fontSize: 24, margin: "8px 0 8px" }}>Where do replies forward?</h1>
      <p style={{ fontSize: 14, color: "var(--color-body)", lineHeight: 1.6, margin: "0 0 24px" }}>
        Replies to your sending domains will forward here — usually your main company domain.
      </p>
      <div
        onClick={() => setSameAsPrimary((v) => !v)}
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderRadius: 10, background: "var(--color-surface)", marginBottom: 16, cursor: "pointer" }}
      >
        <div>
          <p style={{ fontSize: 13, fontWeight: 600, color: "var(--color-heading)", margin: 0 }}>Same as primary domain</p>
          <p style={{ fontSize: 11, color: "var(--color-muted)", margin: "2px 0 0" }}>{primaryDomain}</p>
        </div>
        <span style={{ display: "inline-flex", width: 36, height: 20, borderRadius: 10, background: sameAsPrimary ? "var(--color-brand)" : "var(--color-subtle)", transition: "background 200ms", alignItems: "center", padding: "0 3px", flexShrink: 0 }}>
          <span style={{ width: 14, height: 14, borderRadius: "50%", background: "#fff", boxShadow: "0 1px 2px rgba(5,12,70,0.2)", transform: sameAsPrimary ? "translateX(16px)" : "translateX(0)", transition: "transform 200ms", display: "block" }} />
        </span>
      </div>
      {!sameAsPrimary && (
        <div style={{ marginBottom: 16 }}>
          <label style={LABEL}>Forwarding domain</label>
          <div style={{ position: "relative" }}>
            <input
              className="ob-input"
              type="text"
              placeholder="fwd.yourcompany.com"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              onKeyDown={(e) => { if (e.key === "Enter" && valid) onNext(effectiveDomain); }}
              style={{ ...INPUT, ...(focused ? { borderColor: "var(--color-border-strong)", boxShadow: "var(--shadow-focus)" } : {}), ...(domain && isValidDomain(domain) ? { borderColor: "rgba(7,188,12,0.5)" } : domain ? { borderColor: "rgba(231,76,60,0.5)" } : {}) }}
            />
            {domain && (
              <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", fontSize: 12, fontWeight: 600, color: isValidDomain(domain) ? "var(--color-success)" : "var(--color-error)" }}>
                {isValidDomain(domain) ? "✓" : "✗"}
              </span>
            )}
          </div>
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <button onClick={() => onNext(effectiveDomain)} disabled={!valid} className="ob-primary-btn" style={{ ...PRIMARY_BTN, opacity: !valid ? 0.5 : 1, cursor: !valid ? "not-allowed" : "pointer" }}>Continue</button>
        <button onClick={onBack} className="ob-ghost-btn" style={GHOST_BTN}>Back</button>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   STEP 5 — Volume package
══════════════════════════════════════════════════════════════════════ */
function StepVolume({ onNext, onBack }: { onNext: (pkg: PackageKey) => void; onBack: () => void }) {
  const [selected, setSelected] = useState<PackageKey>("scale");

  return (
    <div className="ob-card" style={{ ...CARD, maxWidth: 520 }}>
      <span style={{ fontSize: 12, fontWeight: 700, color: "var(--color-brand)", letterSpacing: "0.05em", textTransform: "uppercase" as const }}>Sending Setup</span>
      <h1 style={{ fontSize: 24, margin: "8px 0 8px" }}>How much volume?</h1>
      <p style={{ fontSize: 14, color: "var(--color-body)", lineHeight: 1.6, margin: "0 0 24px" }}>
        Pick a tier — 3 mailboxes per domain. You can change it later.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
        {PACKAGES.map((p) => {
          const active = selected === p.key;
          return (
            <button key={p.key} type="button" onClick={() => setSelected(p.key)} style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 18px", borderRadius: 12, border: `1px solid ${active ? "var(--color-brand)" : "var(--color-border-strong)"}`, background: active ? "var(--color-brand-tint)" : "var(--color-surface)", cursor: "pointer", textAlign: "left" as const, transition: "all 150ms", fontFamily: "inherit" }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: "var(--color-heading)" }}>{p.domains} domains · {p.mailboxes} mailboxes</span>
                </div>
              </div>
              <div style={{ width: 20, height: 20, borderRadius: "50%", border: `2px solid ${active ? "var(--color-brand)" : "var(--color-border-strong)"}`, background: active ? "var(--color-brand)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 150ms" }}>
                {active && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>}
              </div>
            </button>
          );
        })}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <button onClick={() => onNext(selected)} className="ob-primary-btn" style={PRIMARY_BTN}>Continue</button>
        <button onClick={onBack} className="ob-ghost-btn" style={GHOST_BTN}>Back</button>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   STEP 6 — Who is sending?
══════════════════════════════════════════════════════════════════════ */
function StepSenders({ onNext, onBack }: { onNext: (senders: Sender[]) => void; onBack: () => void }) {
  const [senders, setSenders] = useState<Sender[]>([{ first: "", last: "", pct: 100 }]);
  const [focused, setFocused] = useState<string | null>(null);

  function updateSender(idx: number, field: "first" | "last", val: string) {
    setSenders((prev) => prev.map((s, i) => i === idx ? { ...s, [field]: val } : s));
  }

  function addSender() {
    setSenders((prev) => redistributePct([...prev, { first: "", last: "", pct: 0 }]));
  }

  function removeSender(idx: number) {
    if (senders.length <= 1) return;
    setSenders((prev) => redistributePct(prev.filter((_, i) => i !== idx)));
  }

  const valid = senders.every((s) => s.first.trim().length > 0);

  return (
    <div className="ob-card" style={{ ...CARD, maxWidth: 520 }}>
      <span style={{ fontSize: 12, fontWeight: 700, color: "var(--color-brand)", letterSpacing: "0.05em", textTransform: "uppercase" as const }}>Sending Setup</span>
      <h1 style={{ fontSize: 24, margin: "8px 0 8px" }}>Who is sending?</h1>
      <p style={{ fontSize: 14, color: "var(--color-body)", lineHeight: 1.6, margin: "0 0 24px" }}>
        Each sender becomes a few mailboxes per domain. Add as many as you like.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
        {senders.map((s, idx) => (
          <div key={idx} style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input className="ob-input" type="text" placeholder="First name" value={s.first} onChange={(e) => updateSender(idx, "first", e.target.value)}
              onFocus={() => setFocused(`f${idx}`)} onBlur={() => setFocused(null)}
              style={{ ...INPUT, flex: 1, ...(focused === `f${idx}` ? { borderColor: "var(--color-border-strong)", boxShadow: "var(--shadow-focus)" } : {}) }} />
            <input className="ob-input" type="text" placeholder="Last name" value={s.last} onChange={(e) => updateSender(idx, "last", e.target.value)}
              onFocus={() => setFocused(`l${idx}`)} onBlur={() => setFocused(null)}
              style={{ ...INPUT, flex: 1, ...(focused === `l${idx}` ? { borderColor: "var(--color-border-strong)", boxShadow: "var(--shadow-focus)" } : {}) }} />
            {senders.length > 1 && (
              <button type="button" onClick={() => removeSender(idx)} style={{ width: 32, height: 32, flexShrink: 0, background: "var(--color-surface)", border: "none", borderRadius: 8, color: "var(--color-muted)", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "inherit" }}>×</button>
            )}
          </div>
        ))}
      </div>
      <button type="button" onClick={addSender} className="ob-link-btn" style={{ fontSize: 13, color: "var(--color-brand)", background: "none", border: "none", cursor: "pointer", padding: "0 0 16px", fontFamily: "inherit", fontWeight: 500, transition: "color 150ms" }}>
        + Add another sender
      </button>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <button onClick={() => onNext(redistributePct(senders))} disabled={!valid} className="ob-primary-btn" style={{ ...PRIMARY_BTN, opacity: !valid ? 0.5 : 1, cursor: !valid ? "not-allowed" : "pointer" }}>Continue</button>
        <button onClick={onBack} className="ob-ghost-btn" style={GHOST_BTN}>Back</button>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   STEP 7 — Split the volume
══════════════════════════════════════════════════════════════════════ */
function StepSplit({ senders, onNext, onBack }: {
  senders: Sender[];
  onNext: (senders: Sender[]) => void;
  onBack: () => void;
}) {
  const [entries, setEntries] = useState<Sender[]>(() => redistributePct(senders));
  const [locked, setLocked] = useState<Set<number>>(new Set());

  function update(idx: number, val: string) {
    const newPct = Math.min(100, Math.max(0, parseInt(val) || 0));
    setEntries((prev) => prev.map((s, i) => i === idx ? { ...s, pct: newPct } : s));
  }

  function rebalance(list: Sender[], lockedSet: Set<number>): Sender[] {
    const unlockedIdxs = list.map((_, i) => i).filter((i) => !lockedSet.has(i));
    if (unlockedIdxs.length === 0) return list;
    const lockedTotal = list.reduce((sum, s, i) => lockedSet.has(i) ? sum + s.pct : sum, 0);
    const remainder = Math.max(0, 100 - lockedTotal);
    const base = Math.floor(remainder / unlockedIdxs.length);
    const rem = remainder - base * unlockedIdxs.length;
    return list.map((s, i) => {
      const pos = unlockedIdxs.indexOf(i);
      if (pos === -1) return s;
      return { ...s, pct: pos === unlockedIdxs.length - 1 ? base + rem : base };
    });
  }

  function lockField(idx: number) {
    const lockedTotal = entries.reduce((sum, s, i) => locked.has(i) ? sum + s.pct : sum, 0);
    const available = Math.max(0, 100 - lockedTotal);
    const clamped = entries.map((s, i) => i === idx ? { ...s, pct: Math.min(s.pct, available) } : s);
    const newLocked = new Set(locked).add(idx);
    setLocked(newLocked);
    setEntries(rebalance(clamped, newLocked));
  }

  function unlockField(idx: number) {
    setLocked((prev) => { const next = new Set(prev); next.delete(idx); return next; });
  }

  const total = entries.reduce((s, e) => s + e.pct, 0);
  const isExact = total === 100;

  return (
    <div className="ob-card" style={{ ...CARD, maxWidth: 520 }}>
      <span style={{ fontSize: 12, fontWeight: 700, color: "var(--color-brand)", letterSpacing: "0.05em", textTransform: "uppercase" as const }}>Sending Setup</span>
      <h1 style={{ fontSize: 24, margin: "8px 0 8px" }}>Split the volume</h1>
      <p style={{ fontSize: 14, color: "var(--color-body)", lineHeight: 1.6, margin: "0 0 24px" }}>
        Split evenly to start. Change a share to lock it — the rest rebalance around locked ones and the total stays at or under 100%.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
        {entries.map((s, idx) => {
          const isLocked = locked.has(idx);
          return (
            <div key={idx} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 10, background: "var(--color-surface)" }}>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: "var(--color-heading)" }}>{s.first} {s.last}</span>
              </div>
              {isLocked ? (
                <button
                  type="button"
                  onClick={() => unlockField(idx)}
                  title="Click to unlock and edit"
                  style={{ display: "flex", alignItems: "center", gap: 6, background: "var(--color-page)", border: "1px solid var(--color-border)", borderRadius: 8, padding: "6px 10px", cursor: "pointer", fontFamily: "inherit" }}
                >
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--color-heading)" }}>{s.pct}%</span>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--color-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </button>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <input
                    className="ob-input"
                    type="number"
                    min={0}
                    max={100}
                    value={s.pct || ""}
                    onChange={(e) => update(idx, e.target.value)}
                    onBlur={() => lockField(idx)}
                    style={{ ...INPUT, background: "var(--color-page)", width: 64, textAlign: "center" as const, padding: "8px 10px" }}
                  />
                  <span style={{ fontSize: 13, color: "var(--color-muted)", fontWeight: 500 }}>%</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <button type="button" onClick={() => { setEntries(redistributePct(senders)); setLocked(new Set()); }} className="ob-link-btn" style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--color-brand)", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", padding: 0, transition: "color 150ms" }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
          </svg>
          Reset
        </button>
        <span style={{ fontSize: 13, fontWeight: 600, color: isExact ? "var(--color-success)" : total > 100 ? "var(--color-error)" : "var(--color-muted)" }}>
          {total}%
        </span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <button onClick={() => onNext(entries)} disabled={!isExact} className="ob-primary-btn" style={{ ...PRIMARY_BTN, opacity: !isExact ? 0.5 : 1, cursor: !isExact ? "not-allowed" : "pointer" }}>Continue</button>
        <button onClick={onBack} className="ob-ghost-btn" style={GHOST_BTN}>Back</button>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   Infrastructure summary — quick review of the sending setup before
   moving on to Connections.
══════════════════════════════════════════════════════════════════════ */
function StepInfraSummary({ primaryDomain, selectedPackage, senders, onNext }: {
  primaryDomain: string;
  selectedPackage: PackageKey;
  senders: Sender[];
  onNext: () => void;
}) {
  const pkg = PACKAGES.find((p) => p.key === selectedPackage)!;
  const senderNames = senders.map((s) => `${s.first} ${s.last}`.trim());
  const sendersValue = senders.length > 1
    ? `${senderNames[0]} +${senderNames.length - 1} more`
    : senders[0] ? `${senderNames[0]} · ${senders[0].pct}%` : "—";

  const rows = [
    { label: "Sending domain", value: primaryDomain || "—" },
    { label: "Volume", value: `${pkg.domains} domains · ${pkg.mailboxes} mailboxes` },
    { label: "Senders", value: sendersValue },
  ];

  return (
    <div className="ob-card" style={{ ...CARD, maxWidth: 480 }}>
      <span style={{ fontSize: 12, fontWeight: 700, color: "var(--color-brand)", letterSpacing: "0.05em", textTransform: "uppercase" as const }}>Infrastructure</span>
      <h1 style={{ fontSize: 24, margin: "8px 0 8px" }}>Your sending setup</h1>
      <p style={{ fontSize: 14, color: "var(--color-body)", lineHeight: 1.6, margin: "0 0 24px" }}>
        Everything&apos;s ready to send from.
      </p>
      <div style={{ borderRadius: 14, border: "1px solid var(--color-border)", overflow: "hidden", marginBottom: 24 }}>
        {rows.map(({ label, value }, i) => (
          <div key={label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, padding: "16px 18px", borderBottom: i < rows.length - 1 ? "1px solid var(--color-border)" : "none" }}>
            <span style={{ fontSize: 13.5, color: "var(--color-muted)" }}>{label}</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: "var(--color-heading)", textAlign: "right" as const, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const, maxWidth: "60%" }}>{value}</span>
          </div>
        ))}
      </div>
      <button onClick={onNext} className="ob-primary-btn" style={PRIMARY_BTN}>
        Looks good — continue
      </button>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   CONNECTIONS INTRO — Intro to the connect-accounts step
══════════════════════════════════════════════════════════════════════ */
const CONNECTIONS_INTRO_BULLETS = [
  "Your primary mailbox",
  "LinkedIn accounts",
  "Scheduling",
  "Invite your team",
];

function StepConnectionsIntro({ onNext }: { onNext: () => void }) {
  return (
    <div className="ob-card" style={{ ...CARD, maxWidth: 480, textAlign: "center" as const }}>
      <span style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--color-brand)", letterSpacing: "0.05em", textTransform: "uppercase" as const, marginBottom: 8 }}>
        Section 3 of 4
      </span>
      <h1 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 10px" }}>Connections</h1>
      <p style={{ fontSize: 14, color: "var(--color-body)", lineHeight: 1.6, margin: "0 0 24px" }}>
        Plug in the tools your agents work alongside — your inbox, calendar, and teammates.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, textAlign: "left" as const, marginBottom: 28 }}>
        {CONNECTIONS_INTRO_BULLETS.map((item, i) => (
          <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
            <span style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--color-brand)", marginTop: 7, flexShrink: 0 }} />
            <span style={{ fontSize: 12.5, color: "var(--color-heading)", lineHeight: 1.5 }}>{item}</span>
          </div>
        ))}
      </div>
      <button onClick={onNext} style={PRIMARY_BTN} className="ob-primary-btn">
        Continue
      </button>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   STEP 8 — Connect accounts
══════════════════════════════════════════════════════════════════════ */
function StepConnect({ initialConnected, onNext, onBack }: {
  initialConnected: string[];
  onNext: (connected: string[]) => void;
  onBack: () => void;
}) {
  const [connected, setConnected] = useState<Set<string>>(() => new Set(initialConnected));
  const [connecting, setConnecting] = useState<string | null>(null);

  function handleConnect(id: string) {
    if (connected.has(id)) return;
    setConnecting(id);
    setTimeout(() => { setConnected((prev) => new Set([...prev, id])); setConnecting(null); }, 1200);
  }

  const accounts = [
    {
      id: "google", label: "Google", email: "you@gmail.com",
      icon: <svg width="20" height="20" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>,
    },
    {
      id: "microsoft", label: "Microsoft", email: "you@outlook.com",
      icon: <svg width="20" height="20" viewBox="0 0 24 24"><rect x="1" y="1" width="10" height="10" fill="#F25022" /><rect x="13" y="1" width="10" height="10" fill="#7FBA00" /><rect x="1" y="13" width="10" height="10" fill="#00A4EF" /><rect x="13" y="13" width="10" height="10" fill="#FFB900" /></svg>,
    },
  ];

  return (
    <div className="ob-card" style={{ ...CARD, maxWidth: 520 }}>
      <span style={{ fontSize: 12, fontWeight: 700, color: "var(--color-brand)", letterSpacing: "0.05em", textTransform: "uppercase" as const }}>Connect</span>
      <h1 style={{ fontSize: 24, margin: "8px 0 8px" }}>Connect your primary mailbox</h1>
      <p style={{ fontSize: 14, color: "var(--color-body)", lineHeight: 1.6, margin: "0 0 24px" }}>
        Connect at least one channel to start sending outreach. You can add more later.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
        {accounts.map(({ id, label, email, icon }) => {
          const isDone = connected.has(id);
          const isLoading = connecting === id;
          return (
            <div key={id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderRadius: 12, background: "var(--color-surface)", border: "1px solid transparent", transition: "all 250ms" }}>
              <div style={{ width: 38, height: 38, flexShrink: 0, background: "var(--color-page)", border: "1px solid var(--color-border)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {icon}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--color-heading)" }}>{label}</div>
                {isDone && <div style={{ fontSize: 12, color: "var(--color-muted)", marginTop: 2 }}>{email}</div>}
              </div>
              <button type="button" onClick={() => handleConnect(id)} disabled={isDone || isLoading}
                style={{ flexShrink: 0, height: 30, padding: "0 12px", borderRadius: 8, fontSize: 12, fontWeight: 600, fontFamily: "inherit", cursor: isDone ? "default" : "pointer", display: "flex", alignItems: "center", gap: 5, transition: "all 200ms", border: "none", ...(isDone ? { background: "rgba(7,188,12,0.12)", color: "var(--color-success)" } : { background: "var(--color-brand-tint)", color: "var(--color-brand)" }) }}>
                {isDone ? <><span>✓</span> Connected</> : isLoading ? <><Spinner />Connecting…</> : "Connect →"}
              </button>
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {connected.size > 0 && <button onClick={() => onNext(Array.from(connected))} className="ob-primary-btn" style={PRIMARY_BTN}>Continue</button>}
        <button onClick={() => onNext(Array.from(connected))} className="ob-ghost-btn" style={GHOST_BTN}>Skip for now</button>
        <button onClick={onBack} className="ob-ghost-btn" style={{ ...GHOST_BTN, color: "var(--color-subtle)" }}>Back</button>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   STEP 8a — Connect LinkedIn
══════════════════════════════════════════════════════════════════════ */
function StepConnectLinkedIn({ initialConnected, onNext, onBack }: {
  initialConnected: string[];
  onNext: (connected: string[]) => void;
  onBack: () => void;
}) {
  const [connected, setConnected] = useState<Set<string>>(() => new Set(initialConnected));
  const [connecting, setConnecting] = useState<string | null>(null);

  function handleConnect(id: string) {
    if (connected.has(id)) return;
    setConnecting(id);
    setTimeout(() => { setConnected((prev) => new Set([...prev, id])); setConnecting(null); }, 1200);
  }

  const isDone = connected.has("linkedin");
  const isLoading = connecting === "linkedin";

  return (
    <div className="ob-card" style={{ ...CARD, maxWidth: 520 }}>
      <span style={{ fontSize: 12, fontWeight: 700, color: "var(--color-brand)", letterSpacing: "0.05em", textTransform: "uppercase" as const }}>Connect</span>
      <h1 style={{ fontSize: 24, margin: "8px 0 8px" }}>Connect your LinkedIn</h1>
      <p style={{ fontSize: 14, color: "var(--color-body)", lineHeight: 1.6, margin: "0 0 24px" }}>
        Connect LinkedIn to send connection requests and DMs alongside your email outreach.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderRadius: 12, background: "var(--color-surface)", border: "1px solid transparent", transition: "all 250ms" }}>
          <div style={{ width: 38, height: 38, flexShrink: 0, background: "var(--color-page)", border: "1px solid var(--color-border)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="var(--color-brand)"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" /></svg>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--color-heading)" }}>LinkedIn</div>
            {isDone && <div style={{ fontSize: 12, color: "var(--color-muted)", marginTop: 2 }}>you@linkedin.com</div>}
          </div>
          <button type="button" onClick={() => handleConnect("linkedin")} disabled={isDone || isLoading}
            style={{ flexShrink: 0, height: 30, padding: "0 12px", borderRadius: 8, fontSize: 12, fontWeight: 600, fontFamily: "inherit", cursor: isDone ? "default" : "pointer", display: "flex", alignItems: "center", gap: 5, transition: "all 200ms", border: "none", ...(isDone ? { background: "rgba(7,188,12,0.12)", color: "var(--color-success)" } : { background: "var(--color-brand-tint)", color: "var(--color-brand)" }) }}>
            {isDone ? <><span>✓</span> Connected</> : isLoading ? <><Spinner />Connecting…</> : "Connect →"}
          </button>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {isDone && <button onClick={() => onNext(Array.from(connected))} className="ob-primary-btn" style={PRIMARY_BTN}>Continue</button>}
        <button onClick={() => onNext(Array.from(connected))} className="ob-ghost-btn" style={GHOST_BTN}>Skip for now</button>
        <button onClick={onBack} className="ob-ghost-btn" style={{ ...GHOST_BTN, color: "var(--color-subtle)" }}>Back</button>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   STEP 8b — Connect calendar
══════════════════════════════════════════════════════════════════════ */
function StepConnectCalendar({ initialConnected, onNext, onBack }: {
  initialConnected: string[];
  onNext: (connected: string[]) => void;
  onBack: () => void;
}) {
  const [connected, setConnected] = useState<Set<string>>(() => new Set(initialConnected));
  const [connecting, setConnecting] = useState<string | null>(null);

  function handleConnect(id: string) {
    if (connected.has(id)) return;
    setConnecting(id);
    setTimeout(() => { setConnected((prev) => new Set([...prev, id])); setConnecting(null); }, 1200);
  }

  const calendars = [
    {
      id: "google_calendar", label: "Google Calendar", email: "you@gmail.com",
      icon: <svg width="20" height="20" viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="19" rx="3" fill="#fff" stroke="var(--color-border-strong)" strokeWidth="1.2" /><rect x="2" y="3" width="20" height="6" rx="3" fill="#4285F4" /><rect x="6" y="12" width="4.5" height="4.5" rx="0.8" fill="#4285F4" /><rect x="13.5" y="12" width="4.5" height="4.5" rx="0.8" fill="#34A853" /></svg>,
    },
    {
      id: "outlook_calendar", label: "Outlook Calendar", email: "you@outlook.com",
      icon: <svg width="20" height="20" viewBox="0 0 24 24"><rect x="1" y="1" width="10" height="10" fill="#F25022" /><rect x="13" y="1" width="10" height="10" fill="#7FBA00" /><rect x="1" y="13" width="10" height="10" fill="#00A4EF" /><rect x="13" y="13" width="10" height="10" fill="#FFB900" /></svg>,
    },
    {
      id: "calendly", label: "Calendly", email: "you@calendly.com",
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="2" y="2" width="20" height="20" rx="5" fill="#006BFF" /><path d="M12 6a6 6 0 1 0 4.24 10.24" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" /><circle cx="12" cy="12" r="1.6" fill="#fff" /></svg>,
    },
  ];

  return (
    <div className="ob-card" style={{ ...CARD, maxWidth: 520 }}>
      <span style={{ fontSize: 12, fontWeight: 700, color: "var(--color-brand)", letterSpacing: "0.05em", textTransform: "uppercase" as const }}>Connect</span>
      <h1 style={{ fontSize: 24, margin: "8px 0 8px" }}>Connect your calendar</h1>
      <p style={{ fontSize: 14, color: "var(--color-body)", lineHeight: 1.6, margin: "0 0 24px" }}>
        Let agents check availability and book meetings straight onto your calendar.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
        {calendars.map(({ id, label, email, icon }) => {
          const isDone = connected.has(id);
          const isLoading = connecting === id;
          return (
            <div key={id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderRadius: 12, background: "var(--color-surface)", border: "1px solid transparent", transition: "all 250ms" }}>
              <div style={{ width: 38, height: 38, flexShrink: 0, background: "var(--color-page)", border: "1px solid var(--color-border)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {icon}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--color-heading)" }}>{label}</div>
                {isDone && <div style={{ fontSize: 12, color: "var(--color-muted)", marginTop: 2 }}>{email}</div>}
              </div>
              <button type="button" onClick={() => handleConnect(id)} disabled={isDone || isLoading}
                style={{ flexShrink: 0, height: 30, padding: "0 12px", borderRadius: 8, fontSize: 12, fontWeight: 600, fontFamily: "inherit", cursor: isDone ? "default" : "pointer", display: "flex", alignItems: "center", gap: 5, transition: "all 200ms", border: "none", ...(isDone ? { background: "rgba(7,188,12,0.12)", color: "var(--color-success)" } : { background: "var(--color-brand-tint)", color: "var(--color-brand)" }) }}>
                {isDone ? <><span>✓</span> Connected</> : isLoading ? <><Spinner />Connecting…</> : "Connect →"}
              </button>
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {connected.size > 0 && <button onClick={() => onNext(Array.from(connected))} className="ob-primary-btn" style={PRIMARY_BTN}>Continue</button>}
        <button onClick={() => onNext(Array.from(connected))} className="ob-ghost-btn" style={GHOST_BTN}>Skip for now</button>
        <button onClick={onBack} className="ob-ghost-btn" style={{ ...GHOST_BTN, color: "var(--color-subtle)" }}>Back</button>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   STEP 9 — Invite team
══════════════════════════════════════════════════════════════════════ */
const INVITE_ROLES = [
  { value: "admin", label: "Admin — Full access" },
  { value: "member", label: "Member — Build and send" },
  { value: "viewer", label: "Viewer — Read only" },
];

function StepInvite({ initialInvitees, onNext, onBack }: {
  initialInvitees: Invitee[];
  onNext: (invitees: Invitee[]) => void;
  onBack: () => void;
}) {
  const [invitees, setInvitees] = useState<Invitee[]>(initialInvitees);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("member");
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const trimmedEmail = email.trim();
  const hasAny = invitees.length > 0 || trimmedEmail !== "";
  const emailValid = trimmedEmail.length === 0 || isValidEmail(trimmedEmail);
  const canAdd = trimmedEmail.length > 0 && isValidEmail(trimmedEmail);

  function addInvitee() {
    if (!canAdd) return;
    setInvitees((prev) => [...prev, { email: trimmedEmail, role }]);
    setEmail("");
    setRole("member");
  }

  function removeInvitee(idx: number) {
    setInvitees((prev) => prev.filter((_, i) => i !== idx));
  }

  function send() {
    setLoading(true);
    setTimeout(() => { setLoading(false); onNext(invitees); }, 1000);
  }

  return (
    <div className="ob-card" style={{ ...CARD, maxWidth: 480 }}>
      <span style={{ fontSize: 12, fontWeight: 700, color: "var(--color-brand)", letterSpacing: "0.05em", textTransform: "uppercase" as const }}>Your Team</span>
      <h1 style={{ fontSize: 24, margin: "8px 0 8px" }}>Invite your team</h1>
      <p style={{ fontSize: 14, color: "var(--color-body)", lineHeight: 1.6, margin: "0 0 24px" }}>
        Bring teammates in to review campaigns and replies. Add as many as you like, or skip.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: invitees.length < 5 ? 4 : 12 }}>
        <div style={{ position: "relative" }}>
          <input className="ob-input" type="email" placeholder="colleague@company.com" value={email}
            onChange={(e) => setEmail(e.target.value)}
            onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addInvitee(); } }}
            style={{ ...INPUT, ...(focused ? { borderColor: "var(--color-border-strong)", boxShadow: "var(--shadow-focus)" } : {}), ...(trimmedEmail && emailValid ? { borderColor: "rgba(7,188,12,0.5)" } : trimmedEmail && !emailValid ? { borderColor: "rgba(231,76,60,0.5)" } : {}) }} />
          {trimmedEmail && (
            <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", fontSize: 12, fontWeight: 600, color: emailValid ? "var(--color-success)" : "var(--color-error)" }}>
              {emailValid ? "✓" : "✗"}
            </span>
          )}
        </div>
        {trimmedEmail && !emailValid && (
          <p style={{ fontSize: 12, color: "var(--color-error)", margin: "-4px 0 0" }}>Enter a valid email address</p>
        )}
        <div style={{ position: "relative" }}>
          <select value={role} onChange={(e) => setRole(e.target.value)}
            style={{ ...INPUT, cursor: "pointer", appearance: "none" as const, WebkitAppearance: "none" as const, MozAppearance: "none" as const, paddingRight: 36 }}>
            {INVITE_ROLES.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" as const }}>
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </div>
      {invitees.length < 5 && (
        <button type="button" onClick={addInvitee} disabled={!canAdd} className="ob-link-btn" style={{ fontSize: 13, color: "var(--color-brand)", background: "none", border: "none", cursor: canAdd ? "pointer" : "not-allowed", opacity: canAdd ? 1 : 0.5, padding: "0 0 16px", fontFamily: "inherit", fontWeight: 500, transition: "color 150ms" }}>
          + Add another
        </button>
      )}
      {invitees.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 8, marginBottom: 16 }}>
          {invitees.map((inv, idx) => {
            const roleLabel = INVITE_ROLES.find((r) => r.value === inv.role)?.label.split(" — ")[0] ?? inv.role;
            return (
              <div key={idx} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 10px", borderRadius: 999, background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: "var(--color-heading)" }}>{inv.email}</span>
                <span style={{ fontSize: 11, color: "var(--color-muted)" }}>· {roleLabel}</span>
                <button type="button" onClick={() => removeInvitee(idx)} style={{ background: "none", border: "none", color: "var(--color-muted)", cursor: "pointer", fontSize: 14, lineHeight: 1, padding: 0, marginLeft: 2, fontFamily: "inherit" }}>×</button>
              </div>
            );
          })}
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {hasAny && (
          <button onClick={send} disabled={loading} className="ob-primary-btn" style={{ ...PRIMARY_BTN, opacity: loading ? 0.8 : 1 }}>
            {loading ? <><Spinner inverted />Sending…</> : "Send invites"}
          </button>
        )}
        <button onClick={() => onNext(invitees)} className="ob-ghost-btn" style={GHOST_BTN}>Skip for now</button>
        <button onClick={onBack} className="ob-ghost-btn" style={{ ...GHOST_BTN, color: "var(--color-subtle)" }}>Back</button>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   Connections summary — quick review of what's plugged in before
   moving on to Review & Approve.
══════════════════════════════════════════════════════════════════════ */
function StepConnectionsSummary({ connectedAccounts, connectedCalendars, invitees, onNext }: {
  connectedAccounts: string[];
  connectedCalendars: string[];
  invitees: Invitee[];
  onNext: () => void;
}) {
  const mailboxCount = connectedAccounts.filter((id) => id === "google" || id === "microsoft").length;
  const linkedinConnected = connectedAccounts.includes("linkedin");

  const rows = [
    { label: "Sending mailboxes", value: mailboxCount > 0 ? `${mailboxCount} connected` : "None yet" },
    { label: "LinkedIn", value: linkedinConnected ? "1 connected" : "Not connected" },
    { label: "Scheduling", value: connectedCalendars.length > 0 ? `${connectedCalendars.length} connected` : "Not connected" },
    { label: "Team invites", value: invitees.length > 0 ? `${invitees.length} invited` : "None" },
  ];

  return (
    <div className="ob-card" style={{ ...CARD, maxWidth: 480 }}>
      <span style={{ fontSize: 12, fontWeight: 700, color: "var(--color-brand)", letterSpacing: "0.05em", textTransform: "uppercase" as const }}>Connections</span>
      <h1 style={{ fontSize: 24, margin: "8px 0 8px" }}>Your connections</h1>
      <p style={{ fontSize: 14, color: "var(--color-body)", lineHeight: 1.6, margin: "0 0 24px" }}>
        What your agents are plugged into.
      </p>
      <div style={{ borderRadius: 14, border: "1px solid var(--color-border)", overflow: "hidden", marginBottom: 24 }}>
        {rows.map(({ label, value }, i) => (
          <div key={label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, padding: "16px 18px", borderBottom: i < rows.length - 1 ? "1px solid var(--color-border)" : "none" }}>
            <span style={{ fontSize: 13.5, color: "var(--color-muted)" }}>{label}</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: "var(--color-heading)", textAlign: "right" as const }}>{value}</span>
          </div>
        ))}
      </div>
      <button onClick={onNext} className="ob-primary-btn" style={PRIMARY_BTN}>
        Looks good — continue
      </button>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   REVIEW INTRO — Intro to the review-and-approve step
══════════════════════════════════════════════════════════════════════ */
const REVIEW_INTRO_BULLETS = [
  "Your sending domains",
  "Mailboxes & package",
  "Senders & split",
];

function StepReviewIntro({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  return (
    <div className="ob-card" style={{ ...CARD, maxWidth: 480, textAlign: "center" as const }}>
      <span style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--color-brand)", letterSpacing: "0.05em", textTransform: "uppercase" as const, marginBottom: 8 }}>
        Section 4 of 4
      </span>
      <h1 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 10px" }}>Review &amp; Approve</h1>
      <p style={{ fontSize: 14, color: "var(--color-body)", lineHeight: 1.6, margin: "0 0 24px" }}>
        Last step — review what we&apos;ve set up and approve it before your infrastructure goes live.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, textAlign: "left" as const, marginBottom: 28 }}>
        {REVIEW_INTRO_BULLETS.map((item, i) => (
          <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
            <span style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--color-brand)", marginTop: 7, flexShrink: 0 }} />
            <span style={{ fontSize: 12.5, color: "var(--color-heading)", lineHeight: 1.5 }}>{item}</span>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <button onClick={onNext} style={PRIMARY_BTN} className="ob-primary-btn">
          Continue
        </button>
        <button onClick={onBack} className="ob-ghost-btn" style={{ ...GHOST_BTN, color: "var(--color-subtle)" }}>Back</button>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   STEP 10 — Review domains & mailboxes
══════════════════════════════════════════════════════════════════════ */
function StepReviewOrder({ forwardingDomain, selectedPackage, senders, onNext, onBack }: {
  forwardingDomain: string;
  selectedPackage: PackageKey;
  senders: Sender[];
  onNext: (domains: string[], mailboxes: string[]) => void;
  onBack: () => void;
}) {
  const pkg = PACKAGES.find((p) => p.key === selectedPackage)!;
  const base = extractBase(forwardingDomain) || "yourdomain";

  const [domains, setDomains] = useState<string[]>([]);
  const [avail, setAvail] = useState<Record<string, AvailStatus>>({});
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    const list = generateDomainSuggestions(base, pkg.domains);
    setDomains(list);
    const init: Record<string, AvailStatus> = {};
    list.forEach((d) => { init[d] = "checking"; });
    setAvail(init);
    setSelected(new Set());
    const t = setTimeout(() => {
      const resolved: Record<string, AvailStatus> = {};
      list.forEach((d) => { resolved[d] = "available"; });
      setAvail(resolved);
      setSelected(new Set(list));
    }, 1400);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isChecking = domains.length > 0 && domains.some((d) => avail[d] === "checking");

  const selectedDomains = domains.filter((d) => selected.has(d));
  const allMailboxes = selectedDomains.flatMap((d) => getMailboxesForDomain(d, senders)).slice(0, pkg.mailboxes);

  return (
    <div className="ob-card" style={{ ...CARD, maxWidth: 480, padding: "28px 28px 24px" }}>
      <div style={{ marginBottom: 16 }}>
        <h1 style={{ fontSize: 22, margin: "0 0 4px" }}>Review your domains</h1>
        <p style={{ fontSize: 13, color: "var(--color-body)", margin: 0 }}>Here are the domains we've secured for you. Taken domains are excluded automatically.</p>
      </div>

      {/* Summary bar */}
      <div style={{ borderRadius: 12, border: "1px solid var(--color-border)", overflow: "hidden", marginBottom: 14 }}>
        {(() => {
          const senderNames = senders.map((s) => `${s.first} ${s.last}`.trim());
          const sendersValue = senderNames.length > 1 ? `${senderNames[0]} +${senderNames.length - 1} more` : senderNames[0] || "—";
          return [
            { label: "Forwarding", value: forwardingDomain, title: forwardingDomain },
            { label: "Package", value: `${pkg.domains} domains · ${pkg.mailboxes} mailboxes`, title: undefined },
            { label: "Senders", value: sendersValue, title: senderNames.join(", ") },
          ];
        })().map(({ label, value, title }, i, arr) => (
          <div key={label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "6px 12px", background: "var(--color-surface)", borderBottom: i < arr.length - 1 ? "1px solid var(--color-border)" : "none" }}>
            <span style={{ fontSize: 11, color: "var(--color-muted)" }}>{label}</span>
            <span title={title} style={{ fontSize: 12, fontWeight: 400, color: "var(--color-heading)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const, textAlign: "right" as const }}>{value}</span>
          </div>
        ))}
      </div>

      {/* Domains */}
      <div style={{ display: "flex", flexDirection: "column", height: 360, borderRadius: 12, border: "1px solid var(--color-border)", overflow: "hidden", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", borderBottom: "1px solid var(--color-border)", background: "var(--color-surface)", flexShrink: 0 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--color-muted)", letterSpacing: "0.05em", textTransform: "uppercase" as const }}>Domains</span>
        </div>
        <div style={{ flex: 1, overflowY: "auto" as const }}>
          {isChecking ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 8 }}>
              <svg style={{ animation: "ob-spin 0.8s linear infinite" }} width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="var(--color-border)" strokeWidth="3" /><path d="M12 2a10 10 0 0 1 10 10" stroke="var(--color-brand)" strokeWidth="3" strokeLinecap="round" /></svg>
              <span style={{ fontSize: 12, color: "var(--color-muted)" }}>Checking availability…</span>
            </div>
          ) : domains.filter((d) => avail[d] === "available").map((d, i) => (
            <div key={d} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 12px", borderBottom: "1px solid var(--color-border)" }}>
              <span style={{ fontSize: 11, color: "var(--color-subtle)", width: 22, flexShrink: 0 }}>{i + 1}.</span>
              <span style={{ fontSize: 12, fontWeight: 400, flex: 1, color: "var(--color-heading)" }}>{d}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <button onClick={() => onNext(selectedDomains, allMailboxes)} disabled={isChecking || allMailboxes.length !== pkg.mailboxes} className="ob-primary-btn" style={{ ...PRIMARY_BTN, opacity: isChecking || allMailboxes.length !== pkg.mailboxes ? 0.5 : 1, cursor: isChecking || allMailboxes.length !== pkg.mailboxes ? "not-allowed" : "pointer" }}>
          Approve &amp; Continue
        </button>
        <button onClick={onBack} className="ob-ghost-btn" style={GHOST_BTN}>Back</button>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   STEP 11 — AI Research
══════════════════════════════════════════════════════════════════════ */
const RESEARCH_ITEMS = [
  { label: "Company Research",    desc: "Mapping company profile, news & signals" },
  { label: "Products & Services", desc: "Extracting value props & differentiators" },
  { label: "TAM Tree & ICPs",     desc: "Building addressable market segments" },
  { label: "Personas",            desc: "Generating buyer personas & pain points" },
  { label: "Outreach Campaign",   desc: "Drafting sequences & messaging angles" },
];

function StepResearch({ onFinish }: { onFinish: () => void }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const delays = [200, 400, 600, 800, 1000];
    const timers = delays.map((d, i) => setTimeout(() => setStep(i + 1), d));
    return () => timers.forEach(clearTimeout);
  }, []);

  const allDone = step >= RESEARCH_ITEMS.length;

  return (
    <div className="ob-card" style={{ ...CARD, maxWidth: 480 }}>
      <span style={{ fontSize: 12, fontWeight: 700, color: "var(--color-brand)", letterSpacing: "0.05em", textTransform: "uppercase" as const }}>Knowledge Center</span>
      <h1 style={{ fontSize: 24, margin: "8px 0 8px" }}>{allDone ? "All Set" : "Researching"}</h1>
      <p style={{ fontSize: 14, color: "var(--color-body)", lineHeight: 1.6, margin: "0 0 24px" }}>
        {allDone ? "Your Knowledge Center and agents are ready." : "We're analysing your company and building your outreach strategy. Hang tight while we finish."}
      </p>
      <div style={{ display: "flex", flexDirection: "column", marginBottom: 24 }}>
        {RESEARCH_ITEMS.map(({ label, desc }, i) => {
          const done = i < step;
          const running = i === step && !allDone;
          return (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 10, background: "transparent", border: `1px solid ${running ? "var(--color-brand)" : "transparent"}`, borderBottom: `1px solid ${running ? "var(--color-brand)" : i < RESEARCH_ITEMS.length - 1 ? "var(--color-border)" : "transparent"}`, transition: "all 400ms" }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: done ? "var(--color-brand)" : "var(--color-page)", border: done ? "none" : `1.5px solid ${running ? "var(--color-brand)" : "var(--color-border-strong)"}` }}>
                {done
                  ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
                  : running
                  ? <svg style={{ animation: "ob-spin 0.8s linear infinite" }} width="12" height="12" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="var(--color-border)" strokeWidth="3" /><path d="M12 2a10 10 0 0 1 10 10" stroke="var(--color-brand)" strokeWidth="3" strokeLinecap="round" /></svg>
                  : <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--color-subtle)" }} />}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 400, color: "var(--color-heading)" }}>{label}</div>
                {running && <div style={{ fontSize: 11, color: "var(--color-muted)", marginTop: 2 }}>{desc}</div>}
              </div>
            </div>
          );
        })}
      </div>
      <button onClick={onFinish} disabled={!allDone} className="ob-primary-btn" style={{ ...PRIMARY_BTN, opacity: allDone ? 1 : 0.5, cursor: allDone ? "pointer" : "not-allowed" }}>
        Continue
      </button>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   STEP 12 — Company Research summary (AI-drafted result)
══════════════════════════════════════════════════════════════════════ */
const RESEARCH_SECTION_LABEL: React.CSSProperties = {
  fontSize: 11, fontWeight: 700, color: "var(--color-muted)", letterSpacing: "0.05em",
  textTransform: "uppercase" as const, paddingBottom: 6, marginBottom: 10, borderBottom: "1px solid var(--color-border)",
  display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8,
};

function SectionLabel({ children, ai }: { children: React.ReactNode; ai?: React.ReactNode }) {
  return (
    <div style={RESEARCH_SECTION_LABEL}>
      <span>{children}</span>
      {ai}
    </div>
  );
}

type RiskLevel = "HIGH" | "MEDIUM" | "LOW";
const RISK_BADGE: Record<RiskLevel, React.CSSProperties> = {
  HIGH: { color: "var(--color-error)", background: "rgba(231,76,60,0.1)", border: "1px solid rgba(231,76,60,0.3)" },
  MEDIUM: { color: "var(--color-warning)", background: "rgba(241,196,15,0.15)", border: "1px solid rgba(241,196,15,0.35)" },
  LOW: { color: "var(--color-success)", background: "rgba(7,188,12,0.1)", border: "1px solid rgba(7,188,12,0.3)" },
};
type Channel = "LinkedIn" | "Email";
const CHANNEL_BADGE: Record<Channel, React.CSSProperties> = {
  LinkedIn: { color: "var(--color-info)", background: "rgba(41,112,255,0.1)", border: "1px solid rgba(41,112,255,0.3)" },
  Email: { color: "var(--color-muted)", background: "var(--color-surface)", border: "1px solid var(--color-border)" },
};

function BulletList({ items, tone = "body" }: { items: string[]; tone?: "body" | "brand" }) {
  const textColor = tone === "brand" ? "var(--color-brand)" : "var(--color-body)";
  const dotColor = tone === "brand" ? "var(--color-brand)" : "var(--color-subtle)";
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {items.map((item, i) => (
        <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
          <span style={{ width: 4, height: 4, borderRadius: "50%", background: dotColor, marginTop: 7, flexShrink: 0 }} />
          <span style={{ fontSize: 12.5, color: textColor, lineHeight: 1.5 }}>{item}</span>
        </div>
      ))}
    </div>
  );
}

/* ─── Inline click-to-edit primitives ──────────────────────────────
   Shared by any "AI-drafted, human-reviewable" step. A click turns
   text into an input/textarea; Enter/blur commits, Escape cancels. */
function EditableText({ value, onChange, multiline = false, placeholder, style, rows = 3, revise }: {
  value: string; onChange: (v: string) => void; multiline?: boolean; placeholder?: string; style?: React.CSSProperties; rows?: number;
  revise?: (current: string, instruction: string) => string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [aiOpen, setAiOpen] = useState(false);
  const [aiInstruction, setAiInstruction] = useState("");
  const [aiBusy, setAiBusy] = useState(false);
  const [undoValue, setUndoValue] = useState<string | null>(null);
  const containerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => { if (!editing) setDraft(value); }, [value, editing]);

  function commit() {
    setEditing(false);
    setAiOpen(false);
    const trimmed = draft.trim();
    if (trimmed && trimmed !== value) onChange(trimmed);
    else setDraft(value);
  }
  function cancel() { setDraft(value); setEditing(false); setAiOpen(false); }

  function applyAI() {
    if (!revise) return;
    const instruction = aiInstruction.trim();
    if (!instruction || aiBusy) return;
    setAiBusy(true);
    setTimeout(() => {
      const revised = revise(draft, instruction);
      setUndoValue(draft);
      setDraft(revised);
      onChange(revised);
      setAiBusy(false);
      setAiOpen(false);
      setAiInstruction("");
      setEditing(false);
    }, 800);
  }

  const fieldStyle: React.CSSProperties = {
    display: "block", width: "100%", background: "var(--color-page)", border: "1px solid var(--color-brand)",
    borderRadius: 7, padding: revise ? "5px 32px 5px 7px" : "5px 7px", fontFamily: "inherit", outline: "none", boxSizing: "border-box" as const,
    color: "var(--color-heading)", lineHeight: 1.5, ...style,
  };

  if (editing) {
    return (
      <span
        ref={containerRef}
        style={{ position: "relative", display: "block" }}
        onBlur={() => {
          // relatedTarget is unreliable across browsers for this (often null on
          // Safari), so defer and check where focus actually landed instead of
          // trusting the blur event's own metadata.
          requestAnimationFrame(() => {
            if (containerRef.current && !containerRef.current.contains(document.activeElement)) commit();
          });
        }}
      >
        <span style={{ position: "relative", display: "block" }}>
          {multiline ? (
            <textarea
              autoFocus rows={rows} value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Escape") { e.preventDefault(); cancel(); } }}
              style={{ ...fieldStyle, resize: "vertical" as const }}
            />
          ) : (
            <input
              autoFocus value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") { e.preventDefault(); commit(); }
                if (e.key === "Escape") { e.preventDefault(); cancel(); }
              }}
              style={fieldStyle}
            />
          )}
          {revise && (
            <button
              type="button" onClick={() => setAiOpen((o) => !o)} title="Ask AI to revise this"
              style={{
                position: "absolute", top: 0, right: 4, bottom: 0, margin: "auto 0", width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center",
                borderRadius: "50%", border: "none", cursor: "pointer", padding: 0, boxShadow: "0 1px 2px rgba(0,0,0,0.15)",
                background: aiOpen ? "var(--color-brand)" : "var(--color-brand-tint)",
                ...(multiline ? { top: 4, bottom: "auto", margin: 0 } : {}),
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill={aiOpen ? "#fff" : "var(--color-brand)"}><path d="M12 5l1.8 5.4L19 12l-5.2 1.6L12 19l-1.8-5.4L5 12l5.2-1.6L12 5z" /></svg>
            </button>
          )}
        </span>
        {aiOpen && (
          <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
            <input
              autoFocus value={aiInstruction} onChange={(e) => setAiInstruction(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); applyAI(); } if (e.key === "Escape") { e.preventDefault(); setAiOpen(false); setAiInstruction(""); } }}
              placeholder="Tell AI what to change…" disabled={aiBusy}
              style={{ flex: 1, minWidth: 0, fontSize: 11.5, border: "1px solid var(--color-border)", borderRadius: 7, padding: "5px 7px", outline: "none", fontFamily: "inherit", background: "var(--color-surface)", color: "var(--color-heading)" }}
            />
            <button type="button" onClick={applyAI} disabled={aiBusy || !aiInstruction.trim()}
              style={{ flexShrink: 0, fontSize: 11, fontWeight: 600, borderRadius: 7, border: "none", padding: "0 10px", background: "var(--color-brand)", color: "#fff", cursor: aiBusy || !aiInstruction.trim() ? "default" : "pointer", opacity: aiBusy || !aiInstruction.trim() ? 0.6 : 1, display: "flex", alignItems: "center", fontFamily: "inherit" }}>
              {aiBusy ? <Spinner inverted /> : "Go"}
            </button>
          </div>
        )}
      </span>
    );
  }
  return (
    <>
      <span
        onClick={() => setEditing(true)}
        title="Click to edit"
        className="ob-editable"
        style={{ cursor: "text", borderRadius: 5, padding: "1px 4px", margin: "-1px -4px", ...style }}
      >
        {value || <span style={{ color: "var(--color-subtle)", fontStyle: "italic" as const }}>{placeholder ?? "Click to add"}</span>}
      </span>
      {undoValue !== null && (
        <button type="button" onClick={() => { onChange(undoValue); setUndoValue(null); }}
          style={{ marginLeft: 6, fontSize: 10, fontWeight: 600, color: "var(--color-brand)", background: "none", border: "none", cursor: "pointer", textDecoration: "underline", padding: 0, fontFamily: "inherit" }}>
          Undo
        </button>
      )}
    </>
  );
}

function EditableBulletList({ items, onChange, tone = "body" }: {
  items: string[]; onChange: (items: string[]) => void; tone?: "body" | "brand";
}) {
  const textColor = tone === "brand" ? "var(--color-brand)" : "var(--color-body)";
  const dotColor = tone === "brand" ? "var(--color-brand)" : "var(--color-subtle)";
  const updateAt = (i: number, v: string) => onChange(items.map((it, idx) => (idx === i ? v : it)));
  const removeAt = (i: number) => onChange(items.filter((_, idx) => idx !== i));
  const add = () => onChange([...items, "New point"]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {items.map((item, i) => (
        <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
          <span style={{ width: 4, height: 4, borderRadius: "50%", background: dotColor, marginTop: 7, flexShrink: 0 }} />
          <span style={{ flex: 1, minWidth: 0 }}>
            <EditableText value={item} onChange={(v) => updateAt(i, v)} multiline rows={2} style={{ fontSize: 12.5, color: textColor }} revise={reviseText} />
          </span>
          <button type="button" onClick={() => removeAt(i)} title="Remove"
            style={{ flexShrink: 0, background: "none", border: "none", color: "var(--color-subtle)", cursor: "pointer", fontSize: 14, padding: 0, lineHeight: 1.5, fontFamily: "inherit" }}>×</button>
        </div>
      ))}
      <button type="button" onClick={add}
        style={{ alignSelf: "flex-start", background: "none", border: "none", color: "var(--color-brand)", cursor: "pointer", fontSize: 11.5, fontWeight: 600, padding: "2px 0", fontFamily: "inherit" }}>
        + Add point
      </button>
    </div>
  );
}

function EditableChips({ items, onChange }: { items: string[]; onChange: (items: string[]) => void }) {
  const [draft, setDraft] = useState("");
  function add() {
    const v = draft.trim();
    if (v && !items.some((c) => c.toLowerCase() === v.toLowerCase())) onChange([...items, v]);
    setDraft("");
  }
  const removeAt = (i: number) => onChange(items.filter((_, idx) => idx !== i));

  return (
    <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 6, alignItems: "center" }}>
      {items.map((c, i) => (
        <span key={c + i} style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, padding: "3px 6px 3px 10px", borderRadius: 999, border: "1px solid var(--color-border)", background: "var(--color-surface)", color: "var(--color-muted)" }}>
          {c}
          <button type="button" onClick={() => removeAt(i)} title="Remove"
            style={{ background: "none", border: "none", color: "var(--color-subtle)", cursor: "pointer", fontSize: 12, padding: 0, lineHeight: 1, fontFamily: "inherit" }}>×</button>
        </span>
      ))}
      <input
        value={draft} onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
        onBlur={add}
        placeholder="+ Add competitor"
        style={{ fontSize: 11, border: "1px dashed var(--color-border-strong)", borderRadius: 999, padding: "3px 10px", background: "transparent", color: "var(--color-heading)", outline: "none", fontFamily: "inherit", width: 130 }}
      />
    </div>
  );
}

/* ─── Inline "Ask AI" trigger — sits next to a field or a section
   header. No live model call in this demo (mirrors the rest of the
   app's mocked delays); `revise` is a pure heuristic transform scoped
   to whatever value this instance was bound to. */
function AIRevise<T>({ value, onChange, revise, scale = "field" }: {
  value: T; onChange: (next: T) => void; revise: (current: T, instruction: string) => T; scale?: "field" | "section";
}) {
  const [open, setOpen] = useState(false);
  const [instruction, setInstruction] = useState("");
  const [busy, setBusy] = useState(false);
  const [undoValue, setUndoValue] = useState<T | null>(null);
  const iconSize = scale === "section" ? 13 : 11;

  function apply() {
    const text = instruction.trim();
    if (!text || busy) return;
    setBusy(true);
    setTimeout(() => {
      setUndoValue(value);
      onChange(revise(value, text));
      setBusy(false);
      setOpen(false);
      setInstruction("");
    }, scale === "section" ? 1200 : 800);
  }
  function cancel() { setOpen(false); setInstruction(""); }

  return (
    <span style={{ position: "relative", display: "inline-flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
      <button type="button" onClick={() => setOpen((o) => !o)} title="Ask AI to revise this"
        style={{ background: "none", border: "none", cursor: "pointer", padding: 2, lineHeight: 0, opacity: open ? 1 : 0.55, fontFamily: "inherit" }}>
        <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="var(--color-brand)"><path d="M12 5l1.8 5.4L19 12l-5.2 1.6L12 19l-1.8-5.4L5 12l5.2-1.6L12 5z" /></svg>
      </button>
      {undoValue !== null && !open && (
        <button type="button" onClick={() => { onChange(undoValue); setUndoValue(null); }}
          style={{ fontSize: 10, fontWeight: 600, color: "var(--color-brand)", background: "none", border: "none", cursor: "pointer", textDecoration: "underline", padding: 0, fontFamily: "inherit" }}>
          Undo
        </button>
      )}
      {open && (
        <div style={{ position: "absolute", top: "calc(100% + 6px)", right: 0, zIndex: 5, display: "flex", gap: 6, background: "var(--color-page)", border: "1px solid var(--color-border)", borderRadius: 10, padding: 6, boxShadow: "var(--shadow-elevated)", width: 240 }}>
          <input
            autoFocus value={instruction} onChange={(e) => setInstruction(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); apply(); } if (e.key === "Escape") { e.preventDefault(); cancel(); } }}
            placeholder="Tell AI what to change…" disabled={busy}
            style={{ flex: 1, minWidth: 0, fontSize: 11.5, border: "1px solid var(--color-border)", borderRadius: 7, padding: "5px 7px", outline: "none", fontFamily: "inherit", background: "var(--color-surface)", color: "var(--color-heading)" }}
          />
          <button type="button" onClick={apply} disabled={busy || !instruction.trim()}
            style={{ flexShrink: 0, fontSize: 11, fontWeight: 600, borderRadius: 7, border: "none", padding: "0 10px", background: "var(--color-brand)", color: "#fff", cursor: busy || !instruction.trim() ? "default" : "pointer", opacity: busy || !instruction.trim() ? 0.6 : 1, display: "flex", alignItems: "center", fontFamily: "inherit" }}>
            {busy ? <Spinner inverted /> : "Go"}
          </button>
        </div>
      )}
    </span>
  );
}

function firstSentence(s: string): string {
  const m = s.match(/^.*?[.!?](?=\s|$)/);
  return m ? m[0] : s;
}

// Field-scoped mock rewrite — operates on exactly one string, so it
// doesn't need to guess which section the instruction was about.
function reviseText(text: string, instruction: string): string {
  const lower = instruction.toLowerCase();
  if (/shorter|concise|tighten|trim/.test(lower)) return firstSentence(text);
  if (/more formal|formal tone/.test(lower)) return text.replace(/—/g, ",");
  if (/casual|friendlier|informal/.test(lower)) return text.replace(/\.(\s|$)/g, "!$1");
  const setTo = instruction.match(/(?:set|change|update|rewrite)(?:\s+this)?\s+to\s+(.+)/i);
  if (setTo) return setTo[1].trim();
  return `${text.replace(/[.\s]+$/, "")} — ${instruction}`;
}

const RISK_ORDER: RiskLevel[] = ["HIGH", "MEDIUM", "LOW"];
function nextRisk(r: RiskLevel): RiskLevel { return RISK_ORDER[(RISK_ORDER.indexOf(r) + 1) % RISK_ORDER.length]; }
const CHANNEL_ORDER: Channel[] = ["Email", "LinkedIn"];
function nextChannel(c: Channel): Channel { return CHANNEL_ORDER[(CHANNEL_ORDER.indexOf(c) + 1) % CHANNEL_ORDER.length]; }

function titleCase(s: string): string { return s.charAt(0).toUpperCase() + s.slice(1); }

// Section-scoped revisers — same "no live model" heuristic approach as
// reviseText, but each understands the shape of its own section so a
// section-level prompt (e.g. "add X as a competitor") can act on the
// whole list/object instead of a single field.
type CompanyResearchOverview = CompanyResearchData["overview"];
function reviseOverview(rows: CompanyResearchOverview, instruction: string): CompanyResearchOverview {
  const m = instruction.match(/(?:set|update|change)\s+(.+?)\s+to\s+(.+)/i);
  if (!m) return rows;
  const label = m[1].trim().toLowerCase();
  const value = m[2].trim();
  return rows.map((r) => (r.label.toLowerCase().includes(label) ? { ...r, value } : r));
}

type ProductBundle = Pick<CompanyResearchData, "productName" | "productDescription" | "productBullets">;
function reviseProductBundle(bundle: ProductBundle, instruction: string): ProductBundle {
  const lower = instruction.toLowerCase();
  if (/shorter|concise|tighten|trim/.test(lower)) {
    return { ...bundle, productDescription: firstSentence(bundle.productDescription) };
  }
  return { ...bundle, productBullets: [...bundle.productBullets, titleCase(instruction)] };
}

type Competitive = CompanyResearchData["competitive"];
function reviseCompetitive(c: Competitive, instruction: string): Competitive {
  const lower = instruction.toLowerCase();
  const addCompetitor = instruction.match(/add\s+([a-z0-9][\w.& -]{1,30}?)\s+as\s+a\s+competitor/i)
    ?? instruction.match(/add\s+competitor\s+([a-z0-9][\w.& -]{1,30})/i);
  if (addCompetitor) {
    const name = addCompetitor[1].trim();
    if (name && !c.competitors.some((x) => x.toLowerCase() === name.toLowerCase())) {
      return { ...c, competitors: [...c.competitors, name] };
    }
    return c;
  }
  const removeCompetitor = instruction.match(/remove\s+([a-z0-9][\w.& -]{1,30}?)\s+(?:as\s+a\s+competitor|from\s+competitors)/i);
  if (removeCompetitor) {
    const name = removeCompetitor[1].trim().toLowerCase();
    return { ...c, competitors: c.competitors.filter((x) => x.toLowerCase() !== name) };
  }
  if (/shorter|concise|tighten|trim/.test(lower)) {
    return { ...c, differentiators: c.differentiators.map(firstSentence) };
  }
  return { ...c, differentiators: [...c.differentiators, titleCase(instruction)] };
}

type ValueProps = CompanyResearchData["valueProps"];
function reviseValueProps(vps: ValueProps, instruction: string): ValueProps {
  const lower = instruction.toLowerCase();
  if (/shorter|concise|tighten|trim/.test(lower)) {
    return vps.map((vp) => ({ ...vp, body: firstSentence(vp.body) }));
  }
  const title = instruction.length > 60 ? `${instruction.slice(0, 57)}…` : titleCase(instruction);
  return [...vps, { title, body: titleCase(instruction), quantified: false }];
}

type IcpHypotheses = CompanyResearchData["icpHypotheses"];
function reviseIcpHypotheses(icps: IcpHypotheses, instruction: string): IcpHypotheses {
  const riskBump = instruction.match(/(?:raise|bump|increase)\s+(?:the\s+)?risk\s+(?:for|on)\s+(.+)/i);
  if (riskBump) {
    const needle = riskBump[1].trim().toLowerCase();
    return icps.map((icp) => (icp.title.toLowerCase().includes(needle) ? { ...icp, risk: nextRisk(icp.risk) } : icp));
  }
  if (icps.length === 0) return icps;
  return icps.map((icp, i) => (i === 0 ? { ...icp, bullets: [...icp.bullets, titleCase(instruction)] } : icp));
}

type OutboundAngles = CompanyResearchData["outboundAngles"];
function reviseOutboundAngles(angles: OutboundAngles, instruction: string): OutboundAngles {
  if (/more formal|formal tone/i.test(instruction)) {
    return angles.map((a) => ({ ...a, quote: a.quote.replace(/—/g, ",") }));
  }
  return [...angles, { title: "New angle", channel: "Email", quote: instruction }];
}

function reviseCallPrepNotes(notes: string[], instruction: string): string[] {
  if (/shorter|concise|tighten|trim/i.test(instruction)) return notes.map(firstSentence);
  return [...notes, titleCase(instruction)];
}

interface CompanyResearchData {
  overview: { label: string; value: string }[];
  productName: string;
  productDescription: string;
  productBullets: string[];
  competitive: { category: string; competitors: string[]; differentiators: string[] };
  valueProps: { title: string; body: string; quantified: boolean }[];
  icpHypotheses: { title: string; risk: RiskLevel; body: string; bullets: string[] }[];
  outboundAngles: { title: string; channel: Channel; quote: string }[];
  callPrepNotes: string[];
}

function buildInitialCompanyResearch(products: Product[]): CompanyResearchData {
  const product = products[0];
  return {
    overview: [
      { label: "Business model", value: "B2B SaaS — subscription pricing" },
      { label: "Company size", value: "Growing team" },
      { label: "Stage", value: "Early stage" },
    ],
    productName: product?.name?.trim() || "Your core product",
    productDescription: product?.description?.trim() || "AI summarised your website to understand what you sell and who it's for.",
    productBullets: [
      "Positioned around fast setup and low time-to-first-send",
      "AI-assisted personalization built into the core workflow",
      "Designed to scale across multiple senders and domains",
    ],
    competitive: {
      category: "Sales & Marketing Outreach Software",
      competitors: ["Outreach", "Apollo", "Instantly", "Smartlead"],
      differentiators: [
        "Positions itself as an outreach platform built for speed to first send",
        "Messaging leans on personalization and AI-assisted workflows",
        "Low setup friction compared to legacy sales tooling",
      ],
    },
    valueProps: [
      { title: "Cuts time spent on manual prospecting", body: "AI drafts and personalizes outreach at scale, freeing reps to focus on conversations.", quantified: true },
      { title: "Faster time to first send", body: "No lengthy setup — connect a domain and start sending within the same day.", quantified: false },
      { title: "Consistent brand voice across sequences", body: "Messaging stays on-brand even as volume scales across senders and domains.", quantified: false },
    ],
    icpHypotheses: [
      {
        title: "VP Sales / Head of RevOps at 50–500 Mid-Market B2B",
        risk: "HIGH",
        body: "Closest match to the core use case — teams running multi-sender outbound who need faster time-to-send without adding headcount.",
        bullets: ["Owns outbound quota and rep productivity", "Actively evaluating tools to replace manual prospecting", "Budget authority for sales tooling"],
      },
      {
        title: "Founder-led Sales at Early-Stage Startups",
        risk: "MEDIUM",
        body: "Small teams wearing multiple hats who need to move fast on outbound without a dedicated SDR function.",
        bullets: ["Values low setup friction over deep customization", "Price-sensitive, favors usage-based plans"],
      },
      {
        title: "Agency or Fractional SDR Teams Managing Multiple Clients",
        risk: "LOW",
        body: "Could adopt per-client, but requires multi-workspace support that may not be a priority yet.",
        bullets: ["Needs to manage several domains and senders per client", "Longer sales cycle due to procurement across client accounts"],
      },
    ],
    outboundAngles: [
      { title: "Time-to-First-Send", channel: "LinkedIn", quote: "Most outreach tools take weeks to set up. We get teams sending personalized sequences the same day — want to see it on your own domain?" },
      { title: "Personalization at Scale", channel: "Email", quote: "Your reps are copy-pasting the same three templates. AI-personalized sequences convert better without adding manual work — worth a 15-minute look?" },
      { title: "Consolidate Your Stack", channel: "Email", quote: "If you're juggling separate tools for sending, personalization, and deliverability, this replaces all three — happy to show how teams like yours consolidated." },
    ],
    callPrepNotes: [
      "Confirm current team size and who owns outbound today — the ICP hypotheses assume a dedicated sales function, which may not match smaller teams.",
      "Validate which tools are currently used for sending, personalization, and deliverability so the consolidation angle lands correctly.",
      "Ask about typical sequence volume and sender count — this shapes which package and domain split makes sense.",
      "Confirm whether outbound is run in-house or through an agency, since this changes the buyer and the pitch.",
    ],
  };
}

function StepCompanyResearch({ products, onNext }: { products: Product[]; onNext: () => void }) {
  const [data, setData] = useState<CompanyResearchData>(() => buildInitialCompanyResearch(products));

  function patch(fields: Partial<CompanyResearchData>) {
    setData((current) => ({ ...current, ...fields }));
  }
  function patchCompetitive(fields: Partial<CompanyResearchData["competitive"]>) {
    setData((current) => ({ ...current, competitive: { ...current.competitive, ...fields } }));
  }
  function updateOverview(i: number, value: string) {
    setData((current) => ({ ...current, overview: current.overview.map((row, idx) => (idx === i ? { ...row, value } : row)) }));
  }
  function updateValueProp(i: number, fields: Partial<CompanyResearchData["valueProps"][number]>) {
    setData((current) => ({ ...current, valueProps: current.valueProps.map((vp, idx) => (idx === i ? { ...vp, ...fields } : vp)) }));
  }
  function updateIcp(i: number, fields: Partial<CompanyResearchData["icpHypotheses"][number]>) {
    setData((current) => ({ ...current, icpHypotheses: current.icpHypotheses.map((icp, idx) => (idx === i ? { ...icp, ...fields } : icp)) }));
  }
  function updateAngle(i: number, fields: Partial<CompanyResearchData["outboundAngles"][number]>) {
    setData((current) => ({ ...current, outboundAngles: current.outboundAngles.map((a, idx) => (idx === i ? { ...a, ...fields } : a)) }));
  }

  const { overview, productName, productDescription, productBullets, competitive, valueProps, icpHypotheses, outboundAngles, callPrepNotes } = data;

  return (
    <div className="ob-card" style={{ ...CARD, maxWidth: 560 }}>
      <span style={{ fontSize: 12, fontWeight: 700, color: "var(--color-brand)", letterSpacing: "0.05em", textTransform: "uppercase" as const }}>Company Research</span>
      <h1 style={{ fontSize: 24, margin: "8px 0 8px" }}>Here&apos;s what we found</h1>
      <p style={{ fontSize: 14, color: "var(--color-body)", lineHeight: 1.6, margin: "0 0 24px" }}>
        AI-researched from your website. Click any field to edit it, or hit <span style={{ color: "var(--color-brand)" }}>✨</span> to ask AI to revise it.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 22, marginBottom: 24 }}>
        <div>
          <SectionLabel ai={<AIRevise value={overview} onChange={(v) => patch({ overview: v })} revise={reviseOverview} scale="section" />}>
            Company Overview
          </SectionLabel>
          <div style={{ borderRadius: 12, border: "1px solid var(--color-border)", overflow: "hidden" }}>
            {overview.map((row, i) => (
              <div key={row.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "8px 12px", background: "var(--color-surface)", borderBottom: i < overview.length - 1 ? "1px solid var(--color-border)" : "none" }}>
                <span style={{ fontSize: 12, color: "var(--color-muted)", flexShrink: 0 }}>{row.label}</span>
                <span style={{ minWidth: 0, maxWidth: "70%" }}>
                  <EditableText value={row.value} onChange={(v) => updateOverview(i, v)} style={{ fontSize: 12, color: "var(--color-heading)" }} revise={reviseText} />
                </span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <SectionLabel ai={<AIRevise value={{ productName, productDescription, productBullets }} onChange={(v) => patch(v)} revise={reviseProductBundle} scale="section" />}>
            Products / Services
          </SectionLabel>
          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--color-heading)", marginBottom: 4 }}>
            <EditableText value={productName} onChange={(v) => patch({ productName: v })} style={{ fontSize: 14, fontWeight: 600 }} revise={reviseText} />
          </div>
          <div style={{ fontSize: 13, color: "var(--color-body)", lineHeight: 1.6, margin: "0 0 10px" }}>
            <EditableText value={productDescription} onChange={(v) => patch({ productDescription: v })} multiline rows={2} style={{ fontSize: 13 }} revise={reviseText} />
          </div>
          <EditableBulletList items={productBullets} onChange={(v) => patch({ productBullets: v })} tone="brand" />
        </div>

        <div>
          <SectionLabel ai={<AIRevise value={competitive} onChange={(v) => patch({ competitive: v })} revise={reviseCompetitive} scale="section" />}>
            Competitive Position
          </SectionLabel>
          <div style={{ fontSize: 10.5, fontWeight: 700, color: "var(--color-muted)", letterSpacing: "0.04em", textTransform: "uppercase" as const, marginBottom: 4 }}>Category</div>
          <div style={{ fontSize: 12.5, color: "var(--color-body)", lineHeight: 1.6, margin: "0 0 12px" }}>
            <EditableText value={competitive.category} onChange={(v) => patchCompetitive({ category: v })} style={{ fontSize: 12.5 }} revise={reviseText} />
          </div>
          <div style={{ fontSize: 10.5, fontWeight: 700, color: "var(--color-muted)", letterSpacing: "0.04em", textTransform: "uppercase" as const, marginBottom: 6 }}>Competitors</div>
          <div style={{ marginBottom: 12 }}>
            <EditableChips items={competitive.competitors} onChange={(v) => patchCompetitive({ competitors: v })} />
          </div>
          <div style={{ fontSize: 10.5, fontWeight: 700, color: "var(--color-muted)", letterSpacing: "0.04em", textTransform: "uppercase" as const, marginBottom: 6 }}>Key Differentiators</div>
          <EditableBulletList items={competitive.differentiators} onChange={(v) => patchCompetitive({ differentiators: v })} />
        </div>

        <div>
          <SectionLabel ai={<AIRevise value={valueProps} onChange={(v) => patch({ valueProps: v })} revise={reviseValueProps} scale="section" />}>
            Value Propositions
          </SectionLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {valueProps.map((vp, i) => (
              <div key={i} style={{ padding: "10px 12px", borderRadius: 10, background: "var(--color-surface)" }}>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--color-heading)", marginBottom: 2 }}>
                  <EditableText value={vp.title} onChange={(v) => updateValueProp(i, { title: v })} style={{ fontSize: 12.5, fontWeight: 600 }} revise={reviseText} />
                </div>
                <div style={{ fontSize: 12, color: "var(--color-muted)", lineHeight: 1.5 }}>
                  <EditableText value={vp.body} onChange={(v) => updateValueProp(i, { body: v })} multiline rows={2} style={{ fontSize: 12, color: "var(--color-muted)" }} revise={reviseText} />
                </div>
                {vp.quantified && (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10.5, fontWeight: 600, color: "var(--color-success)", background: "rgba(7,188,12,0.1)", border: "1px solid rgba(7,188,12,0.3)", borderRadius: 999, padding: "2px 8px", marginTop: 6 }}>
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
                    Quantified
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div>
          <SectionLabel ai={<AIRevise value={icpHypotheses} onChange={(v) => patch({ icpHypotheses: v })} revise={reviseIcpHypotheses} scale="section" />}>
            ICP Hypotheses
          </SectionLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {icpHypotheses.map((icp, i) => (
              <div key={i} style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid var(--color-border)" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 4 }}>
                  <span style={{ flex: 1, fontSize: 12.5, fontWeight: 600, color: "var(--color-heading)", lineHeight: 1.4 }}>
                    <EditableText value={icp.title} onChange={(v) => updateIcp(i, { title: v })} style={{ fontSize: 12.5, fontWeight: 600 }} revise={reviseText} />
                  </span>
                  <button type="button" onClick={() => updateIcp(i, { risk: nextRisk(icp.risk) })} title="Click to change risk level"
                    style={{ flexShrink: 0, fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 6, cursor: "pointer", fontFamily: "inherit", ...RISK_BADGE[icp.risk] }}>
                    {icp.risk}
                  </button>
                </div>
                <div style={{ fontSize: 12, color: "var(--color-muted)", lineHeight: 1.5, margin: "0 0 8px" }}>
                  <EditableText value={icp.body} onChange={(v) => updateIcp(i, { body: v })} multiline rows={2} style={{ fontSize: 12, color: "var(--color-muted)" }} revise={reviseText} />
                </div>
                <EditableBulletList items={icp.bullets} onChange={(v) => updateIcp(i, { bullets: v })} />
              </div>
            ))}
          </div>
        </div>

        <div>
          <SectionLabel ai={<AIRevise value={outboundAngles} onChange={(v) => patch({ outboundAngles: v })} revise={reviseOutboundAngles} scale="section" />}>
            Recommended Outbound Angles
          </SectionLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {outboundAngles.map((angle, i) => (
              <div key={i} style={{ padding: "10px 12px", borderRadius: 10, background: "var(--color-surface)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ flex: 1, fontSize: 12.5, fontWeight: 600, color: "var(--color-heading)" }}>
                    <EditableText value={angle.title} onChange={(v) => updateAngle(i, { title: v })} style={{ fontSize: 12.5, fontWeight: 600 }} revise={reviseText} />
                  </span>
                  <button type="button" onClick={() => updateAngle(i, { channel: nextChannel(angle.channel) })} title="Click to change channel"
                    style={{ flexShrink: 0, fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 6, cursor: "pointer", fontFamily: "inherit", ...CHANNEL_BADGE[angle.channel] }}>
                    {angle.channel}
                  </button>
                </div>
                <div style={{ fontSize: 12, color: "var(--color-muted)", lineHeight: 1.5, fontStyle: "italic" as const }}>
                  &ldquo;<EditableText value={angle.quote} onChange={(v) => updateAngle(i, { quote: v })} multiline rows={2} style={{ fontSize: 12, color: "var(--color-muted)", fontStyle: "italic" as const }} revise={reviseText} />&rdquo;
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <SectionLabel ai={<AIRevise value={callPrepNotes} onChange={(v) => patch({ callPrepNotes: v })} revise={reviseCallPrepNotes} scale="section" />}>
            Call Prep Notes
          </SectionLabel>
          <div style={{ borderRadius: 10, border: "1px solid var(--color-border)", padding: "12px 14px" }}>
            <div style={{ marginBottom: 12 }}>
              <EditableBulletList items={callPrepNotes} onChange={(v) => patch({ callPrepNotes: v })} />
            </div>
            <p style={{ fontSize: 11, color: "var(--color-subtle)", fontStyle: "italic" as const, margin: 0, paddingTop: 10, borderTop: "1px solid var(--color-border)" }}>
              Based on your website and the details you provided. Verify anything you&apos;re unsure about before it goes into outreach.
            </p>
          </div>
        </div>
      </div>

      <button onClick={onNext} className="ob-primary-btn" style={PRIMARY_BTN}>
        Approve and Continue
      </button>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   STEP 13 — Products & Services summary (AI-drafted result)
══════════════════════════════════════════════════════════════════════ */
type PSContent = string | string[];
interface PSSection { label: string; content: PSContent }

function PSField({ section }: { section: PSSection }) {
  const isList = Array.isArray(section.content);
  return (
    <div>
      <div style={{ fontSize: 10.5, fontWeight: 700, color: "var(--color-muted)", letterSpacing: "0.04em", textTransform: "uppercase" as const, marginBottom: 6 }}>{section.label}</div>
      {isList
        ? <BulletList items={section.content as string[]} />
        : <p style={{ fontSize: 12.5, color: "var(--color-body)", lineHeight: 1.6, margin: 0 }}>{section.content as string}</p>}
    </div>
  );
}

function StepProductsServices({ products, onNext }: { products: Product[]; onNext: () => void }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const product = products[selectedIndex];
  const productName = product?.name?.trim() || "Your core product";
  const productBadge = product?.variant?.trim() || "Core product";
  const description = product?.description?.trim() || "AI summarised your website to understand what you sell and who it's for.";

  const PS_TABS: Record<string, PSSection[]> = {
    "Core Details": [
      { label: "Description", content: description },
      { label: "Use Cases", content: ["Outbound prospecting for sales teams without a dedicated SDR function", "Scaling personalized sequences across multiple senders and domains", "Replacing manual, template-based cold email workflows"] },
      { label: "Key Features", content: ["AI-drafted, personalized outreach at scale", "Multi-domain, multi-sender sending infrastructure", "Same-day setup with no lengthy onboarding"] },
      { label: "Problems It Solves", content: ["Reps spending hours manually personalizing emails", "Slow time-to-first-send with legacy sales tooling", "Inconsistent messaging across senders and sequences"] },
      { label: "Value Proposition", content: "Cuts the time spent on manual prospecting by letting AI draft and personalize outreach at scale, while keeping messaging consistent across every sender and domain." },
      { label: "Time to Value", content: "Same day — connect a domain and start sending without a lengthy setup process." },
    ],
    "Market Fit": [
      { label: "Ideal Customer", content: "Sales leaders and founder-led teams at B2B companies who need to scale outbound without adding headcount." },
      { label: "Market Maturity", content: "Replacing an existing behavior — manual, template-based outreach" },
      { label: "Competitive Alternatives", content: ["Manual, template-based cold email workflows", "Legacy sales engagement platforms with slow setup", "Point tools that only handle sending, not personalization"] },
      { label: "Buyer Objections", content: ["\"We already have a sales engagement tool\" — most don't personalize at this depth or scale", "\"Setup will take too long\" — same-day setup with no IT project required"] },
      { label: "What Makes Them Switch", content: ["Outbound volume growing faster than headcount", "Reps spending too much time on manual personalization", "Deliverability issues from a single overused domain"] },
    ],
    "Commercials": [
      { label: "Deal Type", content: "Recurring — subscription pricing" },
      { label: "Typical Contract Length", content: "Month-to-month, with annual options" },
      { label: "Average Deal Size", content: "Scales with sending volume and number of domains/mailboxes" },
      { label: "Typical Stakeholders", content: ["Primary: Head of Sales or RevOps (evaluates and champions)", "Secondary: Founder or CRO (approves budget)"] },
    ],
    "Proof & Evidence": [
      { label: "Best Proof Points", content: ["Faster time-to-first-send compared to legacy sales tooling", "Consistent brand voice maintained across scaled sending volume"] },
      { label: "ROI Metrics", content: ["Hours saved per rep per week on manual personalization", "Increase in reply rate from personalized vs. templated sequences"] },
      { label: "Objection Rebuttals", content: ["\"AI messaging sounds generic\" — sequences are drafted from real product and company research, not generic templates", "\"We're worried about deliverability\" — sending is split across multiple domains and senders by design"] },
    ],
    "Positioning & Messaging": [
      { label: "Elevator Pitch", content: `${productName} turns AI-researched company and product context into personalized outbound sequences — sent across multiple domains and senders, live the same day.` },
      { label: "Positioning Statement", content: `For sales teams that need to scale outbound without scaling headcount, ${productName} is the outreach platform that drafts personalized sequences from real research and sends them through infrastructure built for deliverability.` },
      { label: "Messaging Do's", content: ["Lead with speed to first send and low setup friction", "Anchor on personalization quality, not just volume"] },
      { label: "Messaging Don'ts", content: ["Don't position as a generic \"AI email\" tool — the research-backed personalization is the differentiator", "Don't oversell volume without mentioning deliverability safeguards"] },
    ],
  };
  const tabNames = Object.keys(PS_TABS);
  const [activeTab, setActiveTab] = useState(tabNames[0]);

  return (
    <div className="ob-card" style={{ ...CARD, maxWidth: 580 }}>
      <span style={{ fontSize: 12, fontWeight: 700, color: "var(--color-brand)", letterSpacing: "0.05em", textTransform: "uppercase" as const }}>Products & Services</span>
      <h1 style={{ fontSize: 24, margin: "8px 0 8px" }}>Here&apos;s your product profile</h1>
      <p style={{ fontSize: 14, color: "var(--color-body)", lineHeight: 1.6, margin: "0 0 24px" }}>
        {products.length > 1
          ? `AI-mapped ${products.length} products from your details. Review each, then we'll build your ICP.`
          : "AI-mapped from your product details. Review, then we'll build your ICP."}
      </p>

      <div style={{ borderRadius: 12, border: "1px solid var(--color-border)", overflow: "hidden", marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 16px", borderBottom: "1px solid var(--color-border)" }}>
          {products.length > 1 ? (
            <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
              {products.map((p, i) => (
                <button key={i} type="button" onClick={() => setSelectedIndex(i)} title={p.name?.trim() || `Product ${i + 1}`}
                  style={{ width: 24, height: 24, borderRadius: "50%", fontSize: 11, fontWeight: 700, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", border: "none", cursor: "pointer", fontFamily: "inherit", transition: "all 150ms", background: i === selectedIndex ? "var(--color-brand)" : "var(--color-surface)", color: i === selectedIndex ? "#fff" : "var(--color-muted)" }}>
                  {i + 1}
                </button>
              ))}
            </div>
          ) : (
            <div style={{ width: 24, height: 24, borderRadius: "50%", background: "var(--color-brand)", color: "#fff", fontSize: 11, fontWeight: 700, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>1</div>
          )}
          <span style={{ fontSize: 14, fontWeight: 600, color: "var(--color-heading)" }}>{productName}</span>
          <span style={{ fontSize: 11, fontWeight: 500, color: "var(--color-brand)", border: "1px solid var(--color-border)", background: "var(--color-brand-tint)", borderRadius: 999, padding: "2px 10px" }}>{productBadge}</span>
          {products.length > 1 && (
            <span style={{ fontSize: 11, color: "var(--color-muted)", marginLeft: "auto", flexShrink: 0 }}>{selectedIndex + 1} / {products.length}</span>
          )}
        </div>

        <div style={{ display: "flex", gap: 6, padding: "10px 12px", borderBottom: "1px solid var(--color-border)", overflowX: "auto" as const }}>
          {tabNames.map((tab) => (
            <button key={tab} type="button" onClick={() => setActiveTab(tab)}
              style={{ flexShrink: 0, height: 28, padding: "0 12px", borderRadius: 999, fontSize: 12, fontWeight: 500, fontFamily: "inherit", cursor: "pointer", whiteSpace: "nowrap" as const, border: "none", transition: "all 150ms", ...(activeTab === tab ? { background: "var(--color-brand)", color: "#fff" } : { background: "transparent", color: "var(--color-muted)" }) }}>
              {tab}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: "16px" }}>
          {PS_TABS[activeTab].map((section, i) => (
            <PSField key={i} section={section} />
          ))}
        </div>
      </div>

      <button onClick={onNext} className="ob-primary-btn" style={PRIMARY_BTN}>
        Approve and Continue
      </button>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   STEP 14 — Personas summary (AI-drafted result)
══════════════════════════════════════════════════════════════════════ */
interface PersonaData {
  title: string;
  roleTag: string;
  subtitle: string;
  tabs: Record<string, PSSection[]>;
}

const PERSONAS: PersonaData[] = [
  {
    title: "VP Sales / Head of RevOps",
    roleTag: "Mid-Market B2B",
    subtitle: "Owns the outbound quota and is judged on pipeline generated, not activity — manual prospecting doesn't scale to their number.",
    tabs: {
      "Targeting": [
        { label: "Target Industries", content: ["B2B SaaS", "Sales & marketing technology", "Professional services"] },
        { label: "Company Size", content: "50–500 employees" },
        { label: "Tech Stack Signals", content: ["Salesforce or HubSpot CRM", "LinkedIn Sales Navigator", "An existing sales engagement tool being outgrown"] },
      ],
      "Persona": [
        { label: "Champion / Influencer", content: "VP Sales or Head of RevOps — owns the number, evaluates tools directly, and can approve budget without a lengthy procurement cycle." },
        { label: "What They Care About Most", content: ["Hitting pipeline targets without adding headcount", "Consistent messaging across a growing rep team"] },
        { label: "Objections They Raise", content: ["\"We already have a sales engagement platform\"", "\"Our reps won't adopt another tool\""] },
      ],
      "Pains & Triggers": [
        { label: "Primary Pain", content: "Reps spend hours per week manually personalizing outreach, and quality drops as volume increases — pipeline generation stalls below quota." },
        { label: "Trigger Events", content: ["Missed a quarterly pipeline target", "Just hired new reps who need to ramp fast", "Existing tool's reply rates have plateaued"] },
      ],
      "Messaging": [
        { label: "Opening Hook", content: "Your reps are spending hours a week hand-personalizing emails and still missing quota. AI can draft it in seconds without sounding generic — worth a look?" },
        { label: "CTA Style", content: "Request a 15-minute demo" },
      ],
      "Competitor Intel": [
        { label: "What They Currently Use", content: ["Existing sales engagement platform (Outreach, Salesloft, or similar)", "Manual templates in Gmail or Outlook"] },
        { label: "Switching Triggers", content: ["Reply rates plateau on the current tool", "Rep headcount grows faster than manual personalization can scale"] },
      ],
      "Channel Behavior": [
        { label: "Best Outreach Channel", content: "Email primary, LinkedIn for warm-up" },
        { label: "Best Time to Reach", content: "Tuesday–Thursday, 8–10am local time" },
      ],
      "Lead Scoring": [
        { label: "Warm Lead", content: "Asked about pricing or replied requesting more detail on personalization quality." },
        { label: "Meeting-Ready", content: "Explicitly asked for a demo and mentioned a specific pipeline target or rep count." },
      ],
    },
  },
  {
    title: "Founder or First Sales Hire",
    roleTag: "Early-Stage Startup",
    subtitle: "Wearing multiple hats with no dedicated SDR — needs outbound running without the setup overhead of enterprise tooling.",
    tabs: {
      "Targeting": [
        { label: "Target Industries", content: ["Early-stage B2B SaaS", "Technical founders selling to other businesses"] },
        { label: "Company Size", content: "1–20 employees" },
        { label: "Tech Stack Signals", content: ["Lightweight or no CRM yet", "Founder still doing outbound personally"] },
      ],
      "Persona": [
        { label: "Champion / Influencer", content: "Founder or first sales hire — self-serve buyer, evaluates and decides without a committee." },
        { label: "What They Care About Most", content: ["Getting outbound live fast with minimal setup", "Price that scales with a small early budget"] },
        { label: "Objections They Raise", content: ["\"We don't have time to configure another tool\"", "\"Budget is tight pre-revenue\""] },
      ],
      "Pains & Triggers": [
        { label: "Primary Pain", content: "Founder is personally writing every outbound email, which doesn't scale past a handful of prospects a day." },
        { label: "Trigger Events", content: ["Just raised a seed round and needs to show pipeline", "Manual outbound isn't keeping up with target account list"] },
      ],
      "Messaging": [
        { label: "Opening Hook", content: "Still writing every cold email yourself? Get AI-personalized sequences live today, no setup team required." },
        { label: "CTA Style", content: "Easy yes/no reply" },
      ],
      "Competitor Intel": [
        { label: "What They Currently Use", content: ["Manual emails from a personal inbox", "A spreadsheet-based prospect list"] },
        { label: "Switching Triggers", content: ["Outbound volume finally exceeds what one person can personalize manually"] },
      ],
      "Channel Behavior": [
        { label: "Best Outreach Channel", content: "Email and LinkedIn DM" },
        { label: "Best Time to Reach", content: "Evenings or early morning — founders often check messages off-hours" },
      ],
      "Lead Scoring": [
        { label: "Warm Lead", content: "Signed up for a trial or asked about self-serve pricing." },
        { label: "Meeting-Ready", content: "Mentioned a specific launch or fundraising timeline driving urgency." },
      ],
    },
  },
  {
    title: "Agency Owner",
    roleTag: "Fractional SDR Team",
    subtitle: "Runs outbound for multiple clients and needs to standardize quality without a separate setup per account.",
    tabs: {
      "Targeting": [
        { label: "Target Industries", content: ["B2B lead generation agencies", "Fractional SDR / outsourced sales teams"] },
        { label: "Company Size", content: "2–50 employees, managing 5–20 client accounts" },
        { label: "Tech Stack Signals", content: ["Multiple sending tools per client", "Client reporting spreadsheets or dashboards"] },
      ],
      "Persona": [
        { label: "Champion / Influencer", content: "Agency owner or operations lead — manages the tool stack across every client account." },
        { label: "What They Care About Most", content: ["Consistent quality across every client without per-client setup", "Margin protection on fixed-fee engagements"] },
        { label: "Objections They Raise", content: ["\"Our clients are all on different tools already\"", "\"Cost has to work across our whole client roster\""] },
      ],
      "Pains & Triggers": [
        { label: "Primary Pain", content: "Standing up outbound for each new client takes real setup time, and quality varies depending on which junior SDR is writing copy." },
        { label: "Trigger Events", content: ["Onboarding a new client and need outbound live fast", "A client complained about inconsistent messaging quality"] },
      ],
      "Messaging": [
        { label: "Opening Hook", content: "Standardize outbound quality across every client account — AI-personalized sequences without a per-client setup project." },
        { label: "CTA Style", content: "Offer a no-prep trial run on one client" },
      ],
      "Competitor Intel": [
        { label: "What They Currently Use", content: ["A mix of sending tools chosen per client", "Manual QA process for outbound copy quality"] },
        { label: "Switching Triggers", content: ["Client roster grows past what manual QA can support", "A client churns over inconsistent messaging"] },
      ],
      "Channel Behavior": [
        { label: "Best Outreach Channel", content: "Email and LinkedIn, multi-channel" },
        { label: "Best Time to Reach", content: "Weekday mid-morning or early afternoon" },
      ],
      "Lead Scoring": [
        { label: "Warm Lead", content: "Asked about multi-client or per-seat pricing." },
        { label: "Meeting-Ready", content: "Confirmed active client count and a specific onboarding timeline." },
      ],
    },
  },
];

const PERSONA_TAB_NAMES = Object.keys(PERSONAS[0].tabs);

function StepPersonas({ onNext }: { onNext: () => void }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [activeTab, setActiveTab] = useState(PERSONA_TAB_NAMES[0]);
  const persona = PERSONAS[selectedIndex];

  return (
    <div className="ob-card" style={{ ...CARD, maxWidth: 580 }}>
      <span style={{ fontSize: 12, fontWeight: 700, color: "var(--color-brand)", letterSpacing: "0.05em", textTransform: "uppercase" as const }}>Personas</span>
      <h1 style={{ fontSize: 24, margin: "8px 0 8px" }}>Here&apos;s who you&apos;re selling to</h1>
      <p style={{ fontSize: 14, color: "var(--color-body)", lineHeight: 1.6, margin: "0 0 24px" }}>
        {PERSONAS.length > 1
          ? `AI built ${PERSONAS.length} buyer personas from your ICP. Review each, then we'll draft your outreach campaigns.`
          : "AI built a buyer persona from your ICP. Review it, then we'll draft your outreach campaigns."}
      </p>

      <div style={{ borderRadius: 12, border: "1px solid var(--color-border)", overflow: "hidden", marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "14px 16px", borderBottom: "1px solid var(--color-border)" }}>
          {PERSONAS.length > 1 ? (
            <div style={{ display: "flex", gap: 6, flexShrink: 0, marginTop: 1 }}>
              {PERSONAS.map((p, i) => (
                <button key={i} type="button" onClick={() => setSelectedIndex(i)} title={p.title}
                  style={{ width: 24, height: 24, borderRadius: "50%", fontSize: 11, fontWeight: 700, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", border: "none", cursor: "pointer", fontFamily: "inherit", transition: "all 150ms", background: i === selectedIndex ? "var(--color-brand)" : "var(--color-surface)", color: i === selectedIndex ? "#fff" : "var(--color-muted)" }}>
                  {i + 1}
                </button>
              ))}
            </div>
          ) : (
            <div style={{ width: 24, height: 24, borderRadius: "50%", background: "var(--color-brand)", color: "#fff", fontSize: 11, fontWeight: 700, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", marginTop: 1 }}>1</div>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" as const }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: "var(--color-heading)" }}>{persona.title}</span>
              <span style={{ fontSize: 11, fontWeight: 500, color: "var(--color-brand)", border: "1px solid var(--color-border)", background: "var(--color-brand-tint)", borderRadius: 999, padding: "2px 10px" }}>{persona.roleTag}</span>
            </div>
            <p style={{ fontSize: 12, color: "var(--color-muted)", lineHeight: 1.5, margin: "4px 0 0" }}>{persona.subtitle}</p>
          </div>
          {PERSONAS.length > 1 && (
            <span style={{ fontSize: 11, color: "var(--color-muted)", flexShrink: 0, marginTop: 1 }}>{selectedIndex + 1} / {PERSONAS.length}</span>
          )}
        </div>

        <div style={{ display: "flex", gap: 6, padding: "10px 12px", borderBottom: "1px solid var(--color-border)", overflowX: "auto" as const }}>
          {PERSONA_TAB_NAMES.map((tab) => (
            <button key={tab} type="button" onClick={() => setActiveTab(tab)}
              style={{ flexShrink: 0, height: 28, padding: "0 12px", borderRadius: 999, fontSize: 12, fontWeight: 500, fontFamily: "inherit", cursor: "pointer", whiteSpace: "nowrap" as const, border: "none", transition: "all 150ms", ...(activeTab === tab ? { background: "var(--color-brand)", color: "#fff" } : { background: "transparent", color: "var(--color-muted)" }) }}>
              {tab}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: "16px" }}>
          {persona.tabs[activeTab].map((section, i) => (
            <PSField key={i} section={section} />
          ))}
        </div>
      </div>

      <button onClick={onNext} className="ob-primary-btn" style={PRIMARY_BTN}>
        Approve and Continue
      </button>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   STEP 15 — Outreach Campaign summary (AI-drafted result)
══════════════════════════════════════════════════════════════════════ */
interface CampaignStep { label: string; day: string; message: string }
interface Campaign { channel: "LinkedIn" | "Email"; name: string; flow: string; steps: CampaignStep[] }

const CAMPAIGNS: Campaign[] = [
  {
    channel: "LinkedIn",
    name: "LinkedIn campaign",
    flow: "Connection → conversation → value → meeting",
    steps: [
      { label: "Connection request", day: "DAY 0", message: "Hey {first_name} — keep seeing {company} pop up in my feed, would love to connect 👋" },
      { label: "Conversation starter", day: "DAY 2", message: "Thanks for connecting, {first_name}! Curious how {company} is handling outbound today — worth a quick chat?" },
      { label: "Value message", day: "DAY 5", message: "No pressure either way — here's a quick resource on scaling personalized outreach without adding headcount, thought it might be useful for {company}." },
      { label: "Meeting ask", day: "DAY 8", message: "If this is relevant, happy to grab 15 minutes to show you how it'd work for {company} specifically. Worth a look?" },
    ],
  },
  {
    channel: "Email",
    name: "Email campaign",
    flow: "Intro → follow-up → case study → breakup",
    steps: [
      { label: "Intro email", day: "DAY 0", message: "Hi {first_name}, noticed {company} is scaling outbound — most teams your size are stuck manually personalizing every email. Worth 15 minutes to see a faster way?" },
      { label: "Follow-up", day: "DAY 3", message: "Following up on my note below — happy to share exactly how teams like {company} cut manual prospecting time. Interested?" },
      { label: "Case study", day: "DAY 7", message: "Thought this might help — a team similar to {company} cut time-to-first-send from weeks to same-day. Want the details?" },
      { label: "Breakup", day: "DAY 12", message: "Don't want to keep clogging your inbox — if now isn't the right time, no worries. I'll leave the door open for {company}." },
    ],
  },
  {
    channel: "Email",
    name: "Founder outreach",
    flow: "Personal note → proof → soft close",
    steps: [
      { label: "Personal note", day: "DAY 0", message: "Hi {first_name}, founder to founder — saw {company} is growing fast and figured outbound might be manual right now. Mind if I share what's worked for teams like yours?" },
      { label: "Proof point", day: "DAY 4", message: "Quick one — teams similar to {company} got outbound live same-day without adding a hire. Want me to walk you through it?" },
      { label: "Soft close", day: "DAY 9", message: "No worries if the timing's off for {company} — just say the word if you'd like to revisit this later." },
    ],
  },
  {
    channel: "LinkedIn",
    name: "Warm re-engagement",
    flow: "Reminder → new angle → close",
    steps: [
      { label: "Reminder", day: "DAY 0", message: "Hey {first_name}, circling back — still think this could help {company} scale outbound without extra headcount." },
      { label: "New angle", day: "DAY 4", message: "Different angle this time — curious how {company} currently handles personalization at volume? Happy to share what's worked elsewhere." },
      { label: "Close", day: "DAY 8", message: "Totally fine if it's not a priority for {company} right now — I'll check back down the line." },
    ],
  },
];

function ChannelIcon({ channel }: { channel: Campaign["channel"] }) {
  if (channel === "LinkedIn") {
    return (
      <div style={{ width: 36, height: 36, borderRadius: 10, background: "#0A66C2", color: "#fff", fontSize: 13, fontWeight: 700, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>in</div>
    );
  }
  return (
    <div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--color-brand)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 6-10 7L2 6" />
      </svg>
    </div>
  );
}

function StepCardContent({ step }: { step: CampaignStep }) {
  return (
    <>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 12 }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: "var(--color-heading)" }}>{step.label}</span>
        <span style={{ fontSize: 11, fontWeight: 600, color: "var(--color-brand)", background: "var(--color-brand-tint)", borderRadius: 999, padding: "3px 10px", flexShrink: 0 }}>{step.day}</span>
      </div>
      <div style={{ background: "var(--color-surface)", borderRadius: 12, padding: "14px 16px" }}>
        <p style={{ fontSize: 14, color: "var(--color-heading)", lineHeight: 1.6, margin: 0 }}>{step.message}</p>
      </div>
    </>
  );
}

function StepOutreachCampaign({ onNext }: { onNext: () => void }) {
  const [campaignIndex, setCampaignIndex] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [skipTransition, setSkipTransition] = useState(false);
  const [containerWidth, setContainerWidth] = useState(400);
  const containerRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const dragXRef = useRef(0);
  const isDraggingRef = useRef(false);
  const wheelTimeoutRef = useRef<number | null>(null);
  const touchStartXRef = useRef<number | null>(null);
  const campaign = CAMPAIGNS[campaignIndex];
  const step = campaign.steps[stepIndex];
  const hasPrev = stepIndex > 0;
  const hasNext = stepIndex < campaign.steps.length - 1;

  useEffect(() => {
    function measure() {
      if (containerRef.current) setContainerWidth(containerRef.current.offsetWidth);
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  function updateDragX(v: number) {
    dragXRef.current = v;
    setDragX(v);
  }

  // Writes the transform straight to the DOM during an active gesture so every
  // tick doesn't round-trip through React state/re-render — keeps the drag smooth.
  function setLiveOffset(v: number) {
    dragXRef.current = v;
    if (stripRef.current) stripRef.current.style.transform = `translateX(${-containerWidth + v}px)`;
  }

  function setDragging(v: boolean) {
    isDraggingRef.current = v;
    setIsDragging(v);
  }

  function selectCampaign(i: number) {
    setCampaignIndex(i);
    setStepIndex(0);
  }

  function animateTo(target: number, commit: () => void) {
    updateDragX(target);
    window.setTimeout(() => {
      setSkipTransition(true);
      commit();
      updateDragX(0);
      requestAnimationFrame(() => requestAnimationFrame(() => setSkipTransition(false)));
    }, 160);
  }

  function goToStep(i: number) {
    setStepIndex(i);
  }

  function prevStep() {
    if (hasPrev) animateTo(containerWidth, () => setStepIndex((i) => i - 1));
  }

  function nextStep() {
    if (hasNext) animateTo(-containerWidth, () => setStepIndex((i) => i + 1));
  }

  function finishGesture() {
    const threshold = containerWidth * 0.25;
    const x = dragXRef.current;
    if (x <= -threshold && hasNext) animateTo(-containerWidth, () => setStepIndex((i) => i + 1));
    else if (x >= threshold && hasPrev) animateTo(containerWidth, () => setStepIndex((i) => i - 1));
    else updateDragX(0);
  }

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    function onWheel(e: WheelEvent) {
      if (e.ctrlKey) return;
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      e.preventDefault();
      if (wheelTimeoutRef.current) window.clearTimeout(wheelTimeoutRef.current);
      const maxLeft = hasNext ? containerWidth : 0;
      const maxRight = hasPrev ? containerWidth : 0;
      setLiveOffset(Math.max(-maxLeft, Math.min(maxRight, dragXRef.current - e.deltaX)));
      if (!isDraggingRef.current) setDragging(true);
      wheelTimeoutRef.current = window.setTimeout(() => {
        setDragging(false);
        finishGesture();
      }, 70);
    }
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [hasPrev, hasNext, containerWidth]);

  // Pointer-based swipe for touch, pen, and mouse click-drag alike —
  // wheel events (trackpad) are handled separately above.
  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    touchStartXRef.current = e.clientX;
    setDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (touchStartXRef.current === null) return;
    const delta = e.clientX - touchStartXRef.current;
    const maxLeft = hasNext ? containerWidth : 0;
    const maxRight = hasPrev ? containerWidth : 0;
    setLiveOffset(Math.max(-maxLeft, Math.min(maxRight, delta)));
  }

  function handlePointerUp() {
    if (touchStartXRef.current === null) return;
    touchStartXRef.current = null;
    setDragging(false);
    finishGesture();
  }

  return (
    <div className="ob-card" style={{ ...CARD, maxWidth: 480 }}>
      <span style={{ fontSize: 12, fontWeight: 700, color: "var(--color-brand)", letterSpacing: "0.05em", textTransform: "uppercase" as const }}>Outreach Campaign</span>
      <h1 style={{ fontSize: 24, margin: "8px 0 8px" }}>Here&apos;s your outreach campaigns</h1>
      <p style={{ fontSize: 14, color: "var(--color-body)", lineHeight: 1.6, margin: "0 0 20px" }}>
        AI drafted {CAMPAIGNS.length} campaigns from your ICP and personas. Review each step before you launch.
      </p>

      <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
        {CAMPAIGNS.map((c, i) => (
          <button key={i} type="button" onClick={() => selectCampaign(i)} title={c.name}
            style={{ width: 24, height: 24, borderRadius: "50%", fontSize: 11, fontWeight: 700, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", border: "none", cursor: "pointer", fontFamily: "inherit", transition: "all 150ms", background: i === campaignIndex ? "var(--color-brand)" : "var(--color-surface)", color: i === campaignIndex ? "#fff" : "var(--color-muted)" }}>
            {i + 1}
          </button>
        ))}
      </div>

      <span style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--color-brand)", letterSpacing: "0.05em", textTransform: "uppercase" as const, marginBottom: 10 }}>
        Campaign {campaignIndex + 1} of {CAMPAIGNS.length}
      </span>

      <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 16 }}>
        <ChannelIcon channel={campaign.channel} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--color-heading)" }}>{campaign.name}</div>
          <p style={{ fontSize: 12, color: "var(--color-muted)", lineHeight: 1.4, margin: "2px 0 0" }}>{campaign.flow}</p>
        </div>
        <span style={{ fontSize: 11, fontWeight: 500, color: "var(--color-body)", background: "var(--color-surface)", borderRadius: 999, padding: "4px 10px", flexShrink: 0 }}>{campaign.steps.length} steps</span>
      </div>

      <div
        ref={containerRef}
        style={{ position: "relative", borderRadius: 14, border: "1px solid var(--color-border)", marginBottom: 16, minHeight: 180, overflow: "hidden", cursor: isDragging ? "grabbing" : "grab" }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <div ref={stripRef} style={{ display: "flex", width: containerWidth * 3, transform: `translateX(${-containerWidth + dragX}px)`, transition: (isDragging || skipTransition) ? "none" : "transform 160ms var(--ease-apple)", userSelect: "none" as const, touchAction: "pan-y" as const }}>
          <div style={{ width: containerWidth, flexShrink: 0, padding: "16px", boxSizing: "border-box" as const }}>
            {hasPrev && <StepCardContent step={campaign.steps[stepIndex - 1]} />}
          </div>
          <div style={{ width: containerWidth, flexShrink: 0, padding: "16px", boxSizing: "border-box" as const }}>
            <StepCardContent step={step} />
          </div>
          <div style={{ width: containerWidth, flexShrink: 0, padding: "16px", boxSizing: "border-box" as const }}>
            {hasNext && <StepCardContent step={campaign.steps[stepIndex + 1]} />}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, marginBottom: 20 }}>
        <button type="button" onClick={prevStep} disabled={stepIndex === 0} aria-label="Previous step"
          style={{ width: 28, height: 28, borderRadius: "50%", border: "none", background: "var(--color-surface)", color: "var(--color-muted)", cursor: stepIndex === 0 ? "not-allowed" : "pointer", opacity: stepIndex === 0 ? 0.4 : 1, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "inherit" }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {campaign.steps.map((_, i) => (
            <button key={i} type="button" onClick={() => goToStep(i)} aria-label={`Step ${i + 1}`}
              style={{ width: i === stepIndex ? 22 : 8, height: 8, borderRadius: 999, border: "none", padding: 0, cursor: "pointer", background: i === stepIndex ? "var(--color-brand)" : "var(--color-border-strong)", transition: "width 200ms var(--ease-apple), background 200ms var(--ease-apple)" }} />
          ))}
        </div>
        <button type="button" onClick={nextStep} disabled={stepIndex === campaign.steps.length - 1} aria-label="Next step"
          style={{ width: 28, height: 28, borderRadius: "50%", border: "none", background: "var(--color-surface)", color: "var(--color-muted)", cursor: stepIndex === campaign.steps.length - 1 ? "not-allowed" : "pointer", opacity: stepIndex === campaign.steps.length - 1 ? 0.4 : 1, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "inherit" }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
        </button>
      </div>

      <button onClick={onNext} className="ob-primary-btn" style={PRIMARY_BTN}>
        Approve and Continue
      </button>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   STEP 16 — All set (final confirmation)
══════════════════════════════════════════════════════════════════════ */
function StepAllSet({ onNext }: { onNext: () => void }) {
  return (
    <div className="ob-card" style={{ ...CARD, maxWidth: 440, textAlign: "center" as const }}>
      <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--color-brand-tint)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
      </div>
      <span style={{ fontSize: 12, fontWeight: 700, color: "var(--color-brand)", letterSpacing: "0.05em", textTransform: "uppercase" as const }}>All Set</span>
      <h1 style={{ fontSize: 26, margin: "8px 0 8px" }}>You&apos;re all set!</h1>
      <p style={{ fontSize: 14, color: "var(--color-body)", lineHeight: 1.6, margin: "0 0 28px" }}>
        Your Knowledge Center, ICP, personas, and outreach campaigns are ready. Time to start sending.
      </p>
      <button onClick={onNext} className="ob-primary-btn" style={PRIMARY_BTN}>
        Continue
      </button>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   STEP 17 — Cleared for launch (final timeline)
══════════════════════════════════════════════════════════════════════ */
interface LaunchTimelineItem { when: string; title: string; desc: string; filled: boolean }

const LAUNCH_TIMELINE: LaunchTimelineItem[] = [
  { when: "Today · Day 0", title: "Infrastructure provisioned", desc: "Domains ordered, DNS auto-configured, mailboxes created.", filled: true },
  { when: "Today · Day 0", title: "LinkedIn campaign launches", desc: "Connection requests start going out — no warmup needed.", filled: true },
  { when: "Days 1–14", title: "Mailbox warmup", desc: "We build sender reputation automatically.", filled: false },
  { when: "Week 1", title: "RTS leads activated", desc: "Ready-to-send leads matched to your ICP flow in.", filled: false },
  { when: "Week 2", title: "BeBop added", desc: "Layers into your outreach to widen reach.", filled: false },
  { when: "Week 3", title: "Performance report", desc: "See replies, meetings booked, and pipeline generated so far.", filled: false },
];

function StepClearedForLaunch({ onFinish }: { onFinish: () => void }) {
  return (
    <div className="ob-card" style={{ ...CARD, maxWidth: 520, textAlign: "center" as const }}>
      <div style={{ width: 72, height: 72, borderRadius: 20, background: "var(--color-page)", boxShadow: "var(--shadow-elevated)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" /><path d="M8.5 12.5l2.5 2.5 4.5-5" />
        </svg>
      </div>
      <span style={{ fontSize: 12, fontWeight: 700, color: "var(--color-brand)", letterSpacing: "0.05em", textTransform: "uppercase" as const }}>Onboarding Complete</span>
      <h1 style={{ fontSize: 28, fontWeight: 800, margin: "8px 0 8px" }}>Cleared for launch</h1>
      <p style={{ fontSize: 14, color: "var(--color-body)", lineHeight: 1.6, margin: "0 0 28px" }}>
        Your campaigns are queued. No action needed from you.
      </p>

      <div style={{ textAlign: "left" as const, marginBottom: 28 }}>
        {LAUNCH_TIMELINE.map((item, i) => (
          <div key={i} style={{ position: "relative", paddingLeft: 26, paddingBottom: i < LAUNCH_TIMELINE.length - 1 ? 26 : 0 }}>
            {i < LAUNCH_TIMELINE.length - 1 && (
              <div style={{ position: "absolute", left: 5, top: 14, bottom: -2, width: 2, background: item.filled ? "var(--color-brand)" : "var(--color-border-strong)" }} />
            )}
            <div style={{ position: "absolute", left: 0, top: 2, width: 12, height: 12, borderRadius: "50%", boxSizing: "border-box" as const, background: item.filled ? "var(--color-brand)" : "var(--color-page)", border: item.filled ? "none" : "2px solid var(--color-border-strong)" }} />
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--color-brand)", letterSpacing: "0.05em", textTransform: "uppercase" as const, marginBottom: 4 }}>{item.when}</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--color-heading)", marginBottom: 2 }}>{item.title}</div>
            <p style={{ fontSize: 13, color: "var(--color-muted)", lineHeight: 1.5, margin: 0 }}>{item.desc}</p>
          </div>
        ))}
      </div>

      <button onClick={onFinish} className="ob-primary-btn" style={PRIMARY_BTN}>
        Go to app
      </button>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   STEP 18 — ICP Scoring Matrix (AI-drafted result)
══════════════════════════════════════════════════════════════════════ */
const SCORE_DIMENSIONS = ["Market Size", "Product Fit", "Pain Urgency", "Reachability", "Competition"] as const;
type ScoreDimension = (typeof SCORE_DIMENSIONS)[number];

type Recommendation = "Launch First" | "Test Small" | "Defer";
const RECOMMENDATION_BADGE: Record<Recommendation, React.CSSProperties> = {
  "Launch First": { color: "var(--color-success)", background: "rgba(7,188,12,0.1)", border: "1px solid rgba(7,188,12,0.3)" },
  "Test Small": { color: "var(--color-warning)", background: "rgba(241,196,15,0.15)", border: "1px solid rgba(241,196,15,0.35)" },
  Defer: { color: "var(--color-muted)", background: "var(--color-surface)", border: "1px solid var(--color-border)" },
};

const MONO_FONT = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";

function scoreTone(value: number): string {
  if (value >= 8) return "var(--color-success)";
  if (value >= 5) return "var(--color-warning)";
  return "var(--color-error)";
}

function overallScore(icp: IcpScore): number {
  const values = SCORE_DIMENSIONS.map((d) => icp.scores[d]);
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

interface MarketSegment {
  name: string;
  size: string;
}

interface IcpScore {
  name: string;
  scores: Record<ScoreDimension, number>;
  recommendation: Recommendation;
}

const TAM_DESCRIPTION =
  "The total addressable market centres on B2B companies running outbound sales motions who still personalize outreach manually or through generic templates. The core pain — reps hand-crafting sequences that convert at a fraction of what personalized, AI-assisted outreach could — is universal across any company running structured outbound. The serviceable market is bounded by company stage (teams big enough to run outbound at volume but not yet locked into enterprise sales-engagement contracts), function (dedicated outbound ownership, whether in-house or agency-run), and appetite for AI-assisted messaging. Rough combined TAM across the three segments is 175,000–230,000 companies and agencies actively running B2B outbound today.";

const MARKET_SEGMENTS: MarketSegment[] = [
  { name: "Mid-Market B2B SaaS, Fintech & Professional Services (50–500 employees)", size: "~90,000–120,000 companies" },
  { name: "Early-Stage Startups running founder-led sales", size: "~70,000–90,000 companies" },
  { name: "Outbound Agencies & Fractional SDR Teams", size: "~15,000–20,000 practices managing 5–20 client accounts" },
];

const ICP_SCORES: IcpScore[] = [
  {
    name: "VP Sales / Head of RevOps — Mid-Market B2B",
    scores: { "Market Size": 8, "Product Fit": 10, "Pain Urgency": 9, Reachability: 8, Competition: 6 },
    recommendation: "Launch First",
  },
  {
    name: "Founder-led Sales — Early-Stage Startups",
    scores: { "Market Size": 9, "Product Fit": 6, "Pain Urgency": 6, Reachability: 6, Competition: 7 },
    recommendation: "Test Small",
  },
  {
    name: "Agency / Fractional SDR Teams",
    scores: { "Market Size": 3, "Product Fit": 6, "Pain Urgency": 4, Reachability: 3, Competition: 5 },
    recommendation: "Defer",
  },
];

const GRAPH_LEGEND: { label: string; color: string }[] = [
  { label: "Company", color: "var(--color-brand)" },
  { label: "Product / service", color: "var(--color-success)" },
  { label: "ICP", color: "var(--color-warning)" },
];

function IcpGraph({ productName, icps }: { productName: string; icps: IcpScore[] }) {
  const companyPos = { x: 6, y: 50 };
  const productPos = { x: 40, y: 50 };
  const icpYs = icps.map((_, i) => (icps.length === 1 ? 50 : 15 + (i * 70) / (icps.length - 1)));

  return (
    <div style={{ position: "relative", width: "100%", height: 210, marginTop: 8 }}>
      <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: "absolute", inset: 0 }}>
        <path d={`M ${companyPos.x} ${companyPos.y} L ${productPos.x} ${productPos.y}`} stroke="var(--color-border-strong)" strokeWidth="0.6" fill="none" vectorEffect="non-scaling-stroke" />
        {icpYs.map((y, i) => (
          <path key={i} d={`M ${productPos.x} ${productPos.y} C 58 ${productPos.y}, 58 ${y}, 70 ${y}`} stroke="var(--color-border-strong)" strokeWidth="0.6" fill="none" vectorEffect="non-scaling-stroke" />
        ))}
      </svg>

      <div style={{ position: "absolute", left: `${companyPos.x}%`, top: `${companyPos.y}%`, transform: "translateY(-50%)", display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ width: 14, height: 14, borderRadius: "50%", background: "var(--color-brand)", flexShrink: 0 }} />
        <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--color-heading)", whiteSpace: "nowrap" as const }}>Company</span>
      </div>

      <div style={{ position: "absolute", left: `${productPos.x}%`, top: `${productPos.y}%`, transform: "translateY(-50%)", display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ width: 12, height: 12, borderRadius: "50%", background: "var(--color-success)", flexShrink: 0 }} />
        <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--color-heading)", whiteSpace: "nowrap" as const }}>{productName}</span>
      </div>

      {icps.map((icp, i) => (
        <div key={icp.name} style={{ position: "absolute", left: "70%", top: `${icpYs[i]}%`, transform: "translateY(-50%)", display: "flex", alignItems: "center", gap: 8, maxWidth: "34%" }}>
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--color-warning)", flexShrink: 0 }} />
          <span style={{ fontSize: 12, color: "var(--color-heading)", lineHeight: 1.3 }}>{icp.name}</span>
        </div>
      ))}
    </div>
  );
}

const MATRIX_GRID_COLUMNS = `28px 1.7fr repeat(${SCORE_DIMENSIONS.length}, 0.62fr) 0.62fr 0.7fr`;
const MATRIX_HEADER_CELL: React.CSSProperties = {
  fontSize: 10, fontWeight: 700, color: "var(--color-muted)", letterSpacing: "0.04em", textTransform: "uppercase" as const,
  fontFamily: MONO_FONT, whiteSpace: "nowrap" as const, overflow: "hidden", textOverflow: "ellipsis",
};

function MatrixScoreCell({ value }: { value: number }) {
  const tone = scoreTone(value);
  return (
    <span style={{ fontFamily: MONO_FONT, fontSize: 13, whiteSpace: "nowrap" as const }}>
      <span style={{ fontWeight: 700, color: tone }}>{value}</span>
      <span style={{ color: "var(--color-subtle)" }}>/10</span>
    </span>
  );
}

function IcpMatrix({ icps }: { icps: IcpScore[] }) {
  return (
    <div style={{ overflowX: "auto" as const }}>
      <div style={{ minWidth: 760, borderRadius: 14, border: "1px solid var(--color-border)", overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: MATRIX_GRID_COLUMNS, gap: 10, padding: "10px 14px", background: "var(--color-surface)", borderBottom: "1px solid var(--color-border)" }}>
          <span style={MATRIX_HEADER_CELL}>#</span>
          <span style={MATRIX_HEADER_CELL}>ICP</span>
          {SCORE_DIMENSIONS.map((d) => <span key={d} style={MATRIX_HEADER_CELL} title={d}>{d}</span>)}
          <span style={MATRIX_HEADER_CELL}>Score</span>
          <span style={MATRIX_HEADER_CELL}>Action</span>
        </div>
        {icps.map((icp, i) => (
          <div key={icp.name} style={{ display: "grid", gridTemplateColumns: MATRIX_GRID_COLUMNS, gap: 10, alignItems: "center", padding: "18px 14px", borderBottom: i < icps.length - 1 ? "1px solid var(--color-border)" : "none" }}>
            <span style={{ fontSize: i === 0 ? 15 : 12.5, fontWeight: 700, color: i === 0 ? "var(--color-warning)" : "var(--color-muted)" }}>
              {i === 0 ? "★" : i + 1}
            </span>
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--color-heading)", lineHeight: 1.4, marginBottom: 8, paddingRight: 8 }}>{icp.name}</div>
              <span style={{ display: "inline-block", fontFamily: MONO_FONT, fontSize: 10.5, fontWeight: 700, padding: "3px 9px", borderRadius: 6, whiteSpace: "nowrap" as const, ...RECOMMENDATION_BADGE[icp.recommendation] }}>{icp.recommendation}</span>
            </div>
            {SCORE_DIMENSIONS.map((d) => <MatrixScoreCell key={d} value={icp.scores[d]} />)}
            <span style={{ fontFamily: MONO_FONT, fontSize: 17, fontWeight: 800, color: scoreTone(overallScore(icp)) }}>
              {overallScore(icp).toFixed(1)}
            </span>
            <button type="button" className="ob-primary-btn" style={{ ...PRIMARY_BTN, width: "auto", padding: "7px 16px", fontSize: 12.5, justifySelf: "start" as const }}>
              Plan
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function StepTamIcp({ products, onNext }: { products: Product[]; onNext: () => void }) {
  const [view, setView] = useState<"Graph" | "Matrix">("Graph");
  const productName = products[0]?.name?.trim() || "Your product";

  return (
    <div className="ob-card" style={{ ...CARD, maxWidth: 760 }}>
      <span style={{ fontSize: 12, fontWeight: 700, color: "var(--color-brand)", letterSpacing: "0.05em", textTransform: "uppercase" as const }}>Ideal Customer Profile</span>

      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" as const, margin: "8px 0 8px" }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0 }}>ICP Scoring Matrix</h1>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <div style={{ display: "inline-flex", background: "var(--color-surface)", borderRadius: 999, padding: 3, gap: 2 }}>
            {(["Graph", "Matrix"] as const).map((v) => (
              <button key={v} type="button" onClick={() => setView(v)} style={{
                border: "none", borderRadius: 999, padding: "6px 14px", fontSize: 12.5, fontWeight: 600, fontFamily: "inherit", cursor: "pointer", transition: "all 150ms",
                background: view === v ? "var(--color-page)" : "transparent",
                color: view === v ? "var(--color-brand)" : "var(--color-muted)",
                boxShadow: view === v ? "var(--shadow-card)" : "none",
              }}>
                {v}
              </button>
            ))}
          </div>
        </div>
      </div>

      <p style={{ fontSize: 14, color: "var(--color-body)", lineHeight: 1.6, margin: "0 0 20px" }}>
        AI scores each ICP on 5 dimensions to identify which to launch first, test small, or defer.
      </p>

      <div style={{ borderRadius: 14, border: "1px solid var(--color-border)", padding: "20px 22px", marginBottom: 20 }}>
        <p style={{ fontSize: 13.5, color: "var(--color-body)", lineHeight: 1.7, margin: "0 0 16px" }}>{TAM_DESCRIPTION}</p>
        <div style={{ fontSize: 10.5, fontWeight: 700, color: "var(--color-muted)", letterSpacing: "0.05em", textTransform: "uppercase" as const, marginBottom: 10 }}>
          Market Segments <span style={{ fontWeight: 400, textTransform: "none" as const, letterSpacing: "normal" }}>· sizes are rough estimates</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {MARKET_SEGMENTS.map((seg) => (
            <div key={seg.name} style={{ padding: "10px 14px", borderRadius: 10, background: "var(--color-surface)", fontSize: 12.5, lineHeight: 1.5 }}>
              <span style={{ fontWeight: 600, color: "var(--color-heading)" }}>{seg.name}</span>
              <span style={{ color: "var(--color-muted)" }}> · {seg.size}</span>
            </div>
          ))}
        </div>
      </div>

      {view === "Graph" ? (
        <div style={{ borderRadius: 14, border: "1px solid var(--color-border)", padding: 20 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: "10px 14px", border: "1px solid var(--color-border)", borderRadius: 10, background: "var(--color-page)" }}>
              {GRAPH_LEGEND.map((l) => (
                <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 9, height: 9, borderRadius: "50%", background: l.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: "var(--color-muted)", whiteSpace: "nowrap" as const }}>{l.label}</span>
                </div>
              ))}
            </div>
            <button type="button" className="ob-ghost-btn" style={{ ...GHOST_BTN, width: "auto", padding: "6px 12px", fontSize: 12, border: "1px solid var(--color-border)", borderRadius: 8 }}>
              Fit
            </button>
          </div>
          <IcpGraph productName={productName} icps={ICP_SCORES} />
        </div>
      ) : (
        <IcpMatrix icps={ICP_SCORES} />
      )}

      <button onClick={onNext} className="ob-primary-btn" style={{ ...PRIMARY_BTN, marginTop: 24 }}>
        Approve and Continue
      </button>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   MAIN SHELL
══════════════════════════════════════════════════════════════════════ */
type StepName =
  | "splash"
  | "welcome"
  | "website" | "products" | "research_summary" | "starting_research"
  | "infra_intro"
  | "primary_domain" | "forwarding_domain" | "volume"
  | "senders" | "split" | "infra_summary" | "connections_intro" | "connect" | "connect_linkedin" | "connect_calendar" | "invite" | "connections_summary" | "review_intro" | "review_order" | "researching" | "company_research" | "products_services" | "tam_icp" | "personas" | "outreach_campaign" | "all_set" | "cleared_for_launch";

const STEP_ORDER: StepName[] = [
  "website", "products", "research_summary",
  "primary_domain", "forwarding_domain", "volume",
  "senders", "split", "infra_summary", "connect", "connect_linkedin", "connect_calendar", "invite", "connections_summary", "review_intro", "review_order", "researching", "company_research", "products_services", "tam_icp", "personas", "outreach_campaign",
];

/* ─── Resume draft ──────────────────────────────────────────────── */
const ALL_STEPS: StepName[] = [
  "splash", "welcome", "website", "products", "research_summary", "starting_research",
  "infra_intro", "primary_domain", "forwarding_domain", "volume", "senders", "split", "infra_summary",
  "connections_intro", "connect", "connect_linkedin", "connect_calendar", "invite", "connections_summary",
  "review_intro", "review_order", "researching", "company_research",
  "products_services", "tam_icp", "personas", "outreach_campaign",
  "all_set", "cleared_for_launch",
];

// Last step of Section 1. Leaving before this means nothing worth resuming
// exists yet; leaving at or after it is always "at least one section done"
// since the flow is linear — no per-section branching needed.
const RESUME_THRESHOLD = ALL_STEPS.indexOf("products");

interface OnboardingDraft {
  savedAt: string;
  step: StepName;
  website: string;
  products: Product[];
  primaryDomain: string;
  forwardingDomain: string;
  selectedPackage: PackageKey;
  senders: Sender[];
  connectedAccounts: string[];
  connectedCalendars: string[];
  invitees: Invitee[];
  confirmedDomains: string[];
  confirmedMailboxes: string[];
}

const ONBOARDING_DRAFT_KEY = "ob_pending_progress";

function loadDraft(): OnboardingDraft | null {
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem(ONBOARDING_DRAFT_KEY) : null;
    if (!raw) return null;
    const parsed = JSON.parse(raw) as OnboardingDraft;
    if (!parsed.savedAt || !parsed.step) return null;
    return parsed;
  } catch { return null; }
}
function saveDraft(draft: OnboardingDraft): void {
  try { localStorage.setItem(ONBOARDING_DRAFT_KEY, JSON.stringify(draft)); } catch {}
}
function clearDraft(): void {
  try { localStorage.removeItem(ONBOARDING_DRAFT_KEY); } catch {}
}

// The phase the user was last working on, for the resume screen's copy.
function lastPhaseLabel(step: StepName): string | null {
  const stepIdx = ALL_STEPS.indexOf(step);
  let label: string | null = null;
  for (const phase of PHASES) {
    const phaseStartIdx = Math.min(...phase.steps.map((s) => ALL_STEPS.indexOf(s)));
    if (phaseStartIdx <= stepIdx) label = phase.label;
  }
  return label;
}

function timeAgo(iso: string): string {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function StepResume({ draft, onContinue }: { draft: OnboardingDraft; onContinue: () => void }) {
  const phase = lastPhaseLabel(draft.step);
  return (
    <div className="ob-card" style={{ ...CARD, maxWidth: 480, textAlign: "center" as const }}>
      <span style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--color-brand)", letterSpacing: "0.05em", textTransform: "uppercase" as const, marginBottom: 8 }}>
        Welcome back
      </span>
      <h1 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 10px" }}>Pick up where you left off</h1>
      <p style={{ fontSize: 14, color: "var(--color-body)", lineHeight: 1.6, margin: "0 0 4px" }}>
        {phase ? `Last time, you were working on ${phase}.` : "You have some unfinished setup."}
      </p>
      <p style={{ fontSize: 12.5, color: "var(--color-muted)", margin: "0 0 28px" }}>Saved {timeAgo(draft.savedAt)}</p>
      <button onClick={onContinue} style={PRIMARY_BTN} className="ob-primary-btn">
        Continue
      </button>
    </div>
  );
}

export function OnboardingShell() {
  const router = useRouter();

  // Starts identical on server and client (no draft applied yet) so hydration
  // never mismatches; the actual localStorage check happens after mount below.
  const [draft, setDraft] = useState<OnboardingDraft | null>(null);
  const [showResume, setShowResume] = useState(false);

  const [step, setStep] = useState<StepName>("splash");

  const [website, setWebsite] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [primaryDomain, setPrimaryDomain] = useState("");
  const [forwardingDomain, setForwardingDomain] = useState("");
  const [selectedPackage, setSelectedPackage] = useState<PackageKey>("starter");
  const [senders, setSenders] = useState<Sender[]>([]);
  const [connectedAccounts, setConnectedAccounts] = useState<string[]>([]);
  const [connectedCalendars, setConnectedCalendars] = useState<string[]>([]);
  const [invitees, setInvitees] = useState<Invitee[]>([]);
  const [confirmedDomains, setConfirmedDomains] = useState<string[]>([]);
  const [confirmedMailboxes, setConfirmedMailboxes] = useState<string[]>([]);

  useEffect(() => {
    const loaded = loadDraft();
    if (loaded && ALL_STEPS.indexOf(loaded.step) > RESUME_THRESHOLD) {
      setDraft(loaded);
      setShowResume(true);
      setStep(loaded.step);
      setWebsite(loaded.website);
      setProducts(loaded.products);
      setPrimaryDomain(loaded.primaryDomain);
      setForwardingDomain(loaded.forwardingDomain);
      setSelectedPackage(loaded.selectedPackage);
      setSenders(loaded.senders);
      setConnectedAccounts(loaded.connectedAccounts ?? []);
      setConnectedCalendars(loaded.connectedCalendars ?? []);
      setInvitees(loaded.invitees ?? []);
      setConfirmedDomains(loaded.confirmedDomains);
      setConfirmedMailboxes(loaded.confirmedMailboxes);
    }
    // Runs once on mount, after hydration, when localStorage first becomes safe to read.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [step]);

  function goBack() {
    const idx = STEP_ORDER.indexOf(step);
    if (idx > 0) setStep(STEP_ORDER[idx - 1]);
  }

  // Advances to the next step and persists a snapshot — the only place
  // progress is saved, matching "only save when they proceed."
  function advance(nextStep: StepName, patch?: Partial<{
    website: string;
    products: Product[];
    primaryDomain: string;
    forwardingDomain: string;
    selectedPackage: PackageKey;
    senders: Sender[];
    connectedAccounts: string[];
    connectedCalendars: string[];
    invitees: Invitee[];
    confirmedDomains: string[];
    confirmedMailboxes: string[];
  }>) {
    const next = {
      website: patch?.website ?? website,
      products: patch?.products ?? products,
      primaryDomain: patch?.primaryDomain ?? primaryDomain,
      forwardingDomain: patch?.forwardingDomain ?? forwardingDomain,
      selectedPackage: patch?.selectedPackage ?? selectedPackage,
      senders: patch?.senders ?? senders,
      connectedAccounts: patch?.connectedAccounts ?? connectedAccounts,
      connectedCalendars: patch?.connectedCalendars ?? connectedCalendars,
      invitees: patch?.invitees ?? invitees,
      confirmedDomains: patch?.confirmedDomains ?? confirmedDomains,
      confirmedMailboxes: patch?.confirmedMailboxes ?? confirmedMailboxes,
    };
    if (patch?.website !== undefined) setWebsite(patch.website);
    if (patch?.products !== undefined) setProducts(patch.products);
    if (patch?.primaryDomain !== undefined) setPrimaryDomain(patch.primaryDomain);
    if (patch?.forwardingDomain !== undefined) setForwardingDomain(patch.forwardingDomain);
    if (patch?.selectedPackage !== undefined) setSelectedPackage(patch.selectedPackage);
    if (patch?.senders !== undefined) setSenders(patch.senders);
    if (patch?.connectedAccounts !== undefined) setConnectedAccounts(patch.connectedAccounts);
    if (patch?.connectedCalendars !== undefined) setConnectedCalendars(patch.connectedCalendars);
    if (patch?.invitees !== undefined) setInvitees(patch.invitees);
    if (patch?.confirmedDomains !== undefined) setConfirmedDomains(patch.confirmedDomains);
    if (patch?.confirmedMailboxes !== undefined) setConfirmedMailboxes(patch.confirmedMailboxes);
    setStep(nextStep);
    saveDraft({
      savedAt: new Date().toISOString(),
      step: nextStep,
      ...next,
      // File objects aren't JSON-serializable and can't be restored anyway.
      products: next.products.map((p) => ({ ...p, files: [] })),
    });
  }

  if (showResume && draft) {
    return (
      <div className="ob-shell" style={PAGE_STYLE}>
        <style>{STYLES}</style>
        <PageChrome />
        <div className="ob-shell-content" style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%", padding: "80px 24px 40px", position: "relative", zIndex: 1 }}>
          <StepResume draft={draft} onContinue={() => setShowResume(false)} />
        </div>
      </div>
    );
  }

  return (
    <div className="ob-shell" style={PAGE_STYLE}>
      <style>{STYLES}</style>
      <PageChrome />
      <div
        className="ob-shell-content"
        style={
          step === "starting_research"
            ? { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: "100%", minHeight: "100vh", padding: "24px", position: "relative", zIndex: 1 }
            : { display: "flex", flexDirection: "column", alignItems: "center", width: "100%", padding: "80px 24px 40px", position: "relative", zIndex: 1 }
        }
      >
        <PhaseStepper step={step} />

        {step === "splash" && (
          <StepSplash onNext={() => advance("welcome")} />
        )}
        {step === "welcome" && (
          <StepWelcome onNext={() => advance("website")} />
        )}
        {step === "website" && (
          <StepWebsite onNext={(w) => advance("products", { website: w })} />
        )}
        {step === "products" && (
          <StepProducts initialProducts={products} onNext={(p) => advance("research_summary", { products: p })} onBack={goBack} />
        )}
        {step === "research_summary" && (
          <StepResearchSummary website={website} products={products} onNext={() => advance("starting_research")} onBack={goBack} />
        )}
        {step === "starting_research" && (
          <StepStartingResearch onNext={() => advance("infra_intro")} />
        )}
        {step === "infra_intro" && (
          <StepInfraIntro onNext={() => advance("primary_domain")} />
        )}
        {step === "primary_domain" && (
          <StepPrimaryDomain website={website} onNext={(d) => advance("forwarding_domain", { primaryDomain: d })} />
        )}
        {step === "forwarding_domain" && (
          <StepForwardingDomain primaryDomain={primaryDomain} onNext={(d) => advance("volume", { forwardingDomain: d })} onBack={goBack} />
        )}
        {step === "volume" && (
          <StepVolume onNext={(pkg) => advance("senders", { selectedPackage: pkg })} onBack={goBack} />
        )}
        {step === "senders" && (
          <StepSenders onNext={(s) => advance("split", { senders: s })} onBack={goBack} />
        )}
        {step === "split" && (
          <StepSplit senders={senders} onNext={(s) => advance("infra_summary", { senders: s })} onBack={goBack} />
        )}
        {step === "infra_summary" && (
          <StepInfraSummary primaryDomain={primaryDomain} selectedPackage={selectedPackage} senders={senders} onNext={() => advance("connections_intro")} />
        )}
        {step === "connections_intro" && (
          <StepConnectionsIntro onNext={() => advance("connect")} />
        )}
        {step === "connect" && (
          <StepConnect initialConnected={connectedAccounts} onNext={(c) => advance("connect_linkedin", { connectedAccounts: c })} onBack={goBack} />
        )}
        {step === "connect_linkedin" && (
          <StepConnectLinkedIn initialConnected={connectedAccounts} onNext={(c) => advance("connect_calendar", { connectedAccounts: c })} onBack={goBack} />
        )}
        {step === "connect_calendar" && (
          <StepConnectCalendar initialConnected={connectedCalendars} onNext={(c) => advance("invite", { connectedCalendars: c })} onBack={goBack} />
        )}
        {step === "invite" && (
          <StepInvite initialInvitees={invitees} onNext={(inv) => advance("connections_summary", { invitees: inv })} onBack={goBack} />
        )}
        {step === "connections_summary" && (
          <StepConnectionsSummary connectedAccounts={connectedAccounts} connectedCalendars={connectedCalendars} invitees={invitees} onNext={() => advance("review_intro")} />
        )}
        {step === "review_intro" && (
          <StepReviewIntro onNext={() => advance("review_order")} onBack={goBack} />
        )}
        {step === "review_order" && (
          <StepReviewOrder
            forwardingDomain={forwardingDomain}
            selectedPackage={selectedPackage}
            senders={senders}
            onNext={(d, m) => advance("researching", { confirmedDomains: d, confirmedMailboxes: m })}
            onBack={goBack}
          />
        )}
        {step === "researching" && (
          <StepResearch onFinish={() => advance("company_research")} />
        )}
        {step === "company_research" && (
          <StepCompanyResearch products={products} onNext={() => advance("products_services")} />
        )}
        {step === "products_services" && (
          <StepProductsServices products={products} onNext={() => advance("tam_icp")} />
        )}
        {step === "tam_icp" && (
          <StepTamIcp products={products} onNext={() => advance("personas")} />
        )}
        {step === "personas" && (
          <StepPersonas onNext={() => advance("outreach_campaign")} />
        )}
        {step === "outreach_campaign" && (
          <StepOutreachCampaign onNext={() => advance("all_set")} />
        )}
        {step === "all_set" && (
          <StepAllSet onNext={() => advance("cleared_for_launch")} />
        )}
        {step === "cleared_for_launch" && (
          <StepClearedForLaunch onFinish={() => {
            clearDraft();
            if (typeof window !== "undefined") {
              localStorage.setItem("ob_state", JSON.stringify({
                website,
                products,
                primaryDomain,
                forwardingDomain,
                selectedPackage,
                senders,
                domains: confirmedDomains,
                mailboxes: confirmedMailboxes,
                dismissed: false,
              }));
            }
            router.replace("/");
          }} />
        )}
      </div>
    </div>
  );
}
