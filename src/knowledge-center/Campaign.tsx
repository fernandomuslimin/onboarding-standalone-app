import { useState } from "react";
import { CAMPAIGN_COMBOS } from "./data";
import { ComboRow, ComboTableHeader, overallFit } from "./ComboRow";

export function CampaignSection() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const ranked = [...CAMPAIGN_COMBOS].sort((a, b) => overallFit(b) - overallFit(a));

  return (
    <div style={{ maxWidth: 1080 }}>
      <div style={{ marginBottom: 18 }}>
        <h2 style={{ fontSize: 16, fontWeight: 800, margin: "0 0 4px" }}>Combination Scoring</h2>
        <p style={{ fontSize: 12.5, color: "var(--color-muted)", margin: 0 }}>Weighted overall fit per Product × ICP × Persona combination — 40% ICP, 30% Persona, 30% Product Component.</p>
      </div>

      <div style={{ overflowX: "auto" }}>
        <div style={{ minWidth: 820, borderRadius: 14, border: "1px solid var(--color-border)", overflow: "hidden", background: "var(--color-page)", boxShadow: "var(--shadow-card)" }}>
          <ComboTableHeader />
          {ranked.map((combo) => (
            <ComboRow key={combo.id} combo={combo} expanded={expandedId === combo.id} onToggle={() => setExpandedId((id) => (id === combo.id ? null : combo.id))} />
          ))}
        </div>
      </div>
    </div>
  );
}
