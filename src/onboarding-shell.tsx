import { useState, useEffect, useRef } from "react";
import { KnowledgeCenter } from "./knowledge-center/KnowledgeCenter";

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
.ob-back-btn:hover { background: var(--color-surface); color: var(--color-heading); }
.ob-link-btn:hover { color: var(--color-brand-hover); }
.ob-editable-field:focus { border-color: var(--color-brand) !important; box-shadow: var(--shadow-focus); }
.ob-hero-title { font-size: clamp(32px, 5vw, 56px); }

.ob-field-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); align-items: start; gap: 12px; }

.ob-review-card { max-width: 660px !important; }
@media (min-width: 860px) {
  .ob-review-card { max-width: 780px !important; }
}
@media (min-width: 1080px) {
  .ob-review-card { max-width: 920px !important; }
}

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

const BACK_BTN: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: 36,
  height: 36,
  borderRadius: "50%",
  border: "1px solid var(--color-border)",
  background: "var(--color-page)",
  color: "var(--color-subtle)",
  cursor: "pointer",
  flexShrink: 0,
  marginBottom: 16,
  transition: "background-color 150ms, color 150ms",
};

/* ─── Back button (sits at the top of the card content) ─────────────── */
function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} aria-label="Back" title="Back" className="ob-back-btn" style={BACK_BTN}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 18l-6-6 6-6" />
      </svg>
    </button>
  );
}

/* ─── Point-of-no-return notice — shown on every section summary just
   before the step that locks in that section's answers. ─────────── */
function NoGoingBackNotice() {
  return (
    <p style={{
      fontSize: 12.5, color: "var(--color-warning)", background: "rgba(241,196,15,0.12)",
      border: "1px solid rgba(241,196,15,0.3)", borderRadius: 10, padding: "10px 14px",
      lineHeight: 1.5, margin: "0 0 14px",
    }}>
      You won&apos;t be able to come back to this step once you continue — make sure everything above looks right first.
    </p>
  );
}

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
  { key: "growth"  as PackageKey, label: "Growth",   domains: 34, mailboxes: 102 },
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

function PageChrome({ hideLogo = false }: { hideLogo?: boolean }) {
  return (
    <>
      <div style={{ position: "absolute", top: -160, left: "50%", transform: "translateX(-50%)", width: 900, height: 480, borderRadius: "50%", background: "radial-gradient(ellipse, var(--color-brand-faint) 0%, transparent 70%)", pointerEvents: "none" }} />
      {!hideLogo && (
        <Link href="/login" className="ob-logo-link" style={{ position: "absolute", top: 28, left: 36, display: "flex", alignItems: "center", textDecoration: "none", zIndex: 10 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`${import.meta.env.BASE_URL}b2brocket-logo.png`} alt="B2B Rocket" style={{ height: 26, display: "block" }} />
        </Link>
      )}
    </>
  );
}

/* ─── Progress bar ──────────────────────────────────────────────── */
const PHASES: { label: string; steps: StepName[] }[] = [
  { label: "AI Agent Research", steps: ["website", "products", "research_summary"] },
  { label: "Infrastructure", steps: ["infra_intro", "primary_domain", "volume", "senders", "infra_summary"] },
  { label: "Connections", steps: ["connections_intro", "connect", "connect_linkedin", "connect_calendar", "invite", "connections_summary"] },
  { label: "Review & Approve", steps: ["review_intro", "review_order", "researching", "company_research", "product_review", "outreach_campaign"] },
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
          const complete = pct >= 100;
          return (
            <div key={phase.label} title={complete ? `${phase.label} — 100% completed` : undefined}
              style={{ flex: 1, height: 4, borderRadius: 999, background: "var(--color-border)", overflow: "hidden" }}>
              <div style={{ height: "100%", background: complete ? "var(--color-success)" : "var(--color-brand)", borderRadius: 999, width: `${pct}%`, transition: "width 300ms var(--ease-apple), background 200ms var(--ease-apple)" }} />
            </div>
          );
        })}
      </div>
      <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--color-heading)", letterSpacing: "-0.005em" }}>{currentPhase.label}</span>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   BRAND WELCOME — First screen shown. A single card previewing the
   concrete outputs of onboarding, then straight into the flow.
══════════════════════════════════════════════════════════════════════ */
const WELCOME_ITEMS: { title: string; desc: string; icon: React.ReactNode }[] = [
  {
    title: "A Knowledge Center",
    desc: "Your company, products and market, researched and written up.",
    icon: <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></>,
  },
  {
    title: "ICPs & personas",
    desc: "Who to go after, what they care about, and how to open.",
    icon: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>,
  },
  {
    title: "Sending infrastructure",
    desc: "Domains and mailboxes provisioned, configured and warming.",
    icon: <><rect x="3" y="4" width="18" height="6" rx="1.5" /><rect x="3" y="14" width="18" height="6" rx="1.5" /></>,
  },
  {
    title: "Live campaigns",
    desc: "Email and LinkedIn sequences drafted from your own research.",
    icon: <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />,
  },
];

