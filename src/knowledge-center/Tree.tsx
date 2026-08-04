import { IcpDetail, PersonaDetail, ProductDetail, TreeNodeType, icpsForProduct, personasForIcp, treeKey } from "./data";
import { Icon, IconButton, KC_PRIMARY_BTN, MatchBadge } from "./ui";

export interface TreeSelection { type: TreeNodeType; id: string }

const ROW_BASE: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: 8, width: "100%", minWidth: 0, textAlign: "left",
  border: "none", cursor: "pointer", fontFamily: "inherit", background: "transparent",
  borderRadius: 8, padding: "8px 10px", overflow: "hidden",
};

function Chevron({ expanded }: { expanded: boolean }) {
  return (
    <span style={{ color: "var(--color-muted)", transform: expanded ? "rotate(180deg)" : "none", transition: "transform 150ms var(--ease-apple)", display: "flex", flexShrink: 0 }}>
      <Icon name="chevron-down" size={12} />
    </span>
  );
}

function EmptyBranch({ label, indent }: { label: string; indent: number }) {
  return (
    <div style={{ fontSize: 11.5, color: "var(--color-subtle)", padding: `6px 10px 6px ${indent}px`, fontStyle: "italic" }}>{label}</div>
  );
}

function PersonaRow({ persona, indent, selection, onSelect, reviewedKeys }: {
  persona: PersonaDetail; indent: number;
  selection: TreeSelection | null; onSelect: (sel: TreeSelection) => void;
  reviewedKeys: Set<string>;
}) {
  const active = selection?.type === "persona" && selection.id === persona.id;
  return (
    <button type="button" className="kc-list-row" onClick={() => onSelect({ type: "persona", id: persona.id })}
      style={{ ...ROW_BASE, paddingLeft: indent, background: active ? "var(--color-brand-tint)" : "transparent" }}>
      <span style={{ width: 12, flexShrink: 0 }} />
      <span style={{ flex: 1, minWidth: 0, fontSize: 12.5, fontWeight: active ? 700 : 500, color: active ? "var(--color-brand)" : "var(--color-body)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {persona.name}
      </span>
      {reviewedKeys.has(treeKey("persona", persona.id)) && <Icon name="check" size={11} color="var(--color-success)" />}
      <MatchBadge value={persona.matchPct} />
    </button>
  );
}

function IcpRow({ icp, personas, indent, selection, onSelect, expanded, onToggleExpand, reviewedKeys, onAddPersona }: {
  icp: IcpDetail; personas: PersonaDetail[]; indent: number;
  selection: TreeSelection | null; onSelect: (sel: TreeSelection) => void;
  expanded: Set<string>; onToggleExpand: (key: string) => void;
  reviewedKeys: Set<string>; onAddPersona: (icpId: string) => void;
}) {
  const key = treeKey("icp", icp.id);
  const isExpanded = expanded.has(key);
  const active = selection?.type === "icp" && selection.id === icp.id;
  const children = personasForIcp(icp.id, personas);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
        <button type="button" onClick={() => onToggleExpand(key)} style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 22, height: 22, flexShrink: 0, border: "none", background: "transparent", cursor: "pointer", marginLeft: indent - 20 }}>
          <Chevron expanded={isExpanded} />
        </button>
        <button type="button" className="kc-list-row" onClick={() => onSelect({ type: "icp", id: icp.id })}
          style={{ ...ROW_BASE, paddingLeft: 0, flex: 1, background: active ? "var(--color-brand-tint)" : "transparent" }}>
          <span style={{ flex: 1, minWidth: 0, fontSize: 13, fontWeight: active ? 700 : 600, color: active ? "var(--color-brand)" : "var(--color-heading)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {icp.name}
          </span>
          {reviewedKeys.has(key) && <Icon name="check" size={11} color="var(--color-success)" />}
          <MatchBadge value={icp.matchPct} />
        </button>
        <IconButton icon="plus" title="Add persona" onClick={() => onAddPersona(icp.id)} />
      </div>
      {isExpanded && (
        children.length === 0
          ? <EmptyBranch label="No personas yet" indent={indent + 20} />
          : children.map((persona) => (
            <PersonaRow key={persona.id} persona={persona} indent={indent + 20} selection={selection} onSelect={onSelect} reviewedKeys={reviewedKeys} />
          ))
      )}
    </div>
  );
}

function ProductRow({ product, icps, personas, selection, onSelect, expanded, onToggleExpand, reviewedKeys, onAddIcp, onAddPersona }: {
  product: ProductDetail; icps: IcpDetail[]; personas: PersonaDetail[];
  selection: TreeSelection | null; onSelect: (sel: TreeSelection) => void;
  expanded: Set<string>; onToggleExpand: (key: string) => void;
  reviewedKeys: Set<string>; onAddIcp: (productId: string) => void; onAddPersona: (icpId: string) => void;
}) {
  const key = treeKey("product", product.id);
  const isExpanded = expanded.has(key);
  const active = selection?.type === "product" && selection.id === product.id;
  const children = icpsForProduct(product.id, icps);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
        <button type="button" onClick={() => onToggleExpand(key)} style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 22, height: 22, flexShrink: 0, border: "none", background: "transparent", cursor: "pointer" }}>
          <Chevron expanded={isExpanded} />
        </button>
        <button type="button" className="kc-list-row" onClick={() => onSelect({ type: "product", id: product.id })}
          style={{ ...ROW_BASE, paddingLeft: 0, flex: 1, background: active ? "var(--color-brand-tint)" : "transparent" }}>
          <span style={{ flex: 1, minWidth: 0, fontSize: 13.5, fontWeight: active ? 700 : 700, color: active ? "var(--color-brand)" : "var(--color-heading)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {product.name}
          </span>
          {reviewedKeys.has(key) && <Icon name="check" size={11} color="var(--color-success)" />}
          <MatchBadge value={product.matchPct} />
        </button>
        <IconButton icon="plus" title="Add ICP" onClick={() => onAddIcp(product.id)} />
      </div>
      {isExpanded && (
        children.length === 0
          ? <EmptyBranch label="No ICPs yet" indent={40} />
          : children.map((icp) => (
            <IcpRow key={icp.id} icp={icp} personas={personas} indent={40} selection={selection} onSelect={onSelect}
              expanded={expanded} onToggleExpand={onToggleExpand} reviewedKeys={reviewedKeys} onAddPersona={onAddPersona} />
          ))
      )}
    </div>
  );
}

