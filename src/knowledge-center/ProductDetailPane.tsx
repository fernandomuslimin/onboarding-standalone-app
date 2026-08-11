import { useState } from "react";
import { ProductDetail, ProductField } from "./data";
import { ChipList, EditableField, FieldLabel, Icon, IconButton, KC_DANGER_BTN, KC_GHOST_BTN, KC_PRIMARY_BTN } from "./ui";

export function emptyProduct(id: string): ProductDetail {
  return { id, name: "Untitled product", subtitle: "", description: "", matchPct: 0, fields: [] };
}

function ProductCard({ field, editing, onChange }: { field: ProductField; editing: boolean; onChange: (v: string | string[]) => void }) {
  return (
    <div style={{ background: "var(--color-brand-faint)", border: "1px solid var(--color-border)", borderRadius: 12, padding: "14px 16px" }}>
      <FieldLabel>{field.label}</FieldLabel>
      {editing ? (
        Array.isArray(field.value)
          ? <ChipList items={field.value} onChange={(v) => onChange(v)} />
          : <EditableField value={field.value} onChange={(v) => onChange(v)} multiline rows={2} />
      ) : Array.isArray(field.value) ? (
        <ul style={{ margin: 0, padding: "0 0 0 16px", display: "flex", flexDirection: "column", gap: 3 }}>
          {field.value.map((v, i) => <li key={i} style={{ fontSize: 12.5, color: "var(--color-heading)", lineHeight: 1.5 }}>{v}</li>)}
        </ul>
      ) : (
        <p style={{ margin: 0, fontSize: 12.5, color: "var(--color-heading)", lineHeight: 1.6 }}>{field.value}</p>
      )}
    </div>
  );
}

export function ProductDetailPane({ product, reviewed, onToggleReviewed, onPatchField, onDelete }: {
  product: ProductDetail;
  reviewed: boolean;
  onToggleReviewed: () => void;
  onPatchField: (index: number, value: string | string[]) => void;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  return (
    <div style={{ maxWidth: 980 }}>
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
          <ProductCard key={field.label} field={field} editing={editing} onChange={(v) => onPatchField(i, v)} />
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
  );
}
