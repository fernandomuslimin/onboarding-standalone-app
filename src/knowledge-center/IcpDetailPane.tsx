import { useMemo, useState } from "react";
import { COMPANY_SIZE_BUCKETS, FUNDING_STAGE_BUCKETS, IcpDetail, PersonaDetail } from "./data";
import { CardSection, CheckboxPills, ChipList, EditableField, FieldLabel, Icon, IconButton, KC_DANGER_BTN, KC_PRIMARY_BTN, MatchBadge, ProgressBar } from "./ui";

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

function icpCompletion(icp: IcpDetail): number {
  const checkFields: (string | string[])[] = [
    icp.summary, icp.fitReasoning, icp.buyingTriggers, icp.exclusionCriteria,
    icp.targetIndustries, icp.companySizes, icp.revenueRange, icp.geographies, icp.fundingStages,
    icp.growthStage, icp.businessModel, icp.techStackSignals, icp.decisionMakingUnit,
    icp.painPoints, icp.businessGoals, icp.operationalGoals, icp.useCases,
    icp.exampleCompanies, icp.intentSignals, icp.incumbentTools, icp.departmentSize, icp.outreachAccessibility,
  ];
  const filled = checkFields.filter((v) => (Array.isArray(v) ? v.length > 0 : v.trim().length > 0)).length;
  return Math.round((filled / checkFields.length) * 100);
}

function PercentStat({ label, value, onChange, confidence }: { label: string; value: number; onChange: (v: number) => void; confidence?: number }) {
  return (
    <div>
      <FieldLabel confidence={confidence}>{label}</FieldLabel>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ flex: 1 }}><ProgressBar pct={value} /></div>
        <input type="number" min={0} max={100} value={value} onChange={(e) => onChange(Math.max(0, Math.min(100, Number(e.target.value) || 0)))}
          style={{ width: 52, fontSize: 12.5, fontWeight: 700, color: "var(--color-heading)", textAlign: "right", border: "1px solid var(--color-border)", borderRadius: 6, padding: "3px 5px", background: "var(--color-page)" }} />
        <span style={{ fontSize: 12, color: "var(--color-muted)" }}>%</span>
      </div>
    </div>
  );
}

