import { useEffect, useState } from "react";
import { COMPANY_PROFILE, CompanyProfile, HistoryEntityType, ICPS, IcpDetail, PERSONAS, PRODUCTS, PersonaDetail, ProductDetail, TreeNodeType, HistoryEntry, HistorySource, personasForIcp, treeKey } from "./data";
import { Drawer, Icon, IconName, reviseText } from "./ui";
import { TreeSelection } from "./Tree";
import { KnowledgeOverview } from "./Overview";
import { KnowledgeDiagram } from "./Diagram";
import { KnowledgeDashboard } from "./Dashboard";
import { ProductDetailPane, emptyProduct } from "./ProductDetailPane";
import { IcpDetailPane, emptyIcp } from "./IcpDetailPane";
import { PersonaDetailPane, emptyPersona } from "./PersonaDetailPane";
import { useRegisterCopilotAdapter } from "../copilot/CopilotContext";
import { ResolvedReference } from "../copilot/types";

// Named text fields exposed to the copilot for an ICP — mirrors exactly
// the HistoryTextField/EditableField calls in IcpDetailPane.tsx. ICPs
// don't have a generic fields[] array like products/personas do, so
// this list is what makes individual ICP fields addressable at all.
const ICP_TEXT_FIELDS: { key: "name" | "summary" | "fitReasoning" | "revenueRange" | "growthStage" | "businessModel" | "decisionMakingUnit" | "departmentSize" | "outreachAccessibility"; label: string }[] = [
  { key: "name", label: "Name" },
  { key: "summary", label: "Summary" },
  { key: "fitReasoning", label: "Fit Reasoning" },
  { key: "revenueRange", label: "Revenue Range" },
  { key: "growthStage", label: "Growth Stage" },
  { key: "businessModel", label: "Business Model" },
  { key: "decisionMakingUnit", label: "Decision-Making Unit" },
  { key: "departmentSize", label: "Department Size" },
  { key: "outreachAccessibility", label: "Outreach Accessibility" },
];

