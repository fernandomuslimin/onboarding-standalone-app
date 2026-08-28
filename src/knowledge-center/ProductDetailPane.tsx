import { useState } from "react";
import { HistorySource, ProductDetail, ProductField } from "./data";
import { Bullets, CardSection, ChipList, EditableField, FieldLabel, HistoryTextField, Icon, IconButton, KC_DANGER_BTN, KC_GHOST_BTN, KC_PRIMARY_BTN } from "./ui";
import { ReferenceableField, ReferenceableSection } from "../copilot/Referenceable";

export function emptyProduct(id: string): ProductDetail {
  return { id, name: "Untitled product", subtitle: "", description: "", matchPct: 0, fields: [] };
}

type LogField = (fieldLabel: string, oldValue: string | string[], newValue: string | string[], source: HistorySource, prompt?: string) => void;

const PROSE: React.CSSProperties = { fontSize: 13.5, color: "var(--color-body)", lineHeight: 1.55, margin: 0 };

function fieldByLabel(product: ProductDetail, label: string): ProductField | undefined {
  return product.fields.find((f) => f.label === label);
}
function fieldText(product: ProductDetail, label: string): string {
  const f = fieldByLabel(product, label);
  if (!f) return "";
  return Array.isArray(f.value) ? f.value.join(", ") : f.value;
}
function fieldList(product: ProductDetail, label: string): string[] {
  const f = fieldByLabel(product, label);
  if (!f) return [];
  return Array.isArray(f.value) ? f.value : f.value ? [f.value] : [];
}
const fieldId = (product: ProductDetail, label: string) => `product:${product.id}:field:${label}`;

// AI-Synthesized "What It Does & Solves" block (see
// docs/field_reference/summary-view-spec.md Step 2, block 3) — mirrors
// onboarding-shell.tsx's StepProductReview mock: the description plus
// the value proposition read as one short paragraph, stitched
// deterministically rather than re-synthesized (matches the mock style
// used across this app, e.g. Company.tsx's whoYouAreParagraph).
function productOverviewParagraph(product: ProductDetail): string {
  return [product.description, fieldText(product, "Value Proposition")].filter(Boolean).join(" ");
}

/* ─── Summary — matches docs/field_reference/summary-view-spec.md, Step 2
   (Product), and the same structure StepProductReview's
   ProductServicesPanel renders in the onboarding review flow: header +
   badge + time-to-value, elevator pitch, five Primary blocks in a wide
   left column, two Secondary blocks always expanded in a narrower right
   rail (no collapse/show-more — same convention as Company's summary).
   Messaging Guidance / Extended Commercials / Additional Proof (Hidden —
   Copilot only per the spec) aren't rendered here; still fully visible
   and editable in "View Details" below, and addressable via Copilot. */
