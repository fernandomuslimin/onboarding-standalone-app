import { useState } from "react";
import { INFRASTRUCTURE_STATUS, PERSONAS, PRODUCTS, ROADMAP_PHASES } from "./data";
import { EmptyState, Icon, IconName, KC_PRIMARY_BTN } from "./ui";

const STATUS_ICON: Record<string, IconName> = { email: "mail", linkedin: "linkedin", "cold-calling": "phone", phases: "layers" };

function StatusPill({ status }: { status: "warming_up" | "ready" | "placeholder" }) {
  if (status === "ready") return <span style={{ fontSize: 10.5, fontWeight: 700, color: "var(--color-success)", background: "rgba(7,188,12,0.1)", border: "1px solid rgba(7,188,12,0.3)", borderRadius: 999, padding: "2px 9px" }}>Ready</span>;
  if (status === "warming_up") return <span style={{ fontSize: 10.5, fontWeight: 700, color: "var(--color-warning)", background: "rgba(241,196,15,0.15)", border: "1px solid rgba(241,196,15,0.35)", borderRadius: 999, padding: "2px 9px" }}>Warming Up</span>;
  return <span style={{ fontSize: 10.5, fontWeight: 700, color: "var(--color-muted)", background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 999, padding: "2px 9px" }}>Placeholder</span>;
}

export function StrategySection() {
  const [generated, setGenerated] = useState(false);

  return (
    <div style={{ maxWidth: 900 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 22 }}>
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 800, margin: "0 0 4px" }}>Outreach Strategy</h2>
          <p style={{ fontSize: 12.5, color: "var(--color-muted)", margin: 0 }}>Sequenced rollout across your highest-fit product, ICP, and persona combinations.</p>
        </div>
        <button type="button" className="kc-primary-btn" style={KC_PRIMARY_BTN} onClick={() => setGenerated(true)}>
          <Icon name="compass" size={14} />
          Generate Roadmap
        </button>
      </div>

      <div style={{ marginBottom: 22 }}>
        <h3 style={{ fontSize: 12.5, fontWeight: 700, color: "var(--color-muted)", letterSpacing: "0.04em", textTransform: "uppercase", margin: "0 0 10px" }}>Infrastructure Status</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
          {INFRASTRUCTURE_STATUS.map((ch) => (
            <div key={ch.key} style={{ background: "var(--color-page)", border: "1px solid var(--color-border)", borderRadius: 12, padding: "14px 16px", boxShadow: "var(--shadow-card)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: "var(--color-brand-tint)", color: "var(--color-brand)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon name={STATUS_ICON[ch.key]} size={14} />
                </div>
                <StatusPill status={ch.status} />
              </div>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--color-heading)", marginBottom: 2 }}>{ch.label}</div>
              <div style={{ fontSize: 12, color: "var(--color-muted)" }}>{ch.detail}</div>
            </div>
          ))}
        </div>
      </div>

      {!generated ? (
        <div style={{ background: "var(--color-page)", border: "1px solid var(--color-border)", borderRadius: 14, boxShadow: "var(--shadow-card)" }}>
          <EmptyState icon="route" title="No strategy generated yet"
            subtitle={`${PRODUCTS.length} products · ${PERSONAS.length} personas ready to sequence once you generate a roadmap.`} />
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {ROADMAP_PHASES.map((phase, i) => (
            <div key={phase.phase} style={{ display: "flex", gap: 16, background: "var(--color-page)", border: "1px solid var(--color-border)", borderRadius: 14, padding: "16px 20px", boxShadow: "var(--shadow-card)" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0, width: 22 }}>
                <span style={{ width: 22, height: 22, borderRadius: "50%", background: "var(--color-brand)", color: "#fff", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{i + 1}</span>
                {i < ROADMAP_PHASES.length - 1 && <span style={{ flex: 1, width: 2, background: "var(--color-border-strong)", marginTop: 4 }} />}
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 13.5, fontWeight: 700, color: "var(--color-heading)" }}>{phase.phase}</span>
                  <span style={{ fontSize: 11.5, color: "var(--color-muted)" }}>{phase.window}</span>
                </div>
                <ul style={{ margin: 0, padding: "0 0 0 16px", display: "flex", flexDirection: "column", gap: 3 }}>
                  {phase.combos.map((c) => <li key={c} style={{ fontSize: 12.5, color: "var(--color-body)", lineHeight: 1.5 }}>{c}</li>)}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
