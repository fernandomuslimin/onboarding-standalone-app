import { useEffect, useState } from "react";
import { CompanyProfile, HistorySource, IcpDetail, PersonaDetail, ProductDetail, icpsForProduct, personasForIcp, treeKey } from "./data";
import { AccordionBlock, CardSection, EmptyState, FieldLabel, FieldValue, Icon, KC_PRIMARY_BTN, LowConfidenceMark, MatchBadge, TagRow } from "./ui";
import { TreeSelection } from "./Tree";
import { CompanySection } from "./Company";
import { PersonaCard } from "./Diagram";
import { ReferenceableField, ReferenceableSection } from "../copilot/Referenceable";

type LogField = (fieldLabel: string, oldValue: string | string[], newValue: string | string[], source: HistorySource, prompt?: string) => void;

const PROSE: React.CSSProperties = { fontSize: 13.5, color: "var(--color-body)", lineHeight: 1.55, margin: 0 };

type LabeledField = { label: string; value: string | string[]; confidence?: number };

function fieldValue(fields: LabeledField[], label: string): string | string[] | undefined {
  return fields.find((f) => f.label === label)?.value;
}
function fieldConfidence(fields: LabeledField[], label: string): number | undefined {
  return fields.find((f) => f.label === label)?.confidence;
}
function fieldList(fields: LabeledField[], label: string): string[] {
  const v = fieldValue(fields, label);
  return Array.isArray(v) ? v : v ? [v] : [];
}

function ProductPillRow({ products, activeId, reviewedKeys, onSelect, onAdd }: {
  products: ProductDetail[]; activeId: string | null; reviewedKeys: Set<string>;
  onSelect: (id: string) => void; onAdd: () => void;
}) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
      {products.map((product) => {
        const active = product.id === activeId;
        return (
          <button key={product.id} type="button" onClick={() => onSelect(product.id)}
            style={{
              display: "flex", alignItems: "center", gap: 7, fontSize: 12.5, fontWeight: 700, fontFamily: "inherit",
              padding: "8px 16px", borderRadius: 999, cursor: "pointer",
              border: active ? "1px solid var(--color-brand)" : "1px solid var(--color-border)",
              background: active ? "var(--color-brand-tint)" : "var(--color-page)",
              color: active ? "var(--color-brand)" : "var(--color-body)",
            }}>
            {product.name}
            {reviewedKeys.has(treeKey("product", product.id)) && <Icon name="check" size={12} color="var(--color-success)" />}
          </button>
        );
      })}
      <button type="button" onClick={onAdd}
        style={{
          display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 600, fontFamily: "inherit",
          padding: "8px 14px", borderRadius: 999, cursor: "pointer",
          border: "1.5px dashed var(--color-border-strong)", background: "transparent", color: "var(--color-muted)",
        }}>
        <Icon name="plus" size={12} />
        Add Product
      </button>
    </div>
  );
}

function SectionHeaderRow({ title, actionLabel, onAction }: { title: string; actionLabel: string; onAction: () => void }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <h3 style={{ fontSize: 12.5, fontWeight: 800, color: "var(--color-muted)", margin: 0, textTransform: "uppercase", letterSpacing: "0.05em" }}>{title}</h3>
      <button type="button" onClick={onAction}
        style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700, color: "var(--color-brand)", background: "transparent", border: "none", cursor: "pointer", fontFamily: "inherit", padding: 0 }}>
        <Icon name="plus" size={12} />
        {actionLabel}
      </button>
    </div>
  );
}

/* ─── Product summary — matches summary-view-spec.md Step 2. Primary
   blocks 1,2,3,4,5,6,8 are always visible; Secondary blocks 7 & 9 sit
   behind AccordionBlock. Blocks 10–13 (messaging playbook, extended
   commercials, additional proof, scoring input) are Hidden — Copilot
   only — and stay out of this summary entirely; they're still fully
   present in the product's field list and reachable via "View Details"
   or the Copilot. */