export function ProductSummary({ product, onViewDetails }: { product: ProductDetail; onViewDetails: () => void }) {
  const timeToValue = fieldText(product, "Time To Value");
  const elevatorPitch = fieldText(product, "Elevator Pitch") || product.description;

  return (
    <ReferenceableSection id={`product:${product.id}`} label={product.name} style={{ width: "100%" }}>
    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Block 1 — Header (Primary, Field-Join) + Block 2 — Elevator Pitch (Primary, Verbatim Passthrough) */}
      <div style={{ background: "var(--color-page)", border: "1px solid var(--color-border)", borderRadius: 14, padding: "16px 26px", boxShadow: "var(--shadow-card)" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 20, flexWrap: "wrap" }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
              <h2 style={{ fontSize: 21, fontWeight: 800, margin: 0 }}>{product.name}</h2>
            </div>
            {timeToValue && (
              <ReferenceableField id={fieldId(product, "Time To Value")} label="Time To Value">
                <div style={{ fontSize: 12, color: "var(--color-muted)", margin: "5px 0 0" }}>{timeToValue}</div>
              </ReferenceableField>
            )}
          </div>
          <button type="button" className="kc-primary-btn" title="View Details" style={{ ...KC_PRIMARY_BTN, padding: 0, width: 36, height: 36, justifyContent: "center", flexShrink: 0 }} onClick={onViewDetails}>
            <Icon name="edit" size={14} />
          </button>
        </div>
        {elevatorPitch && (
          <ReferenceableField id={fieldId(product, "Elevator Pitch")} label="Elevator Pitch">
            <p style={{ fontSize: 13.5, fontStyle: "italic", color: "var(--color-heading)", margin: "12px 0 0" }}>&ldquo;{elevatorPitch}&rdquo;</p>
          </ReferenceableField>
        )}
      </div>

      {/* Primary blocks (left, wide) + Secondary blocks (right rail, always
          expanded) — collapses to a single column below 1024px, see
          .kc-company-grid in ui.tsx's KC_STYLES. */}
      <div className="kc-company-grid" style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.6fr) minmax(300px, 1fr)", gap: 20, alignItems: "start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 0 }}>
          {/* Block 3 — What It Does & Solves (Primary, AI-Synthesized) */}
          <CardSection icon="message" title="Product Overview">
            <ReferenceableField id={fieldId(product, "Value Proposition")} label="Value Proposition">
              <p style={PROSE}>{productOverviewParagraph(product)}</p>
            </ReferenceableField>
          </CardSection>

          {/* Block 4 — Key Capabilities (Primary, Field-Join) */}
          <CardSection icon="grid" title="Key Capabilities">
            <ReferenceableField id={fieldId(product, "Key Features")} label="Key Features">
              <Bullets items={fieldList(product, "Key Features")} />
            </ReferenceableField>
          </CardSection>

          {/* Block 5 — Who It's For (Primary, Field-Join) */}
          <CardSection icon="target" title="Target Customer">
            <ReferenceableField id={fieldId(product, "Ideal Customer")} label="Ideal Customer">
              <p style={PROSE}>{fieldText(product, "Ideal Customer")}</p>
            </ReferenceableField>
          </CardSection>

          {/* Block 6 — Proof It Works (Primary, Field-Join) */}
          <CardSection icon="handshake" title="Proof Points">
            <ReferenceableField id={fieldId(product, "Proof Points")} label="Proof Points">
              <Bullets items={fieldList(product, "Proof Points")} />
            </ReferenceableField>
          </CardSection>

          {/* Block 8 — Deal Basics (Primary, Field-Join) */}
          <CardSection icon="dollar" title="Commercial Terms">
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <ReferenceableField id={fieldId(product, "Deal Type")} label="Deal Type">
                <FieldLabel>Deal Type</FieldLabel>
                <p style={{ ...PROSE, margin: 0 }}>{fieldText(product, "Deal Type")}</p>
              </ReferenceableField>
              <ReferenceableField id={fieldId(product, "ACV")} label="ACV">
                <FieldLabel>ACV</FieldLabel>
                <p style={{ ...PROSE, margin: 0 }}>{fieldText(product, "ACV")}</p>
              </ReferenceableField>
              <ReferenceableField id={fieldId(product, "Contract Length")} label="Contract Length">
                <FieldLabel>Contract Length</FieldLabel>
                <p style={{ ...PROSE, margin: 0 }}>{fieldText(product, "Contract Length")}</p>
              </ReferenceableField>
            </div>
          </CardSection>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 0 }}>
          {/* Block 7 — Competitive Snapshot (Secondary, always expanded) */}
          <CardSection icon="graph" title="Competitive Snapshot">
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <ReferenceableField id={fieldId(product, "Competitors")} label="Competitors">
                <FieldLabel>Competitors</FieldLabel>
                <Bullets items={fieldList(product, "Competitors")} />
              </ReferenceableField>
              <ReferenceableField id={fieldId(product, "Market Maturity")} label="Market Maturity">
                <FieldLabel>Market Maturity</FieldLabel>
                <p style={{ ...PROSE, margin: 0 }}>{fieldText(product, "Market Maturity")}</p>
              </ReferenceableField>
            </div>
          </CardSection>

          {/* Block 9 — Objections & Switch Triggers (Secondary, always expanded) */}
          <CardSection icon="shield" title="Objections & Switch Triggers">
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <ReferenceableField id={fieldId(product, "Buyer Objections")} label="Buyer Objections">
                <FieldLabel>Buyer Objections</FieldLabel>
                <Bullets items={fieldList(product, "Buyer Objections")} />
              </ReferenceableField>
              <ReferenceableField id={fieldId(product, "Switch Triggers")} label="Switch Triggers">
                <FieldLabel>Switch Triggers</FieldLabel>
                <Bullets items={fieldList(product, "Switch Triggers")} />
              </ReferenceableField>
            </div>
          </CardSection>
        </div>
      </div>
    </div>
    </ReferenceableSection>
  );
}

