import { useMemo, useState } from "react";
import { COMPANY_PROFILE, CompanyProfile } from "./data";
import { CardSection, ChipList, EditableField, FieldLabel, Icon, KC_PRIMARY_BTN, ProgressBar, TagRow } from "./ui";

const TEXT_FIELDS: { key: keyof CompanyProfile; label: string; multiline?: boolean }[] = [
  { key: "companyName", label: "Company Name" },
  { key: "website", label: "Website" },
  { key: "category", label: "Category" },
  { key: "companySize", label: "Company Size" },
  { key: "annualRevenue", label: "Annual Revenue" },
  { key: "elevatorPitch", label: "Elevator Pitch", multiline: true },
  { key: "productServiceSummary", label: "Product / Service Summary", multiline: true },
  { key: "weHelp", label: "We Help…" },
  { key: "whoStruggleWith", label: "Who Struggle With…" },
  { key: "byProviding", label: "By Providing…" },
  { key: "unlike", label: "Unlike…" },
  { key: "weUniquely", label: "We Uniquely…" },
  { key: "coreProblem", label: "Core Problem", multiline: true },
  { key: "differentiators", label: "Differentiators", multiline: true },
  { key: "buyingMotion", label: "Buying Motion", multiline: true },
  { key: "proof", label: "Proof", multiline: true },
  { key: "dreamCustomer", label: "Dream Customer", multiline: true },
];

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

function positioningStatement(p: CompanyProfile): string {
  return `We help ${p.weHelp} who struggle with ${p.whoStruggleWith} by providing ${p.byProviding}. Unlike ${p.unlike}, we uniquely ${p.weUniquely}.`;
}

export function CompanySection({ reviewed, onToggleReviewed }: { reviewed: boolean; onToggleReviewed: () => void }) {
  const [profile, setProfile] = useState<CompanyProfile>(COMPANY_PROFILE);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [view, setView] = useState<"summary" | "detail">("summary");
  const completion = useMemo(() => computeCompletion(profile), [profile]);

  function patch(key: keyof CompanyProfile, value: string | string[]) {
    setProfile((current) => ({ ...current, [key]: value } as CompanyProfile));
  }

  if (view === "summary") {
    return (
      <CompanySummary
        profile={profile}
        onViewDetails={() => setView("detail")}
      />
    );
  }

  return (
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

      <CardSection icon="briefcase" title="Business Profile" right={
        <button type="button" onClick={onToggleReviewed} title="Mark reviewed"
          style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, fontWeight: 700, color: reviewed ? "var(--color-success)" : "var(--color-muted)", background: reviewed ? "rgba(7,188,12,0.1)" : "var(--color-surface)", border: `1px solid ${reviewed ? "rgba(7,188,12,0.3)" : "var(--color-border)"}`, borderRadius: 999, padding: "4px 10px", cursor: "pointer" }}>
          <Icon name="check" size={11} />
          {reviewed ? "Reviewed" : "Mark reviewed"}
        </button>
      }>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
          {TEXT_FIELDS.map(({ key, label, multiline }) => (
            <div key={key} style={multiline ? { gridColumn: "1 / -1" } : undefined}>
              <FieldLabel>{label}</FieldLabel>
              <EditableField value={profile[key] as string} onChange={(v) => patch(key, v)} multiline={multiline} rows={2} />
            </div>
          ))}
        </div>
      </CardSection>

      <CardSection icon="target" title="Market & Positioning">
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {CHIP_FIELDS.map(({ key, label }) => (
            <div key={key}>
              <FieldLabel>{label}</FieldLabel>
              <ChipList items={profile[key] as string[]} onChange={(v) => patch(key, v)} />
            </div>
          ))}
        </div>
      </CardSection>

      <CardSection icon="handshake" title="Deal & Sales Cycle">
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <FieldLabel>Deal Overview</FieldLabel>
            <EditableField value={profile.dealOverview} onChange={(v) => patch("dealOverview", v)} multiline rows={3} />
          </div>
          <div>
            <FieldLabel>Sales Cycle</FieldLabel>
            <EditableField value={profile.salesCycle} onChange={(v) => patch("salesCycle", v)} multiline rows={3} />
          </div>
        </div>
      </CardSection>
    </div>
  );
}