function ProductSummaryCard({ product, icpNames, onViewDetails }: {
  product: ProductDetail; icpNames: string[]; onViewDetails: () => void;
}) {
  const f = product.fields;
  const proofPoints = fieldList(f, "Proof Points");
  const roiMetrics = fieldList(f, "ROI Metrics");
  const caseStudies = fieldList(f, "Case Studies");

  return (
    <ReferenceableSection id={`product:${product.id}`} label={product.name}>
    <CardSection icon="briefcase" title={product.name} right={
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <MatchBadge value={product.matchPct} />
        <button type="button" className="kc-primary-btn" title="View Details" style={{ ...KC_PRIMARY_BTN, padding: 0, width: 36, height: 36, justifyContent: "center" }} onClick={onViewDetails}>
          <Icon name="edit" size={14} />
        </button>
      </div>
    }>
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        {/* Block 1 — Header (Primary, Field-Join) */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 7, fontSize: 12, color: "var(--color-muted)" }}>
          <ReferenceableField id={`product:${product.id}:field:Category`} label="Category">
            <span>{fieldValue(f, "Category")}</span>
          </ReferenceableField>
          <span style={{ opacity: 0.4 }}>·</span>
          <ReferenceableField id={`product:${product.id}:field:Time To Value`} label="Time To Value">
            <span>{fieldValue(f, "Time To Value")}</span>
          </ReferenceableField>
        </div>

        {/* Block 2 — Elevator Pitch (Primary, Verbatim Passthrough) */}
        <ReferenceableField id={`product:${product.id}:field:Elevator Pitch`} label="Elevator Pitch">
          <p style={{ ...PROSE, fontSize: 14.5, fontStyle: "italic", color: "var(--color-heading)" }}>
            &ldquo;{fieldValue(f, "Elevator Pitch") ?? product.description}&rdquo;
          </p>
        </ReferenceableField>

        {/* Block 3 — What It Does & Solves (Primary, AI-Synthesized) */}
        <ReferenceableField id={`product:${product.id}:field:Value Proposition`} label="What It Does & Solves">
          <p style={{ ...PROSE, display: "flex", alignItems: "flex-start", gap: 6 }}>
            {product.description} {fieldValue(f, "Value Proposition")}
            <LowConfidenceMark value={fieldConfidence(f, "Problems Solved")} />
          </p>
        </ReferenceableField>

        {/* Block 4 — Key Capabilities (Primary, Field-Join) */}
        <ReferenceableField id={`product:${product.id}:field:Key Features`} label="Key Capabilities">
          <FieldLabel confidence={fieldConfidence(f, "Key Features")}>Key Capabilities</FieldLabel>
          <TagRow items={fieldList(f, "Key Features").slice(0, 7)} />
        </ReferenceableField>

        {/* Block 5 — Who It's For (Primary, Field-Join) */}
        <ReferenceableField id={`product:${product.id}:field:Ideal Customer`} label="Target Customer">
          <FieldLabel>Target Customer</FieldLabel>
          <p style={{ ...PROSE, margin: "0 0 8px" }}>{fieldValue(f, "Ideal Customer")}</p>
          {icpNames.length > 0 && <TagRow items={icpNames} />}
        </ReferenceableField>

        {/* Block 6 — Proof It Works (Primary, Field-Join) */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
            {proofPoints.length > 0 && (
              <ReferenceableField id={`product:${product.id}:field:Proof Points`} label="Proof Points">
                <FieldLabel>Proof Points</FieldLabel>
                <FieldValue value={proofPoints} />
              </ReferenceableField>
            )}
            {roiMetrics.length > 0 && (
              <ReferenceableField id={`product:${product.id}:field:ROI Metrics`} label="ROI Metrics">
                <FieldLabel>ROI Metrics</FieldLabel>
                <FieldValue value={roiMetrics} />
              </ReferenceableField>
            )}
          </div>
          {caseStudies[0] && (
            <ReferenceableField id={`product:${product.id}:field:Case Studies`} label="Case Studies">
              <div style={{ borderLeft: "3px solid var(--color-brand)", borderRadius: 8, padding: "9px 13px" }}>
                <FieldLabel>Case Study</FieldLabel>
                <p style={{ ...PROSE, margin: 0 }}>{caseStudies[0]}</p>
              </div>
            </ReferenceableField>
          )}
        </div>

        {/* Block 7 — Competitive Snapshot (Secondary) */}
        <AccordionBlock icon="graph" title="Competitive Snapshot">
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <ReferenceableField id={`product:${product.id}:field:Competitors`} label="Competitors">
              <FieldLabel>Competitors</FieldLabel>
              <TagRow items={fieldList(f, "Competitors")} />
            </ReferenceableField>
            <ReferenceableField id={`product:${product.id}:field:Market Maturity`} label="Market Maturity">
              <FieldLabel>Market Maturity</FieldLabel>
              <FieldValue value={fieldValue(f, "Market Maturity") ?? ""} />
            </ReferenceableField>
          </div>
        </AccordionBlock>

        {/* Block 8 — Deal Basics (Primary, Field-Join) */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          <ReferenceableField id={`product:${product.id}:field:ACV`} label="ACV">
            <FieldLabel>ACV</FieldLabel>
            <FieldValue value={fieldValue(f, "ACV") ?? "—"} />
          </ReferenceableField>
          <ReferenceableField id={`product:${product.id}:field:Deal Type`} label="Deal Type">
            <FieldLabel>Deal Type</FieldLabel>
            <FieldValue value={fieldValue(f, "Deal Type") ?? "—"} />
          </ReferenceableField>
          <ReferenceableField id={`product:${product.id}:field:Contract Length`} label="Contract Length">
            <FieldLabel>Contract Length</FieldLabel>
            <FieldValue value={fieldValue(f, "Contract Length") ?? "—"} />
          </ReferenceableField>
        </div>

        {/* Block 9 — Objections & Switch Triggers (Secondary) */}
        <AccordionBlock icon="shield" title="Objections & Switch Triggers">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
            <ReferenceableField id={`product:${product.id}:field:Buyer Objections`} label="Buyer Objections">
              <FieldLabel>Buyer Objections</FieldLabel>
              <FieldValue value={fieldList(f, "Buyer Objections")} />
            </ReferenceableField>
            <ReferenceableField id={`product:${product.id}:field:Switch Triggers`} label="Switch Triggers">
              <FieldLabel>Switch Triggers</FieldLabel>
              <FieldValue value={fieldList(f, "Switch Triggers")} />
            </ReferenceableField>
          </div>
        </AccordionBlock>
      </div>
    </CardSection>
    </ReferenceableSection>
  );
}

/* Card list preview for ICP block 7 "Candidate Personas" — name +
   description only, per spec; deeper fields live behind the persona's
   own summary/detail view. */
function PersonaMiniSummary({ persona }: { persona: PersonaDetail }) {
  return (
    <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 4 }}>
      <span style={{ fontSize: 13, fontWeight: 700, color: "var(--color-heading)" }}>{persona.name}</span>
      <p style={{ ...PROSE, color: "var(--color-muted)" }}>{persona.subtitle}</p>
    </div>
  );
}

