import { useState } from "react";
import { COMPANY_SIZE_BUCKETS, FUNDING_STAGE_BUCKETS, HistorySource, IcpDetail, PersonaDetail } from "./data";
import { CardSection, CheckboxPills, ChipList, EditableField, FieldLabel, HistoryTextField, Icon, KC_DANGER_BTN, KC_PRIMARY_BTN } from "./ui";

export function emptyIcp(id: string, productId: string): IcpDetail {
  return {
    id, name: "Untitled ICP", industryTag: "—", matchPct: 0, productId,
    summary: "", fitReasoning: "", buyingTriggers: [], exclusionCriteria: [],
    targetIndustries: [], companySizes: [], revenueRange: "", geographies: [], fundingStages: [],
    growthStage: "", businessModel: "", techStackSignals: [], decisionMakingUnit: "",
    painPoints: [], businessGoals: [], operationalGoals: [], useCases: [],
    exampleCompanies: [], competitiveDisplacementFitPct: 0, maturityPct: 0, intentSignals: [],
    incumbentTools: [], departmentSize: "", outreachAccessibility: "", marketSizePct: 0,
  };
}

type LogField = (fieldLabel: string, oldValue: string | string[], newValue: string | string[], source: HistorySource, prompt?: string) => void;

function PercentStat({ label, value, onChange, onLogField }: { label: string; value: number; onChange: (v: number) => void; onLogField: LogField }) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <input type="number" min={0} max={100} value={value}
        onChange={(e) => {
          const next = Math.max(0, Math.min(100, Number(e.target.value) || 0));
          onLogField(label, String(value), String(next), "manual");
          onChange(next);
        }}
        style={{ width: "100%", fontSize: 12.5, fontWeight: 700, color: "var(--color-heading)", border: "1px solid var(--color-border)", borderRadius: 8, padding: "8px 10px", background: "var(--color-page)" }} />
    </div>
  );
}