function StepBrandWelcome({ onNext, onSkip }: { onNext: () => void; onSkip: () => void }) {
  return (
    <div className="ob-card" style={{ ...CARD, maxWidth: 520, textAlign: "center" as const }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`${import.meta.env.BASE_URL}b2brocket-logo.png`} alt="B2B Rocket" style={{ height: 44, marginBottom: 28, display: "block", marginLeft: "auto", marginRight: "auto" }} />

      <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.2, margin: "0 0 12px", color: "var(--color-heading)" }}>
        Welcome to B2B Rocket
      </h1>

      <p style={{ fontSize: 15, color: "var(--color-body)", lineHeight: 1.6, margin: "0 auto 28px", maxWidth: 420 }}>
        Answer a few quick questions and your AI agents get to work — prospecting, personalizing, and booking meetings for you.
      </p>

      <div style={{ border: "1px solid var(--color-border)", borderRadius: 12, overflow: "hidden", marginBottom: 28, textAlign: "left" as const }}>
        <div style={{ padding: "10px 20px", background: "var(--color-surface)", borderBottom: "1px solid var(--color-border)" }}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" as const, color: "var(--color-muted)" }}>
            Here&apos;s what you&apos;ll have
          </span>
        </div>
        {WELCOME_ITEMS.map((item, i) => (
          <div key={item.title} style={{ display: "flex", alignItems: "flex-start", gap: 14, padding: "16px 20px", borderBottom: i < WELCOME_ITEMS.length - 1 ? "1px solid var(--color-border)" : "none" }}>
            <div style={{ width: 36, height: 36, borderRadius: 9, background: "var(--color-brand-tint)", color: "var(--color-brand)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{item.icon}</svg>
            </div>
            <div>
              <div style={{ fontSize: 14.5, fontWeight: 700, color: "var(--color-heading)", marginBottom: 2 }}>{item.title}</div>
              <div style={{ fontSize: 13, color: "var(--color-body)", lineHeight: 1.5 }}>{item.desc}</div>
            </div>
          </div>
        ))}
      </div>

      <button onClick={onNext} style={PRIMARY_BTN} className="ob-primary-btn">
        Get started
      </button>
      <p style={{ fontSize: 12.5, color: "var(--color-muted)", margin: "14px 0 0" }}>
        Takes about 10 minutes. Your progress saves as you go.
      </p>
      <button onClick={onSkip} style={{ ...GHOST_BTN, width: "auto", margin: "8px auto 0" }} className="ob-ghost-btn">
        Skip to Knowledge Center (testing)
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
        <BackButton onClick={onBack} />
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
            </div>
          </>
        )}
        </div>
    );
  }

  return (
      <div className="ob-card" style={{ ...CARD, maxWidth: 520 }}>
      <BackButton onClick={goBackWithinStep} />
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
  const productItems = products
    .map((p) => p.name.trim() || p.description.trim())
    .filter(Boolean);
  const totalFiles = products.reduce((sum, p) => sum + p.files.length, 0);

  const [showAllProducts, setShowAllProducts] = useState(false);
  const VISIBLE_PRODUCTS = 3;
  const visibleProducts = showAllProducts ? productItems : productItems.slice(0, VISIBLE_PRODUCTS);
  const hiddenCount = productItems.length - VISIBLE_PRODUCTS;

  return (
      <div className="ob-card" style={{ ...CARD, maxWidth: 480 }}>
      <BackButton onClick={onBack} />
      <span style={{ fontSize: 12, fontWeight: 700, color: "var(--color-brand)", letterSpacing: "0.05em", textTransform: "uppercase" as const }}>AI Agent Research</span>
      <h1 style={{ fontSize: 24, margin: "8px 0 8px" }}>Your research, at a glance</h1>
      <p style={{ fontSize: 14, color: "var(--color-body)", lineHeight: 1.6, margin: "0 0 24px" }}>
        Here&apos;s what your agents will work from.
      </p>
      <div style={{ borderRadius: 14, border: "1px solid var(--color-border)", overflow: "hidden", marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, padding: "16px 18px", borderBottom: "1px solid var(--color-border)" }}>
          <span style={{ fontSize: 13.5, color: "var(--color-muted)" }}>Website</span>
          <span style={{ fontSize: 14, fontWeight: 700, color: "var(--color-heading)", textAlign: "right" as const, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const, maxWidth: "60%" }}>{domain}</span>
        </div>
        <div style={{ padding: "16px 18px", borderBottom: "1px solid var(--color-border)" }}>
          <span style={{ fontSize: 13.5, color: "var(--color-muted)", display: "block", marginBottom: 8 }}>Products / services</span>
          {productItems.length ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {visibleProducts.map((item, i) => (
                <span key={i} style={{ fontSize: 14, fontWeight: 700, color: "var(--color-heading)", lineHeight: 1.4, whiteSpace: "pre-wrap" as const, wordBreak: "break-word" as const }}>{item}</span>
              ))}
            </div>
          ) : (
            <span style={{ fontSize: 14, fontWeight: 700, color: "var(--color-heading)" }}>—</span>
          )}
          {hiddenCount > 0 && (
            <button
              type="button"
              onClick={() => setShowAllProducts((v) => !v)}
              style={{ background: "none", border: "none", padding: 0, marginTop: 10, fontSize: 13, fontWeight: 700, color: "var(--color-brand)", cursor: "pointer" }}
            >
              {showAllProducts ? "Show less" : `Show ${hiddenCount} more`}
            </button>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, padding: "16px 18px" }}>
          <span style={{ fontSize: 13.5, color: "var(--color-muted)" }}>Files shared</span>
          <span style={{ fontSize: 14, fontWeight: 700, color: "var(--color-heading)", textAlign: "right" as const, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const, maxWidth: "60%" }}>{totalFiles > 0 ? `${totalFiles} file${totalFiles > 1 ? "s" : ""}` : "None"}</span>
        </div>
      </div>
      <NoGoingBackNotice />
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <button onClick={onNext} className="ob-primary-btn" style={PRIMARY_BTN}>
          Looks good — continue
        </button>
      </div>
      </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   Transition — AI research kicks off in the background, then straight
   into Setup Infrastructure. Brief and auto-advancing, no user input.
══════════════════════════════════════════════════════════════════════ */
function StepStartingResearch({ onNext }: { onNext: () => void }) {
  const [phase, setPhase] = useState<"loading" | "success">("loading");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("success"), 1200);
    const t2 = setTimeout(onNext, 3400);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const success = phase === "success";

  return (
    <div className="ob-card" style={{ ...CARD, maxWidth: 440, textAlign: "center" as const }}>
      <div style={{ width: 40, height: 40, margin: "0 auto 18px", background: success ? "rgba(7,188,12,0.12)" : "var(--color-brand-faint)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", transition: "background 250ms" }}>
        {success ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        ) : (
          <svg style={{ animation: "ob-spin 0.8s linear infinite" }} width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="var(--color-border)" strokeWidth="3" />
            <path d="M12 2a10 10 0 0 1 10 10" stroke="var(--color-brand)" strokeWidth="3" strokeLinecap="round" />
          </svg>
        )}
      </div>
      <h1 style={{ fontSize: 20, margin: "0 0 8px" }}>{success ? "Research started" : "Starting AI research…"}</h1>
      <p style={{ fontSize: 14, color: "var(--color-body)", lineHeight: 1.6, margin: 0 }}>
        {success
          ? "We're researching your company and products in the background. Let's set up your sending infrastructure next."
          : "We're kicking off research on your company and products in the background."}
      </p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   STEP 3 — Primary & forwarding domain
══════════════════════════════════════════════════════════════════════ */
function StepPrimaryDomain({ website, initialPrimaryDomain, initialForwardingDomain, onNext }: {
  website: string; initialPrimaryDomain: string; initialForwardingDomain: string; onNext: (primaryDomain: string, forwardingDomain: string) => void;
}) {
  const [domain, setDomain] = useState(() => initialPrimaryDomain || extractDomain(website));
  const [domainFocused, setDomainFocused] = useState(false);
  const [sameAsPrimary, setSameAsPrimary] = useState(() => !initialForwardingDomain || initialForwardingDomain === (initialPrimaryDomain || extractDomain(website)));
  const [forwardingDomain, setForwardingDomain] = useState(initialForwardingDomain);
  const [forwardingFocused, setForwardingFocused] = useState(false);

  const valid = isValidDomain(domain);
  const effectiveForwarding = sameAsPrimary ? domain : forwardingDomain;
  const canContinue = valid && isValidDomain(effectiveForwarding);

  function submit() {
    if (!canContinue) return;
    onNext(domain.trim(), effectiveForwarding.trim());
  }

  return (
    <div className="ob-card" style={{ ...CARD, maxWidth: 480 }}>
      <h1 style={{ fontSize: 24, margin: "8px 0 8px" }}>Set up your sending domain</h1>
      <p style={{ fontSize: 14, color: "var(--color-body)", lineHeight: 1.6, margin: "0 0 28px" }}>
        Your main company domain, and where replies should land.
      </p>
      <div style={{ marginBottom: 20 }}>
        <label style={LABEL}>Primary domain</label>
        <div style={{ position: "relative" }}>
          <input
            className="ob-input"
            type="text"
            placeholder="yourcompany.com"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            onFocus={() => setDomainFocused(true)}
            onBlur={() => setDomainFocused(false)}
            onKeyDown={(e) => { if (e.key === "Enter" && canContinue) submit(); }}
            style={{ ...INPUT, ...(domainFocused ? { borderColor: "var(--color-border-strong)", boxShadow: "var(--shadow-focus)" } : {}), ...(domain && valid ? { borderColor: "rgba(7,188,12,0.5)" } : domain && !valid ? { borderColor: "rgba(231,76,60,0.5)" } : {}) }}
          />
          {domain && (
            <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", fontSize: 12, fontWeight: 600, color: valid ? "var(--color-success)" : "var(--color-error)" }}>
              {valid ? "✓" : "✗"}
            </span>
          )}
        </div>
        <p style={{ fontSize: 11.5, color: "var(--color-muted)", margin: "6px 0 0" }}>Used as a reference for generating sending domain variations.</p>
      </div>
      <div style={{ marginBottom: 20 }}>
        <label style={LABEL}>Configure forwarding domain</label>
        <div
          onClick={() => setSameAsPrimary((v) => !v)}
          style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderRadius: 10, background: "var(--color-surface)", marginBottom: 12, cursor: "pointer" }}
        >
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: "var(--color-heading)", margin: 0 }}>Same as primary domain</p>
            <p style={{ fontSize: 11, color: "var(--color-muted)", margin: "2px 0 0" }}>{domain || "—"}</p>
          </div>
          <span style={{ display: "inline-flex", width: 36, height: 20, borderRadius: 10, background: sameAsPrimary ? "var(--color-brand)" : "var(--color-subtle)", transition: "background 200ms", alignItems: "center", padding: "0 3px", flexShrink: 0 }}>
            <span style={{ width: 14, height: 14, borderRadius: "50%", background: "#fff", boxShadow: "0 1px 2px rgba(5,12,70,0.2)", transform: sameAsPrimary ? "translateX(16px)" : "translateX(0)", transition: "transform 200ms", display: "block" }} />
          </span>
        </div>
        {!sameAsPrimary && (
          <div style={{ position: "relative" }}>
            <input
              className="ob-input"
              type="text"
              placeholder="fwd.yourcompany.com"
              value={forwardingDomain}
              onChange={(e) => setForwardingDomain(e.target.value)}
              onFocus={() => setForwardingFocused(true)}
              onBlur={() => setForwardingFocused(false)}
              onKeyDown={(e) => { if (e.key === "Enter" && canContinue) submit(); }}
              style={{ ...INPUT, ...(forwardingFocused ? { borderColor: "var(--color-border-strong)", boxShadow: "var(--shadow-focus)" } : {}), ...(forwardingDomain && isValidDomain(forwardingDomain) ? { borderColor: "rgba(7,188,12,0.5)" } : forwardingDomain ? { borderColor: "rgba(231,76,60,0.5)" } : {}) }}
            />
            {forwardingDomain && (
              <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", fontSize: 12, fontWeight: 600, color: isValidDomain(forwardingDomain) ? "var(--color-success)" : "var(--color-error)" }}>
                {isValidDomain(forwardingDomain) ? "✓" : "✗"}
              </span>
            )}
          </div>
        )}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <button onClick={submit} disabled={!canContinue} className="ob-primary-btn" style={{ ...PRIMARY_BTN, opacity: !canContinue ? 0.5 : 1, cursor: !canContinue ? "not-allowed" : "pointer" }}>Continue</button>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   STEP 5 — Volume package