function PersonaGroup({ icp, personas, selection, reviewedKeys, onSelect, onAddPersona }: {
  icp: IcpDetail; personas: PersonaDetail[]; selection: TreeSelection | null; reviewedKeys: Set<string>;
  onSelect: (sel: TreeSelection) => void; onAddPersona: (icpId: string) => void;
}) {
  const list = personasForIcp(icp.id, personas);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingTop: 16, borderTop: "1px solid var(--color-border)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 11.5, fontWeight: 700, color: "var(--color-muted)" }}>Personas for {icp.name}</span>
        <button type="button" onClick={() => onAddPersona(icp.id)}
          style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700, color: "var(--color-brand)", background: "transparent", border: "none", cursor: "pointer", fontFamily: "inherit", padding: 0 }}>
          <Icon name="plus" size={12} />
          Add Persona
        </button>
      </div>
      {list.length === 0 ? (
        <EmptyState icon="users" title="No personas yet" subtitle="Add a persona to start profiling buyers for this ICP." />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {list.map((persona, i) => (
            <div key={persona.id} style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
              <div style={{ flexShrink: 0 }}>
                <PersonaCard persona={persona} icp={icp} tintIndex={i} variant="plain" width={260}
                  active={selection?.type === "persona" && selection.id === persona.id}
                  reviewed={reviewedKeys.has(treeKey("persona", persona.id))}
                  onSelect={() => onSelect({ type: "persona", id: persona.id })}
                />
              </div>
              <PersonaMiniSummary persona={persona} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── ICP summary — matches summary-view-spec.md Step 3. Primary
   blocks 1–7 are always visible (block 7, Candidate Personas, is the
   existing PersonaGroup); blocks 8–9 are Secondary, behind
   AccordionBlock. Block 10 (targeting filters) and 11 (scoring input)
   are Hidden — Copilot only — and stay out of this summary; they're
   still fully editable in the full ICP detail pane. */
function IcpSummaryCard({ icp, onViewDetails, personas, selection, reviewedKeys, onSelect, onAddPersona }: {
  icp: IcpDetail; onViewDetails: () => void;
  personas: PersonaDetail[]; selection: TreeSelection | null; reviewedKeys: Set<string>;
  onSelect: (sel: TreeSelection) => void; onAddPersona: (icpId: string) => void;
}) {
  return (
    <ReferenceableSection id={`icp:${icp.id}`} label={icp.name}>
    <CardSection icon="target" title={icp.name} right={
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <MatchBadge value={icp.matchPct} />
        <button type="button" className="kc-primary-btn" title="View Details" style={{ ...KC_PRIMARY_BTN, padding: 0, width: 36, height: 36, justifyContent: "center" }} onClick={onViewDetails}>
          <Icon name="edit" size={14} />
        </button>
      </div>
    }>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Block 1 — Header (Primary, Field-Join) */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 11, color: "var(--color-muted)", border: "1px solid var(--color-border)", borderRadius: 999, padding: "3px 10px" }}>
            {icp.industryTag}
          </span>
          <ReferenceableField id={`icp:${icp.id}:field:growthStage`} label="Growth Stage">
            <span style={{ fontSize: 11, color: "var(--color-muted)", border: "1px solid var(--color-border)", borderRadius: 999, padding: "3px 10px" }}>
              {icp.growthStage}
            </span>
          </ReferenceableField>
        </div>

        {/* Block 2 — Who This Is & Why They Fit (Primary, AI-Synthesized) */}
        <div>
          <ReferenceableField id={`icp:${icp.id}:field:summary`} label="Summary">
            <p style={PROSE}>{icp.summary}</p>
          </ReferenceableField>
          <ReferenceableField id={`icp:${icp.id}:field:fitReasoning`} label="Fit Reasoning">
            <div style={{ borderLeft: "3px solid var(--color-brand)", borderRadius: 8, padding: "9px 13px", marginTop: 8 }}>
              <FieldLabel confidence={icp.confidence?.fitReasoning}>Why It Fits</FieldLabel>
              <p style={{ ...PROSE, fontStyle: "italic", margin: 0 }}>{icp.fitReasoning}</p>
            </div>
          </ReferenceableField>
        </div>

        {/* Block 3 — Firmographic Snapshot (Primary, Field-Join) */}
        <div>
          <FieldLabel>Firmographic Snapshot</FieldLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <ReferenceableField id={`icp:${icp.id}:field:targetIndustries`} label="Target Industries">
              <TagRow items={icp.targetIndustries} />
            </ReferenceableField>
            <ReferenceableField id={`icp:${icp.id}:field:companySizes`} label="Company Size">
              <TagRow items={[...icp.companySizes, icp.revenueRange, ...icp.geographies]} />
            </ReferenceableField>
          </div>
        </div>

        {/* Block 4 — Pains & Goals (Primary, Field-Join) */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
          <ReferenceableField id={`icp:${icp.id}:field:painPoints`} label="Pain Points">
            <FieldLabel>Pain Points</FieldLabel>
            <FieldValue value={icp.painPoints} />
          </ReferenceableField>
          <ReferenceableField id={`icp:${icp.id}:field:businessGoals`} label="Business Goals">
            <FieldLabel>Business Goals</FieldLabel>
            <FieldValue value={icp.businessGoals} />
          </ReferenceableField>
        </div>

        {/* Block 5 — Buying Signals (Primary, Field-Join) */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
          <ReferenceableField id={`icp:${icp.id}:field:buyingTriggers`} label="Buying Triggers">
            <FieldLabel>Buying Triggers</FieldLabel>
            <FieldValue value={icp.buyingTriggers} />
          </ReferenceableField>
          <ReferenceableField id={`icp:${icp.id}:field:intentSignals`} label="Intent Signals">
            <FieldLabel>Intent Signals</FieldLabel>
            <FieldValue value={icp.intentSignals} />
          </ReferenceableField>
        </div>

        {/* Block 6 — Real Companies Like This (Primary, Field-Join) */}
        {icp.exampleCompanies.length > 0 && (
          <ReferenceableField id={`icp:${icp.id}:field:exampleCompanies`} label="Representative Accounts">
            <FieldLabel>Representative Accounts</FieldLabel>
            <TagRow items={icp.exampleCompanies} />
          </ReferenceableField>
        )}

        {/* Blocks 8–9 — Secondary (expandable) */}
        <AccordionBlock icon="chart" title="Market Size">
          <ReferenceableField id={`icp:${icp.id}:field:marketSizePct`} label="Market Size">
            <FieldLabel confidence={icp.confidence?.marketSizePct}>Estimated Addressable Share</FieldLabel>
            <p style={{ ...PROSE, margin: 0 }}>{icp.marketSizePct}% of the product&rsquo;s addressable market.</p>
          </ReferenceableField>
        </AccordionBlock>

        <AccordionBlock icon="layers" title="Additional Firmographics">
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <ReferenceableField id={`icp:${icp.id}:field:techStackSignals`} label="Tech Stack Signals">
              <FieldLabel>Tech Stack Signals</FieldLabel>
              <TagRow items={icp.techStackSignals} />
            </ReferenceableField>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
              <ReferenceableField id={`icp:${icp.id}:field:businessModel`} label="Business Model">
                <FieldLabel>Business Model</FieldLabel>
                <FieldValue value={icp.businessModel} />
              </ReferenceableField>
              <ReferenceableField id={`icp:${icp.id}:field:fundingStages`} label="Funding Stage">
                <FieldLabel>Funding Stage</FieldLabel>
                <TagRow items={icp.fundingStages} />
              </ReferenceableField>
            </div>
            <ReferenceableField id={`icp:${icp.id}:field:decisionMakingUnit`} label="Decision-Making Unit">
              <FieldLabel>Decision-Making Unit</FieldLabel>
              <FieldValue value={icp.decisionMakingUnit} />
            </ReferenceableField>
          </div>
        </AccordionBlock>

        {/* Block 7 — Candidate Personas (Primary, Field-Join) */}
        <PersonaGroup icp={icp} personas={personas} selection={selection} reviewedKeys={reviewedKeys}
          onSelect={onSelect} onAddPersona={onAddPersona}
        />
      </div>
    </CardSection>
    </ReferenceableSection>
  );
}

// The concise "dossier" landing view: Company summary, a product switcher,
// and — for the active product — its ICP and persona summaries. Every card
// is read-only; "View Details" hands off to the existing dense panes via the
// same onSelect contract the org-chart (Diagram.tsx) already uses, so
// Explorer's drawer/full-page logic needs no changes.
export function KnowledgeOverview({
  products, icps, personas, selection, onSelect, reviewedKeys,
  onAddProduct, onAddIcp, onAddPersona, companyReviewed, onToggleCompanyReviewed,
  companyProfile, onPatchCompany, onLogCompanyField,
}: {
  products: ProductDetail[]; icps: IcpDetail[]; personas: PersonaDetail[];
  selection: TreeSelection | null; onSelect: (sel: TreeSelection) => void;
  reviewedKeys: Set<string>;
  onAddProduct: () => void; onAddIcp: (productId: string) => void; onAddPersona: (icpId: string) => void;
  companyReviewed: boolean; onToggleCompanyReviewed: () => void;
  companyProfile: CompanyProfile; onPatchCompany: (key: keyof CompanyProfile, value: string | string[]) => void;
  onLogCompanyField: LogField;
}) {
  const [activeProductId, setActiveProductId] = useState<string | null>(products[0]?.id ?? null);

  // Keep the product switcher in sync when a node is selected from elsewhere
  // (e.g. adding a product, or picking a persona from the Performance tab).
  useEffect(() => {
    if (!selection) return;
    let productId: string | undefined;
    if (selection.type === "product") productId = selection.id;
    else if (selection.type === "icp") productId = icps.find((i) => i.id === selection.id)?.productId;
    else if (selection.type === "persona") {
      const persona = personas.find((p) => p.id === selection.id);
      productId = persona ? icps.find((i) => i.id === persona.icpId)?.productId : undefined;
    }
    if (productId) setActiveProductId(productId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selection]);

  const activeProduct = products.find((p) => p.id === activeProductId) ?? products[0] ?? null;
  const productIcps = activeProduct ? icpsForProduct(activeProduct.id, icps) : [];

  return (
    <div style={{ flex: 1, minHeight: 0 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 24, width: "100%", paddingBottom: 40 }}>
        <CompanySection reviewed={companyReviewed} onToggleReviewed={onToggleCompanyReviewed}
          profile={companyProfile} onChange={onPatchCompany} onLogField={onLogCompanyField} />

        <ProductPillRow products={products} activeId={activeProduct?.id ?? null} reviewedKeys={reviewedKeys}
          onSelect={setActiveProductId} onAdd={onAddProduct} />

        {!activeProduct ? (
          <EmptyState icon="briefcase" title="No products yet" subtitle="Add a product to start building out its ICPs and personas." />
        ) : (
          <>
            <ProductSummaryCard product={activeProduct} icpNames={productIcps.map((i) => i.name)}
              onViewDetails={() => onSelect({ type: "product", id: activeProduct.id })}
            />

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <SectionHeaderRow title="Ideal Customer Profiles" actionLabel="Add ICP" onAction={() => onAddIcp(activeProduct.id)} />
              {productIcps.length === 0 ? (
                <EmptyState icon="target" title="No ICPs yet" subtitle="Add an ICP to define who this product is for." />
              ) : (
                productIcps.map((icp) => (
                  <IcpSummaryCard key={icp.id} icp={icp}
                    onViewDetails={() => onSelect({ type: "icp", id: icp.id })}
                    personas={personas} selection={selection} reviewedKeys={reviewedKeys}
                    onSelect={onSelect} onAddPersona={onAddPersona}
                  />
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
