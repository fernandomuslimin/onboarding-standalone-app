import { useMemo, useState } from "react";
import { RESOURCE_RUNS } from "./data";
import { Icon, KC_GHOST_BTN, Pagination } from "./ui";

const PAGE_SIZE = 5;

export function ResourcesSection() {
  const [selectedId, setSelectedId] = useState(RESOURCE_RUNS[0].id);
  const [page, setPage] = useState(1);
  const selected = RESOURCE_RUNS.find((r) => r.id === selectedId) ?? RESOURCE_RUNS[0];

  const pageCount = Math.max(1, Math.ceil(selected.pages.length / PAGE_SIZE));
  const visiblePages = useMemo(() => selected.pages.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [selected, page]);

  function selectRun(id: string) {
    setSelectedId(id);
    setPage(1);
  }

  return (
    <div style={{ display: "flex", gap: 20, alignItems: "flex-start", maxWidth: 1180 }}>
      {/* ─── Runs ─────────────────────────────────────────── */}
      <div style={{ width: 320, flexShrink: 0, background: "var(--color-page)", border: "1px solid var(--color-border)", borderRadius: 14, boxShadow: "var(--shadow-card)", overflow: "hidden" }}>
        <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--color-border)" }}>
          <span style={{ fontSize: 12.5, fontWeight: 700, color: "var(--color-heading)" }}>Crawl Runs</span>
        </div>
        <div className="kc-scrollbar" style={{ maxHeight: 620, overflowY: "auto" }}>
          {RESOURCE_RUNS.map((run) => {
            const active = run.id === selected.id;
            return (
              <button key={run.id} type="button" onClick={() => selectRun(run.id)} className="kc-list-row"
                style={{ display: "block", width: "100%", textAlign: "left", padding: "14px 16px", border: "none", borderBottom: "1px solid var(--color-border)", cursor: "pointer", fontFamily: "inherit", background: active ? "var(--color-brand-tint)" : "transparent" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: active ? "var(--color-brand)" : "var(--color-heading)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{run.url}</span>
                  <span style={{
                    flexShrink: 0, fontSize: 10, fontWeight: 700, borderRadius: 999, padding: "2px 8px",
                    color: run.completed ? "var(--color-success)" : "var(--color-warning)",
                    background: run.completed ? "rgba(7,188,12,0.1)" : "rgba(241,196,15,0.15)",
                    border: `1px solid ${run.completed ? "rgba(7,188,12,0.3)" : "rgba(241,196,15,0.35)"}`,
                  }}>
                    {run.completed ? "Completed" : "Crawling"}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 11.5, color: "var(--color-muted)" }}>
                  <span>{run.pageCount} pages</span>
                  <span>{run.timestamp}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── Pages ────────────────────────────────────────── */}
      <div style={{ flex: 1, minWidth: 0, background: "var(--color-page)", border: "1px solid var(--color-border)", borderRadius: 14, boxShadow: "var(--shadow-card)", overflow: "hidden" }}>
        <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--color-border)" }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--color-heading)" }}>{selected.url}</span>
          <span style={{ fontSize: 12, color: "var(--color-muted)", marginLeft: 10 }}>{selected.pages.length} pages crawled</span>
        </div>
        <div>
          {visiblePages.map((page_, i) => (
            <div key={page_.url} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "14px 20px", borderBottom: i < visiblePages.length - 1 ? "1px solid var(--color-border)" : "none" }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-heading)", marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{page_.title}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11.5, color: "var(--color-muted)" }}>
                  {page_.url}
                  <Icon name="external" size={11} />
                </div>
              </div>
              <button type="button" style={{ ...KC_GHOST_BTN, flexShrink: 0, padding: "7px 14px" }}>
                Preview
              </button>
            </div>
          ))}
        </div>
        <div style={{ padding: "4px 20px 16px" }}>
          <Pagination page={page} pageCount={pageCount} onChange={setPage} />
        </div>
      </div>
    </div>
  );
}