export function IcpDetailPane({ icp, personas, onPatch, onDelete, onSelectPersona, onLogField }: {
  icp: IcpDetail;
  personas: PersonaDetail[];
  onPatch: (fields: Partial<IcpDetail>) => void;
  onDelete: () => void;
  onSelectPersona: (personaId: string) => void;
  onLogField: LogField;
}) {
  const [savedAt, setSavedAt] = useState<string | null>(null);

  // Array/pill fields commit on every onChange (add/remove is already a discrete
  // action, unlike free typing), so this just logs before applying the patch.
  function logArray(label: string, oldValue: string[], onChange: (v: string[]) => void) {
    return (v: string[]) => { onLogField(label, oldValue, v, "manual"); onChange(v); };
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 900 }}>
      <div style={{ background: "var(--color-page)", border: "1px solid var(--color-border)", borderRadius: 14, padding: "18px 22px", boxShadow: "var(--shadow-card)" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 14, marginBottom: 12 }}>
          <EditableField value={icp.name} onChange={(v) => onPatch({ name: v })}
            onCommit={(oldValue, newValue) => onLogField("Name", oldValue, newValue, "manual")} />
          <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
            <button type="button" className="kc-primary-btn" style={KC_PRIMARY_BTN} onClick={() => setSavedAt(new Date().toLocaleTimeString())}>
              <Icon name="check" size={14} />
              Save
            </button>
          </div>
        </div>
        {savedAt && <div style={{ fontSize: 11.5, color: "var(--color-success)", marginTop: 8 }}>Saved at {savedAt}</div>}
      </div>

      <CardSection icon="target" title="Identity & Fit">
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <HistoryTextField label="Summary" value={icp.summary} onChange={(v) => onPatch({ summary: v })} multiline rows={2}
            onLogChange={(c) => onLogField("Summary", c.oldValue, c.newValue, c.source, c.prompt)} />
          <HistoryTextField label="Fit Reasoning" value={icp.fitReasoning} onChange={(v) => onPatch({ fitReasoning: v })} multiline rows={2}
            onLogChange={(c) => onLogField("Fit Reasoning", c.oldValue, c.newValue, c.source, c.prompt)} />
          <div>
            <FieldLabel>Buying Triggers</FieldLabel>
            <ChipList items={icp.buyingTriggers} onChange={logArray("Buying Triggers", icp.buyingTriggers, (v) => onPatch({ buyingTriggers: v }))} />
          </div>
          <div>
            <FieldLabel>Exclusion Criteria</FieldLabel>
            <ChipList items={icp.exclusionCriteria} onChange={logArray("Exclusion Criteria", icp.exclusionCriteria, (v) => onPatch({ exclusionCriteria: v }))} />
          </div>
        </div>
      </CardSection>

      <CardSection icon="filter" title="Firmographic Filters">
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <FieldLabel>Target Industries</FieldLabel>
            <ChipList items={icp.targetIndustries} onChange={logArray("Target Industries", icp.targetIndustries, (v) => onPatch({ targetIndustries: v }))} />
          </div>
          <div>
            <FieldLabel>Company Size</FieldLabel>
            <CheckboxPills options={COMPANY_SIZE_BUCKETS} selected={icp.companySizes} onChange={logArray("Company Size", icp.companySizes, (v) => onPatch({ companySizes: v }))} />
          </div>
          <HistoryTextField label="Revenue Range" value={icp.revenueRange} onChange={(v) => onPatch({ revenueRange: v })}
            onLogChange={(c) => onLogField("Revenue Range", c.oldValue, c.newValue, c.source, c.prompt)} />
          <div>
            <FieldLabel>Geographies</FieldLabel>
            <ChipList items={icp.geographies} onChange={logArray("Geographies", icp.geographies, (v) => onPatch({ geographies: v }))} />
          </div>
          <div>
            <FieldLabel>Funding Stage</FieldLabel>
            <CheckboxPills options={FUNDING_STAGE_BUCKETS} selected={icp.fundingStages} onChange={logArray("Funding Stage", icp.fundingStages, (v) => onPatch({ fundingStages: v }))} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
            <HistoryTextField label="Growth Stage" value={icp.growthStage} onChange={(v) => onPatch({ growthStage: v })}
              onLogChange={(c) => onLogField("Growth Stage", c.oldValue, c.newValue, c.source, c.prompt)} />
            <HistoryTextField label="Business Model" value={icp.businessModel} onChange={(v) => onPatch({ businessModel: v })}
              onLogChange={(c) => onLogField("Business Model", c.oldValue, c.newValue, c.source, c.prompt)} />
          </div>
          <div>
            <FieldLabel>Tech Stack Signals</FieldLabel>
            <ChipList items={icp.techStackSignals} onChange={logArray("Tech Stack Signals", icp.techStackSignals, (v) => onPatch({ techStackSignals: v }))} />
          </div>
          <HistoryTextField label="Decision-Making Unit" value={icp.decisionMakingUnit} onChange={(v) => onPatch({ decisionMakingUnit: v })} multiline rows={2}
            onLogChange={(c) => onLogField("Decision-Making Unit", c.oldValue, c.newValue, c.source, c.prompt)} />
        </div>
      </CardSection>

      <CardSection icon="flag" title="Pains & Goals">
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <FieldLabel>Pain Points</FieldLabel>
            <ChipList items={icp.painPoints} onChange={logArray("Pain Points", icp.painPoints, (v) => onPatch({ painPoints: v }))} />
          </div>
          <div>
            <FieldLabel>Business Goals</FieldLabel>
            <ChipList items={icp.businessGoals} onChange={logArray("Business Goals", icp.businessGoals, (v) => onPatch({ businessGoals: v }))} />
          </div>
          <div>
            <FieldLabel>Operational Goals</FieldLabel>
            <ChipList items={icp.operationalGoals} onChange={logArray("Operational Goals", icp.operationalGoals, (v) => onPatch({ operationalGoals: v }))} />
          </div>
          <div>
            <FieldLabel>Use Cases</FieldLabel>
            <ChipList items={icp.useCases} onChange={logArray("Use Cases", icp.useCases, (v) => onPatch({ useCases: v }))} />
          </div>
        </div>
      </CardSection>

      <CardSection icon="brain" title="Intelligence & Targeting">
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <FieldLabel>Example Companies</FieldLabel>
            <ChipList items={icp.exampleCompanies} onChange={logArray("Example Companies", icp.exampleCompanies, (v) => onPatch({ exampleCompanies: v }))} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            <PercentStat label="Competitive Displacement Fit" value={icp.competitiveDisplacementFitPct} onChange={(v) => onPatch({ competitiveDisplacementFitPct: v })} onLogField={onLogField} />
            <PercentStat label="Maturity" value={icp.maturityPct} onChange={(v) => onPatch({ maturityPct: v })} onLogField={onLogField} />
            <PercentStat label="Market Size" value={icp.marketSizePct} onChange={(v) => onPatch({ marketSizePct: v })} onLogField={onLogField} />
          </div>
          <div>
            <FieldLabel>Intent Signals</FieldLabel>
            <ChipList items={icp.intentSignals} onChange={logArray("Intent Signals", icp.intentSignals, (v) => onPatch({ intentSignals: v }))} />
          </div>
          <div>
            <FieldLabel>Incumbent Tools</FieldLabel>
            <ChipList items={icp.incumbentTools} onChange={logArray("Incumbent Tools", icp.incumbentTools, (v) => onPatch({ incumbentTools: v }))} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
            <HistoryTextField label="Department Size" value={icp.departmentSize} onChange={(v) => onPatch({ departmentSize: v })}
              onLogChange={(c) => onLogField("Department Size", c.oldValue, c.newValue, c.source, c.prompt)} />
            <HistoryTextField label="Outreach Accessibility" value={icp.outreachAccessibility} onChange={(v) => onPatch({ outreachAccessibility: v })}
              onLogChange={(c) => onLogField("Outreach Accessibility", c.oldValue, c.newValue, c.source, c.prompt)} />
          </div>
        </div>
      </CardSection>

      <CardSection icon="users" title="Discovered Personas">
        {personas.length === 0 ? (
          <p style={{ fontSize: 12.5, color: "var(--color-muted)", margin: 0 }}>No personas discovered for this ICP yet.</p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
            {personas.map((p) => (
              <button key={p.id} type="button" onClick={() => onSelectPersona(p.id)} className="kc-list-row"
                style={{ display: "block", textAlign: "left", fontFamily: "inherit", background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 10, padding: "12px 14px", cursor: "pointer" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--color-heading)", marginBottom: 4 }}>{p.name}</div>
                <div style={{ fontSize: 12, color: "var(--color-muted)", lineHeight: 1.5 }}>{p.subtitle}</div>
              </button>
            ))}
          </div>
        )}
      </CardSection>

      <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 4 }}>
        <button type="button" style={KC_DANGER_BTN} onClick={onDelete}>
          <Icon name="trash" size={14} />
          Delete ICP
        </button>
        <button type="button" className="kc-primary-btn" style={KC_PRIMARY_BTN} onClick={() => setSavedAt(new Date().toLocaleTimeString())}>
          <Icon name="check" size={14} />
          Save
        </button>
      </div>
    </div>
  );
}
