import { useState } from "react";
import { IcpDetail, PersonaDetail, ProductDetail, icpsForProduct, personasForIcp, treeKey } from "./data";
import { EmptyState, Icon, KC_PRIMARY_BTN, MatchBadge } from "./ui";
import { TreeSelection } from "./Tree";
import { AddGhost, PersonaCard } from "./Diagram";

const TIER_LABEL: React.CSSProperties = {
  fontSize: 10.5, fontWeight: 700, color: "var(--color-muted)", textTransform: "uppercase",
  letterSpacing: "0.05em", width: 52, flexShrink: 0,
};

function SegTab({ label, active, reviewed, matchPct, onSelect, compact }: {
  label: string; active: boolean; reviewed: boolean; matchPct: number; onSelect: () => void; compact?: boolean;
}) {
  return (
    <button type="button" onClick={onSelect}
      style={{
        display: "flex", alignItems: "center", gap: 6, fontFamily: "inherit", whiteSpace: "nowrap",
        fontSize: compact ? 12 : 13, fontWeight: 700, cursor: "pointer", border: "none",
        padding: compact ? "6px 12px" : "8px 16px", borderRadius: 8,
        background: active ? "var(--color-page)" : "transparent",
        color: active ? "var(--color-brand)" : "var(--color-muted)",
        boxShadow: active ? "var(--shadow-card)" : "none",
      }}>
      {label}
      {reviewed && <Icon name="check" size={11} color="var(--color-success)" />}
      <MatchBadge value={matchPct} />
    </button>
  );
}

function AddPill({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: 6, fontFamily: "inherit", fontSize: 12, fontWeight: 600,
        padding: "7px 12px", borderRadius: 8, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
        border: "1.5px dashed var(--color-border-strong)", background: "transparent", color: "var(--color-muted)",
      }}>
      <Icon name="plus" size={11} />
      {label}
    </button>
  );
}

export function KnowledgeBrowse({
  products, icps, personas, selection, onSelect, reviewedKeys, onAddProduct, onAddIcp, onAddPersona,
}: {
  products: ProductDetail[]; icps: IcpDetail[]; personas: PersonaDetail[];
  selection: TreeSelection | null; onSelect: (sel: TreeSelection) => void;
  reviewedKeys: Set<string>;
  onAddProduct: () => void; onAddIcp: (productId: string) => void; onAddPersona: (icpId: string) => void;
}) {
  // Seeded once from whatever is selected elsewhere (tree/diagram) so switching
  // into this view lands on the right product/ICP instead of always resetting
  // to the first one; after that the tabs are driven purely by local clicks.
  const [activeProductId, setActiveProductId] = useState<string | null>(() => {
    if (selection?.type === "product") return selection.id;
    if (selection?.type === "icp") return icps.find((i) => i.id === selection.id)?.productId ?? products[0]?.id ?? null;
    if (selection?.type === "persona") {
      const persona = personas.find((p) => p.id === selection.id);
      const icp = persona ? icps.find((i) => i.id === persona.icpId) : undefined;
      return icp?.productId ?? products[0]?.id ?? null;
    }
    return products[0]?.id ?? null;
  });
  const [activeIcpId, setActiveIcpId] = useState<string | null>(() => {
    if (selection?.type === "icp") return selection.id;
    if (selection?.type === "persona") return personas.find((p) => p.id === selection.id)?.icpId ?? null;
    return icpsForProduct(activeProductId ?? "", icps)[0]?.id ?? null;
  });

  const activeProduct = products.find((p) => p.id === activeProductId) ?? null;
  const productIcps = activeProduct ? icpsForProduct(activeProduct.id, icps) : [];
  const activeIcp = productIcps.find((i) => i.id === activeIcpId) ?? null;
  const icpPersonas = activeIcp ? personasForIcp(activeIcp.id, personas) : [];

  function selectProduct(product: ProductDetail) {
    setActiveProductId(product.id);
    setActiveIcpId(icpsForProduct(product.id, icps)[0]?.id ?? null);
    onSelect({ type: "product", id: product.id });
  }
  function selectIcp(icp: IcpDetail) {
    setActiveIcpId(icp.id);
    onSelect({ type: "icp", id: icp.id });
  }

  if (products.length === 0) {
    return (
      <EmptyState icon="layers" title="No products yet" subtitle="Add a product to start mapping ICPs and personas."
        action={<button type="button" className="kc-primary-btn" style={KC_PRIMARY_BTN} onClick={onAddProduct}><Icon name="plus" size={14} />Add Product</button>} />
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 1100 }}>
      <div style={{ background: "var(--color-page)", border: "1px solid var(--color-border)", borderRadius: 14, boxShadow: "var(--shadow-card)", padding: 14, display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={TIER_LABEL}>Product</span>
          <div className="kc-scrollbar" style={{ display: "flex", gap: 2, background: "var(--color-surface)", borderRadius: 10, padding: 4, overflowX: "auto", flex: 1 }}>
            {products.map((product) => (
              <SegTab key={product.id} label={product.name} matchPct={product.matchPct}
                active={activeProductId === product.id} reviewed={reviewedKeys.has(treeKey("product", product.id))}
                onSelect={() => selectProduct(product)} />
            ))}
          </div>
          <AddPill label="Add Product" onClick={onAddProduct} />
        </div>

        {activeProduct && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, borderTop: "1px solid var(--color-border)", paddingTop: 12 }}>
            <span style={TIER_LABEL}>ICP</span>
            <div className="kc-scrollbar" style={{ display: "flex", gap: 2, background: "var(--color-surface)", borderRadius: 10, padding: 4, overflowX: "auto", flex: 1 }}>
              {productIcps.length === 0 ? (
                <span style={{ fontSize: 12, color: "var(--color-subtle)", fontStyle: "italic", padding: "6px 10px" }}>No ICPs yet</span>
              ) : productIcps.map((icp) => (
                <SegTab key={icp.id} label={icp.name} matchPct={icp.matchPct} compact
                  active={activeIcpId === icp.id} reviewed={reviewedKeys.has(treeKey("icp", icp.id))}
                  onSelect={() => selectIcp(icp)} />
              ))}
            </div>
            <AddPill label="Add ICP" onClick={() => onAddIcp(activeProduct.id)} />
          </div>
        )}
      </div>

      {activeIcp && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <span style={{ fontSize: 10.5, fontWeight: 700, color: "var(--color-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Personas · {icpPersonas.length}
          </span>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
            {icpPersonas.map((persona, i) => (
              <PersonaCard key={persona.id} persona={persona} icp={activeIcp} tintIndex={i} variant="plain" width="100%"
                active={selection?.type === "persona" && selection.id === persona.id}
                reviewed={reviewedKeys.has(treeKey("persona", persona.id))}
                onSelect={() => onSelect({ type: "persona", id: persona.id })} />
            ))}
            <AddGhost label="Add Persona" onClick={() => onAddPersona(activeIcp.id)} width="100%" minHeight={192} />
          </div>
        </div>
      )}
    </div>
  );
}