export function IcpDetailPane({ icp, personas, reviewed, onToggleReviewed, onPatch, onDelete, onSelectPersona }: {
  icp: IcpDetail;
  personas: PersonaDetail[];
  reviewed: boolean;
  onToggleReviewed: () => void;
  onPatch: (fields: Partial<IcpDetail>) => void;
  onDelete: () => void;
  onSelectPersona: (personaId: string) => void;
}) {
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const pct = useMemo(() => icpCompletion(icp), [icp]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 900 }}>
      <div style={{ background: "var(--color-page)", border: "1px solid var(--color-border)", borderRadius: 14, padding: "18px 22px", boxShadow: "var(--shadow-card)" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 14, marginBottom: 12 }}>
          <EditableField value={icp.name} onChange={(v) => onPatch({ name: v })} />
          <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
            <IconButton icon="check" title={reviewed ? "Reviewed" : "Mark reviewed"} tone={reviewed ? "brand" : "muted"} onClick={onToggleReviewed} />
            <button type="button" className="kc-primary-btn" style={KC_PRIMARY_BTN} onClick={() => setSavedAt(new Date().toLocaleTimeString())}>
              <Icon name="check" size={14} />
              Save
            </button>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ flex: 1, maxWidth: 320 }}><ProgressBar pct={pct} /></div>
          <span style={{ fontSize: 12.5, fontWeight: 700, color: "var(--color-heading)" }}>{pct}% complete</span>
        </div>
        {savedAt && <div style={{ fontSize: 11.5, color: "var(--color-success)", marginTop: 8 }}>Saved at {savedAt}</div>}
      </div>

      <CardSection icon="target" title="Identity & Fit">
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <FieldLabel>Summary</FieldLabel>
            <EditableField value={icp.summary} onChange={(v) => onPatch({ summary: v })} multiline rows={2} />
          </div>
          <div>
            <FieldLabel confidence={icp.confidence?.fitReasoning}>Fit Reasoning</FieldLabel>
            <EditableField value={icp.fitReasoning} onChange={(v) => onPatch({ fitReasoning: v })} multiline rows={2} />
          </div>
          <div>
            <FieldLabel>Buying Triggers</FieldLabel>
            <ChipList items={icp.buyingTriggers} onChange={(v) => onPatch({ buyingTriggers: v })} />
          </div>
          <div>
            <FieldLabel>Exclusion Criteria</FieldLabel>
            <ChipList items={icp.exclusionCriteria} onChange={(v) => onPatch({ exclusionCriteria: v })} />
          </div>
        </div>
      </CardSection>

      <CardSection icon="filter" title="Firmographic Filters">
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <FieldLabel>Target Industries</FieldLabel>
            <ChipList items={icp.targetIndustries} onChange={(v) => onPatch({ targetIndustries: v })} />
          </div>
          <div>
            <FieldLabel>Company Size</FieldLabel>
            <CheckboxPills options={COMPANY_SIZE_BUCKETS} selected={icp.companySizes} onChange={(v) => onPatch({ companySizes: v })} />
          </div>
          <div>
            <FieldLabel>Revenue Range</FieldLabel>
            <EditableField value={icp.revenueRange} onChange={(v) => onPatch({ revenueRange: v })} />
          </div>
          <div>
            <FieldLabel>Geographies</FieldLabel>
            <ChipList items={icp.geographies} onChange={(v) => onPatch({ geographies: v })} />
          </div>
          <div>
            <FieldLabel>Funding Stage</FieldLabel>
            <CheckboxPills options={FUNDING_STAGE_BUCKETS} selected={icp.fundingStages} onChange={(v) => onPatch({ fundingStages: v })} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
            <div>
              <FieldLabel>Growth Stage</FieldLabel>
              <EditableField value={icp.growthStage} onChange={(v) => onPatch({ growthStage: v })} />
            </div>
            <div>
              <FieldLabel>Business Model</FieldLabel>
              <EditableField value={icp.businessModel} onChange={(v) => onPatch({ businessModel: v })} />
            </div>
          </div>
          <div>
            <FieldLabel>Tech Stack Signals</FieldLabel>
            <ChipList items={icp.techStackSignals} onChange={(v) => onPatch({ techStackSignals: v })} />
          </div>
          <div>
            <FieldLabel>Decision-Making Unit</FieldLabel>
            <EditableField value={icp.decisionMakingUnit} onChange={(v) => onPatch({ decisionMakingUnit: v })} multiline rows={2} />
          </div>
        </div>
      </CardSection>

      <CardSection icon="flag" title="Pains & Goals">
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <FieldLabel>Pain Points</FieldLabel>
            <ChipList items={icp.painPoints} onChange={(v) => onPatch({ painPoints: v })} />
          </div>
          <div>
            <FieldLabel>Business Goals</FieldLabel>
            <ChipList items={icp.businessGoals} onChange={(v) => onPatch({ businessGoals: v })} />
          </div>
          <div>
            <FieldLabel>Operational Goals</FieldLabel>
            <ChipList items={icp.operationalGoals} onChange={(v) => onPatch({ operationalGoals: v })} />
          </div>
          <div>
            <FieldLabel>Use Cases</FieldLabel>
            <ChipList items={icp.useCases} onChange={(v) => onPatch({ useCases: v })} />
          </div>
        </div>
      </CardSection>

      <CardSection icon="brain" title="Intelligence & Targeting">
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <FieldLabel>Example Companies</FieldLabel>
            <ChipList items={icp.exampleCompanies} onChange={(v) => onPatch({ exampleCompanies: v })} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            <PercentStat label="Competitive Displacement Fit" value={icp.competitiveDisplacementFitPct} onChange={(v) => onPatch({ competitiveDisplacementFitPct: v })} confidence={icp.confidence?.competitiveDisplacementFitPct} />
            <PercentStat label="Maturity" value={icp.maturityPct} onChange={(v) => onPatch({ maturityPct: v })} />
            <PercentStat label="Market Size" value={icp.marketSizePct} onChange={(v) => onPatch({ marketSizePct: v })} confidence={icp.confidence?.marketSizePct} />
          </div>
          <div>
            <FieldLabel>Intent Signals</FieldLabel>
            <ChipList items={icp.intentSignals} onChange={(v) => onPatch({ intentSignals: v })} />
          </div>
          <div>
            <FieldLabel>Incumbent Tools</FieldLabel>
            <ChipList items={icp.incumbentTools} onChange={(v) => onPatch({ incumbentTools: v })} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
            <div>
              <FieldLabel>Department Size</FieldLabel>
              <EditableField value={icp.departmentSize} onChange={(v) => onPatch({ departmentSize: v })} />
            </div>
            <div>
              <FieldLabel>Outreach Accessibility</FieldLabel>
              <EditableField value={icp.outreachAccessibility} onChange={(v) => onPatch({ outreachAccessibility: v })} />
            </div>
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
