import { useState } from "react";
import { HistorySource, PRODUCTS, PersonaDetail, PersonaField, personaPerformance } from "./data";
import { Bullets, CardSection, ChipList, Drawer, EditableField, EmptyState, FieldLabel, FieldValue, HistoryTextField, Icon, KC_DANGER_BTN, KC_PRIMARY_BTN, StatTile, formatCurrencyShort } from "./ui";
import { ComboRow, ComboTableHeader, overallFit } from "./ComboRow";
import { CampaignSequenceView } from "./CampaignSequenceView";
import { ReferenceableField, ReferenceableSection } from "../copilot/Referenceable";

const PROSE: React.CSSProperties = { fontSize: 13.5, color: "var(--color-body)", lineHeight: 1.55, margin: 0 };

function sectionField(persona: PersonaDetail, heading: string, label: string): string | string[] | undefined {
  return persona.sections.find((s) => s.heading === heading)?.fields.find((f) => f.label === label)?.value;
}
function sectionFieldList(persona: PersonaDetail, heading: string, label: string): string[] {
  const v = sectionField(persona, heading, label);
  return Array.isArray(v) ? v : v ? [v] : [];
}

export function emptyPersona(id: string, icpId: string): PersonaDetail {
  return { id, name: "Untitled persona", department: "—", matchPct: 0, icpId, subtitle: "", sections: [] };
}

type LogField = (fieldLabel: string, oldValue: string | string[], newValue: string | string[], source: HistorySource, prompt?: string) => void;

function PersonaFieldRow({ field, onChange, onLogField }: {
  field: PersonaField; onChange: (v: string | string[]) => void; onLogField: LogField;
}) {
  if (Array.isArray(field.value)) {
    return (
      <div>
        <FieldLabel confidence={field.confidence}>{field.label}</FieldLabel>
        <ChipList items={field.value} onChange={(v) => { onLogField(field.label, field.value, v, "manual"); onChange(v); }} />
      </div>
    );
  }
  return (
    <HistoryTextField
      label={field.label} value={field.value} onChange={onChange} confidence={field.confidence} multiline rows={2}
      onLogChange={(c) => onLogField(field.label, c.oldValue, c.newValue, c.source, c.prompt)}
    />
  );
}

function PerformanceSection({ persona }: { persona: PersonaDetail }) {
  const { combos, products, opportunities, pipelineValue } = personaPerformance(persona.id);
  const [openComboId, setOpenComboId] = useState<string | null>(null);
  const ranked = [...combos].sort((a, b) => overallFit(b) - overallFit(a));
  const openCombo = combos.find((c) => c.id === openComboId) ?? null;

  return (
    <CardSection title="Performance">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: combos.length === 0 ? 0 : 18 }}>
        <StatTile label="Products" value={String(products)} />
        <StatTile label="Opportunities" value={String(opportunities)} />
        <StatTile label="Pipeline" value={formatCurrencyShort(pipelineValue)} />
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

/* ─── Summary — matches summary-view-spec.md Step 4 (Persona). Primary
   blocks 1–9 sit above the fold; block 10 (Qualification Snapshot) is
   Secondary, always expanded (no collapse/show-more). Blocks 11–21 (deeper pain/risk
   context, decision-making detail, buyer psychology, extended
   messaging/outreach, remaining qualification tiers, etc.) and block
   22 (scoring input) are Hidden — Copilot only / internal-only — and
   stay out of this summary; they're still fully present and editable
   in the full detail view below. */
