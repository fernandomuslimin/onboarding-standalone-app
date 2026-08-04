import { CampaignCombo, ICPS, PERSONAS, PRODUCTS } from "./data";
import { Icon, IconName } from "./ui";

export const MONO = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";

export const CHANNEL_ICON: Record<CampaignCombo["channel"], IconName> = {
  Email: "mail", LinkedIn: "linkedin", "Cold Calling": "phone",
};

export const STATUS_STYLE: Record<CampaignCombo["status"], React.CSSProperties> = {
  Completed: { color: "var(--color-success)", background: "rgba(7,188,12,0.1)", border: "1px solid rgba(7,188,12,0.3)" },
  Active: { color: "var(--color-brand)", background: "var(--color-brand-tint)", border: "1px solid rgba(87,97,254,0.3)" },
  Scheduled: { color: "var(--color-warning)", background: "rgba(241,196,15,0.15)", border: "1px solid rgba(241,196,15,0.35)" },
  Draft: { color: "var(--color-muted)", background: "var(--color-surface)", border: "1px solid var(--color-border)" },
};

export function overallFit(combo: CampaignCombo): number {
  return combo.icpScore * 0.4 + combo.personaScore * 0.3 + combo.productScore * 0.3;
}
export function tone(v: number): string {
  if (v >= 8) return "var(--color-success)";
  if (v >= 5) return "var(--color-warning)";
  return "var(--color-error)";
}

export const GRID_COLS = "1.6fr 0.7fr 1.8fr 20px";
export const HEADER_CELL: React.CSSProperties = { fontSize: 10, fontWeight: 700, color: "var(--color-muted)", letterSpacing: "0.04em", textTransform: "uppercase", fontFamily: MONO, whiteSpace: "nowrap" };

export function ComboTableHeader() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: GRID_COLS, gap: 10, padding: "10px 16px", background: "var(--color-surface)", borderBottom: "1px solid var(--color-border)" }}>
      <span style={HEADER_CELL}>Combination</span>
      <span style={HEADER_CELL}>Score</span>
      <span style={HEADER_CELL}>Campaign</span>
      <span />
    </div>
  );
}

export function ComboRow({ combo, onOpen, subtitleOverride }: { combo: CampaignCombo; onOpen: () => void; subtitleOverride?: string }) {
  const product = PRODUCTS.find((p) => p.id === combo.productId);
  const icp = ICPS.find((i) => i.id === combo.icpId);
  const persona = PERSONAS.find((p) => p.id === combo.personaId);

  return (
    <div style={{ borderBottom: "1px solid var(--color-border)" }}>
      <button type="button" onClick={onOpen} className="kc-list-row"
        style={{ display: "grid", gridTemplateColumns: GRID_COLS, gap: 10, alignItems: "center", width: "100%", textAlign: "left", padding: "14px 16px", background: "transparent", border: "none", cursor: "pointer", fontFamily: "inherit" }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--color-heading)", marginBottom: 2 }}>{product?.name}</div>
          <div style={{ fontSize: 11.5, color: "var(--color-muted)" }}>{subtitleOverride ?? `${icp?.name} → ${persona?.name}`}</div>
        </div>
        <span style={{ fontFamily: MONO, fontSize: 16, fontWeight: 800, color: tone(overallFit(combo)) }}>{overallFit(combo).toFixed(1)}</span>
        <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
          <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 24, height: 24, borderRadius: 7, background: "var(--color-surface)", color: "var(--color-brand)", flexShrink: 0 }}>
            <Icon name={CHANNEL_ICON[combo.channel]} size={13} />
          </span>
          <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--color-heading)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{combo.campaignName}</span>
          <span style={{ fontSize: 10.5, fontWeight: 700, borderRadius: 999, padding: "2px 8px", flexShrink: 0, ...STATUS_STYLE[combo.status] }}>{combo.status}</span>
        </div>
        <span style={{ color: "var(--color-muted)", display: "flex", transform: "rotate(180deg)" }}>
          <Icon name="chevron-left" size={14} />
        </span>
      </button>
    </div>
  );
}
