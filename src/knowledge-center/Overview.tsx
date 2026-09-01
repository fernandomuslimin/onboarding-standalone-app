import { useEffect, useState } from "react";
import { CompanyProfile, HistorySource, IcpDetail, PersonaDetail, ProductDetail, TreeNodeType, icpsForProduct, personasForIcp, treeKey } from "./data";
import { EmptyState, Icon, IconName } from "./ui";
import { TreeSelection } from "./Tree";
import { CompanySection } from "./Company";
import { ProductSummary } from "./ProductDetailPane";
import { IcpSummary } from "./IcpDetailPane";
import { PersonaSummaryView } from "./PersonaDetailPane";
import { ReferenceableSection } from "../copilot/Referenceable";

type LogField = (fieldLabel: string, oldValue: string | string[], newValue: string | string[], source: HistorySource, prompt?: string) => void;

/* ─── Drill-down chrome ───────────────────────────────────────────────
   The overview is a three-level drill-down: Product → ICP → Persona.
   Each level is a chip row over its siblings plus the selected sibling's
   summary card. To keep "which persona belongs to which ICP belongs to
   which product" unambiguous, each level header names the parent it lives
   under ("in Acme Outbound") and the whole path is echoed in a breadcrumb
   at the top. Levels are not indented — the labels carry the hierarchy.
══════════════════════════════════════════════════════════════════════ */

const LEVEL_ICON: Record<TreeNodeType, IconName> = {
  product: "briefcase", icp: "target", persona: "users",
};

interface ChipItem { id: string; name: string; subCount?: number }

