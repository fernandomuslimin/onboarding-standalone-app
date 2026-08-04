import { useEffect, useRef, useState } from "react";
import { ICPS, IcpDetail, PERSONAS, PRODUCTS, PersonaDetail, ProductDetail, TreeNodeType, personasForIcp, treeKey } from "./data";
import { EmptyState, Icon, IconName } from "./ui";
import { KnowledgeTree, TreeSelection } from "./Tree";
import { KnowledgeDiagram } from "./Diagram";
import { KnowledgeBrowse } from "./Browse";
import { KnowledgeDashboard } from "./Dashboard";
import { ProductDetailPane, emptyProduct } from "./ProductDetailPane";
import { IcpDetailPane, emptyIcp } from "./IcpDetailPane";
import { PersonaDetailPane, emptyPersona } from "./PersonaDetailPane";

type ExplorerView = "diagram" | "tree" | "browse" | "performance";

const VIEWS: { key: ExplorerView; label: string; icon: IconName }[] = [
  { key: "diagram", label: "Diagram", icon: "route" },
  { key: "tree", label: "Tree", icon: "list" },
  { key: "browse", label: "Browse", icon: "grid" },
  { key: "performance", label: "Performance", icon: "chart" },
];

export function Explorer({ reviewedKeys, onToggleReviewed, onNodeTypeChange }: {
  reviewedKeys: Set<string>;
  onToggleReviewed: (key: string) => void;
  onNodeTypeChange: (type: TreeNodeType | null) => void;
}) {
  const [products, setProducts] = useState<ProductDetail[]>(PRODUCTS);
  const [icps, setIcps] = useState<IcpDetail[]>(ICPS);
  const [personas, setPersonas] = useState<PersonaDetail[]>(PERSONAS);
  const [selection, setSelection] = useState<TreeSelection | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [view, setView] = useState<ExplorerView>("diagram");
  const paneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    onNodeTypeChange(selection?.type ?? null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selection?.type]);

  function toggleExpand(key: string) {
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  }

  function addProduct() {
    const id = `product-${Date.now()}`;
    setProducts((current) => [...current, emptyProduct(id)]);
    setSelection({ type: "product", id });
  }
  function addIcp(productId: string) {
    const id = `icp-${Date.now()}`;
    setIcps((current) => [...current, emptyIcp(id, productId)]);
    setExpanded((current) => new Set(current).add(treeKey("product", productId)));
    setSelection({ type: "icp", id });
  }
  function addPersona(icpId: string) {
    const id = `persona-${Date.now()}`;
    setPersonas((current) => [...current, emptyPersona(id, icpId)]);
    const parentProduct = icps.find((i) => i.id === icpId)?.productId;
    setExpanded((current) => {
      const next = new Set(current).add(treeKey("icp", icpId));
      if (parentProduct) next.add(treeKey("product", parentProduct));
      return next;
    });
    setSelection({ type: "persona", id });
  }

  function deleteProduct(id: string) {
    const orphanIcpIds = icps.filter((i) => i.productId === id).map((i) => i.id);
    setProducts((current) => current.filter((p) => p.id !== id));
    setIcps((current) => current.filter((i) => i.productId !== id));
    setPersonas((current) => current.filter((p) => !orphanIcpIds.includes(p.icpId)));
    setSelection(null);
  }
  function deleteIcp(id: string) {
    setIcps((current) => current.filter((i) => i.id !== id));
    setPersonas((current) => current.filter((p) => p.icpId !== id));
    setSelection(null);
  }
  function deletePersona(id: string) {
    setPersonas((current) => current.filter((p) => p.id !== id));
    setSelection(null);
  }

  function patchProductField(id: string, index: number, value: string | string[]) {
    setProducts((current) => current.map((p) => (p.id !== id ? p : { ...p, fields: p.fields.map((f, i) => (i === index ? { ...f, value } : f)) })));
  }
  function patchIcp(id: string, fields: Partial<IcpDetail>) {
    setIcps((current) => current.map((i) => (i.id === id ? { ...i, ...fields } : i)));
  }
  function patchPersonaName(id: string, name: string) {
    setPersonas((current) => current.map((p) => (p.id === id ? { ...p, name } : p)));
  }
  function patchPersonaField(id: string, sectionIdx: number, fieldIdx: number, value: string | string[]) {
    setPersonas((current) => current.map((p) => (p.id !== id ? p : {
      ...p,
      sections: p.sections.map((s, si) => (si !== sectionIdx ? s : { ...s, fields: s.fields.map((f, fi) => (fi !== fieldIdx ? f : { ...f, value })) })),
    })));
  }

  const selectedProduct = selection?.type === "product" ? products.find((p) => p.id === selection.id) : undefined;
  const selectedIcp = selection?.type === "icp" ? icps.find((i) => i.id === selection.id) : undefined;
  const selectedPersona = selection?.type === "persona" ? personas.find((p) => p.id === selection.id) : undefined;

  const detailPane = selectedProduct ? (
    <ProductDetailPane
      key={selectedProduct.id}
      product={selectedProduct}
      reviewed={reviewedKeys.has(treeKey("product", selectedProduct.id))}
      onToggleReviewed={() => onToggleReviewed(treeKey("product", selectedProduct.id))}
      onPatchField={(i, v) => patchProductField(selectedProduct.id, i, v)}
      onDelete={() => deleteProduct(selectedProduct.id)}
    />
  ) : selectedIcp ? (
    <IcpDetailPane
      key={selectedIcp.id}
      icp={selectedIcp}
      personas={personasForIcp(selectedIcp.id, personas)}
      reviewed={reviewedKeys.has(treeKey("icp", selectedIcp.id))}
      onToggleReviewed={() => onToggleReviewed(treeKey("icp", selectedIcp.id))}
      onPatch={(fields) => patchIcp(selectedIcp.id, fields)}
      onDelete={() => deleteIcp(selectedIcp.id)}
      onSelectPersona={(personaId) => setSelection({ type: "persona", id: personaId })}
    />
  ) : selectedPersona ? (
    <PersonaDetailPane
      key={selectedPersona.id}
      persona={selectedPersona}
      reviewed={reviewedKeys.has(treeKey("persona", selectedPersona.id))}
      onToggleReviewed={() => onToggleReviewed(treeKey("persona", selectedPersona.id))}
      onPatchName={(name) => patchPersonaName(selectedPersona.id, name)}
      onPatchField={(si, fi, v) => patchPersonaField(selectedPersona.id, si, fi, v)}
      onDelete={() => deletePersona(selectedPersona.id)}
    />
  ) : null;

  const viewToggle = (
    <div style={{ display: "flex", gap: 4, background: "var(--color-surface)", borderRadius: 10, padding: 4, alignSelf: "flex-start" }}>
      {VIEWS.map(({ key, label, icon }) => (
        <button key={key} type="button" onClick={() => setView(key)}
          style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 700, padding: "7px 14px", borderRadius: 8, border: "none", cursor: "pointer", fontFamily: "inherit", background: view === key ? "var(--color-page)" : "transparent", color: view === key ? "var(--color-brand)" : "var(--color-muted)", boxShadow: view === key ? "var(--shadow-card)" : "none" }}>
          <Icon name={icon} size={13} />
          {label}
        </button>
      ))}
    </div>
  );

  // Clicking empty space clears the selection. Nodes, ghosts and the view
  // toggle are all buttons, so those are left alone; the detail pane is
  // excluded by ref since it holds inputs that aren't buttons.
  function handleBackgroundClick(event: React.MouseEvent) {
    const target = event.target as HTMLElement;
    if (target.closest("button") || paneRef.current?.contains(target)) return;
    setSelection(null);
  }

  if (view === "performance") {
    return (
      <div onClick={handleBackgroundClick} style={{ display: "flex", flexDirection: "column", gap: 20, minHeight: "70vh" }}>
        {viewToggle}
        <KnowledgeDashboard
          products={products} icps={icps} personas={personas}
          selection={selection} onSelect={setSelection}
          reviewedKeys={reviewedKeys}
        />
        {detailPane && <div ref={paneRef} style={{ maxWidth: 980 }}>{detailPane}</div>}
      </div>
    );
  }

  if (view === "diagram") {
    return (
      <div onClick={handleBackgroundClick} style={{ display: "flex", flexDirection: "column", gap: 20, minHeight: "70vh" }}>
        {viewToggle}
        <KnowledgeDiagram
          products={products} icps={icps} personas={personas}
          selection={selection} onSelect={setSelection}
          reviewedKeys={reviewedKeys}
          onAddProduct={addProduct} onAddIcp={addIcp} onAddPersona={addPersona}
        />
        {detailPane && <div ref={paneRef} style={{ maxWidth: 980 }}>{detailPane}</div>}
      </div>
    );
  }

  // Browse's product/ICP tabs are pure navigation — selecting one shouldn't
  // pop that item's full edit form under the card grid. Only a persona click
  // (the thing this view is actually for) opens the detail pane here.
  if (view === "browse") {
    return (
      <div onClick={handleBackgroundClick} style={{ display: "flex", flexDirection: "column", gap: 20, minHeight: "70vh" }}>
        {viewToggle}
        <KnowledgeBrowse
          products={products} icps={icps} personas={personas}
          selection={selection} onSelect={setSelection}
          reviewedKeys={reviewedKeys}
          onAddProduct={addProduct} onAddIcp={addIcp} onAddPersona={addPersona}
        />
        {selectedPersona && detailPane && <div ref={paneRef} style={{ maxWidth: 980 }}>{detailPane}</div>}
      </div>
    );
  }

  return (
    <div onClick={handleBackgroundClick} style={{ display: "flex", flexDirection: "column", gap: 20, minHeight: "70vh" }}>
      {viewToggle}
      <div style={{ display: "flex", gap: 20, alignItems: "flex-start", maxWidth: 1280 }}>
        <KnowledgeTree
          products={products} icps={icps} personas={personas}
          selection={selection} onSelect={setSelection}
          expanded={expanded} onToggleExpand={toggleExpand}
          reviewedKeys={reviewedKeys}
          onAddProduct={addProduct} onAddIcp={addIcp} onAddPersona={addPersona}
        />
        <div ref={paneRef} style={{ flex: 1, minWidth: 0 }}>
          {detailPane ?? <EmptyState icon="layers" title="Select a node" subtitle="Choose a product, ICP, or persona from the tree to view its details." />}
        </div>
      </div>
    </div>
  );
}
