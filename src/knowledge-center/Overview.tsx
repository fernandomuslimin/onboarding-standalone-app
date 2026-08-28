import { useEffect, useState } from "react";
import { CompanyProfile, HistorySource, IcpDetail, PersonaDetail, ProductDetail, icpsForProduct, personasForIcp, treeKey } from "./data";
import { EmptyState, Icon } from "./ui";
import { TreeSelection } from "./Tree";
import { CompanySection } from "./Company";
import { ProductSummary } from "./ProductDetailPane";
import { IcpSummary } from "./IcpDetailPane";
import { PersonaCard } from "./Diagram";

type LogField = (fieldLabel: string, oldValue: string | string[], newValue: string | string[], source: HistorySource, prompt?: string) => void;

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
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
          {list.map((persona, i) => (
            <PersonaCard key={persona.id} persona={persona} icp={icp} tintIndex={i} variant="plain" width={260}
              active={selection?.type === "persona" && selection.id === persona.id}
              reviewed={reviewedKeys.has(treeKey("persona", persona.id))}
              onSelect={() => onSelect({ type: "persona", id: persona.id })}
            />
          ))}
        </div>
      )}
    </div>
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
            <ProductSummary product={activeProduct}
              onViewDetails={() => onSelect({ type: "product", id: activeProduct.id })}
            />

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <SectionHeaderRow title="Ideal Customer Profiles" actionLabel="Add ICP" onAction={() => onAddIcp(activeProduct.id)} />
              {productIcps.length === 0 ? (
                <EmptyState icon="target" title="No ICPs yet" subtitle="Add an ICP to define who this product is for." />
              ) : (
                productIcps.map((icp) => (
                  <div key={icp.id} style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                    <IcpSummary icp={icp} onViewDetails={() => onSelect({ type: "icp", id: icp.id })} />
                    <PersonaGroup icp={icp} personas={personas} selection={selection} reviewedKeys={reviewedKeys}
                      onSelect={onSelect} onAddPersona={onAddPersona}
                    />
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