export function KnowledgeTree({
  products, icps, personas, selection, onSelect, expanded, onToggleExpand, reviewedKeys, onAddProduct, onAddIcp, onAddPersona,
}: {
  products: ProductDetail[]; icps: IcpDetail[]; personas: PersonaDetail[];
  selection: TreeSelection | null; onSelect: (sel: TreeSelection) => void;
  expanded: Set<string>; onToggleExpand: (key: string) => void;
  reviewedKeys: Set<string>;
  onAddProduct: () => void; onAddIcp: (productId: string) => void; onAddPersona: (icpId: string) => void;
}) {
  return (
    <div style={{ width: 300, flexShrink: 0, background: "var(--color-page)", border: "1px solid var(--color-border)", borderRadius: 14, boxShadow: "var(--shadow-card)", overflow: "hidden" }}>
      <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--color-border)" }}>
        <button type="button" className="kc-primary-btn" style={{ ...KC_PRIMARY_BTN, width: "100%", justifyContent: "center" }} onClick={onAddProduct}>
          <Icon name="plus" size={14} />
          Add Product
        </button>
      </div>
      <div className="kc-scrollbar" style={{ maxHeight: 620, overflowY: "auto", padding: "8px 8px" }}>
        {products.length === 0 ? (
          <EmptyBranch label="No products yet" indent={10} />
        ) : (
          products.map((product) => (
            <ProductRow key={product.id} product={product} icps={icps} personas={personas} selection={selection} onSelect={onSelect}
              expanded={expanded} onToggleExpand={onToggleExpand} reviewedKeys={reviewedKeys} onAddIcp={onAddIcp} onAddPersona={onAddPersona} />
          ))
        )}
      </div>
    </div>
  );
}