function ProductCard({ field, editing, onChange, onLogField }: {
  field: ProductField; editing: boolean; onChange: (v: string | string[]) => void; onLogField: LogField;
}) {
  return (
    <div style={{ background: "var(--color-brand-faint)", border: "1px solid var(--color-border)", borderRadius: 12, padding: "14px 16px" }}>
      {editing ? (
        Array.isArray(field.value)
          ? <>
              <FieldLabel confidence={field.confidence}>{field.label}</FieldLabel>
              <ChipList items={field.value} onChange={(v) => { onLogField(field.label, field.value, v, "manual"); onChange(v); }} />
            </>
          : <HistoryTextField
              label={field.label} value={field.value} onChange={onChange} confidence={field.confidence} multiline rows={2}
              onLogChange={(c) => onLogField(field.label, c.oldValue, c.newValue, c.source, c.prompt)}
            />
      ) : (
        <>
          <FieldLabel confidence={field.confidence}>{field.label}</FieldLabel>
          {Array.isArray(field.value) ? (
            <ul style={{ margin: 0, padding: "0 0 0 16px", display: "flex", flexDirection: "column", gap: 3 }}>
              {field.value.map((v, i) => <li key={i} style={{ fontSize: 12.5, color: "var(--color-heading)", lineHeight: 1.5 }}>{v}</li>)}
            </ul>
          ) : (
            <p style={{ margin: 0, fontSize: 12.5, color: "var(--color-heading)", lineHeight: 1.6 }}>{field.value}</p>
          )}
        </>
      )}
    </div>
  );
}

export function ProductDetailPane({ product, reviewed, onToggleReviewed, onPatchField, onDelete, onLogField }: {
  product: ProductDetail;
  reviewed: boolean;
  onToggleReviewed: () => void;
  onPatchField: (index: number, value: string | string[]) => void;
  onDelete: () => void;
  onLogField: LogField;
}) {
  const [view, setView] = useState<"summary" | "detail">("summary");
  const [editing, setEditing] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  if (view === "summary") {
    return <ProductSummary product={product} onViewDetails={() => setView("detail")} />;
  }

  return (
    <ReferenceableSection id={`product:${product.id}`} label={product.name}>
    <div style={{ maxWidth: 980 }}>
      <button type="button" onClick={() => setView("summary")}
        style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 600, color: "var(--color-muted)", background: "transparent", border: "none", cursor: "pointer", padding: 0, marginBottom: 18, fontFamily: "inherit" }}>
        <Icon name="chevron-left" size={13} />
        Back to summary
      </button>

      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 18 }}>
        <div style={{ minWidth: 0 }}>
          <h2 style={{ fontSize: 19, fontWeight: 800, margin: "0 0 3px" }}>{product.name}</h2>
          <p style={{ fontSize: 13, color: "var(--color-muted)", margin: 0 }}>{product.subtitle}</p>
        </div>
        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
          <IconButton icon="check" title={reviewed ? "Reviewed" : "Mark reviewed"} tone={reviewed ? "brand" : "muted"} onClick={onToggleReviewed} />
          <button type="button" style={KC_GHOST_BTN} onClick={() => setEditing((e) => !e)}>
            <Icon name={editing ? "check" : "edit"} size={14} />
            {editing ? "Done Editing" : "Edit"}
          </button>
          <button type="button" style={KC_DANGER_BTN} onClick={onDelete}>
            <Icon name="trash" size={14} />
            Delete
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }}>
        {product.fields.map((field, i) => (
          <ReferenceableField key={field.label} id={`product:${product.id}:field:${field.label}`} label={field.label}>
            <ProductCard field={field} editing={editing} onChange={(v) => onPatchField(i, v)} onLogField={onLogField} />
          </ReferenceableField>
        ))}
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: 18 }}>
        <button type="button" className="kc-primary-btn" style={KC_PRIMARY_BTN} onClick={() => setSavedAt(new Date().toLocaleTimeString())}>
          <Icon name="check" size={14} />
          Save
        </button>
      </div>
      {savedAt && <div style={{ fontSize: 11.5, color: "var(--color-success)", textAlign: "right" }}>Saved at {savedAt}</div>}
    </div>
    </ReferenceableSection>
  );
}
