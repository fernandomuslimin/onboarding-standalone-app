import { useMemo, useState } from "react";
import { CompanyProfile, HistorySource } from "./data";
import { Bullets, CardSection, ChipList, FieldLabel, HistoryTextField, Icon, KC_PRIMARY_BTN, ProgressBar, reviseText } from "./ui";
import { ReferenceableField, ReferenceableSection } from "../copilot/Referenceable";
import { useRegisterCopilotAdapter } from "../copilot/CopilotContext";
import { ResolvedReference } from "../copilot/types";

type LogField = (fieldLabel: string, oldValue: string | string[], newValue: string | string[], source: HistorySource, prompt?: string) => void;

type TextFieldSpec = { key: keyof CompanyProfile; label: string; multiline?: boolean };

// Short, single-line facts about the company.
const BASIC_FIELDS: TextFieldSpec[] = [
  { key: "companyName", label: "Company Name" },
  { key: "website", label: "Website" },
  { key: "category", label: "Category" },
  { key: "companySize", label: "Company Size" },
  { key: "annualRevenue", label: "Annual Revenue" },
];

// The headline pitch and one-paragraph summary.
const PITCH_FIELDS: TextFieldSpec[] = [
  { key: "elevatorPitch", label: "Elevator Pitch", multiline: true },
  { key: "productServiceSummary", label: "Product / Service Summary", multiline: true },
];

// These five clauses stitch together into one sentence in the summary view
// (see positioningStatement below) — each holds a full clause, not a short
// value, so they need the same multiline treatment as any other prose field.
const POSITIONING_FIELDS: TextFieldSpec[] = [
  { key: "weHelp", label: "We Help…", multiline: true },
  { key: "whoStruggleWith", label: "Who Struggle With…", multiline: true },
  { key: "byProviding", label: "By Providing…", multiline: true },
  { key: "unlike", label: "Unlike…", multiline: true },
  { key: "weUniquely", label: "We Uniquely…", multiline: true },
];

const DEEP_DIVE_FIELDS: TextFieldSpec[] = [
  { key: "coreProblem", label: "Core Problem", multiline: true },
  { key: "differentiators", label: "Differentiators", multiline: true },
  { key: "buyingMotion", label: "Buying Motion", multiline: true },
  { key: "proof", label: "Proof", multiline: true },
  { key: "dreamCustomer", label: "Dream Customer", multiline: true },
];

function ProfileTextField({ field, profile, onChange, onLogField }: {
  field: TextFieldSpec; profile: CompanyProfile; onChange: (key: keyof CompanyProfile, value: string) => void; onLogField: LogField;
}) {
  const value = profile[field.key] as string;
  return (
    <ReferenceableField id={`company:${field.key}`} label={field.label}>
      <HistoryTextField
        label={field.label} value={value} onChange={(v) => onChange(field.key, v)} multiline={field.multiline} rows={field.multiline ? 3 : undefined}
        onLogChange={(c) => onLogField(field.label, c.oldValue, c.newValue, c.source, c.prompt)}
      />
    </ReferenceableField>
  );
}

const CHIP_FIELDS: { key: keyof CompanyProfile; label: string }[] = [
  { key: "industries", label: "Industries" },
  { key: "products", label: "Products" },
  { key: "competitors", label: "Competitors" },
  { key: "keySellingPoints", label: "Key Selling Points" },
  { key: "trustRisksObjections", label: "Trust Risks / Objections" },
  { key: "notableCustomers", label: "Notable Customers" },
];

const PROSE: React.CSSProperties = { fontSize: 13.5, color: "var(--color-body)", lineHeight: 1.55, margin: 0 };

function computeCompletion(profile: CompanyProfile): number {
  const values = Object.values(profile);
  const filled = values.filter((v) => (Array.isArray(v) ? v.length > 0 : v.trim().length > 0)).length;
  return Math.round((filled / values.length) * 100);
}

// AI-Synthesized blocks 2 & 3 (see summary-view-spec.md Step 1) — in a real
// pipeline these are model-written prose combining the source fields; here
// they're stitched deterministically, matching the mock style used
// elsewhere in this file (e.g. reviseText).
function whoYouAreParagraph(p: CompanyProfile): string {
  return `${p.elevatorPitch} We help ${p.weHelp} who struggle with ${p.whoStruggleWith} by providing ${p.byProviding}. ${p.coreProblem}`;
}
function differentiationParagraph(p: CompanyProfile): string {
  return `Unlike ${p.unlike}, we uniquely ${p.weUniquely}. ${p.differentiators}`;
}