export function PersonaSummaryView({ persona, onViewDetails }: {
  persona: PersonaDetail; onViewDetails: () => void;
}) {
  const objections = sectionFieldList(persona, "Messaging Guidance", "Objections They Raise");
  const bestChannel = sectionField(persona, "Outreach Strategy", "Best Channel");
  const bestTime = sectionField(persona, "Outreach Strategy", "Best Time To Reach");

  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Block 1 — Header (Primary, Field-Join). Stays full width above the
          two-column grid, same as the ICP and Product summary views. */}
      <div style={{ background: "var(--color-page)", border: "1px solid var(--color-border)", borderRadius: 14, padding: "16px 26px", boxShadow: "var(--shadow-card)" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 20, flexWrap: "wrap" }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <h2 style={{ fontSize: 21, fontWeight: 800, margin: 0 }}>{persona.name}</h2>
              <span style={{ fontSize: 11, fontWeight: 600, color: "var(--color-brand)", border: "1px solid var(--color-border)", background: "var(--color-brand-tint)", borderRadius: 999, padding: "2px 10px" }}>{persona.department}</span>
            </div>
          </div>
          <button type="button" className="kc-primary-btn" title="View Details" style={{ ...KC_PRIMARY_BTN, padding: 0, width: 36, height: 36, justifyContent: "center", flexShrink: 0 }} onClick={onViewDetails}>
            <Icon name="edit" size={14} />
          </button>
        </div>
      </div>

      {/* Two columns: narrative blocks (2–5, 8–9) on the left, short
          operational blocks (6–7, 10) on the right. Collapses to a single
          column below 1024px via .kc-company-grid in ui.tsx's KC_STYLES. */}
      <div className="kc-company-grid" style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.6fr) minmax(280px, 1fr)", gap: 14, alignItems: "start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 0 }}>
          {/* Block 2 — Who They Are (Primary, Verbatim Passthrough) */}
          <ReferenceableField id={`persona:${persona.id}:section:Overview:field:Role Summary`} label="Role Summary">
            <CardSection title="Overview">
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <p style={PROSE}>{persona.subtitle}</p>
                <p style={PROSE}>{sectionField(persona, "Overview", "Role Summary")}</p>
              </div>
            </CardSection>
          </ReferenceableField>

          {/* Block 3 — What They're Responsible For (Primary, Field-Join) */}
          <ReferenceableField id={`persona:${persona.id}:section:Responsibilities:field:Core Responsibilities`} label="Core Responsibilities">
            <CardSection title="Key Responsibilities">
              <Bullets items={sectionFieldList(persona, "Responsibilities", "Core Responsibilities")} />
            </CardSection>
          </ReferenceableField>

          {/* Block 4 — Goals (Primary, Field-Join) */}
          <ReferenceableField id={`persona:${persona.id}:section:Goals:field:Primary Goal`} label="Primary Goal">
            <CardSection title="Primary Goal">
              <FieldValue value={sectionField(persona, "Goals", "Primary Goal") ?? ""} />
            </CardSection>
          </ReferenceableField>

          <ReferenceableField id={`persona:${persona.id}:section:Goals:field:Secondary Goals`} label="Secondary Goals">
            <CardSection title="Secondary Goals">
              <Bullets items={sectionFieldList(persona, "Goals", "Secondary Goals")} />
            </CardSection>
          </ReferenceableField>

          {/* Block 5 — Primary Pain (Primary, Verbatim Passthrough) */}
          <ReferenceableField id={`persona:${persona.id}:section:Pain Points:field:Primary Pain`} label="Primary Pain">
            <CardSection title="Primary Pain">
              <p style={PROSE}>{sectionField(persona, "Pain Points", "Primary Pain")}</p>
            </CardSection>
          </ReferenceableField>

          {/* Block 8 — Objections to Expect (Primary, Field-Join) */}
          {objections.length > 0 && (
            <ReferenceableField id={`persona:${persona.id}:section:Messaging Guidance:field:Objections They Raise`} label="Objections They Raise">
              <CardSection title="Anticipated Objections">
                <Bullets items={objections} />
              </CardSection>
            </ReferenceableField>
          )}

          {/* Block 9 — Opening Hook (Primary, Verbatim Passthrough) */}
          <ReferenceableField id={`persona:${persona.id}:section:Messaging Guidance:field:Opening Hook`} label="Opening Hook">
            <CardSection title="Opening Hook">
              <p style={{ ...PROSE, fontStyle: "italic" }}>&ldquo;{sectionField(persona, "Messaging Guidance", "Opening Hook")}&rdquo;</p>
            </CardSection>
          </ReferenceableField>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 0 }}>
          {/* Block 6 — Current Tools (Primary, Field-Join) */}
          <ReferenceableField id={`persona:${persona.id}:section:Current Solutions:field:Tools In Use`} label="Tools In Use">
            <CardSection title="Current Tools">
              <Bullets items={sectionFieldList(persona, "Current Solutions", "Tools In Use")} />
            </CardSection>
          </ReferenceableField>

          {/* Block 7 — Best Way to Reach Them (Primary, Field-Join) */}
          <ReferenceableField id={`persona:${persona.id}:section:Outreach Strategy:field:Best Channel`} label="Best Channel">
            <CardSection title="Best Channel">
              <FieldValue value={bestChannel ?? "—"} />
            </CardSection>
          </ReferenceableField>

          <ReferenceableField id={`persona:${persona.id}:section:Outreach Strategy:field:Best Time To Reach`} label="Best Time To Reach">
            <CardSection title="Best Time to Reach">
              <FieldValue value={bestTime ?? "—"} />
            </CardSection>
          </ReferenceableField>

          {/* Block 10 — Qualification Snapshot (Secondary, always expanded) */}
          <ReferenceableField id={`persona:${persona.id}:section:Qualification:field:Warm Lead`} label="Warm Lead">
            <CardSection title="Warm Lead">
              <FieldValue value={sectionField(persona, "Qualification", "Warm Lead") ?? "—"} />
            </CardSection>
          </ReferenceableField>

          <ReferenceableField id={`persona:${persona.id}:section:Qualification:field:Meeting-Ready`} label="Meeting-Ready">
            <CardSection title="Meeting-Ready">
              <FieldValue value={sectionField(persona, "Qualification", "Meeting-Ready") ?? "—"} />
            </CardSection>
          </ReferenceableField>
        </div>
      </div>
    </div>
  );
}

