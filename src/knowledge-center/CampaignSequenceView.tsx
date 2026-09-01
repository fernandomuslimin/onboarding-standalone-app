import { CampaignCombo, ICPS, PERSONAS, PRODUCTS } from "./data";
import { CardSection, Icon, StatTile, formatCurrencyShort } from "./ui";
import { CHANNEL_ICON, MONO, STATUS_STYLE, overallFit } from "./ComboRow";

export function CampaignSequenceView({ combo }: { combo: CampaignCombo }) {
  const product = PRODUCTS.find((p) => p.id === combo.productId);
  const icp = ICPS.find((i) => i.id === combo.icpId);
  const persona = PERSONAS.find((p) => p.id === combo.personaId);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ background: "var(--color-page)", border: "1px solid var(--color-border)", borderRadius: 14, padding: "18px 22px", boxShadow: "var(--shadow-card)" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 14, marginBottom: 8 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: "var(--color-heading)", marginBottom: 4 }}>{combo.campaignName}</div>
            <div style={{ fontSize: 12.5, color: "var(--color-muted)" }}>{product?.name} · {icp?.name} → {persona?.name}</div>
          </div>
          <span style={{ fontSize: 10.5, fontWeight: 700, borderRadius: 999, padding: "3px 10px", flexShrink: 0, ...STATUS_STYLE[combo.status] }}>{combo.status}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 24, height: 24, borderRadius: 7, background: "var(--color-surface)", color: "var(--color-brand)", flexShrink: 0 }}>
            <Icon name={CHANNEL_ICON[combo.channel]} size={13} />
          </span>
          <span style={{ fontSize: 12.5, color: "var(--color-body)" }}>{combo.channel} · {combo.sequence.length}-step sequence</span>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        <StatTile label="Overall Fit" value={overallFit(combo).toFixed(1)} />
        <StatTile label="Opportunities" value={String(combo.opportunities)} />
        <StatTile label="Pipeline" value={formatCurrencyShort(combo.pipelineValue)} />
        <StatTile label="Steps" value={String(combo.sequence.length)} />
      </div>

      <CardSection title="Sequence">
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {combo.sequence.map((step, i) => (
            <div key={i} style={{ display: "flex", gap: 14, paddingBottom: i === combo.sequence.length - 1 ? 0 : 18 }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                <div style={{
                  width: 30, height: 30, borderRadius: 999, background: "var(--color-brand-tint)", color: "var(--color-brand)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Icon name={CHANNEL_ICON[step.channel]} size={14} />
                </div>
                {i < combo.sequence.length - 1 && <div style={{ flex: 1, width: 2, background: "var(--color-border)", marginTop: 4 }} />}
              </div>
              <div style={{ flex: 1, minWidth: 0, paddingTop: 2 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <span style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, color: "var(--color-brand)", textTransform: "uppercase", letterSpacing: "0.04em" }}>Day {step.day}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "var(--color-muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>{step.channel}</span>
                </div>
                <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 10, padding: "12px 14px" }}>
                  {step.subject && <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--color-heading)", marginBottom: 6 }}>{step.subject}</div>}
                  <p style={{ margin: 0, fontSize: 12.5, color: "var(--color-body)", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{step.copy}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardSection>
    </div>
  );
}
