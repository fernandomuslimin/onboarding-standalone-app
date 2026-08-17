import { useMemo, useState } from "react";
import { NAV_GROUPS, NAV_LABEL, REVIEWABLE_SECTIONS, NavKey, PRODUCTS, ICPS, PERSONAS, TreeNodeType, HistoryEntry, SEED_HISTORY } from "./data";
import { Icon, IconName, KC_STYLES } from "./ui";
import { Explorer } from "./Explorer";
import { CampaignSection } from "./Campaign";
import { ResourcesSection } from "./Resources";
import { HistoryDrawer } from "./HistoryDrawer";

const NAV_ICON: Record<NavKey, IconName> = {
  company: "building", explorer: "layers",
  campaign: "route", resources: "folder",
};

function totalForSection(key: NavKey): number {
  if (key === "company") return 1;
  return 0;
}

function totalForNodeType(type: TreeNodeType): number {
  return type === "product" ? PRODUCTS.length : type === "icp" ? ICPS.length : PERSONAS.length;
}

export function KnowledgeCenter({ onExit }: { onExit: () => void }) {
  const [section, setSection] = useState<NavKey>("explorer");
  const [reviewed, setReviewed] = useState<Record<NavKey, Set<string>>>({
    company: new Set(), explorer: new Set(),
    campaign: new Set(), resources: new Set(),
  });
  const [explorerNodeType, setExplorerNodeType] = useState<TreeNodeType | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>(SEED_HISTORY);
  const [historyOpen, setHistoryOpen] = useState(false);

  function logChange(entry: Omit<HistoryEntry, "id" | "timestamp">) {
    setHistory((current) => [{ ...entry, id: `hist-${current.length}-${entry.entityId}-${entry.fieldLabel}`, timestamp: Date.now() }, ...current]);
  }

  function toggleReviewed(key: NavKey, id: string) {
    setReviewed((current) => {
      const next = new Set(current[key]);
      if (next.has(id)) next.delete(id); else next.add(id);
      return { ...current, [key]: next };
    });
  }

  const reviewedCount = useMemo(() => {
    if (section !== "explorer") return reviewed[section]?.size ?? 0;
    if (!explorerNodeType) return 0;
    return [...reviewed.explorer].filter((k) => k.startsWith(`${explorerNodeType}:`)).length;
  }, [section, reviewed, explorerNodeType]);

  const total = useMemo(() => {
    if (section !== "explorer") return totalForSection(section);
    return explorerNodeType ? totalForNodeType(explorerNodeType) : 0;
  }, [section, explorerNodeType]);

  const showReviewedBadge = REVIEWABLE_SECTIONS.includes(section) && (section !== "explorer" || explorerNodeType !== null);

  return (
    <div style={{ display: "flex", height: "100vh", width: "100%", background: "var(--color-surface)", fontFamily: "var(--font-sans)", overflow: "hidden" }}>
      <style>{KC_STYLES}</style>

      {/* ─── Sidebar ─────────────────────────────────────────── */}
      <aside className="kc-sidebar" style={{ width: 240, flexShrink: 0, background: "var(--color-page)", borderRight: "1px solid var(--color-border)", display: "flex", flexDirection: "column", position: "sticky", top: 0, height: "100vh" }}>
        <div style={{ padding: "20px 20px 16px", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 30, height: 30, background: "var(--color-brand)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
              <path d="M8 2C10.5 2 13 4 13.5 7C14 10 12.5 12.5 10 13.5C7.5 14.5 5 13.5 3.5 11.5C2 9.5 2.5 6.5 4 4.5C5 3 6.5 2 8 2Z" fill="white" fillOpacity="0.2" />
              <path d="M6.5 10.5L4.5 12.5M9.5 5.5C9.5 5.5 11.5 5 12 7.5C12.5 10 11 11 11 11L8.5 8.5M9.5 5.5L7 8M9.5 5.5L8 4" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="7" cy="9" r="1.2" fill="white" />
            </svg>
          </div>
          <span style={{ fontSize: 14.5, fontWeight: 700, color: "var(--color-heading)", letterSpacing: "-0.01em" }}>Knowledge Center</span>
        </div>

        <nav className="kc-scrollbar" style={{ flex: 1, overflowY: "auto", padding: "4px 12px 12px" }}>
          {NAV_GROUPS.map((group) => (
            <div key={group.label} style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 10.5, fontWeight: 700, color: "var(--color-subtle)", letterSpacing: "0.08em", textTransform: "uppercase", padding: "0 10px 6px" }}>
                {group.label}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {group.items.map((item) => {
                  const active = item.key === section;
                  return (
                    <button key={item.key} type="button" onClick={() => setSection(item.key)} className="kc-nav-item"
                      style={{
                        display: "flex", alignItems: "center", gap: 10, textAlign: "left", fontFamily: "inherit",
                        fontSize: 13.5, fontWeight: active ? 700 : 500, padding: "8px 10px", borderRadius: 9,
                        border: "none", cursor: "pointer",
                        color: active ? "var(--color-brand)" : "var(--color-body)",
                        background: active ? "var(--color-brand-tint)" : "transparent",
                      }}>
                      <Icon name={NAV_ICON[item.key]} size={15} />
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div style={{ padding: 12, borderTop: "1px solid var(--color-border)" }}>
          <button type="button" onClick={onExit}
            style={{ display: "flex", alignItems: "center", gap: 9, width: "100%", fontFamily: "inherit", fontSize: 13, fontWeight: 600, color: "var(--color-muted)", background: "transparent", border: "none", borderRadius: 9, padding: "8px 10px", cursor: "pointer" }}>
            <Icon name="chevron-left" size={14} />
            Back to onboarding
          </button>
        </div>
      </aside>

      {/* ─── Content ─────────────────────────────────────────── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, minHeight: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 32px", borderBottom: "1px solid var(--color-border)", background: "var(--color-page)", flexShrink: 0 }}>
          <h1 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>{NAV_LABEL[section]}</h1>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {showReviewedBadge && (
              <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--color-muted)", fontVariantNumeric: "tabular-nums" }}>
                {reviewedCount}/{total} reviewed
              </span>
            )}
            <button type="button" onClick={() => setHistoryOpen(true)}
              style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: "inherit", fontSize: 12.5, fontWeight: 600, color: "var(--color-body)", background: "var(--color-page)", border: "1px solid var(--color-border-strong)", borderRadius: 9, padding: "7px 12px", cursor: "pointer" }}>
              <Icon name="clock" size={13} />
              History{history.length > 0 ? ` (${history.length})` : ""}
            </button>
          </div>
        </div>

        <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "28px 32px 48px", minWidth: 0, background: "var(--color-page)" }}>
          {section === "explorer" && (
            <Explorer
              reviewedKeys={reviewed.explorer}
              onToggleReviewed={(key) => toggleReviewed("explorer", key)}
              onNodeTypeChange={setExplorerNodeType}
              companyReviewed={reviewed.company.has("company")}
              onToggleCompanyReviewed={() => toggleReviewed("company", "company")}
              onLogChange={logChange}
            />
          )}
          {section === "campaign" && <CampaignSection />}
          {section === "resources" && <ResourcesSection />}
        </div>
      </div>

      <HistoryDrawer history={history} open={historyOpen} onClose={() => setHistoryOpen(false)} />
    </div>
  );
}
