import { HistoryEntry, TreeNodeType } from "./data";
import { Drawer, EmptyState } from "./ui";

const ENTITY_LABEL: Record<TreeNodeType, string> = { product: "Product", icp: "ICP", persona: "Persona" };

function displayValue(value: string | string[]): string {
  return Array.isArray(value) ? (value.length ? value.join(", ") : "—") : value || "—";
}

function HistoryRow({ entry }: { entry: HistoryEntry }) {
  return (
    <div style={{ padding: "14px 0", borderBottom: "1px solid var(--color-border)" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 6 }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, color: "var(--color-muted)", letterSpacing: "0.04em", textTransform: "uppercase" }}>
            {ENTITY_LABEL[entry.entityType]} · {entry.entityLabel}
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--color-heading)", marginTop: 2 }}>{entry.fieldLabel}</div>
        </div>
        <span style={{
          flexShrink: 0, fontSize: 10.5, fontWeight: 700, borderRadius: 999, padding: "2px 9px",
          color: entry.source === "ai" ? "var(--color-brand)" : "var(--color-muted)",
          background: entry.source === "ai" ? "var(--color-brand-tint)" : "var(--color-surface)",
        }}>
          {entry.source === "ai" ? "AI" : "Manual"}
        </span>
      </div>

      <div style={{ fontSize: 12.5, lineHeight: 1.5, marginBottom: entry.prompt ? 6 : 0 }}>
        <span style={{ color: "var(--color-subtle)", textDecoration: "line-through" }}>{displayValue(entry.oldValue)}</span>
        <span style={{ color: "var(--color-muted)", margin: "0 6px" }}>→</span>
        <span style={{ color: "var(--color-heading)" }}>{displayValue(entry.newValue)}</span>
      </div>

      {entry.prompt && (
        <div style={{ fontSize: 11.5, color: "var(--color-muted)", fontStyle: "italic", marginBottom: 6 }}>
          &ldquo;{entry.prompt}&rdquo;
        </div>
      )}

      <div style={{ fontSize: 11, color: "var(--color-subtle)" }}>{new Date(entry.timestamp).toLocaleString()}</div>
    </div>
  );
}

export function HistoryDrawer({ history, open, onClose }: { history: HistoryEntry[]; open: boolean; onClose: () => void }) {
  return (
    <Drawer open={open} onClose={onClose} title="Change History" width={520}>
      {history.length === 0 ? (
        <EmptyState icon="clock" title="No changes yet" subtitle="Edits to products, ICPs, and personas will appear here as they happen." />
      ) : (
        <div>
          {history.map((entry) => <HistoryRow key={entry.id} entry={entry} />)}
        </div>
      )}
    </Drawer>
  );
}