══════════════════════════════════════════════════════════════════════ */
function StepVolume({ initialPackage, onNext, onBack }: { initialPackage: PackageKey; onNext: (pkg: PackageKey) => void; onBack: () => void }) {
  const [selected, setSelected] = useState<PackageKey>(initialPackage);

  return (
      <div className="ob-card" style={{ ...CARD, maxWidth: 520 }}>
      <BackButton onClick={onBack} />
      <h1 style={{ fontSize: 24, margin: "8px 0 24px" }}>How many domains and mailboxes?</h1>
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
      </div>
      </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   STEP 6 — Who is sending? (name + volume split)
══════════════════════════════════════════════════════════════════════ */
function StepSenders({ initialSenders, onNext, onBack }: { initialSenders: Sender[]; onNext: (senders: Sender[]) => void; onBack: () => void }) {
  const [senders, setSenders] = useState<Sender[]>(() => initialSenders.length > 0 ? initialSenders : [{ first: "", last: "", pct: 100 }]);
  const [locked, setLocked] = useState<Set<number>>(new Set());
  const [focused, setFocused] = useState<string | null>(null);

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

  function shiftLocked(lockedSet: Set<number>, removedIdx: number): Set<number> {
    const next = new Set<number>();
    lockedSet.forEach((i) => { if (i < removedIdx) next.add(i); else if (i > removedIdx) next.add(i - 1); });
    return next;
  }

  function updateSender(idx: number, field: "first" | "last", val: string) {
    setSenders((prev) => prev.map((s, i) => i === idx ? { ...s, [field]: val } : s));
  }

  function addSender() {
    setSenders((prev) => rebalance([...prev, { first: "", last: "", pct: 0 }], locked));
  }

  function removeSender(idx: number) {
    if (senders.length <= 1) return;
    const newLocked = shiftLocked(locked, idx);
    setLocked(newLocked);
    setSenders((prev) => rebalance(prev.filter((_, i) => i !== idx), newLocked));
  }

  function updatePct(idx: number, val: string) {
    const newPct = Math.min(100, Math.max(0, parseInt(val) || 0));
    setSenders((prev) => prev.map((s, i) => i === idx ? { ...s, pct: newPct } : s));
  }

  function lockField(idx: number) {
    const lockedTotal = senders.reduce((sum, s, i) => locked.has(i) ? sum + s.pct : sum, 0);
    const available = Math.max(0, 100 - lockedTotal);
    const clamped = senders.map((s, i) => i === idx ? { ...s, pct: Math.min(s.pct, available) } : s);
    const newLocked = new Set(locked).add(idx);
    setLocked(newLocked);
    setSenders(rebalance(clamped, newLocked));
  }

  function unlockField(idx: number) {
    setLocked((prev) => { const next = new Set(prev); next.delete(idx); return next; });
  }

  const namesValid = senders.every((s) => s.first.trim().length > 0);
  const total = senders.reduce((sum, s) => sum + s.pct, 0);
  const isExact = total === 100;
  const canContinue = namesValid && isExact;

  return (
      <div className="ob-card" style={{ ...CARD, maxWidth: 520 }}>
      <BackButton onClick={onBack} />
      <h1 style={{ fontSize: 24, margin: "8px 0 8px" }}>Who is sending?</h1>
      <p style={{ fontSize: 14, color: "var(--color-body)", lineHeight: 1.6, margin: "0 0 24px" }}>
        Add each sender and set how volume is split between them. Add as many as you like.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
        {senders.map((s, idx) => {
          const isLocked = locked.has(idx);
          return (
            <div key={idx} style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input className="ob-input" type="text" placeholder="First name" value={s.first} onChange={(e) => updateSender(idx, "first", e.target.value)}
                onFocus={() => setFocused(`f${idx}`)} onBlur={() => setFocused(null)}
                style={{ ...INPUT, flex: 1, ...(focused === `f${idx}` ? { borderColor: "var(--color-border-strong)", boxShadow: "var(--shadow-focus)" } : {}) }} />
              <input className="ob-input" type="text" placeholder="Last name" value={s.last} onChange={(e) => updateSender(idx, "last", e.target.value)}
                onFocus={() => setFocused(`l${idx}`)} onBlur={() => setFocused(null)}
                style={{ ...INPUT, flex: 1, ...(focused === `l${idx}` ? { borderColor: "var(--color-border-strong)", boxShadow: "var(--shadow-focus)" } : {}) }} />
              {isLocked ? (
                <button
                  type="button"
                  onClick={() => unlockField(idx)}
                  title="Click to unlock and edit"
                  style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0, background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 8, padding: "6px 10px", cursor: "pointer", fontFamily: "inherit" }}
                >
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--color-heading)" }}>{s.pct}%</span>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--color-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </button>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                  <input
                    className="ob-input"
                    type="number"
                    min={0}
                    max={100}
                    value={s.pct || ""}
                    onChange={(e) => updatePct(idx, e.target.value)}
                    onBlur={() => lockField(idx)}
                    style={{ ...INPUT, width: 60, textAlign: "center" as const, padding: "8px 10px" }}
                  />
                  <span style={{ fontSize: 13, color: "var(--color-muted)", fontWeight: 500 }}>%</span>
                </div>
              )}
              {senders.length > 1 && (
                <button type="button" onClick={() => removeSender(idx)} style={{ width: 32, height: 32, flexShrink: 0, background: "var(--color-surface)", border: "none", borderRadius: 8, color: "var(--color-muted)", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "inherit" }}>×</button>
              )}
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <button type="button" onClick={addSender} className="ob-link-btn" style={{ fontSize: 13, color: "var(--color-brand)", background: "none", border: "none", cursor: "pointer", padding: 0, fontFamily: "inherit", fontWeight: 500, transition: "color 150ms" }}>
            + Add another sender
          </button>
          <button type="button" onClick={() => { setSenders(redistributePct(senders)); setLocked(new Set()); }} className="ob-link-btn" style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--color-muted)", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", padding: 0, transition: "color 150ms" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
            </svg>
            Reset split
          </button>
        </div>
        <span style={{ fontSize: 13, fontWeight: 600, color: isExact ? "var(--color-success)" : total > 100 ? "var(--color-error)" : "var(--color-muted)" }}>
          {total}%
        </span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <button onClick={() => onNext(senders)} disabled={!canContinue} className="ob-primary-btn" style={{ ...PRIMARY_BTN, opacity: !canContinue ? 0.5 : 1, cursor: !canContinue ? "not-allowed" : "pointer" }}>Continue</button>
      </div>
      </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   Infrastructure summary — quick review of the sending setup before
   moving on to Connections.
══════════════════════════════════════════════════════════════════════ */
function StepInfraSummary({ primaryDomain, selectedPackage, senders, onNext, onBack }: {
  primaryDomain: string;
  selectedPackage: PackageKey;
  senders: Sender[];
  onNext: () => void;
  onBack: () => void;
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
      <BackButton onClick={onBack} />
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
      <NoGoingBackNotice />
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
function StepConnect({ initialConnected, onNext }: {
  initialConnected: string[];
  onNext: (connected: string[]) => void;
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
      <BackButton onClick={onBack} />
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
      <BackButton onClick={onBack} />
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
      <BackButton onClick={onBack} />
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
      </div>
      </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   Connections summary — quick review of what's plugged in before
   moving on to Review & Approve.
══════════════════════════════════════════════════════════════════════ */
function StepConnectionsSummary({ connectedAccounts, connectedCalendars, invitees, onNext, onBack }: {
  connectedAccounts: string[];
  connectedCalendars: string[];
  invitees: Invitee[];
  onNext: () => void;
  onBack: () => void;
}) {
  const mailboxCount = connectedAccounts.filter((id) => id === "google" || id === "microsoft").length;
  const linkedinConnected = connectedAccounts.includes("linkedin");

  const rows = [
    { label: "Sending mailboxes", value: mailboxCount > 0 ? `${mailboxCount} connected` : "Not Connected" },
    { label: "LinkedIn", value: linkedinConnected ? "1 connected" : "Not Connected" },
    { label: "Scheduling", value: connectedCalendars.length > 0 ? `${connectedCalendars.length} connected` : "Not Connected" },
    { label: "Team invites", value: invitees.length > 0 ? `${invitees.length} invited` : "None" },
  ];

  return (
    <div className="ob-card" style={{ ...CARD, maxWidth: 480 }}>
      <BackButton onClick={onBack} />
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
      <NoGoingBackNotice />
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

function StepReviewIntro({ onNext }: { onNext: () => void }) {
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
      <BackButton onClick={onBack} />
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

      <NoGoingBackNotice />
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <button onClick={() => onNext(selectedDomains, allMailboxes)} disabled={isChecking || allMailboxes.length !== pkg.mailboxes} className="ob-primary-btn" style={{ ...PRIMARY_BTN, opacity: isChecking || allMailboxes.length !== pkg.mailboxes ? 0.5 : 1, cursor: isChecking || allMailboxes.length !== pkg.mailboxes ? "not-allowed" : "pointer" }}>
          Approve &amp; Continue
        </button>
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
    const delays = [700, 1400, 2100, 2800, 3500];
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
              <div style={{ width: 28, height: 28, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: done ? "var(--color-success)" : "var(--color-page)", border: done ? "none" : `1.5px solid ${running ? "var(--color-brand)" : "var(--color-border-strong)"}`, transition: "background 250ms" }}>
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

/* ─── Inline editable field primitives ─────────────────────────────
   Shared by any "AI-drafted, human-reviewable" step. Always rendered
   as a live input/textarea — no click needed to start editing —
   with an optional "Ask AI" trigger for a revise-by-instruction pass. */
function EditableText({ value, onChange, multiline = false, placeholder, style, rows = 3, revise }: {
  value: string; onChange: (v: string) => void; multiline?: boolean; placeholder?: string; style?: React.CSSProperties; rows?: number;
  revise?: (current: string, instruction: string) => string;
}) {
  const [aiOpen, setAiOpen] = useState(false);
  const [aiInstruction, setAiInstruction] = useState("");
  const [aiBusy, setAiBusy] = useState(false);
  const [undoValue, setUndoValue] = useState<string | null>(null);
  const containerRef = useRef<HTMLSpanElement>(null);

  function applyAI() {
    if (!revise) return;
    const instruction = aiInstruction.trim();
    if (!instruction || aiBusy) return;
    setAiBusy(true);
    setTimeout(() => {
      setUndoValue(value);
      onChange(revise(value, instruction));
      setAiBusy(false);
      setAiOpen(false);
      setAiInstruction("");
    }, 800);
  }

  const fieldStyle: React.CSSProperties = {
    display: "block", width: "100%", background: "var(--color-surface)", border: "1px solid var(--color-border)",
    borderRadius: 7, padding: revise ? "5px 32px 5px 7px" : "5px 7px", fontFamily: "inherit", outline: "none", boxSizing: "border-box" as const,
    color: "var(--color-heading)", lineHeight: 1.5, transition: "border-color 150ms, box-shadow 150ms", ...style,
  };

  return (
    <span ref={containerRef} style={{ position: "relative", display: "block" }}>
      <span style={{ position: "relative", display: "block" }}>
        {multiline ? (
          <textarea
            className="ob-editable-field" rows={rows} value={value} placeholder={placeholder}
            onChange={(e) => onChange(e.target.value)}
            style={{ ...fieldStyle, resize: "vertical" as const }}
          />
        ) : (
          <input
            className="ob-editable-field" value={value} placeholder={placeholder}
            onChange={(e) => onChange(e.target.value)}
            style={{ ...fieldStyle, textOverflow: "ellipsis" }}
          />
        )}
        {revise && (
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()} // keep focus on the field; only React state (aiOpen) decides the popup, not a focus/blur race
            onClick={() => setAiOpen((o) => !o)}
            title="Ask AI to revise this"
            style={{
              position: "absolute", top: 0, right: 4, bottom: 0, margin: "auto 0", width: 15, height: 15, display: "flex", alignItems: "center", justifyContent: "center",
              borderRadius: "50%", border: "none", cursor: "pointer", padding: 0, boxShadow: "0 1px 2px rgba(0,0,0,0.15)",
              background: aiOpen ? "var(--color-brand)" : "var(--color-brand-tint)",
              ...(multiline ? { top: 4, bottom: "auto", margin: 0 } : {}),
            }}
          >
            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke={aiOpen ? "#fff" : "var(--color-brand)"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72Z" />
              <path d="m14 7 3 3" /><path d="M5 6v4" /><path d="M19 14v4" />
            </svg>
          </button>
        )}
      </span>
      {aiOpen && (
        <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
          <input
            autoFocus value={aiInstruction} onChange={(e) => setAiInstruction(e.target.value)}
            onBlur={() => {
              // Popup's own blur: if focus left the whole field+popup group
              // entirely (not just moved between its own pieces), close for real.
              requestAnimationFrame(() => {
                if (containerRef.current && !containerRef.current.contains(document.activeElement)) { setAiOpen(false); setAiInstruction(""); }
              });
            }}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); applyAI(); } if (e.key === "Escape") { e.preventDefault(); setAiOpen(false); setAiInstruction(""); } }}
            placeholder="Tell AI what to change…" disabled={aiBusy}
            style={{ flex: 1, minWidth: 0, fontSize: 11.5, border: "1px solid var(--color-border)", borderRadius: 7, padding: "5px 7px", outline: "none", fontFamily: "inherit", background: "var(--color-surface)", color: "var(--color-heading)" }}
          />
          <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={applyAI} disabled={aiBusy || !aiInstruction.trim()}
            style={{ flexShrink: 0, fontSize: 11, fontWeight: 600, borderRadius: 7, border: "none", padding: "0 10px", background: "var(--color-brand)", color: "#fff", cursor: aiBusy || !aiInstruction.trim() ? "default" : "pointer", opacity: aiBusy || !aiInstruction.trim() ? 0.6 : 1, display: "flex", alignItems: "center", fontFamily: "inherit" }}>
            {aiBusy ? <Spinner inverted /> : "Go"}
          </button>
        </div>
      )}
      {undoValue !== null && (
        <button type="button" onClick={() => { onChange(undoValue); setUndoValue(null); }}
          style={{ display: "block", marginTop: 4, fontSize: 10, fontWeight: 600, color: "var(--color-brand)", background: "none", border: "none", cursor: "pointer", textDecoration: "underline", padding: 0, fontFamily: "inherit" }}>
          Undo
        </button>
      )}
    </span>
  );
}

function EditableBulletList({ items, onChange, tone = "body" }: {
  items: string[]; onChange: (items: string[]) => void; tone?: "body" | "brand";
}) {
  const textColor = tone === "brand" ? "var(--color-brand)" : "var(--color-body)";
  const updateAt = (i: number, v: string) => onChange(items.map((it, idx) => (idx === i ? v : it)));
  const removeAt = (i: number) => onChange(items.filter((_, idx) => idx !== i));
  const add = () => onChange([...items, "New point"]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {items.map((item, i) => (
        <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
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
  const iconSize = scale === "section" ? 9 : 7;

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
        <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="var(--color-brand)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72Z" />
          <path d="m14 7 3 3" /><path d="M5 6v4" /><path d="M19 14v4" />
        </svg>
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

/* ─── Always-visible, whole-section "Ask AI" prompt — used by the
   Product/ICP/Personas review panels below, where per-field editing
   has been removed and this is the only way to change anything in a
   section. Same busy → apply → undo state machine as AIRevise, but
   rendered inline and always open instead of hidden behind a click,
   since it's no longer a secondary affordance. Deliberately NOT built
   on top of AIRevise so StepCompanyResearch's usage is untouched. */
function SectionRevisePrompt<T>({ value, onChange, revise, placeholder = "Tell AI what to change across this section…" }: {
  value: T; onChange: (next: T) => void; revise: (current: T, instruction: string) => T; placeholder?: string;
}) {
  const [instruction, setInstruction] = useState("");
  const [busy, setBusy] = useState(false);
  const [undoValue, setUndoValue] = useState<T | null>(null);

  function apply() {
    const text = instruction.trim();
    if (!text || busy) return;
    setBusy(true);
    setTimeout(() => {
      setUndoValue(value);
      onChange(revise(value, text));
      setBusy(false);
      setInstruction("");
    }, 1200);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--color-brand-faint)", border: "1px solid var(--color-border)", borderRadius: 12, padding: "8px 8px 8px 12px" }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
          <path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72Z" />
          <path d="m14 7 3 3" /><path d="M5 6v4" /><path d="M19 14v4" />
        </svg>
        <input
          value={instruction} onChange={(e) => setInstruction(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); apply(); } }}
          placeholder={placeholder} disabled={busy}
          style={{ flex: 1, minWidth: 0, fontSize: 12.5, border: "none", outline: "none", background: "transparent", fontFamily: "inherit", color: "var(--color-heading)" }}
        />
        <button type="button" onClick={apply} disabled={busy || !instruction.trim()}
          style={{ flexShrink: 0, fontSize: 11.5, fontWeight: 600, borderRadius: 8, border: "none", padding: "7px 14px", background: "var(--color-brand)", color: "#fff", cursor: busy || !instruction.trim() ? "default" : "pointer", opacity: busy || !instruction.trim() ? 0.6 : 1, display: "flex", alignItems: "center", fontFamily: "inherit" }}>
          {busy ? <Spinner inverted /> : "Ask AI"}
        </button>
      </div>
      {undoValue !== null && (
        <button type="button" onClick={() => { onChange(undoValue); setUndoValue(null); }}
          style={{ alignSelf: "flex-start", fontSize: 11, fontWeight: 600, color: "var(--color-brand)", background: "none", border: "none", cursor: "pointer", textDecoration: "underline", padding: 0, fontFamily: "inherit" }}>
          Undo last AI revision
        </button>
      )}
    </div>
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

type Positioning = CompanyResearchData["positioning"];
function revisePositioning(p: Positioning, instruction: string): Positioning {
  const lower = instruction.toLowerCase();
  if (/shorter|concise|tighten|trim/.test(lower)) {
    return { ...p, differentiators: p.differentiators.map(firstSentence) };
  }
  return { ...p, differentiators: [...p.differentiators, titleCase(instruction)] };
}

/* ─── Section-scoped revisers for the Product/ICP/Personas review step.
   Unlike reviseText (one string) these operate on everything shown in
   one accordion section at once, so a single instruction like "make
   this more enterprise-focused" visibly touches every field in that
   section instead of just whichever one had a pencil icon. */
function reviseSectionContent(content: PSContent, instruction: string): PSContent {
  const lower = instruction.toLowerCase();
  if (/shorter|concise|tighten|trim/.test(lower)) {
    return Array.isArray(content) ? content.map(firstSentence) : firstSentence(content);
  }
  if (/more formal|formal tone/.test(lower)) {
    return Array.isArray(content) ? content.map((c) => c.replace(/—/g, ",")) : content.replace(/—/g, ",");
  }
  if (/casual|friendlier|informal/.test(lower)) {
    return Array.isArray(content) ? content.map((c) => c.replace(/\.(\s|$)/g, "!$1")) : content.replace(/\.(\s|$)/g, "!$1");
  }
  return Array.isArray(content)
    ? [...content, titleCase(instruction)]
    : `${content.replace(/[.\s]+$/, "")} — ${instruction}`;
}

function reviseProductServicesBundle(bundle: PSProductState, instruction: string): PSProductState {
  // "set <field> to <value>" — keep single-field precision when the
  // instruction clearly names one field (mirrors reviseOverview).
  const setTo = instruction.match(/(?:set|change|update|rewrite)\s+(.+?)\s+to\s+(.+)/i);
  if (setTo) {
    const label = setTo[1].trim().toLowerCase();
    const value = setTo[2].trim();
    if (label.includes("name")) return { ...bundle, name: value };
    return {
      ...bundle,
      sections: bundle.sections.map((s) =>
        s.label.toLowerCase().includes(label) ? { ...s, content: Array.isArray(s.content) ? [value] : value } : s
      ),
    };
  }
  // Everything else (shorter/formal/casual/fallback) applies across
  // every section in the bundle in one pass.
  return { ...bundle, sections: bundle.sections.map((s) => ({ ...s, content: reviseSectionContent(s.content, instruction) })) };
}

type IcpBundle = { tamDescription: string; icps: IcpScore[] };
function reviseIcpBundle(bundle: IcpBundle, instruction: string): IcpBundle {
  const lower = instruction.toLowerCase();

  const setTo = instruction.match(/(?:set|change|update|rewrite)\s+(.+?)\s+to\s+(.+)/i);
  if (setTo) {
    const label = setTo[1].trim().toLowerCase();
    const value = setTo[2].trim();
    if (/tam|total addressable|market/.test(label)) return { ...bundle, tamDescription: value };
    return { ...bundle, icps: bundle.icps.map((icp) => (icp.name.toLowerCase().includes(label) ? { ...icp, reasoning: value } : icp)) };
  }
  if (/shorter|concise|tighten|trim/.test(lower)) {
    return { tamDescription: firstSentence(bundle.tamDescription), icps: bundle.icps.map((icp) => ({ ...icp, reasoning: firstSentence(icp.reasoning) })) };
  }
  if (/more formal|formal tone/.test(lower)) {
    return { tamDescription: bundle.tamDescription.replace(/—/g, ","), icps: bundle.icps.map((icp) => ({ ...icp, reasoning: icp.reasoning.replace(/—/g, ",") })) };
  }
  if (/casual|friendlier|informal/.test(lower)) {
    return { tamDescription: bundle.tamDescription.replace(/\.(\s|$)/g, "!$1"), icps: bundle.icps.map((icp) => ({ ...icp, reasoning: icp.reasoning.replace(/\.(\s|$)/g, "!$1") })) };
  }
  // Fallback: same raw instruction appended to TAM *and* every ICP's
  // reasoning — the whole point is it's no longer just one card.
  return {
    tamDescription: `${bundle.tamDescription.replace(/[.\s]+$/, "")} — ${instruction}`,
    icps: bundle.icps.map((icp) => ({ ...icp, reasoning: `${icp.reasoning.replace(/[.\s]+$/, "")} — ${instruction}` })),
  };
}

function revisePersonasBundle(personas: PersonaData[], instruction: string): PersonaData[] {
  const shrink = /shorter|concise|tighten|trim/.test(instruction.toLowerCase());
  return personas.map((p) => ({
    ...p,
    subtitle: shrink ? firstSentence(p.subtitle) : p.subtitle,
    sections: p.sections.map((s) => ({ ...s, content: reviseSectionContent(s.content, instruction) })),
  }));
}

interface CompanyResearchData {
  overview: { label: string; value: string }[];
  productName: string;
  productDescription: string;
  productBullets: string[];
  positioning: { category: string; differentiators: string[] };
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
    positioning: {
      category: "Sales & Marketing Outreach Software",
      differentiators: [
        "Positions itself as an outreach platform built for speed to first send",
        "Messaging leans on personalization and AI-assisted workflows",
        "Low setup friction compared to legacy sales tooling",
      ],
    },
  };
}

function StepCompanyResearch({ products, onNext }: { products: Product[]; onNext: () => void }) {
  const [data, setData] = useState<CompanyResearchData>(() => buildInitialCompanyResearch(products));

  function patch(fields: Partial<CompanyResearchData>) {
    setData((current) => ({ ...current, ...fields }));
  }
  function patchPositioning(fields: Partial<CompanyResearchData["positioning"]>) {
    setData((current) => ({ ...current, positioning: { ...current.positioning, ...fields } }));
  }
  function updateOverview(i: number, value: string) {
    setData((current) => ({ ...current, overview: current.overview.map((row, idx) => (idx === i ? { ...row, value } : row)) }));
  }

  const { overview, productName, productDescription, productBullets, positioning } = data;

  return (
    <div className="ob-card" style={{ ...CARD, maxWidth: 560 }}>
      <span style={{ fontSize: 12, fontWeight: 700, color: "var(--color-brand)", letterSpacing: "0.05em", textTransform: "uppercase" as const }}>Company Research</span>
      <h1 style={{ fontSize: 24, margin: "8px 0 8px" }}>Here&apos;s what we found</h1>
      <p style={{ fontSize: 14, color: "var(--color-body)", lineHeight: 1.6, margin: "0 0 24px" }}>
        AI-researched from your website. Edit any field directly, or hit <span style={{ color: "var(--color-brand)" }}>🪄</span> to ask AI to revise it.
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
          <SectionLabel ai={<AIRevise value={positioning} onChange={(v) => patch({ positioning: v })} revise={revisePositioning} scale="section" />}>
            Positioning
          </SectionLabel>
          <div style={{ fontSize: 10.5, fontWeight: 700, color: "var(--color-muted)", letterSpacing: "0.04em", textTransform: "uppercase" as const, marginBottom: 4 }}>Category</div>
          <div style={{ fontSize: 12.5, color: "var(--color-body)", lineHeight: 1.6, margin: "0 0 12px" }}>
            <EditableText value={positioning.category} onChange={(v) => patchPositioning({ category: v })} style={{ fontSize: 12.5 }} revise={reviseText} />
          </div>
          <div style={{ fontSize: 10.5, fontWeight: 700, color: "var(--color-muted)", letterSpacing: "0.04em", textTransform: "uppercase" as const, marginBottom: 6 }}>Key Differentiators</div>
          <EditableBulletList items={positioning.differentiators} onChange={(v) => patchPositioning({ differentiators: v })} />
        </div>
      </div>

      <button onClick={onNext} className="ob-primary-btn" style={PRIMARY_BTN}>
        Approve and Continue
      </button>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   Shared Products & Services building blocks — used by the merged
   Product / ICP / Persona review step further below.
══════════════════════════════════════════════════════════════════════ */
type PSContent = string | string[];
interface PSSection { label: string; content: PSContent }

function PSField({ section }: { section: PSSection }) {
  const isList = Array.isArray(section.content);
  return (
    <div style={{ background: "var(--color-page)", border: "1px solid var(--color-border)", borderRadius: 12, padding: "14px 16px" }}>
      <div style={{ fontSize: 10.5, fontWeight: 700, color: "var(--color-brand)", letterSpacing: "0.05em", textTransform: "uppercase" as const, marginBottom: 8 }}>{section.label}</div>
      {isList ? (
        <BulletList items={section.content as string[]} />
      ) : (
        <p style={{ fontSize: 13, color: "var(--color-body)", lineHeight: 1.6, margin: 0 }}>{section.content as string}</p>
      )}
    </div>
  );
}

interface PSProductState { name: string; badge: string; sections: PSSection[] }

function buildInitialPSProduct(product?: Product): PSProductState {
  const name = product?.name?.trim() || "Your core product";
  const badge = product?.variant?.trim() || "Core product";
  const description = product?.description?.trim() || "AI summarised your website to understand what you sell and who it's for.";

  const sections: PSSection[] = [
    { label: "Description", content: description },
    { label: "Key Features", content: ["AI-drafted, personalized outreach at scale", "Multi-domain, multi-sender sending infrastructure", "Same-day setup with no lengthy onboarding"] },
    { label: "Ideal Customer", content: "Sales leaders and founder-led teams at B2B companies who need to scale outbound without adding headcount." },
    { label: "Value Proposition", content: "Cuts the time spent on manual prospecting by letting AI draft and personalize outreach at scale, while keeping messaging consistent across every sender and domain." },
  ];

  return { name, badge, sections };
}

/* ════════════════════════════════════════════════════════════════════
   Shared Persona building blocks — used by the merged Product / ICP /
   Persona review step further below.
══════════════════════════════════════════════════════════════════════ */
interface PersonaData {
  title: string;
  roleTag: string;
  subtitle: string;
  sections: PSSection[];
}

const PERSONAS_DEFAULT: PersonaData[] = [
  {
    title: "VP Sales / Head of RevOps",
    roleTag: "Mid-Market B2B",
    subtitle: "Owns the outbound quota and is judged on pipeline generated, not activity — manual prospecting doesn't scale to their number.",
    sections: [
      { label: "Primary Pain", content: "Reps spend hours per week manually personalizing outreach, and quality drops as volume increases — pipeline generation stalls below quota." },
      { label: "Opening Hook", content: "Your reps are spending hours a week hand-personalizing emails and still missing quota. AI can draft it in seconds without sounding generic — worth a look?" },
    ],
  },
  {
    title: "Founder or First Sales Hire",
    roleTag: "Early-Stage Startup",
    subtitle: "Wearing multiple hats with no dedicated SDR — needs outbound running without the setup overhead of enterprise tooling.",
    sections: [
      { label: "Primary Pain", content: "Founder is personally writing every outbound email, which doesn't scale past a handful of prospects a day." },
      { label: "Opening Hook", content: "Still writing every cold email yourself? Get AI-personalized sequences live today, no setup team required." },
    ],
  },
  {
    title: "Agency Owner",
    roleTag: "Fractional SDR Team",
    subtitle: "Runs outbound for multiple clients and needs to standardize quality without a separate setup per account.",
    sections: [
      { label: "Primary Pain", content: "Standing up outbound for each new client takes real setup time, and quality varies depending on which junior SDR is writing copy." },
      { label: "Opening Hook", content: "Standardize outbound quality across every client account — AI-personalized sequences without a per-client setup project." },
    ],
  },
];

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
  const [approved, setApproved] = useState<boolean[]>(() => CAMPAIGNS.map(() => false));
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

  const allCampaignsApproved = approved.every(Boolean);
  const firstUnapproved = approved.findIndex((a) => !a);
  const unlockedUpTo = firstUnapproved === -1 ? CAMPAIGNS.length - 1 : firstUnapproved;

  function approveAndAdvance() {
    const nextApproved = approved.map((a, i) => (i === campaignIndex ? true : a));
    setApproved(nextApproved);
    const nextUnapproved = nextApproved.findIndex((a) => !a);
    if (nextUnapproved !== -1) selectCampaign(nextUnapproved);
    else onNext();
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
        {CAMPAIGNS.map((c, i) => {
          const done = approved[i];
          const isCurrent = i === campaignIndex;
          const locked = i > unlockedUpTo;
          return (
            <button key={i} type="button" onClick={() => !locked && selectCampaign(i)} disabled={locked} title={c.name}
              style={{
                width: 24, height: 24, borderRadius: "50%", fontSize: 11, fontWeight: 700, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
                border: "none", cursor: locked ? "not-allowed" : "pointer", fontFamily: "inherit", transition: "all 150ms",
                background: done ? "var(--color-success)" : isCurrent ? "var(--color-brand)" : "var(--color-surface)",
                color: done || isCurrent ? "#fff" : "var(--color-muted)", opacity: locked ? 0.5 : 1,
              }}>
              {done ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
              ) : i + 1}
            </button>
          );
        })}
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

      <button onClick={allCampaignsApproved ? onNext : approveAndAdvance} className="ob-primary-btn" style={PRIMARY_BTN}>
        {allCampaignsApproved || approved[campaignIndex] ? "Continue" : "Approve and Continue"}
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
   Shared ICP building blocks, then STEP 13 — the merged Product / ICP /
   Persona review: one page per product, three collapsible sections
   (Product & Services, ICP, Personas) approved in sequence before the
   next product unlocks.
══════════════════════════════════════════════════════════════════════ */
type Recommendation = "Launch First" | "Test Small" | "Defer";
const RECOMMENDATION_BADGE: Record<Recommendation, React.CSSProperties> = {
  "Launch First": { color: "var(--color-success)", background: "rgba(7,188,12,0.1)", border: "1px solid rgba(7,188,12,0.3)" },
  "Test Small": { color: "var(--color-warning)", background: "rgba(241,196,15,0.15)", border: "1px solid rgba(241,196,15,0.35)" },
  Defer: { color: "var(--color-muted)", background: "var(--color-surface)", border: "1px solid var(--color-border)" },
};
const RECOMMENDATION_ORDER: Recommendation[] = ["Launch First", "Test Small", "Defer"];
function nextRecommendation(r: Recommendation): Recommendation { return RECOMMENDATION_ORDER[(RECOMMENDATION_ORDER.indexOf(r) + 1) % RECOMMENDATION_ORDER.length]; }

const MONO_FONT = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";

interface IcpScore {
  name: string;
  reasoning: string;
  recommendation: Recommendation;
}

const TAM_DESCRIPTION_DEFAULT =
  "Centres on B2B companies running outbound sales motions who still personalize manually or through generic templates — roughly 175,000–230,000 companies and agencies across mid-market, early-stage, and agency segments.";

const ICP_SCORES_DEFAULT: IcpScore[] = [
  {
    name: "VP Sales / Head of RevOps — Mid-Market B2B",
    reasoning: "Closest match to the core use case — owns outbound quota, actively evaluating tools to replace manual prospecting.",
    recommendation: "Launch First",
  },
  {
    name: "Founder-led Sales — Early-Stage Startups",
    reasoning: "Values low setup friction over deep customization; price-sensitive and favors usage-based plans.",
    recommendation: "Test Small",
  },
  {
    name: "Agency / Fractional SDR Teams",
    reasoning: "Needs multi-workspace support per client that may not be a priority yet.",
    recommendation: "Defer",
  },
];

/* ─── Collapsible accordion primitive for the merged review step ───
   Header row (checkmark/lock/section icon + label + optional collapsed
   summary + chevron) toggles the body open; approving marks it done
   and lets the parent decide what opens next. */
const SECTION_ICON_PATH: Record<ReviewSectionKey, React.ReactNode> = {
  product: (
    <>
      <path d="M3 8l2-5h14l2 5" />
      <rect x="3" y="8" width="18" height="12" rx="2" />
      <path d="M9 12.5h6" />
    </>
  ),
  icp: (
    <>
      <circle cx="12" cy="12" r="7.5" />
      <circle cx="12" cy="12" r="2.5" />
      <path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3" />
    </>
  ),
  personas: (
    <>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M4.5 20.5c0-3.6 3.3-6.5 7.5-6.5s7.5 2.9 7.5 6.5" />
    </>
  ),
};

function SectionIcon({ section }: { section: ReviewSectionKey }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {SECTION_ICON_PATH[section]}
    </svg>
  );
}

function CollapsibleReviewSection({ section, label, approved, active, locked, summary, onToggle, onApprove, hideApproveButton, children }: {
  section: ReviewSectionKey; label: string; approved: boolean; active: boolean; locked: boolean; summary?: string;
  onToggle: () => void; onApprove: () => void; hideApproveButton?: boolean; children: React.ReactNode;
}) {
  const iconColor = approved ? "var(--color-success)" : active ? "var(--color-brand)" : "var(--color-subtle)";
  const iconBg = approved ? "rgba(7,188,12,0.12)" : active ? "var(--color-brand-tint)" : "var(--color-surface)";
  return (
    <div
      style={{
        borderRadius: 16, border: `1px solid ${active ? "var(--color-brand)" : "var(--color-border)"}`,
        overflow: "hidden", marginBottom: 14, background: "var(--color-page)",
        boxShadow: active ? "var(--shadow-elevated)" : "none", transition: "border-color 150ms, box-shadow 150ms",
      }}
    >
      <button
        type="button"
        onClick={onToggle}
        disabled={locked}
        style={{
          width: "100%", display: "flex", alignItems: "center", gap: 14, padding: "16px 18px",
          background: "transparent", border: "none", cursor: locked ? "not-allowed" : "pointer",
          fontFamily: "inherit", textAlign: "left" as const, opacity: locked ? 0.55 : 1,
        }}
      >
        <span
          style={{
            width: 34, height: 34, borderRadius: 10, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
            background: iconBg, color: iconColor, transition: "background-color 150ms, color 150ms",
          }}
        >
          {approved ? (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
          ) : locked ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-subtle)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
          ) : (
            <SectionIcon section={section} />
          )}
        </span>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: "block", fontSize: 14.5, fontWeight: 700, color: "var(--color-heading)" }}>{label}</span>
          {!active && summary && (
            <span style={{ display: "block", fontSize: 12, color: "var(--color-muted)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>{summary}</span>
          )}
        </span>
        {approved && !active && (
          <span style={{ flexShrink: 0, fontSize: 11, fontWeight: 700, color: "var(--color-success)", background: "rgba(7,188,12,0.1)", borderRadius: 999, padding: "4px 10px" }}>Approved</span>
        )}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, transform: active ? "rotate(90deg)" : "none", transition: "transform 150ms" }}>
          <polyline points="9 6 15 12 9 18" />
        </svg>
      </button>
      {active && (
        <div style={{ padding: "6px 18px 20px", borderTop: "1px solid var(--color-border)", background: "var(--color-surface)" }}>
          <div style={{ paddingTop: 16, display: "flex", flexDirection: "column", gap: 12 }}>{children}</div>
          {!hideApproveButton && (
            <button type="button" onClick={onApprove} className="ob-primary-btn" style={{ ...PRIMARY_BTN, width: "auto", padding: "10px 24px", fontSize: 13, marginTop: 18, borderRadius: 999, gap: 6 }}>
              {approved ? "Save changes" : (
                <>
                  Approve
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
                </>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function ProductServicesPanel({ state, onChange }: { state: PSProductState; onChange: (next: PSProductState) => void }) {
  return (
    <div>
      <SectionRevisePrompt
        value={state} onChange={onChange} revise={reviseProductServicesBundle}
        placeholder="Tell AI what to change about the product, description, features, ideal customer, or value prop…"
      />
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <span style={{ flex: "1 1 auto", minWidth: 0, fontSize: 15, fontWeight: 700, color: "var(--color-heading)" }}>{state.name}</span>
        <span style={{ fontSize: 11.5, fontWeight: 600, color: "var(--color-brand)", background: "var(--color-brand-tint)", borderRadius: 999, padding: "3px 10px", flexShrink: 0 }}>
          {state.badge}
        </span>
      </div>
      <div className="ob-field-grid">
        {state.sections.map((section) => (
          <PSField key={section.label} section={section} />
        ))}
      </div>
    </div>
  );
}

function IcpPanel({ tamDescription, icps, onChangeTam, onChangeIcps }: {
  tamDescription: string; icps: IcpScore[];
  onChangeTam: (v: string) => void; onChangeIcps: (v: IcpScore[]) => void;
}) {
  function cycleRecommendation(i: number) {
    onChangeIcps(icps.map((icp, idx) => (idx === i ? { ...icp, recommendation: nextRecommendation(icp.recommendation) } : icp)));
  }

  return (
    <div>
      <SectionRevisePrompt
        value={{ tamDescription, icps }}
        onChange={(next) => { onChangeTam(next.tamDescription); onChangeIcps(next.icps); }}
        revise={reviseIcpBundle}
        placeholder="Tell AI what to change about the market size or any ICP…"
      />
      <div style={{ display: "flex", gap: 10, alignItems: "flex-start", background: "var(--color-brand-faint)", border: "1px solid var(--color-border)", borderRadius: 12, padding: "14px 16px", marginBottom: 14 }}>
        <span style={{ flexShrink: 0, width: 26, height: 26, borderRadius: 8, background: "var(--color-brand-tint)", color: "var(--color-brand)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 8v4l3 2" /></svg>
        </span>
        <p style={{ flex: 1, fontSize: 13, color: "var(--color-body)", lineHeight: 1.6, margin: 0 }}>{tamDescription}</p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {icps.map((icp, i) => (
          <div key={i} style={{ padding: "14px 16px", borderRadius: 12, border: "1px solid var(--color-border)", background: "var(--color-page)" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 6 }}>
              <span style={{ flex: 1, fontSize: 13.5, fontWeight: 700, color: "var(--color-heading)", lineHeight: 1.4 }}>{icp.name}</span>
              <button type="button" onClick={() => cycleRecommendation(i)} title="Click to change recommendation"
                style={{ flexShrink: 0, fontFamily: MONO_FONT, fontSize: 10.5, fontWeight: 700, padding: "4px 10px", borderRadius: 999, whiteSpace: "nowrap" as const, cursor: "pointer", border: "none", ...RECOMMENDATION_BADGE[icp.recommendation] }}>
                {icp.recommendation}
              </button>
            </div>
            <div style={{ fontSize: 12.5, color: "var(--color-muted)", lineHeight: 1.5 }}>{icp.reasoning}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PersonasPanel({ personas, onChange, approvedList, onApprovePersona }: {
  personas: PersonaData[]; onChange: (next: PersonaData[]) => void;
  approvedList: boolean[]; onApprovePersona: (i: number) => void;
}) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const persona = personas[selectedIndex];
  const firstIncompleteIndex = approvedList.findIndex((a) => !a);
  const unlockedUpTo = firstIncompleteIndex === -1 ? personas.length - 1 : firstIncompleteIndex;
  const personaApproved = approvedList[selectedIndex];

  function approveCurrent() {
    onApprovePersona(selectedIndex);
    if (selectedIndex < personas.length - 1) setSelectedIndex(selectedIndex + 1);
  }

  return (
    <div>
      <SectionRevisePrompt
        value={personas} onChange={onChange} revise={revisePersonasBundle}
        placeholder="Tell AI what to change across all personas…"
      />
      {personas.length > 1 && (
        <div style={{ display: "flex", gap: 8, marginBottom: 14, overflowX: "auto" as const, paddingBottom: 2 }}>
          {personas.map((p, i) => {
            const isCurrent = i === selectedIndex;
            const done = approvedList[i];
            const locked = i > unlockedUpTo;
            return (
              <button key={i} type="button" onClick={() => !locked && setSelectedIndex(i)} disabled={locked} title={p.title}
                style={{
                  display: "flex", alignItems: "center", gap: 7, flexShrink: 0, padding: "6px 12px 6px 6px", borderRadius: 999,
                  border: "none", cursor: locked ? "not-allowed" : "pointer", fontFamily: "inherit", transition: "all 150ms",
                  background: isCurrent ? "var(--color-brand)" : "var(--color-surface)", opacity: locked ? 0.5 : 1,
                }}
              >
                <span style={{
                  width: 22, height: 22, borderRadius: "50%", fontSize: 10.5, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center",
                  background: done ? "var(--color-success)" : isCurrent ? "rgba(255,255,255,0.25)" : "var(--color-page)",
                  color: done || isCurrent ? "#fff" : "var(--color-muted)",
                }}>
                  {done ? (
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
                  ) : i + 1}
                </span>
                <span style={{ fontSize: 12, fontWeight: 600, color: isCurrent ? "#fff" : "var(--color-body)", whiteSpace: "nowrap" as const }}>{p.title}</span>
              </button>
            );
          })}
        </div>
      )}

      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 14, background: "var(--color-page)", border: "1px solid var(--color-border)", borderRadius: 12, padding: "14px 16px" }}>
        <div style={{ width: 34, height: 34, borderRadius: "50%", background: "var(--color-brand)", color: "#fff", fontSize: 13, fontWeight: 700, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {selectedIndex + 1}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" as const }}>
            <span style={{ flex: "1 1 160px", minWidth: 0, fontSize: 14.5, fontWeight: 700, color: "var(--color-heading)" }}>{persona.title}</span>
            <span style={{ flexShrink: 0, fontSize: 11, fontWeight: 600, color: "var(--color-brand)", border: "1px solid var(--color-border)", background: "var(--color-brand-tint)", borderRadius: 999, padding: "2px 10px" }}>{persona.roleTag}</span>
            {personas.length > 1 && (
              <span style={{ flexShrink: 0, fontSize: 11, color: "var(--color-subtle)", marginLeft: "auto" }}>{selectedIndex + 1} / {personas.length}</span>
            )}
          </div>
          <p style={{ fontSize: 12.5, color: "var(--color-muted)", lineHeight: 1.5, margin: "5px 0 0" }}>{persona.subtitle}</p>
        </div>
      </div>

      <div className="ob-field-grid">
        {persona.sections.map((section) => (
          <PSField key={`${selectedIndex}-${section.label}`} section={section} />
        ))}
      </div>

      <button type="button" onClick={approveCurrent} className="ob-primary-btn" style={{ ...PRIMARY_BTN, width: "auto", padding: "10px 24px", fontSize: 13, marginTop: 14, borderRadius: 999, gap: 6 }}>
        {personaApproved ? "Save changes" : (
          <>
            Approve this persona
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
          </>
        )}
      </button>
    </div>
  );
}

type ReviewSectionKey = "product" | "icp" | "personas";
const REVIEW_SECTION_ORDER: ReviewSectionKey[] = ["product", "icp", "personas"];
function nextReviewSection(s: ReviewSectionKey): ReviewSectionKey | null {
  const idx = REVIEW_SECTION_ORDER.indexOf(s);
  return idx < REVIEW_SECTION_ORDER.length - 1 ? REVIEW_SECTION_ORDER[idx + 1] : null;
}

interface ProductReviewState {
  product: PSProductState;
  tamDescription: string;
  icps: IcpScore[];
  personas: PersonaData[];
  personaApproved: boolean[];
  approved: { product: boolean; icp: boolean; personas: boolean };
  activeSection: ReviewSectionKey | null;
}

function buildInitialProductReview(product: Product): ProductReviewState {
  return {
    product: buildInitialPSProduct(product),
    tamDescription: TAM_DESCRIPTION_DEFAULT,
    icps: ICP_SCORES_DEFAULT.map((icp) => ({ ...icp })),
    personas: PERSONAS_DEFAULT.map((p) => ({ ...p, sections: p.sections.map((s) => ({ ...s })) })),
    personaApproved: PERSONAS_DEFAULT.map(() => false),
    approved: { product: false, icp: false, personas: false },
    activeSection: "product",
  };
}

const REVIEW_SECTION_LABEL: Record<ReviewSectionKey, string> = { product: "Product", icp: "ICP", personas: "Personas" };

function SectionProgressBar({ approved, active }: { approved: ProductReviewState["approved"]; active: ReviewSectionKey | null }) {
  return (
    <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
      {REVIEW_SECTION_ORDER.map((key) => {
        const done = approved[key];
        const isActive = active === key;
        const color = done ? "var(--color-success)" : isActive ? "var(--color-brand)" : "var(--color-subtle)";
        return (
          <div key={key} style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ height: 4, borderRadius: 999, background: done || isActive ? color : "var(--color-border)" }} />
            <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.03em", textTransform: "uppercase" as const, color }}>
              {REVIEW_SECTION_LABEL[key]}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function StepProductReview({ products, onNext }: { products: Product[]; onNext: () => void }) {
  const [reviewStates, setReviewStates] = useState<ProductReviewState[]>(() => products.map((p) => buildInitialProductReview(p)));
  const [selectedIndex, setSelectedIndex] = useState(0);
  const current = reviewStates[selectedIndex];
  const n = selectedIndex + 1;

  function patchCurrent(fields: Partial<ProductReviewState>) {
    setReviewStates((cur) => cur.map((s, i) => (i === selectedIndex ? { ...s, ...fields } : s)));
  }
  function toggleSection(section: ReviewSectionKey) {
    patchCurrent({ activeSection: current.activeSection === section ? null : section });
  }
  function approveSection(section: ReviewSectionKey) {
    patchCurrent({ approved: { ...current.approved, [section]: true }, activeSection: nextReviewSection(section) });
  }
  function approvePersona(i: number) {
    const nextPersonaApproved = current.personaApproved.map((a, idx) => (idx === i ? true : a));
    const allPersonasDone = nextPersonaApproved.every(Boolean);
    patchCurrent({
      personaApproved: nextPersonaApproved,
      approved: allPersonasDone ? { ...current.approved, personas: true } : current.approved,
      activeSection: allPersonasDone ? nextReviewSection("personas") : current.activeSection,
    });
  }

  const allApproved = (s: ProductReviewState) => s.approved.product && s.approved.icp && s.approved.personas;
  const firstIncompleteIndex = reviewStates.findIndex((s) => !allApproved(s));
  const unlockedUpTo = firstIncompleteIndex === -1 ? reviewStates.length - 1 : firstIncompleteIndex;
  const currentDone = allApproved(current);
  const approvedCount = REVIEW_SECTION_ORDER.filter((key) => current.approved[key]).length;

  function handleContinue() {
    if (selectedIndex < products.length - 1) setSelectedIndex(selectedIndex + 1);
    else onNext();
  }

  return (
    <div className="ob-card ob-review-card" style={{ ...CARD, maxWidth: 660 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 8 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: "var(--color-brand)", letterSpacing: "0.05em", textTransform: "uppercase" as const }}>Product, ICP &amp; Personas</span>
        <span style={{ fontSize: 11.5, fontWeight: 700, color: "var(--color-muted)", background: "var(--color-surface)", borderRadius: 999, padding: "4px 10px", flexShrink: 0 }}>
          {approvedCount}/3 approved
        </span>
      </div>
      <h1 style={{ fontSize: 24, margin: "0 0 8px" }}>
        {products.length > 1 ? `Product ${n} of ${products.length} — ${current.product.name}` : "Review your product, ICP & personas"}
      </h1>
      <p style={{ fontSize: 14, color: "var(--color-body)", lineHeight: 1.6, margin: "0 0 20px" }}>
        Review each section below and approve it to unlock the next. Each section has one AI prompt — describe what to change and every field in that section updates together (e.g. &ldquo;make this more enterprise-focused&rdquo; revises the description, ideal customer, and value prop at once).
      </p>

      {products.length > 1 && (
        <div style={{ display: "flex", gap: 8, marginBottom: 20, overflowX: "auto" as const, paddingBottom: 2 }}>
          {reviewStates.map((s, i) => {
            const done = allApproved(s);
            const isCurrent = i === selectedIndex;
            const locked = i > unlockedUpTo;
            return (
              <button key={i} type="button" onClick={() => !locked && setSelectedIndex(i)} disabled={locked} title={s.product.name}
                style={{
                  display: "flex", alignItems: "center", gap: 7, flexShrink: 0, padding: "6px 12px 6px 6px", borderRadius: 999,
                  border: "none", cursor: locked ? "not-allowed" : "pointer", fontFamily: "inherit", transition: "all 150ms",
                  background: isCurrent ? "var(--color-brand)" : "var(--color-surface)", opacity: locked ? 0.5 : 1,
                }}>
                <span style={{
                  width: 22, height: 22, borderRadius: "50%", fontSize: 10.5, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center",
                  background: done ? "var(--color-success)" : isCurrent ? "rgba(255,255,255,0.25)" : "var(--color-page)",
                  color: done || isCurrent ? "#fff" : "var(--color-muted)",
                }}>
                  {done ? (
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
                  ) : i + 1}
                </span>
                <span style={{ fontSize: 12, fontWeight: 600, color: isCurrent ? "#fff" : "var(--color-body)", whiteSpace: "nowrap" as const }}>{s.product.name}</span>
              </button>
            );
          })}
        </div>
      )}

      <SectionProgressBar approved={current.approved} active={current.activeSection} />

      <CollapsibleReviewSection
        section="product"
        label={`${n}. Product & Services`}
        approved={current.approved.product}
        active={current.activeSection === "product"}
        locked={false}
        summary={current.product.name}
        onToggle={() => toggleSection("product")}
        onApprove={() => approveSection("product")}
      >
        <ProductServicesPanel state={current.product} onChange={(next) => patchCurrent({ product: next })} />
      </CollapsibleReviewSection>

      <CollapsibleReviewSection
        section="icp"
        label={`${n}A. Ideal Customer Profile`}
        approved={current.approved.icp}
        active={current.activeSection === "icp"}
        locked={!current.approved.product}
        summary={`${current.icps.length} ICPs identified`}
        onToggle={() => toggleSection("icp")}
        onApprove={() => approveSection("icp")}
      >
        <IcpPanel
          tamDescription={current.tamDescription}
          icps={current.icps}
          onChangeTam={(v) => patchCurrent({ tamDescription: v })}
          onChangeIcps={(v) => patchCurrent({ icps: v })}
        />
      </CollapsibleReviewSection>

      <CollapsibleReviewSection
        section="personas"
        label={`${n}B. Personas`}
        approved={current.approved.personas}
        active={current.activeSection === "personas"}
        locked={!current.approved.icp}
        summary={`${current.personaApproved.filter(Boolean).length}/${current.personas.length} personas approved`}
        onToggle={() => toggleSection("personas")}
        onApprove={() => approveSection("personas")}
        hideApproveButton
      >
        <PersonasPanel
          personas={current.personas}
          onChange={(v) => patchCurrent({ personas: v })}
          approvedList={current.personaApproved}
          onApprovePersona={approvePersona}
        />
      </CollapsibleReviewSection>

      <button onClick={handleContinue} disabled={!currentDone} className="ob-primary-btn" style={{ ...PRIMARY_BTN, marginTop: 12, opacity: currentDone ? 1 : 0.5, cursor: currentDone ? "pointer" : "not-allowed" }}>
        Approve &amp; Continue
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
      </button>
      {!currentDone && (
        <p style={{ fontSize: 12, color: "var(--color-muted)", textAlign: "center" as const, margin: "10px 0 0" }}>
          Approve all three sections above to continue.
        </p>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   MAIN SHELL
══════════════════════════════════════════════════════════════════════ */
type StepName =
  | "brand_welcome"
  | "website" | "products" | "research_summary" | "starting_research"
  | "infra_intro"
  | "primary_domain" | "volume"
  | "senders" | "infra_summary" | "connections_intro" | "connect" | "connect_linkedin" | "connect_calendar" | "invite" | "connections_summary" | "review_intro" | "review_order" | "researching" | "company_research" | "product_review" | "outreach_campaign" | "all_set" | "cleared_for_launch";

const STEP_ORDER: StepName[] = [
  "website", "products", "research_summary",
  "primary_domain", "volume",
  "senders", "infra_summary", "connect", "connect_linkedin", "connect_calendar", "invite", "connections_summary", "review_intro", "review_order", "researching", "company_research", "product_review", "outreach_campaign",
];

/* ─── Resume draft ──────────────────────────────────────────────── */
const ALL_STEPS: StepName[] = [
  "brand_welcome", "website", "products", "research_summary", "starting_research",
  "infra_intro", "primary_domain", "volume", "senders", "infra_summary",
  "connections_intro", "connect", "connect_linkedin", "connect_calendar", "invite", "connections_summary",
  "review_intro", "review_order", "researching", "company_research",
  "product_review", "outreach_campaign",
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
  // Starts identical on server and client (no draft applied yet) so hydration
  // never mismatches; the actual localStorage check happens after mount below.
  const [draft, setDraft] = useState<OnboardingDraft | null>(null);
  const [showResume, setShowResume] = useState(false);

  const [step, setStep] = useState<StepName>("brand_welcome");
  const [enteredApp, setEnteredApp] = useState(false);

  const [website, setWebsite] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [primaryDomain, setPrimaryDomain] = useState("");
  const [forwardingDomain, setForwardingDomain] = useState("");
  const [selectedPackage, setSelectedPackage] = useState<PackageKey>("growth");
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

  if (enteredApp) {
    return <KnowledgeCenter onExit={() => setEnteredApp(false)} />;
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
      <PageChrome hideLogo={step === "brand_welcome"} />
      <div
        className="ob-shell-content"
        style={
          step === "starting_research" || step === "brand_welcome"
            ? { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: "100%", minHeight: "100vh", padding: "24px", position: "relative", zIndex: 1 }
            : { display: "flex", flexDirection: "column", alignItems: "center", width: "100%", padding: "80px 24px 40px", position: "relative", zIndex: 1 }
        }
      >
        <PhaseStepper step={step} />

        {step === "brand_welcome" && (
          <StepBrandWelcome onNext={() => advance("website")} onSkip={() => setEnteredApp(true)} />
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
          <StepPrimaryDomain website={website} initialPrimaryDomain={primaryDomain} initialForwardingDomain={forwardingDomain} onNext={(primary, forwarding) => advance("volume", { primaryDomain: primary, forwardingDomain: forwarding })} />
        )}
        {step === "volume" && (
          <StepVolume initialPackage={selectedPackage} onNext={(pkg) => advance("senders", { selectedPackage: pkg })} onBack={goBack} />
        )}
        {step === "senders" && (
          <StepSenders initialSenders={senders} onNext={(s) => advance("infra_summary", { senders: s })} onBack={goBack} />
        )}
        {step === "infra_summary" && (
          <StepInfraSummary primaryDomain={primaryDomain} selectedPackage={selectedPackage} senders={senders} onNext={() => advance("connections_intro")} onBack={goBack} />
        )}
        {step === "connections_intro" && (
          <StepConnectionsIntro onNext={() => advance("connect")} />
        )}
        {step === "connect" && (
          <StepConnect initialConnected={connectedAccounts} onNext={(c) => advance("connect_linkedin", { connectedAccounts: c })} />
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
          <StepConnectionsSummary connectedAccounts={connectedAccounts} connectedCalendars={connectedCalendars} invitees={invitees} onNext={() => advance("review_intro")} onBack={goBack} />
        )}
        {step === "review_intro" && (
          <StepReviewIntro onNext={() => advance("review_order")} />
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
          <StepCompanyResearch products={products} onNext={() => advance("product_review")} />
        )}
        {step === "product_review" && (
          <StepProductReview products={products} onNext={() => advance("outreach_campaign")} />
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
            setEnteredApp(true);
          }} />
        )}
      </div>
    </div>
  );
}