function ChipRow({ items, activeId, nodeType, reviewedKeys, onSelect, onAdd, addLabel, subCountLabel }: {
  items: ChipItem[]; activeId: string | null; nodeType: TreeNodeType;
  reviewedKeys: Set<string>; onSelect: (id: string) => void;
  onAdd: () => void; addLabel: string; subCountLabel?: string;
}) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
      {items.map((item, i) => {
        const active = item.id === activeId;
        return (
          <button key={item.id} type="button" onClick={() => onSelect(item.id)}
            title={subCountLabel && item.subCount !== undefined ? `${item.subCount} ${subCountLabel}` : undefined}
            style={{
              display: "flex", alignItems: "center", gap: 7, fontSize: 12.5, fontWeight: 700, fontFamily: "inherit",
              padding: "7px 14px 7px 10px", borderRadius: 999, cursor: "pointer", transition: "all 140ms",
              border: active ? "1px solid var(--color-brand)" : "1px solid var(--color-border)",
              background: active ? "var(--color-brand-tint)" : "var(--color-page)",
              color: active ? "var(--color-brand)" : "var(--color-body)",
            }}>
            {/* Ordinal keeps the chips readable as "item N of this level" the
                same way the onboarding review chips do. */}
            <span style={{
              width: 19, height: 19, borderRadius: "50%", flexShrink: 0, fontSize: 10, fontWeight: 800,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: active ? "var(--color-brand)" : "var(--color-surface)",
              color: active ? "#fff" : "var(--color-muted)",
            }}>{i + 1}</span>
            {item.name}
            {item.subCount !== undefined && item.subCount > 0 && (
              <span style={{ fontSize: 10.5, fontWeight: 700, color: active ? "var(--color-brand)" : "var(--color-subtle)", opacity: 0.8 }}>
                {item.subCount}
              </span>
            )}
            {reviewedKeys.has(treeKey(nodeType, item.id)) && <Icon name="check" size={12} color="var(--color-success)" />}
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
        {addLabel}
      </button>
    </div>
  );
}

/* One drill-down level. Levels sit flush at the same left edge rather than
   indenting — containment is carried by `parentLabel` ("in Acme Outbound")
   on each header plus the breadcrumb above, which stay legible even when
   the parent's card is scrolled out of view. */
function DrillLevel({ nodeType, title, parentLabel, count, children }: {
  nodeType: TreeNodeType; title: string; parentLabel?: string; count: number;
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, minWidth: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <span style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--color-muted)" }}>
          <Icon name={LEVEL_ICON[nodeType]} size={13} />
          <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.07em", textTransform: "uppercase" }}>{title}</span>
        </span>
        <span style={{ fontSize: 11, fontWeight: 700, color: "var(--color-subtle)", background: "var(--color-surface)", borderRadius: 999, padding: "1px 7px" }}>{count}</span>
        {parentLabel && (
          <span style={{ fontSize: 11.5, color: "var(--color-subtle)", minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            in {parentLabel}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

/* "Acme Outbound › Mid-Market RevOps › VP Sales" — the whole current path
   in one line, so the drill-down state is legible without tracing rails. */
function DrillBreadcrumb({ trail }: { trail: { nodeType: TreeNodeType; name: string }[] }) {
  if (trail.length === 0) return null;
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap",
      background: "var(--color-surface)", border: "1px solid var(--color-border)",
      borderRadius: 10, padding: "8px 12px",
    }}>
      {trail.map((step, i) => {
        const last = i === trail.length - 1;
        return (
          <span key={`${step.nodeType}-${i}`} style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
            {i > 0 && <Icon name="chevron-right" size={11} color="var(--color-subtle)" />}
            <Icon name={LEVEL_ICON[step.nodeType]} size={12} color={last ? "var(--color-brand)" : "var(--color-subtle)"} />
            <span style={{
              fontSize: 12, fontWeight: last ? 700 : 600,
              color: last ? "var(--color-brand)" : "var(--color-muted)",
              minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>{step.name}</span>
          </span>
        );
      })}
    </div>
  );
}

// The concise "dossier" landing view: Company summary, then a Product → ICP
// → Persona drill-down where every level switches with chips. Every card is
// read-only; "View Details" hands off to the existing dense panes via the
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
  const [activeIcpId, setActiveIcpId] = useState<string | null>(null);
  const [activePersonaId, setActivePersonaId] = useState<string | null>(null);

  // Keep the drill-down in sync when a node is selected from elsewhere (e.g.
  // adding an ICP, or picking a persona from the Performance/Diagram tabs) —
  // every ancestor of that node has to become active too, or the chips would
  // point at a different branch than the pane the user just opened.
  useEffect(() => {
    if (!selection) return;
    if (selection.type === "product") {
      setActiveProductId(selection.id);
      setActiveIcpId(null);
      setActivePersonaId(null);
      return;
    }
    if (selection.type === "icp") {
      const icp = icps.find((i) => i.id === selection.id);
      if (!icp) return;
      setActiveProductId(icp.productId);
      setActiveIcpId(icp.id);
      setActivePersonaId(null);
      return;
    }
    const persona = personas.find((p) => p.id === selection.id);
    if (!persona) return;
    const icp = icps.find((i) => i.id === persona.icpId);
    if (icp) {
      setActiveProductId(icp.productId);
      setActiveIcpId(icp.id);
    }
    setActivePersonaId(persona.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selection]);

  // Each level falls back to its first child, so a stale id left over from a
  // previous branch (or a deleted node) can never leave a level blank.
  const activeProduct = products.find((p) => p.id === activeProductId) ?? products[0] ?? null;
  const productIcps = activeProduct ? icpsForProduct(activeProduct.id, icps) : [];
  const activeIcp = productIcps.find((i) => i.id === activeIcpId) ?? productIcps[0] ?? null;
  const icpPersonas = activeIcp ? personasForIcp(activeIcp.id, personas) : [];
  const activePersona = icpPersonas.find((p) => p.id === activePersonaId) ?? icpPersonas[0] ?? null;

  // Switching a level clears its descendants so the drill-down always lands
  // on the new branch's first child rather than silently keeping a sibling
  // from the branch the user just left.
  function selectProduct(id: string) {
    setActiveProductId(id);
    setActiveIcpId(null);
    setActivePersonaId(null);
  }
  function selectIcp(id: string) {
    setActiveIcpId(id);
    setActivePersonaId(null);
  }

  const trail = [
    ...(activeProduct ? [{ nodeType: "product" as TreeNodeType, name: activeProduct.name }] : []),
    ...(activeIcp ? [{ nodeType: "icp" as TreeNodeType, name: activeIcp.name }] : []),
    ...(activePersona ? [{ nodeType: "persona" as TreeNodeType, name: activePersona.name }] : []),
  ];

  return (
    <div style={{ flex: 1, minHeight: 0 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 24, width: "100%", paddingBottom: 40 }}>
        <CompanySection reviewed={companyReviewed} onToggleReviewed={onToggleCompanyReviewed}
          profile={companyProfile} onChange={onPatchCompany} onLogField={onLogCompanyField} />

        <DrillBreadcrumb trail={trail} />

        {/* ─── Level 1: Product ─────────────────────────────────── */}
        <DrillLevel nodeType="product" title="Products" count={products.length}>
          <ChipRow
            items={products.map((p) => ({ id: p.id, name: p.name, subCount: icpsForProduct(p.id, icps).length }))}
            activeId={activeProduct?.id ?? null} nodeType="product" reviewedKeys={reviewedKeys}
            onSelect={selectProduct} onAdd={onAddProduct} addLabel="Add Product" subCountLabel="ICPs"
          />

          {!activeProduct ? (
            <EmptyState icon="briefcase" title="No products yet" subtitle="Add a product to start building out its ICPs and personas." />
          ) : (
            <>
              <ProductSummary product={activeProduct}
                onViewDetails={() => onSelect({ type: "product", id: activeProduct.id })}
              />

              {/* ─── Level 2: ICP, scoped to the active product ─── */}
              <DrillLevel nodeType="icp" title="Ideal Customer Profiles" parentLabel={activeProduct.name}
                count={productIcps.length}>
                <ChipRow
                  items={productIcps.map((i) => ({ id: i.id, name: i.name, subCount: personasForIcp(i.id, personas).length }))}
                  activeId={activeIcp?.id ?? null} nodeType="icp" reviewedKeys={reviewedKeys}
                  onSelect={selectIcp} onAdd={() => onAddIcp(activeProduct.id)} addLabel="Add ICP" subCountLabel="personas"
                />

                {!activeIcp ? (
                  <EmptyState icon="target" title="No ICPs yet" subtitle={`Add an ICP to define who ${activeProduct.name} is for.`} />
                ) : (
                  <>
                    <IcpSummary icp={activeIcp} onViewDetails={() => onSelect({ type: "icp", id: activeIcp.id })} />

                    {/* ─── Level 3: Persona, scoped to the active ICP ─── */}
                    <DrillLevel nodeType="persona" title="Personas" parentLabel={activeIcp.name}
                      count={icpPersonas.length}>
                      <ChipRow
                        items={icpPersonas.map((p) => ({ id: p.id, name: p.name }))}
                        activeId={activePersona?.id ?? null} nodeType="persona" reviewedKeys={reviewedKeys}
                        onSelect={setActivePersonaId} onAdd={() => onAddPersona(activeIcp.id)} addLabel="Add Persona"
                      />

                      {!activePersona ? (
                        <EmptyState icon="users" title="No personas yet" subtitle={`Add a persona to start profiling buyers for ${activeIcp.name}.`} />
                      ) : (
                        <ReferenceableSection id={`persona:${activePersona.id}`} label={activePersona.name}>
                          <PersonaSummaryView key={activePersona.id} persona={activePersona}
                            onViewDetails={() => onSelect({ type: "persona", id: activePersona.id })}
                          />
                        </ReferenceableSection>
                      )}
                    </DrillLevel>
                  </>
                )}
              </DrillLevel>
            </>
          )}
        </DrillLevel>
      </div>
    </div>
  );
}
