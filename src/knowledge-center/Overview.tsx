import { useEffect, useState } from "react";
import { IcpDetail, PersonaDetail, ProductDetail, icpsForProduct, personasForIcp, treeKey } from "./data";
import { CardSection, EmptyState, FieldLabel, FieldValue, Icon, KC_PRIMARY_BTN, TagRow } from "./ui";
import { TreeSelection } from "./Tree";
import { CompanySection } from "./Company";
import { PersonaCard } from "./Diagram";

const PROSE: React.CSSProperties = { fontSize: 13.5, color: "var(--color-body)", lineHeight: 1.55, margin: 0 };

function fieldValue(fields: { label: string; value: string | string[] }[], label: string): string | string[] | undefined {
  return fields.find((f) => f.label === label)?.value;
}

function personaField(persona: PersonaDetail, heading: string, label: string): string | string[] | undefined {
  return persona.sections.find((s) => s.heading === heading)?.fields.find((f) => f.label === label)?.value;
}

const PERSONA_SUMMARY_FIELDS = [
  { heading: "Overview", label: "Role Summary" },
  { heading: "Goals", label: "Primary Goal" },
  { heading: "Pain Points", label: "Primary Pain" },
];

const PRODUCT_HIGHLIGHT_LABELS = ["Category", "Ideal Customer", "Deal Type", "ACV"];

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

function ProductSummaryCard({ product, onViewDetails }: {
  product: ProductDetail; onViewDetails: () => void;
}) {
  return (
    <CardSection icon="briefcase" title={product.name} right={
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <button type="button" className="kc-primary-btn" title="View Details" style={{ ...KC_PRIMARY_BTN, padding: 0, width: 36, height: 36, justifyContent: "center" }} onClick={onViewDetails}>
          <Icon name="edit" size={14} />
        </button>
      </div>
    }>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <p style={{ ...PROSE, fontStyle: "italic", color: "var(--color-muted)" }}>{product.subtitle}</p>
        <p style={PROSE}>{product.description}</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 14 }}>
          {PRODUCT_HIGHLIGHT_LABELS.map((label) => {
            const value = fieldValue(product.fields, label);
            if (value == null) return null;
            return (
              <div key={label}>
                <FieldLabel>{label}</FieldLabel>
                <FieldValue value={value} />
              </div>
            );
          })}
        </div>
      </div>
    </CardSection>
  );
}

function PersonaSummary({ persona }: { persona: PersonaDetail }) {
  return (
    <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 10 }}>
      <p style={{ ...PROSE, fontStyle: "italic", color: "var(--color-muted)" }}>{persona.subtitle}</p>
      {PERSONA_SUMMARY_FIELDS.map(({ heading, label }) => {
        const value = personaField(persona, heading, label);
        if (value == null) return null;
        return (
          <div key={label}>
            <FieldLabel>{label}</FieldLabel>
            <FieldValue value={value} />
          </div>
        );
      })}
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
              <PersonaSummary persona={persona} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function IcpSummaryCard({ icp, onViewDetails, personas, selection, reviewedKeys, onSelect, onAddPersona }: {
  icp: IcpDetail; onViewDetails: () => void;
  personas: PersonaDetail[]; selection: TreeSelection | null; reviewedKeys: Set<string>;
  onSelect: (sel: TreeSelection) => void; onAddPersona: (icpId: string) => void;
}) {
  return (
    <CardSection icon="target" title={icp.name} right={
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <button type="button" className="kc-primary-btn" title="View Details" style={{ ...KC_PRIMARY_BTN, padding: 0, width: 36, height: 36, justifyContent: "center" }} onClick={onViewDetails}>
          <Icon name="edit" size={14} />
        </button>
      </div>
    }>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <span style={{ fontSize: 11, color: "var(--color-muted)", border: "1px solid var(--color-border)", borderRadius: 999, padding: "3px 10px", width: "fit-content" }}>
          {icp.industryTag}
        </span>
        <p style={PROSE}>{icp.summary}</p>
        <div style={{ borderLeft: "3px solid var(--color-brand)", borderRadius: 8, padding: "9px 13px" }}>
          <FieldLabel>Why It Fits</FieldLabel>
          <p style={{ ...PROSE, fontStyle: "italic", margin: 0 }}>{icp.fitReasoning}</p>
        </div>
        {icp.buyingTriggers.length > 0 && (
          <div>
            <FieldLabel>Buying Triggers</FieldLabel>
            <TagRow items={icp.buyingTriggers.slice(0, 3)} />
          </div>
        )}
        <PersonaGroup icp={icp} personas={personas} selection={selection} reviewedKeys={reviewedKeys}
          onSelect={onSelect} onAddPersona={onAddPersona}
        />
      </div>
    </CardSection>
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
}: {
  products: ProductDetail[]; icps: IcpDetail[]; personas: PersonaDetail[];
  selection: TreeSelection | null; onSelect: (sel: TreeSelection) => void;
  reviewedKeys: Set<string>;
  onAddProduct: () => void; onAddIcp: (productId: string) => void; onAddPersona: (icpId: string) => void;
  companyReviewed: boolean; onToggleCompanyReviewed: () => void;
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
        <CompanySection reviewed={companyReviewed} onToggleReviewed={onToggleCompanyReviewed} />

        <ProductPillRow products={products} activeId={activeProduct?.id ?? null} reviewedKeys={reviewedKeys}
          onSelect={setActiveProductId} onAdd={onAddProduct} />

        {!activeProduct ? (
          <EmptyState icon="briefcase" title="No products yet" subtitle="Add a product to start building out its ICPs and personas." />
        ) : (
          <>
            <ProductSummaryCard product={activeProduct}
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