// Every text field addressable at "company:{key}" via the copilot —
// everything ProfileTextField/HistoryTextField renders, i.e. all of
// BASIC_FIELDS/PITCH_FIELDS/POSITIONING_FIELDS/DEEP_DIVE_FIELDS plus
// the two Deal & Sales Cycle fields.
const COMPANY_TEXT_FIELDS: TextFieldSpec[] = [...BASIC_FIELDS, ...PITCH_FIELDS, ...POSITIONING_FIELDS, ...DEEP_DIVE_FIELDS, { key: "dealOverview", label: "Deal Overview" }, { key: "salesCycle", label: "Sales Cycle" }];

// The Summary view (below) shows two AI-Synthesized blocks that don't map to
// a single profile field — they're prose combining several. These two
// synthetic ids let the copilot pin/resolve/revise each block as a unit
// (mirrors the "one prompt per block" bundle-revise pattern used for the
// same blocks in onboarding-shell.tsx's Company Research step), reusing the
// exact paragraph builders the summary renders so the copilot always
// "reads" what the user sees.
const SYNTHESIZED_BLOCKS: { key: "whoYouAre" | "whatMakesYouDifferent"; label: string; build: (p: CompanyProfile) => string; fields: (keyof CompanyProfile)[] }[] = [
  { key: "whoYouAre", label: "Company Overview", build: whoYouAreParagraph, fields: ["elevatorPitch", "weHelp", "whoStruggleWith", "byProviding", "coreProblem"] },
  { key: "whatMakesYouDifferent", label: "Competitive Differentiation", build: differentiationParagraph, fields: ["unlike", "weUniquely", "differentiators"] },
];

// Section-level pin targets for the remaining summary blocks (Company
// Overview / Competitive Differentiation already pin as a whole via their
// SYNTHESIZED_BLOCKS field id above). Ids are namespaced "company:block:
// {key}" so hovering/pinning the whole card works the same as pinning a
// single field inside it — mirrors the same pattern in onboarding-shell.tsx's
// StepCompanyResearch.
const COMPANY_BLOCKS: { key: string; label: string; fields: (keyof CompanyProfile)[] }[] = [
  { key: "productsOfferings", label: "Products & Offerings", fields: ["productServiceSummary", "products"] },
  { key: "proofCredibility", label: "Proof & Credibility", fields: ["keySellingPoints", "notableCustomers", "proof"] },
  { key: "marketContext", label: "Market Context", fields: ["industries", "competitors"] },
  { key: "dealSnapshot", label: "Deal Snapshot", fields: ["buyingMotion", "dealOverview", "salesCycle"] },
  { key: "risksToAddress", label: "Risks to Address", fields: ["trustRisksObjections"] },
];
const companyBlockId = (key: string) => `company:block:${key}`;

