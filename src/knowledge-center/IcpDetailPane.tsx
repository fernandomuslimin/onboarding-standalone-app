import { useState } from "react";
import { COMPANY_SIZE_BUCKETS, FUNDING_STAGE_BUCKETS, HistorySource, IcpDetail, PersonaDetail } from "./data";
import { Bullets, CardSection, CheckboxPills, ChipList, EditableField, FieldLabel, HistoryTextField, Icon, KC_DANGER_BTN, KC_PRIMARY_BTN } from "./ui";
import { ReferenceableField, ReferenceableSection } from "../copilot/Referenceable";

/* ─── Summary — matches docs/field_reference/summary-view-spec.md, Step 3
   (ICP), and the same single-card structure onboarding-shell.tsx's
   IcpCandidateCard renders in the review flow: header row, Primary
   blocks 2–6 in a wide left column, a single "Market Sizing &
   Additional Firmographics" card (blocks 8–9) always expanded in the
   right rail — no collapse/show-more. Block 7 (Candidate Personas)
   isn't duplicated here, same as onboarding — the personas list for
   this ICP is a separate section wherever this summary is used.
   Targeting filters and scoring inputs (Hidden — Copilot only /
   internal) aren't rendered here; still fully present and editable in
   "View Details" below. */
export function IcpSummary({ icp, onViewDetails }: { icp: IcpDetail; onViewDetails: () => void }) {
  return (
    <ReferenceableSection id={`icp:${icp.id}`} label={icp.name} style={{ borderRadius: 12, width: "100%" }}>
    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Block 1 — Header (Primary, Field-Join) + Block 2 — Who This Is &
          Why They Fit, which reads as the header's lede rather than a card
          of its own (same as onboarding's IcpCandidateCard header). */}
      <div style={{ background: "var(--color-page)", border: "1px solid var(--color-border)", borderRadius: 14, padding: "16px 22px", boxShadow: "var(--shadow-card)" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <span style={{ display: "block", fontSize: 17, fontWeight: 800, color: "var(--color-heading)", lineHeight: 1.35 }}>{icp.name}</span>
            <ReferenceableField id={`icp:${icp.id}:field:growthStage`} label="Growth Stage">
              <span style={{ fontSize: 11.5, color: "var(--color-muted)" }}>{icp.growthStage}</span>
            </ReferenceableField>
          </div>
          <button type="button" className="kc-primary-btn" title="View Details" style={{ ...KC_PRIMARY_BTN, padding: 0, width: 36, height: 36, justifyContent: "center", flexShrink: 0 }} onClick={onViewDetails}>
            <Icon name="edit" size={14} />
          </button>
        </div>
        <ReferenceableField id={`icp:${icp.id}:field:summary`} label="Summary">
          <p style={{ fontSize: 12.5, color: "var(--color-body)", lineHeight: 1.6, margin: "10px 0 0" }}>{icp.summary}</p>
        </ReferenceableField>
        <ReferenceableField id={`icp:${icp.id}:field:fitReasoning`} label="Fit Reasoning">
          <p style={{ fontSize: 12.5, color: "var(--color-muted)", fontStyle: "italic", lineHeight: 1.6, margin: "4px 0 0" }}>{icp.fitReasoning}</p>
        </ReferenceableField>
      </div>

      <div className="kc-company-grid" style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.6fr) minmax(280px, 1fr)", gap: 20, alignItems: "start" }}>
        {/* Blocks 3–6 — Primary, one field per card, same as the onboarding
            review step, so each is its own pin target. */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 0 }}>
          <ReferenceableField id={`icp:${icp.id}:field:firmographicSnapshot`} label="Firmographic Snapshot">
            <CardSection title="Firmographic Snapshot">
              <Bullets items={[...icp.targetIndustries, ...icp.companySizes, icp.revenueRange, ...icp.geographies]} />
            </CardSection>
          </ReferenceableField>

          <ReferenceableField id={`icp:${icp.id}:field:painPoints`} label="Pain Points">
            <CardSection title="Pain Points">
              <Bullets items={icp.painPoints} />
            </CardSection>
          </ReferenceableField>

          <ReferenceableField id={`icp:${icp.id}:field:businessGoals`} label="Business Goals">
            <CardSection title="Business Goals">
              <Bullets items={icp.businessGoals} />
            </CardSection>
          </ReferenceableField>

          <ReferenceableField id={`icp:${icp.id}:field:buyingTriggers`} label="Buying Triggers">
            <CardSection title="Buying Triggers">
              <Bullets items={icp.buyingTriggers} />
            </CardSection>
          </ReferenceableField>

          <ReferenceableField id={`icp:${icp.id}:field:intentSignals`} label="Intent Signals">
            <CardSection title="Intent Signals">
              <Bullets items={icp.intentSignals} />
            </CardSection>
          </ReferenceableField>

          {icp.exampleCompanies.length > 0 && (
            <ReferenceableField id={`icp:${icp.id}:field:exampleCompanies`} label="Representative Accounts">
              <CardSection title="Real Companies Like This">
                <Bullets items={icp.exampleCompanies} />
              </CardSection>
            </ReferenceableField>
          )}
        </div>

        {/* Blocks 8–9 — Secondary, always shown in full, no collapse/expand.
            One field per card, same as the onboarding review step. */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 0 }}>
          <ReferenceableField id={`icp:${icp.id}:field:marketSizePct`} label="Market Size">
            <CardSection title="Market Size">
              <p style={{ fontSize: 12.5, color: "var(--color-body)", lineHeight: 1.6, margin: 0 }}>{icp.marketSizePct}% of the product&rsquo;s addressable market.</p>
            </CardSection>
          </ReferenceableField>

          <ReferenceableField id={`icp:${icp.id}:field:techStackSignals`} label="Tech Stack Signals">
            <CardSection title="Tech Stack Signals">
              <Bullets items={icp.techStackSignals} />
            </CardSection>
          </ReferenceableField>

          <ReferenceableField id={`icp:${icp.id}:field:businessModel`} label="Business Model">
            <CardSection title="Business Model">
              <p style={{ fontSize: 12.5, color: "var(--color-body)", lineHeight: 1.6, margin: 0 }}>{icp.businessModel}</p>
            </CardSection>
          </ReferenceableField>

          <ReferenceableField id={`icp:${icp.id}:field:fundingStages`} label="Funding Stage">
            <CardSection title="Funding Stage">
              <Bullets items={icp.fundingStages} />
            </CardSection>
          </ReferenceableField>

          <ReferenceableField id={`icp:${icp.id}:field:decisionMakingUnit`} label="Decision-Making Unit">
            <CardSection title="Decision-Making Unit">
              <p style={{ fontSize: 12.5, color: "var(--color-body)", lineHeight: 1.6, margin: 0 }}>{icp.decisionMakingUnit}</p>
            </CardSection>
          </ReferenceableField>
        </div>
      </div>
    </div>
    </ReferenceableSection>
  );
}

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
  const [view, setView] = useState<"summary" | "detail">("summary");

  // Array/pill fields commit on every onChange (add/remove is already a discrete
  // action, unlike free typing), so this just logs before applying the patch.
  function logArray(label: string, oldValue: string[], onChange: (v: string[]) => void) {
    return (v: string[]) => { onLogField(label, oldValue, v, "manual"); onChange(v); };
  }

  if (view === "summary") {
    return <IcpSummary icp={icp} onViewDetails={() => setView("detail")} />;
  }

  return (
    <ReferenceableSection id={`icp:${icp.id}`} label={icp.name}>
    <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 900 }}>
      <button type="button" onClick={() => setView("summary")}
        style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 600, color: "var(--color-muted)", background: "transparent", border: "none", cursor: "pointer", padding: 0, fontFamily: "inherit" }}>
        <Icon name="chevron-left" size={13} />
        Back to summary
      </button>

      <div style={{ background: "var(--color-page)", border: "1px solid var(--color-border)", borderRadius: 14, padding: "18px 22px", boxShadow: "var(--shadow-card)" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 14, marginBottom: 12 }}>
          <ReferenceableField id={`icp:${icp.id}:field:name`} label="Name">
            <EditableField value={icp.name} onChange={(v) => onPatch({ name: v })}
              onCommit={(oldValue, newValue) => onLogField("Name", oldValue, newValue, "manual")} />
          </ReferenceableField>
          <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
            <button type="button" className="kc-primary-btn" style={KC_PRIMARY_BTN} onClick={() => setSavedAt(new Date().toLocaleTimeString())}>
              <Icon name="check" size={14} />
              Save
            </button>
          </div>
        </div>
        {savedAt && <div style={{ fontSize: 11.5, color: "var(--color-success)", marginTop: 8 }}>Saved at {savedAt}</div>}
      </div>

      <CardSection title="Identity & Fit">
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <ReferenceableField id={`icp:${icp.id}:field:summary`} label="Summary">
            <HistoryTextField label="Summary" value={icp.summary} onChange={(v) => onPatch({ summary: v })} multiline rows={2}
              onLogChange={(c) => onLogField("Summary", c.oldValue, c.newValue, c.source, c.prompt)} />
          </ReferenceableField>
          <ReferenceableField id={`icp:${icp.id}:field:fitReasoning`} label="Fit Reasoning">
            <HistoryTextField label="Fit Reasoning" value={icp.fitReasoning} onChange={(v) => onPatch({ fitReasoning: v })} multiline rows={2}
              onLogChange={(c) => onLogField("Fit Reasoning", c.oldValue, c.newValue, c.source, c.prompt)} />
          </ReferenceableField>
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

      <CardSection title="Firmographic Filters">
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <FieldLabel>Target Industries</FieldLabel>
            <ChipList items={icp.targetIndustries} onChange={logArray("Target Industries", icp.targetIndustries, (v) => onPatch({ targetIndustries: v }))} />
          </div>
          <div>
            <FieldLabel>Company Size</FieldLabel>
            <CheckboxPills options={COMPANY_SIZE_BUCKETS} selected={icp.companySizes} onChange={logArray("Company Size", icp.companySizes, (v) => onPatch({ companySizes: v }))} />
          </div>
          <ReferenceableField id={`icp:${icp.id}:field:revenueRange`} label="Revenue Range">
            <HistoryTextField label="Revenue Range" value={icp.revenueRange} onChange={(v) => onPatch({ revenueRange: v })}
              onLogChange={(c) => onLogField("Revenue Range", c.oldValue, c.newValue, c.source, c.prompt)} />
          </ReferenceableField>
          <div>
            <FieldLabel>Geographies</FieldLabel>
            <ChipList items={icp.geographies} onChange={logArray("Geographies", icp.geographies, (v) => onPatch({ geographies: v }))} />
          </div>
          <div>
            <FieldLabel>Funding Stage</FieldLabel>
            <CheckboxPills options={FUNDING_STAGE_BUCKETS} selected={icp.fundingStages} onChange={logArray("Funding Stage", icp.fundingStages, (v) => onPatch({ fundingStages: v }))} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
            <ReferenceableField id={`icp:${icp.id}:field:growthStage`} label="Growth Stage">
              <HistoryTextField label="Growth Stage" value={icp.growthStage} onChange={(v) => onPatch({ growthStage: v })}
                onLogChange={(c) => onLogField("Growth Stage", c.oldValue, c.newValue, c.source, c.prompt)} />
            </ReferenceableField>
            <ReferenceableField id={`icp:${icp.id}:field:businessModel`} label="Business Model">
              <HistoryTextField label="Business Model" value={icp.businessModel} onChange={(v) => onPatch({ businessModel: v })}
                onLogChange={(c) => onLogField("Business Model", c.oldValue, c.newValue, c.source, c.prompt)} />
            </ReferenceableField>
          </div>
          <div>
            <FieldLabel>Tech Stack Signals</FieldLabel>
            <ChipList items={icp.techStackSignals} onChange={logArray("Tech Stack Signals", icp.techStackSignals, (v) => onPatch({ techStackSignals: v }))} />
          </div>
          <ReferenceableField id={`icp:${icp.id}:field:decisionMakingUnit`} label="Decision-Making Unit">
            <HistoryTextField label="Decision-Making Unit" value={icp.decisionMakingUnit} onChange={(v) => onPatch({ decisionMakingUnit: v })} multiline rows={2}
              onLogChange={(c) => onLogField("Decision-Making Unit", c.oldValue, c.newValue, c.source, c.prompt)} />
          </ReferenceableField>
        </div>
      </CardSection>

      <CardSection title="Pains & Goals">
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

      <CardSection title="Intelligence & Targeting">
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
            <ReferenceableField id={`icp:${icp.id}:field:departmentSize`} label="Department Size">
              <HistoryTextField label="Department Size" value={icp.departmentSize} onChange={(v) => onPatch({ departmentSize: v })}
                onLogChange={(c) => onLogField("Department Size", c.oldValue, c.newValue, c.source, c.prompt)} />
            </ReferenceableField>
            <ReferenceableField id={`icp:${icp.id}:field:outreachAccessibility`} label="Outreach Accessibility">
              <HistoryTextField label="Outreach Accessibility" value={icp.outreachAccessibility} onChange={(v) => onPatch({ outreachAccessibility: v })}
                onLogChange={(c) => onLogField("Outreach Accessibility", c.oldValue, c.newValue, c.source, c.prompt)} />
            </ReferenceableField>
          </div>
        </div>
      </CardSection>

      <CardSection title="Discovered Personas">
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
    </ReferenceableSection>
  );
}
