import { useState } from "react";
import { PRODUCTS, PersonaDetail, PersonaField, personaPerformance } from "./data";
import { CardSection, ChipList, Drawer, EditableField, EmptyState, FieldLabel, Icon, IconName, KC_DANGER_BTN, KC_PRIMARY_BTN, StatTile, formatCurrencyShort } from "./ui";
import { ComboRow, ComboTableHeader, overallFit } from "./ComboRow";
import { CampaignSequenceView } from "./CampaignSequenceView";

const SECTION_ICON: Record<string, IconName> = {
  "Overview": "compass",
  "Responsibilities": "briefcase",
  "Goals": "flag",
  "Pain Points": "target",
  "Challenges": "shield",
  "Decision Making": "brain",
  "Current Solutions": "layers",
  "Buying Behavior": "handshake",
  "Buyer Psychology": "globe",
  "Messaging Guidance": "message",
  "Account Intelligence": "search",
  "Prospecting & Search": "map",
  "Representative Examples": "book",
  "Outreach Strategy": "route",
  "Qualification": "check",
};

export function emptyPersona(id: string, icpId: string): PersonaDetail {
  return { id, name: "Untitled persona", department: "—", matchPct: 0, icpId, subtitle: "", sections: [] };
}

function PersonaFieldRow({ field, onChange }: { field: PersonaField; onChange: (v: string | string[]) => void }) {
  return (
    <div>
      <FieldLabel>{field.label}</FieldLabel>
      {Array.isArray(field.value)
        ? <ChipList items={field.value} onChange={onChange} />
        : <EditableField value={field.value} onChange={onChange} multiline rows={2} />}
    </div>
  );
}

function PerformanceSection({ persona }: { persona: PersonaDetail }) {
  const { combos, products, opportunities, pipelineValue } = personaPerformance(persona.id);
  const [openComboId, setOpenComboId] = useState<string | null>(null);
  const ranked = [...combos].sort((a, b) => overallFit(b) - overallFit(a));
  const openCombo = combos.find((c) => c.id === openComboId) ?? null;

  return (
    <CardSection icon="chart" title="Performance">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: combos.length === 0 ? 0 : 18 }}>
        <StatTile icon="grid" label="Products" value={String(products)} />
        <StatTile icon="target" label="Opportunities" value={String(opportunities)} />
        <StatTile icon="dollar" label="Pipeline" value={formatCurrencyShort(pipelineValue)} />
      </div>
      {combos.length === 0 ? (
        <EmptyState icon="route" title="No campaigns yet" subtitle="Campaigns targeting this persona will appear here once created." />
      ) : (
        <div style={{ borderRadius: 12, border: "1px solid var(--color-border)", overflow: "hidden" }}>
          <ComboTableHeader />
          {ranked.map((combo) => (
            <ComboRow key={combo.id} combo={combo} onOpen={() => setOpenComboId(combo.id)}
              subtitleOverride={PRODUCTS.find((p) => p.id === combo.productId)?.subtitle} />
          ))}
        </div>
      )}

      <Drawer open={!!openCombo} onClose={() => setOpenComboId(null)} title="Campaign Sequence" width={720}>
        {openCombo && <CampaignSequenceView combo={openCombo} />}
      </Drawer>
    </CardSection>
  );
}

export function PersonaDetailPane({ persona, onPatchName, onPatchField, onDelete }: {
  persona: PersonaDetail;
  onPatchName: (name: string) => void;
  onPatchField: (sectionIdx: number, fieldIdx: number, value: string | string[]) => void;
  onDelete: () => void;
}) {
  const [savedAt, setSavedAt] = useState<string | null>(null);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ background: "var(--color-page)", border: "1px solid var(--color-border)", borderRadius: 14, padding: "18px 22px", boxShadow: "var(--shadow-card)" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 14, marginBottom: 8 }}>
          <EditableField value={persona.name} onChange={onPatchName} />
          <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
            <button type="button" className="kc-primary-btn" style={KC_PRIMARY_BTN} onClick={() => setSavedAt(new Date().toLocaleTimeString())}>
              <Icon name="check" size={14} />
              Save
            </button>
          </div>
        </div>
        <p style={{ fontSize: 12.5, color: "var(--color-muted)", margin: 0, lineHeight: 1.5 }}>{persona.subtitle}</p>
        {savedAt && <div style={{ fontSize: 11.5, color: "var(--color-success)", marginTop: 8 }}>Saved at {savedAt}</div>}
      </div>

      <PerformanceSection persona={persona} />

      {persona.sections.map((section, si) => (
        <CardSection key={section.heading} icon={SECTION_ICON[section.heading] ?? "list"} title={section.heading}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {section.fields.map((field, fi) => (
              <PersonaFieldRow key={field.label} field={field} onChange={(v) => onPatchField(si, fi, v)} />
            ))}
          </div>
        </CardSection>
      ))}

      <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 4 }}>
        <button type="button" style={KC_DANGER_BTN} onClick={onDelete}>
          <Icon name="trash" size={14} />
          Delete Persona
        </button>
        <button type="button" className="kc-primary-btn" style={KC_PRIMARY_BTN} onClick={() => setSavedAt(new Date().toLocaleTimeString())}>
          <Icon name="check" size={14} />
          Save
        </button>
      </div>
    </div>
  );
}