/* ─── Summary — one-page editorial overview, read-only ─────────────
   Business Profile's ~20 discrete fields collapse into a handful of
   flowing paragraphs; tag lists stay as compact read-only chips.
   "View Details" drops into the full editable form above. */
function CompanySummary({ profile, onViewDetails }: {
  profile: CompanyProfile;
  onViewDetails: () => void;
}) {
  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ background: "var(--color-page)", border: "1px solid var(--color-border)", borderRadius: 14, padding: "16px 26px", boxShadow: "var(--shadow-card)" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 20, flexWrap: "wrap" }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
              <h2 style={{ fontSize: 21, fontWeight: 800, margin: 0 }}>{profile.companyName}</h2>
              <a href={`https://${profile.website}`} target="_blank" rel="noopener noreferrer"
                style={{ fontSize: 12.5, color: "var(--color-brand)", textDecoration: "none" }}>
                {profile.website}
              </a>
            </div>
            <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 7, fontSize: 12, color: "var(--color-muted)", margin: "5px 0 8px" }}>
              <span>{profile.category}</span>
              <span style={{ opacity: 0.4 }}>·</span>
              <span>{profile.companySize}</span>
              <span style={{ opacity: 0.4 }}>·</span>
              <span>{profile.annualRevenue}</span>
            </div>
            <p style={{ fontSize: 15, color: "var(--color-heading)", lineHeight: 1.6, margin: 0, maxWidth: 640, fontStyle: "italic" }}>
              &ldquo;{profile.elevatorPitch}&rdquo;
            </p>
          </div>
          <div style={{ flexShrink: 0 }}>
            <button type="button" className="kc-primary-btn" title="View Details" style={{ ...KC_PRIMARY_BTN, padding: 0, width: 36, height: 36, justifyContent: "center" }} onClick={onViewDetails}>
              <Icon name="edit" size={14} />
            </button>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 14, alignItems: "start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <CardSection icon="message" title="Positioning">
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <p style={PROSE}>{positioningStatement(profile)}</p>
              <p style={PROSE}>{profile.coreProblem}</p>
              <p style={{ ...PROSE, color: "var(--color-muted)", fontStyle: "italic" }}>{profile.proof}</p>
            </div>
          </CardSection>

          <CardSection icon="handshake" title="Deal & Sales Cycle">
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <p style={PROSE}>{profile.dealOverview} {profile.salesCycle}</p>
              <div>
                <FieldLabel>Buying Motion</FieldLabel>
                <p style={{ ...PROSE, margin: 0 }}>{profile.buyingMotion}</p>
              </div>
            </div>
          </CardSection>
        </div>

        <CardSection icon="grid" title="Product & Market">
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <p style={PROSE}>{profile.productServiceSummary} {profile.differentiators}</p>

            <div style={{ borderLeft: "3px solid var(--color-brand)", borderRadius: 8, padding: "9px 13px" }}>
              <FieldLabel>Dream Customer</FieldLabel>
              <p style={{ ...PROSE, margin: 0 }}>{profile.dreamCustomer}</p>
            </div>

            <div>
              <FieldLabel>Industries</FieldLabel>
              <TagRow items={profile.industries} />
            </div>
            <div>
              <FieldLabel>Competitors</FieldLabel>
              <TagRow items={profile.competitors} />
            </div>
            <div>
              <FieldLabel>Notable Customers</FieldLabel>
              <TagRow items={profile.notableCustomers} />
            </div>
          </div>
        </CardSection>
      </div>
    </div>
  );
}
