import { useEffect, useState } from "react";
import { ICPS, IcpDetail, PERSONAS, PRODUCTS, PersonaDetail, ProductDetail, TreeNodeType, HistoryEntry, HistorySource, personasForIcp, treeKey } from "./data";
import { Drawer, Icon, IconName } from "./ui";
import { TreeSelection } from "./Tree";
import { KnowledgeOverview } from "./Overview";
import { KnowledgeDiagram } from "./Diagram";
import { KnowledgeDashboard } from "./Dashboard";
import { ProductDetailPane, emptyProduct } from "./ProductDetailPane";
import { IcpDetailPane, emptyIcp } from "./IcpDetailPane";
import { PersonaDetailPane, emptyPersona } from "./PersonaDetailPane";

type ExplorerView = "overview" | "diagram" | "performance";

const VIEWS: { key: ExplorerView; label: string; icon: IconName }[] = [
  { key: "overview", label: "Overview", icon: "layers" },
  { key: "diagram", label: "Diagram", icon: "route" },
  { key: "performance", label: "Performance", icon: "chart" },
];

export function Explorer({ reviewedKeys, onToggleReviewed, onNodeTypeChange, companyReviewed, onToggleCompanyReviewed, onLogChange }: {
  reviewedKeys: Set<string>;
  onToggleReviewed: (key: string) => void;
  onNodeTypeChange: (type: TreeNodeType | null) => void;
  companyReviewed: boolean;
  onToggleCompanyReviewed: () => void;
  onLogChange: (entry: Omit<HistoryEntry, "id" | "timestamp">) => void;
}) {
  const [products, setProducts] = useState<ProductDetail[]>(PRODUCTS);
  const [icps, setIcps] = useState<IcpDetail[]>(ICPS);
  const [personas, setPersonas] = useState<PersonaDetail[]>(PERSONAS);
  const [selection, setSelection] = useState<TreeSelection | null>(null);
  const [view, setView] = useState<ExplorerView>("overview");
  // Closing the drawer/full-page view shouldn't un-select the node — the
  // card it belongs to should keep reading as "currently selected" until
  // something else is picked. This tracks "closed without changing
  // selection" separately from `selection` itself.
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    onNodeTypeChange(selection?.type ?? null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selection?.type]);

  useEffect(() => {
    setDismissed(false);
  }, [selection]);

  function addProduct() {
    const id = `product-${Date.now()}`;
    setProducts((current) => [...current, emptyProduct(id)]);
    setSelection({ type: "product", id });
  }
  function addIcp(productId: string) {
    const id = `icp-${Date.now()}`;
    setIcps((current) => [...current, emptyIcp(id, productId)]);
    setSelection({ type: "icp", id });
  }
  function addPersona(icpId: string) {
    const id = `persona-${Date.now()}`;
    setPersonas((current) => [...current, emptyPersona(id, icpId)]);
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

  // Binds the shared onLogChange to whichever entity is currently selected, so
  // the detail panes only need to know about their own fields, not entity context.
  function logField(
    entityType: TreeNodeType, entityId: string, entityLabel: string,
    fieldLabel: string, oldValue: string | string[], newValue: string | string[],
    source: HistorySource, prompt?: string,
  ) {
    onLogChange({ entityType, entityId, entityLabel, fieldLabel, oldValue, newValue, source, prompt });
  }

  const detailPane = selectedProduct ? (
    <ProductDetailPane
      key={selectedProduct.id}
      product={selectedProduct}
      reviewed={reviewedKeys.has(treeKey("product", selectedProduct.id))}
      onToggleReviewed={() => onToggleReviewed(treeKey("product", selectedProduct.id))}
      onPatchField={(i, v) => patchProductField(selectedProduct.id, i, v)}
      onDelete={() => deleteProduct(selectedProduct.id)}
      onLogField={(fieldLabel, oldValue, newValue, source, prompt) =>
        logField("product", selectedProduct.id, selectedProduct.name, fieldLabel, oldValue, newValue, source, prompt)}
    />
  ) : selectedIcp ? (
    <IcpDetailPane
      key={selectedIcp.id}
      icp={selectedIcp}
      personas={personasForIcp(selectedIcp.id, personas)}
      onPatch={(fields) => patchIcp(selectedIcp.id, fields)}
      onDelete={() => deleteIcp(selectedIcp.id)}
      onSelectPersona={(personaId) => setSelection({ type: "persona", id: personaId })}
      onLogField={(fieldLabel, oldValue, newValue, source, prompt) =>
        logField("icp", selectedIcp.id, selectedIcp.name, fieldLabel, oldValue, newValue, source, prompt)}
    />
  ) : selectedPersona ? (
    <PersonaDetailPane
      key={selectedPersona.id}
      persona={selectedPersona}
      onPatchName={(name) => patchPersonaName(selectedPersona.id, name)}
      onPatchField={(si, fi, v) => patchPersonaField(selectedPersona.id, si, fi, v)}
      onDelete={() => deletePersona(selectedPersona.id)}
      onLogField={(fieldLabel, oldValue, newValue, source, prompt) =>
        logField("persona", selectedPersona.id, selectedPersona.name, fieldLabel, oldValue, newValue, source, prompt)}
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
  // toggle are all buttons, so those are left alone; any open drawer is
  // excluded by class since it holds inputs that aren't buttons.
  function handleBackgroundClick(event: React.MouseEvent) {
    const target = event.target as HTMLElement;
    if (target.closest("button") || target.closest(".kc-drawer-panel")) return;
    setSelection(null);
  }

  // A persona's detail is too long to sit comfortably below the chart, so
  // clicking one takes over the page instead of opening in a drawer or
  // sitting under the dashboard. This applies across every view — the back
  // button returns to whichever view the persona was opened from, so the
  // user can pick another persona's detail from there.
  if (selectedPersona && !dismissed) {
    const backLabel = view === "diagram" ? "Diagram" : view === "performance" ? "Performance" : "Overview";
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16, minHeight: "70vh" }}>
        <button type="button" onClick={() => setDismissed(true)}
          style={{
            display: "flex", alignItems: "center", gap: 6, alignSelf: "flex-start", fontFamily: "inherit",
            fontSize: 12.5, fontWeight: 700, color: "var(--color-muted)", background: "transparent",
            border: "none", cursor: "pointer", padding: "4px 2px",
          }}>
          <Icon name="chevron-left" size={13} />
          Back to {backLabel}
        </button>
        {detailPane}
      </div>
    );
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
      </div>
    );
  }

  if (view === "diagram") {
    return (
      <div onClick={handleBackgroundClick} style={{ display: "flex", flexDirection: "column", gap: 20, height: "100%", minHeight: 0 }}>
        {viewToggle}
        <div style={{ flex: 1, minHeight: 0 }}>
          <KnowledgeDiagram
            products={products} icps={icps} personas={personas}
            selection={selection} onSelect={setSelection}
            reviewedKeys={reviewedKeys}
            onAddProduct={addProduct} onAddIcp={addIcp} onAddPersona={addPersona}
            companyReviewed={companyReviewed} onToggleCompanyReviewed={onToggleCompanyReviewed}
          />
        </div>
        <Drawer
          open={(!!selectedProduct || !!selectedIcp) && !dismissed}
          onClose={() => setDismissed(true)}
          title={selectedProduct ? "Product Details" : "ICP Details"}
          width={720}
        >
          {detailPane}
        </Drawer>
      </div>
    );
  }

  return (
    <div onClick={handleBackgroundClick} style={{ display: "flex", flexDirection: "column", gap: 20, height: "100%", minHeight: 0 }}>
      {viewToggle}
      <div style={{ flex: 1, minHeight: 0 }}>
        <KnowledgeOverview
          products={products} icps={icps} personas={personas}
          selection={selection} onSelect={setSelection}
          reviewedKeys={reviewedKeys}
          onAddProduct={addProduct} onAddIcp={addIcp} onAddPersona={addPersona}
          companyReviewed={companyReviewed} onToggleCompanyReviewed={onToggleCompanyReviewed}
        />
      </div>
      <Drawer
        open={(!!selectedProduct || !!selectedIcp) && !dismissed}
        onClose={() => setDismissed(true)}
        title={selectedProduct ? "Product Details" : "ICP Details"}
        width={720}
      >
        {detailPane}
      </Drawer>
    </div>
  );
}
