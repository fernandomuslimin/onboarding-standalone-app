import { useCopilot } from "./CopilotContext";

/* ════════════════════════════════════════════════════════════════════
   Copilot — hover-to-reference wrappers
   Wrap any section/card (ReferenceableSection) or individual field
   (ReferenceableField) to make it hoverable + pinnable, mirroring
   Claude-in-Excel's "cell selected" affordance. Both share one base:
   bubbling onMouseOver + stopPropagation means the deepest wrapper
   under the pointer always wins the shared `hoveredId`, without any
   z-index bookkeeping between section- and field-level wrappers.
══════════════════════════════════════════════════════════════════════ */

const PIN_ICON = (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72Z" />
    <path d="m14 7 3 3" /><path d="M5 6v4" /><path d="M19 14v4" />
  </svg>
);

function ReferenceableBase({ id, label, radius, children }: { id: string; label: string; radius: number; children: React.ReactNode }) {
  const { hoveredId, setHoveredId, pinned, pin, unpin, open } = useCopilot();
  const isPinned = pinned.some((r) => r.id === id);
  const isHovered = hoveredId === id;
  const active = isPinned || isHovered;

  function togglePin(e: React.MouseEvent) {
    e.stopPropagation();
    if (isPinned) unpin(id);
    else { pin({ id, label }); open(); }
  }

  return (
    <div
      className="copilot-ref"
      data-copilot-active={active}
      onMouseOver={(e) => { e.stopPropagation(); setHoveredId(id); }}
      onMouseLeave={() => setHoveredId((current) => (current === id ? null : current))}
      style={{ position: "relative", borderRadius: radius }}
    >
      {children}
      {isHovered && (
        <button
          type="button"
          title={isPinned ? `Remove "${label}" from copilot reference` : `Reference "${label}" in copilot`}
          onClick={togglePin}
          style={{
            position: "absolute", top: 6, right: 6, zIndex: 2, display: "flex", alignItems: "center", justifyContent: "center",
            width: 22, height: 22, borderRadius: "50%", border: "1px solid var(--color-border)",
            background: isPinned ? "var(--color-brand)" : "var(--color-page)", color: isPinned ? "#fff" : "var(--color-brand)",
            cursor: "pointer", boxShadow: "var(--shadow-card)", padding: 0,
          }}
        >
          {PIN_ICON}
        </button>
      )}
    </div>
  );
}

export function ReferenceableSection({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  return <ReferenceableBase id={id} label={label} radius={16}>{children}</ReferenceableBase>;
}

export function ReferenceableField({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  return <ReferenceableBase id={id} label={label} radius={12}>{children}</ReferenceableBase>;
}

/* Mounted once by CopilotWidget. Gates the hover ring with
   data-copilot-active so a pinned reference keeps a persistent border
   even after the mouse leaves — same pattern as Diagram.tsx's
   .kc-chart-box hover-ring precedent. */
export const COPILOT_REF_STYLES = `
.copilot-ref:not([data-copilot-active="true"]):hover { box-shadow: 0 0 0 2px var(--color-brand-tint) !important; }
.copilot-ref[data-copilot-active="true"] { box-shadow: 0 0 0 2px var(--color-brand) !important; }
`;