export function CompanySection({ profile, onChange, onLogField, reviewed, onToggleReviewed }: {
  profile: CompanyProfile; onChange: (key: keyof CompanyProfile, value: string | string[]) => void; onLogField: LogField;
  reviewed: boolean; onToggleReviewed: () => void;
}) {
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [view, setView] = useState<"summary" | "detail">("summary");
  const completion = useMemo(() => computeCompletion(profile), [profile]);

  function patch(key: keyof CompanyProfile, value: string | string[]) {
    onChange(key, value);
  }

  useRegisterCopilotAdapter("company", {
    resolve(id): ResolvedReference | null {
      const parts = id.split(":");
      const key = parts[1];
      if (!key) return { id, label: profile.companyName, value: COMPANY_TEXT_FIELDS.map((f) => ({ label: f.label, value: profile[f.key] as string })) };
      if (key === "block") {
        const block = COMPANY_BLOCKS.find((b) => b.key === parts[2]);
        if (!block) return null;
        return {
          id, label: block.label,
          value: block.fields.map((f) => {
            const spec = [...COMPANY_TEXT_FIELDS, ...CHIP_FIELDS].find((s) => s.key === f);
            return { label: spec ? spec.label : f, value: profile[f] };
          }),
        };
      }
      const synth = SYNTHESIZED_BLOCKS.find((b) => b.key === key);
      if (synth) return { id, label: synth.label, value: synth.build(profile) };
      if (!(key in profile)) return null;
      const spec = COMPANY_TEXT_FIELDS.find((f) => f.key === key);
      return { id, label: spec ? spec.label : key, value: profile[key as keyof CompanyProfile] };
    },
    applyEdit(id, instruction) {
      const parts = id.split(":");
      const key = parts[1];
      return new Promise((resolve) => {
        setTimeout(() => {
          if (key === "block") {
            const block = COMPANY_BLOCKS.find((b) => b.key === parts[2]);
            if (!block) return resolve({ changedSummary: "couldn't find that section." });
            let changed = 0;
            let hasListFields = false;
            block.fields.forEach((f) => {
              const textSpec = COMPANY_TEXT_FIELDS.find((t) => t.key === f);
              if (!textSpec) { hasListFields = true; return; }
              const oldValue = profile[f] as string;
              const revised = reviseText(oldValue, instruction);
              if (revised !== oldValue) {
                onChange(f, revised);
                onLogField(textSpec.label, oldValue, revised, "ai", instruction);
                changed++;
              }
            });
            if (changed > 0) return resolve({ changedSummary: `updated ${changed} field(s) in "${block.label}".` });
            return resolve({ changedSummary: hasListFields ? `no text changes — list fields in "${block.label}" aren't editable via the copilot yet.` : "no visible change." });
          }
          if (key) {
            const synth = SYNTHESIZED_BLOCKS.find((b) => b.key === key);
            if (synth) {
              let changed = 0;
              synth.fields.forEach((fieldKey) => {
                const oldValue = profile[fieldKey] as string;
                const revised = reviseText(oldValue, instruction);
                if (revised !== oldValue) {
                  onChange(fieldKey, revised);
                  onLogField(fieldKey, oldValue, revised, "ai", instruction);
                  changed++;
                }
              });
              return resolve({ changedSummary: changed > 0 ? `updated "${synth.label}" (${changed} field(s)).` : "no visible change." });
            }
            const spec = COMPANY_TEXT_FIELDS.find((f) => f.key === key);
            if (!spec) return resolve({ changedSummary: "this is a list field — ask a question about it instead, list fields aren't editable via the copilot yet." });
            const oldValue = profile[key as keyof CompanyProfile] as string;
            const revised = reviseText(oldValue, instruction);
            if (revised === oldValue) return resolve({ changedSummary: "no visible change." });
            onChange(key as keyof CompanyProfile, revised);
            onLogField(spec.label, oldValue, revised, "ai", instruction);
            return resolve({ changedSummary: `updated "${spec.label}".` });
          }
          let changed = 0;
          COMPANY_TEXT_FIELDS.forEach((f) => {
            const oldValue = profile[f.key] as string;
            const revised = reviseText(oldValue, instruction);
            if (revised !== oldValue) {
              onChange(f.key, revised);
              onLogField(f.label, oldValue, revised, "ai", instruction);
              changed++;
            }
          });
          resolve({ changedSummary: changed > 0 ? `updated ${changed} field(s).` : "no text fields changed." });
        }, key ? 800 : 1200);
      });
    },
  });

  if (view === "summary") {
    return (
      <CompanySummary
        profile={profile}
        onViewDetails={() => setView("detail")}
      />
    );
  }

  return (
    <ReferenceableSection id="company" label={profile.companyName}>
    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 22 }}>
      <button type="button" onClick={() => setView("summary")}
        style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 600, color: "var(--color-muted)", background: "transparent", border: "none", cursor: "pointer", padding: 0, fontFamily: "inherit" }}>
        <Icon name="chevron-left" size={13} />
        Back to summary
      </button>

      <div style={{ background: "var(--color-page)", border: "1px solid var(--color-border)", borderRadius: 14, padding: "22px 24px", boxShadow: "var(--shadow-card)" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 14 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, margin: "0 0 4px" }}>Company Profile</h2>
            <p style={{ fontSize: 13, color: "var(--color-muted)", margin: 0, lineHeight: 1.5 }}>
              Everything the AI has learned about {profile.companyName} — used to ground research across products, ICPs, and personas.
            </p>
          </div>
          <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
            <button type="button" onClick={onToggleReviewed} title="Mark reviewed"
              style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, fontWeight: 700, color: reviewed ? "var(--color-success)" : "var(--color-muted)", background: reviewed ? "rgba(7,188,12,0.1)" : "var(--color-surface)", border: `1px solid ${reviewed ? "rgba(7,188,12,0.3)" : "var(--color-border)"}`, borderRadius: 999, padding: "0 12px", cursor: "pointer" }}>
              <Icon name="check" size={11} />
              {reviewed ? "Reviewed" : "Mark reviewed"}
            </button>
            <button type="button" className="kc-primary-btn" style={KC_PRIMARY_BTN} onClick={() => setSavedAt(new Date().toLocaleTimeString())}>
              <Icon name="check" size={14} />
              Save
            </button>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ flex: 1 }}>
            <ProgressBar pct={completion} />
          </div>
        </div>
        {savedAt && <div style={{ fontSize: 11.5, color: "var(--color-success)", marginTop: 8 }}>Saved at {savedAt}</div>}
      </div>

      <CardSection icon="briefcase" title="Company Basics">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
          {BASIC_FIELDS.map((field) => <ProfileTextField key={field.key} field={field} profile={profile} onChange={patch} onLogField={onLogField} />)}
        </div>
      </CardSection>

      <CardSection icon="message" title="Elevator Pitch">
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {PITCH_FIELDS.map((field) => <ProfileTextField key={field.key} field={field} profile={profile} onChange={patch} onLogField={onLogField} />)}
        </div>
      </CardSection>

      <CardSection icon="compass" title="Positioning Statement">
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {POSITIONING_FIELDS.map((field) => <ProfileTextField key={field.key} field={field} profile={profile} onChange={patch} onLogField={onLogField} />)}
        </div>
      </CardSection>

      <CardSection icon="brain" title="Deep Dive">
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {DEEP_DIVE_FIELDS.map((field) => <ProfileTextField key={field.key} field={field} profile={profile} onChange={patch} onLogField={onLogField} />)}
        </div>
      </CardSection>

      <CardSection icon="target" title="Market & Positioning">
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {CHIP_FIELDS.map(({ key, label }) => (
            <ReferenceableField key={key} id={`company:${key}`} label={label}>
              <FieldLabel>{label}</FieldLabel>
              <ChipList items={profile[key] as string[]} onChange={(v) => patch(key, v)} />
            </ReferenceableField>
          ))}
        </div>
      </CardSection>

      <CardSection icon="handshake" title="Deal & Sales Cycle">
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <ReferenceableField id="company:dealOverview" label="Deal Overview">
            <HistoryTextField label="Deal Overview" value={profile.dealOverview} onChange={(v) => patch("dealOverview", v)} multiline rows={3}
              onLogChange={(c) => onLogField("Deal Overview", c.oldValue, c.newValue, c.source, c.prompt)} />
          </ReferenceableField>
          <ReferenceableField id="company:salesCycle" label="Sales Cycle">
            <HistoryTextField label="Sales Cycle" value={profile.salesCycle} onChange={(v) => patch("salesCycle", v)} multiline rows={3}
              onLogChange={(c) => onLogField("Sales Cycle", c.oldValue, c.newValue, c.source, c.prompt)} />
          </ReferenceableField>
        </div>
      </CardSection>
    </div>
    </ReferenceableSection>
  );
}

