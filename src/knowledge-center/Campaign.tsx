import { useState } from "react";
import { CAMPAIGN_COMBOS } from "./data";
import { ComboRow, ComboTableHeader, overallFit } from "./ComboRow";
import { CampaignSequenceView } from "./CampaignSequenceView";
import { Drawer } from "./ui";

export function CampaignSection() {
  const [openComboId, setOpenComboId] = useState<string | null>(null);
  const ranked = [...CAMPAIGN_COMBOS].sort((a, b) => overallFit(b) - overallFit(a));
  const openCombo = CAMPAIGN_COMBOS.find((c) => c.id === openComboId) ?? null;

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
            <ComboRow key={combo.id} combo={combo} onOpen={() => setOpenComboId(combo.id)} />
          ))}
        </div>
      </div>

      <Drawer open={!!openCombo} onClose={() => setOpenComboId(null)} title="Campaign Sequence" width={720}>
        {openCombo && <CampaignSequenceView combo={openCombo} />}
      </Drawer>
    </div>
  );
}