export function PersonaDetailPane({ persona, onPatchName, onPatchField, onDelete, onLogField }: {
  persona: PersonaDetail;
  onPatchName: (name: string) => void;
  onPatchField: (sectionIdx: number, fieldIdx: number, value: string | string[]) => void;
  onDelete: () => void;
  onLogField: LogField;
}) {
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [view, setView] = useState<"summary" | "detail">("summary");

  if (view === "summary") {
    return (
      <ReferenceableSection id={`persona:${persona.id}`} label={persona.name}>
        <PersonaSummaryView persona={persona} onViewDetails={() => setView("detail")} />
      </ReferenceableSection>
    );
  }

  return (
    <ReferenceableSection id={`persona:${persona.id}`} label={persona.name}>
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <button type="button" onClick={() => setView("summary")}
        style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 600, color: "var(--color-muted)", background: "transparent", border: "none", cursor: "pointer", padding: 0, fontFamily: "inherit" }}>
        <Icon name="chevron-left" size={13} />
        Back to summary
      </button>

      <div style={{ background: "var(--color-page)", border: "1px solid var(--color-border)", borderRadius: 14, padding: "18px 22px", boxShadow: "var(--shadow-card)" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 14, marginBottom: 8 }}>
          <ReferenceableField id={`persona:${persona.id}:name`} label="Name">
            <EditableField value={persona.name} onChange={onPatchName}
              onCommit={(oldValue, newValue) => onLogField("Name", oldValue, newValue, "manual")} />
          </ReferenceableField>
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
        <CardSection key={section.heading} title={section.heading}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {section.fields.map((field, fi) => (
              <ReferenceableField key={field.label} id={`persona:${persona.id}:section:${section.heading}:field:${field.label}`} label={`${section.heading}: ${field.label}`}>
                <PersonaFieldRow field={field} onChange={(v) => onPatchField(si, fi, v)}
                  onLogField={(fieldLabel, oldValue, newValue, source, prompt) =>
                    onLogField(`${section.heading}: ${fieldLabel}`, oldValue, newValue, source, prompt)} />
              </ReferenceableField>
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
    </ReferenceableSection>
  );
}