/* ─── Summary — matches docs/field_reference/summary-view-spec.md,
   Step 1 (Company Profile). Primary blocks 1–5 sit above the fold, laid
   out as a wide left column; Secondary blocks 6–8 sit in a narrower
   right rail — always expanded (no collapse/show-more) — a desktop
   layout that spends the page's real width on the tiering the spec
   already defines, instead of one long single-column scroll. Blocks 9
   (dreamCustomer) and 10 (goalTimeline — not in this mock model) are
   intentionally absent here: Hidden — still live in the full detail
   form above and addressable via Copilot.
   "View Details" drops into that full editable form. */
function CompanySummary({ profile, onViewDetails }: {
  profile: CompanyProfile;
  onViewDetails: () => void;
}) {
  return (
    <ReferenceableSection id="company" label={profile.companyName} style={{ width: "100%" }}>
    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Block 1 — Header Strip (Primary, Field-Join) */}
      <div style={{ background: "var(--color-page)", border: "1px solid var(--color-border)", borderRadius: 14, padding: "16px 26px", boxShadow: "var(--shadow-card)" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 20, marginBottom: 12 }}>
          <h2 style={{ fontSize: 21, fontWeight: 800, margin: 0 }}>{profile.companyName}</h2>
          <button type="button" className="kc-primary-btn" title="View Details" style={{ ...KC_PRIMARY_BTN, padding: 0, width: 36, height: 36, justifyContent: "center", flexShrink: 0 }} onClick={onViewDetails}>
            <Icon name="edit" size={14} />
          </button>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16, border: "1px solid var(--color-border)", borderRadius: 14, background: "var(--color-surface)", padding: "14px 16px" }}>
          {([["category", "Category", profile.category], ["companySize", "Company Size", profile.companySize], ["annualRevenue", "Revenue", profile.annualRevenue]] as const).map(([key, label, value]) => (
            <ReferenceableField key={key} id={`company:${key}`} label={label} style={{ flex: "1 1 150px", minWidth: 0 }}>
              <div style={{ fontSize: 10.5, fontWeight: 700, color: "var(--color-muted)", letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 4 }}>{label}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-heading)" }}>{value}</div>
            </ReferenceableField>
          ))}
        </div>
      </div>

      {/* Primary blocks (left, wide) + Secondary blocks (right rail) —
          collapses to a single column below 1024px, see .kc-company-grid
          in ui.tsx's KC_STYLES. */}
      <div className="kc-company-grid" style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.6fr) minmax(300px, 1fr)", gap: 20, alignItems: "start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 0 }}>
          {/* Block 2 — Who You Are & The Problem You Solve (Primary, AI-Synthesized) */}
          <ReferenceableField id="company:whoYouAre" label="Company Overview">
            <CardSection icon="message" title="Company Overview">
              <p style={PROSE}>{whoYouAreParagraph(profile)}</p>
            </CardSection>
          </ReferenceableField>

          {/* Block 3 — What Makes You Different (Primary, AI-Synthesized) */}
          <ReferenceableField id="company:whatMakesYouDifferent" label="Competitive Differentiation">
            <CardSection icon="compass" title="Competitive Differentiation">
              <p style={PROSE}>{differentiationParagraph(profile)}</p>
            </CardSection>
          </ReferenceableField>

          {/* Block 4 — What You Sell (Primary, Field-Join) */}
          <CardSection icon="grid" title="Products & Offerings" sectionId={companyBlockId("productsOfferings")}>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <ReferenceableField id="company:productServiceSummary" label="Product / Service Summary">
                <p style={PROSE}>{profile.productServiceSummary}</p>
              </ReferenceableField>
              <ReferenceableField id="company:products" label="Products">
                <Bullets items={profile.products} tone="brand" />
              </ReferenceableField>
            </div>
          </CardSection>

          {/* Block 5 — Proof & Credibility (Primary, Field-Join) */}
          <CardSection icon="handshake" title="Proof & Credibility" sectionId={companyBlockId("proofCredibility")}>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
                <ReferenceableField id="company:keySellingPoints" label="Key Selling Points">
                  <FieldLabel>Key Selling Points</FieldLabel>
                  <Bullets items={profile.keySellingPoints} tone="brand" />
                </ReferenceableField>
                <ReferenceableField id="company:notableCustomers" label="Notable Customers">
                  <FieldLabel>Notable Customers</FieldLabel>
                  <Bullets items={profile.notableCustomers} />
                </ReferenceableField>
              </div>
              <ReferenceableField id="company:proof" label="Proof">
                <p style={{ ...PROSE, color: "var(--color-muted)", fontStyle: "italic" }}>&ldquo;{profile.proof}&rdquo;</p>
              </ReferenceableField>
            </div>
          </CardSection>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 0 }}>
          {/* Blocks 6–8 — Secondary, always visible (no collapse/expand) */}
          <CardSection icon="globe" title="Market Context" sectionId={companyBlockId("marketContext")}>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <ReferenceableField id="company:industries" label="Industries">
                <FieldLabel>Industries</FieldLabel>
                <Bullets items={profile.industries} />
              </ReferenceableField>
              <ReferenceableField id="company:competitors" label="Competitors">
                <FieldLabel>Competitors</FieldLabel>
                <Bullets items={profile.competitors} />
              </ReferenceableField>
            </div>
          </CardSection>

          <CardSection icon="dollar" title="Deal Snapshot" sectionId={companyBlockId("dealSnapshot")}>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <ReferenceableField id="company:buyingMotion" label="Buying Motion">
                <FieldLabel>Buying Motion</FieldLabel>
                <p style={{ ...PROSE, margin: 0 }}>{profile.buyingMotion}</p>
              </ReferenceableField>
              <ReferenceableField id="company:dealOverview" label="Deal Overview">
                <FieldLabel>Deal Overview</FieldLabel>
                <p style={{ ...PROSE, margin: 0 }}>{profile.dealOverview}</p>
              </ReferenceableField>
              <ReferenceableField id="company:salesCycle" label="Sales Cycle">
                <FieldLabel>Sales Cycle</FieldLabel>
                <p style={{ ...PROSE, margin: 0 }}>{profile.salesCycle}</p>
              </ReferenceableField>
            </div>
          </CardSection>

          <CardSection icon="shield" title="Risks to Address" sectionId={companyBlockId("risksToAddress")}>
            <ReferenceableField id="company:trustRisksObjections" label="Trust Risks / Objections">
              <Bullets items={profile.trustRisksObjections} />
            </ReferenceableField>
          </CardSection>
        </div>
      </div>
    </div>
    </ReferenceableSection>
  );
}