// Array fields the ICP summary card also shows — readable/pinnable via the
// copilot like the text fields above, but not text-revisable (same "ask a
// question instead" convention used for Company's and Product's chip/list
// fields, since reviseText only knows how to rewrite a single string).
const ICP_LIST_FIELDS: { key: "targetIndustries" | "companySizes" | "geographies" | "painPoints" | "businessGoals" | "buyingTriggers" | "intentSignals" | "exampleCompanies" | "techStackSignals" | "fundingStages"; label: string }[] = [
  { key: "targetIndustries", label: "Target Industries" },
  { key: "companySizes", label: "Company Size" },
  { key: "geographies", label: "Geographies" },
  { key: "painPoints", label: "Pain Points" },
  { key: "businessGoals", label: "Business Goals" },
  { key: "buyingTriggers", label: "Buying Triggers" },
  { key: "intentSignals", label: "Intent Signals" },
  { key: "exampleCompanies", label: "Representative Accounts" },
  { key: "techStackSignals", label: "Tech Stack Signals" },
  { key: "fundingStages", label: "Funding Stage" },
];

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
  // Lifted up from CompanySection so it survives Explorer's view
  // switches (overview/diagram/performance) — CompanySection used to
  // hold this locally and lose it on every view change since it gets
  // unmounted along the way.
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile>(COMPANY_PROFILE);
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
  function patchCompany(key: keyof CompanyProfile, value: string | string[]) {
    setCompanyProfile((current) => ({ ...current, [key]: value } as CompanyProfile));
  }

  // Binds the shared onLogChange to whichever entity is currently selected, so
  // the detail panes only need to know about their own fields, not entity context.
  function logField(
    entityType: HistoryEntityType, entityId: string, entityLabel: string,
    fieldLabel: string, oldValue: string | string[], newValue: string | string[],
    source: HistorySource, prompt?: string,
  ) {
    onLogChange({ entityType, entityId, entityLabel, fieldLabel, oldValue, newValue, source, prompt });
  }

  /* ─── Copilot adapters ────────────────────────────────────────────
     One slice per referenceable entity type, registered every render
     so their closures always see current products/icps/personas.
     Card-level ids (no ":field:") resolve/edit every string field at
     once; field-level ids target exactly one. Array/list fields are
     Q&A-only — there's no existing reviser for them to reuse. */
  useRegisterCopilotAdapter("product", {
    resolve(id): ResolvedReference | null {
      const [, productId, , fieldLabel] = id.split(":");
      const product = products.find((p) => p.id === productId);
      if (!product) return null;
      if (fieldLabel) {
        const field = product.fields.find((f) => f.label === fieldLabel);
        if (!field) return null;
        return { id, label: `${product.name} — ${field.label}`, value: field.value };
      }
      return { id, label: product.name, value: product.fields.map((f) => ({ label: f.label, value: f.value })) };
    },
    applyEdit(id, instruction) {
      const [, productId, , fieldLabel] = id.split(":");
      const product = products.find((p) => p.id === productId);
      if (!product) return Promise.resolve(null);
      return new Promise((resolve) => {
        setTimeout(() => {
          if (fieldLabel) {
            const idx = product.fields.findIndex((f) => f.label === fieldLabel);
            if (idx === -1) return resolve(null);
            const field = product.fields[idx];
            if (Array.isArray(field.value)) {
              return resolve({ changedSummary: "this is a list field — ask a question about it instead, list fields aren't editable via the copilot yet." });
            }
            const revised = reviseText(field.value, instruction);
            if (revised === field.value) return resolve({ changedSummary: "no visible change." });
            patchProductField(productId, idx, revised);
            logField("product", productId, product.name, field.label, field.value, revised, "ai", instruction);
            return resolve({ changedSummary: `updated "${field.label}".` });
          }
          let changed = 0;
          product.fields.forEach((f, i) => {
            if (Array.isArray(f.value)) return;
            const revised = reviseText(f.value, instruction);
            if (revised !== f.value) {
              patchProductField(productId, i, revised);
              logField("product", productId, product.name, f.label, f.value, revised, "ai", instruction);
              changed++;
            }
          });
          resolve({ changedSummary: changed > 0 ? `updated ${changed} field(s).` : "no text fields changed." });
        }, fieldLabel ? 800 : 1200);
      });
    },
  });

  useRegisterCopilotAdapter("icp", {
    resolve(id): ResolvedReference | null {
      const [, icpId, , fieldKey] = id.split(":");
      const icp = icps.find((i) => i.id === icpId);
      if (!icp) return null;
      if (fieldKey) {
        const textSpec = ICP_TEXT_FIELDS.find((f) => f.key === fieldKey);
        if (textSpec) return { id, label: `${icp.name} — ${textSpec.label}`, value: icp[textSpec.key] as string };
        const listSpec = ICP_LIST_FIELDS.find((f) => f.key === fieldKey);
        if (listSpec) return { id, label: `${icp.name} — ${listSpec.label}`, value: icp[listSpec.key] as string[] };
        if (fieldKey === "marketSizePct") return { id, label: `${icp.name} — Market Size`, value: `${icp.marketSizePct}% of the product's addressable market.` };
        return null;
      }
      return {
        id, label: icp.name,
        value: [
          ...ICP_TEXT_FIELDS.map((f) => ({ label: f.label, value: icp[f.key] as string })),
          ...ICP_LIST_FIELDS.map((f) => ({ label: f.label, value: icp[f.key] as string[] })),
        ],
      };
    },
    applyEdit(id, instruction) {
      const [, icpId, , fieldKey] = id.split(":");
      const icp = icps.find((i) => i.id === icpId);
      if (!icp) return Promise.resolve(null);
      return new Promise((resolve) => {
        setTimeout(() => {
          if (fieldKey) {
            const textSpec = ICP_TEXT_FIELDS.find((f) => f.key === fieldKey);
            if (textSpec) {
              const oldValue = icp[textSpec.key] as string;
              const revised = reviseText(oldValue, instruction);
              if (revised === oldValue) return resolve({ changedSummary: "no visible change." });
              patchIcp(icpId, { [textSpec.key]: revised } as Partial<IcpDetail>);
              logField("icp", icpId, icp.name, textSpec.label, oldValue, revised, "ai", instruction);
              return resolve({ changedSummary: `updated "${textSpec.label}".` });
            }
            if (ICP_LIST_FIELDS.some((f) => f.key === fieldKey) || fieldKey === "marketSizePct") {
              return resolve({ changedSummary: "this is a list field — ask a question about it instead, list fields aren't editable via the copilot yet." });
            }
            return resolve(null);
          }
          let changed = 0;
          const patch: Partial<IcpDetail> = {};
          ICP_TEXT_FIELDS.forEach((f) => {
            const oldValue = icp[f.key] as string;
            const revised = reviseText(oldValue, instruction);
            if (revised !== oldValue) {
              (patch as Record<string, string>)[f.key] = revised;
              logField("icp", icpId, icp.name, f.label, oldValue, revised, "ai", instruction);
              changed++;
            }
          });
          if (changed > 0) patchIcp(icpId, patch);
          resolve({ changedSummary: changed > 0 ? `updated ${changed} field(s).` : "no text fields changed." });
        }, fieldKey ? 800 : 1200);
      });
    },
  });

  useRegisterCopilotAdapter("persona", {
    resolve(id): ResolvedReference | null {
      const [, personaId, , heading, , fieldLabel] = id.split(":");
      const persona = personas.find((p) => p.id === personaId);
      if (!persona) return null;
      if (heading && fieldLabel) {
        const section = persona.sections.find((s) => s.heading === heading);
        const field = section?.fields.find((f) => f.label === fieldLabel);
        if (!field) return null;
        return { id, label: `${persona.name} — ${heading}: ${field.label}`, value: field.value };
      }
      return { id, label: persona.name, value: persona.sections.flatMap((s) => s.fields.map((f) => ({ label: `${s.heading}: ${f.label}`, value: f.value }))) };
    },
    applyEdit(id, instruction) {
      const [, personaId, , heading, , fieldLabel] = id.split(":");
      const persona = personas.find((p) => p.id === personaId);
      if (!persona) return Promise.resolve(null);
      return new Promise((resolve) => {
        setTimeout(() => {
          if (heading && fieldLabel) {
            const si = persona.sections.findIndex((s) => s.heading === heading);
            const fi = si === -1 ? -1 : persona.sections[si].fields.findIndex((f) => f.label === fieldLabel);
            if (si === -1 || fi === -1) return resolve(null);
            const field = persona.sections[si].fields[fi];
            if (Array.isArray(field.value)) {
              return resolve({ changedSummary: "this is a list field — ask a question about it instead, list fields aren't editable via the copilot yet." });
            }
            const revised = reviseText(field.value, instruction);
            if (revised === field.value) return resolve({ changedSummary: "no visible change." });
            patchPersonaField(personaId, si, fi, revised);
            logField("persona", personaId, persona.name, `${heading}: ${field.label}`, field.value, revised, "ai", instruction);
            return resolve({ changedSummary: `updated "${field.label}".` });
          }
          let changed = 0;
          persona.sections.forEach((s, si) => {
            s.fields.forEach((f, fi) => {
              if (Array.isArray(f.value)) return;
              const revised = reviseText(f.value, instruction);
              if (revised !== f.value) {
                patchPersonaField(personaId, si, fi, revised);
                logField("persona", personaId, persona.name, `${s.heading}: ${f.label}`, f.value, revised, "ai", instruction);
                changed++;
              }
            });
          });
          resolve({ changedSummary: changed > 0 ? `updated ${changed} field(s).` : "no text fields changed." });
        }, heading && fieldLabel ? 800 : 1200);
      });
    },
  });

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
            companyProfile={companyProfile} onPatchCompany={patchCompany}
            onLogCompanyField={(fieldLabel, oldValue, newValue, source, prompt) =>
              logField("company", "company", companyProfile.companyName, fieldLabel, oldValue, newValue, source, prompt)}
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
          companyProfile={companyProfile} onPatchCompany={patchCompany}
          onLogCompanyField={(fieldLabel, oldValue, newValue, source, prompt) =>
            logField("company", "company", companyProfile.companyName, fieldLabel, oldValue, newValue, source, prompt)}
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
