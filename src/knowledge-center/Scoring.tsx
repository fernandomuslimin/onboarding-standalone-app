import { useMemo, useState } from "react";
import { ICPS, PERSONAS, PRODUCTS, SCORE_CHAINS, SCORE_DIMENSIONS, ScoreChain, overallScore } from "./data";
import { EmptyState, Icon, KC_GHOST_BTN, KC_PRIMARY_BTN } from "./ui";

type Tab = "Product" | "ICP" | "Persona";
const TABS: Tab[] = ["Product", "ICP", "Persona"];

const MONO = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";

function nameFor(kind: "product" | "icp" | "persona", id: string): string {
  if (kind === "product") return PRODUCTS.find((p) => p.id === id)?.name ?? id;
  if (kind === "icp") return ICPS.find((i) => i.id === id)?.name ?? id;
  return PERSONAS.find((p) => p.id === id)?.name ?? id;
}

function scoreTone(value: number): string {
  if (value >= 8) return "var(--color-success)";
  if (value >= 5) return "var(--color-warning)";
  return "var(--color-error)";
}

const GRID_COLS = `28px 2.2fr repeat(${SCORE_DIMENSIONS.length}, 0.7fr) 0.7fr`;
const HEADER_CELL: React.CSSProperties = { fontSize: 10, fontWeight: 700, color: "var(--color-muted)", letterSpacing: "0.04em", textTransform: "uppercase", fontFamily: MONO, whiteSpace: "nowrap" };

function ChainMatrix({ chains, labelFor }: { chains: ScoreChain[]; labelFor: (c: ScoreChain) => string }) {
  const ranked = [...chains].sort((a, b) => overallScore(b.scores) - overallScore(a.scores));
  return (
    <div style={{ overflowX: "auto" }}>
      <div style={{ minWidth: 720, borderRadius: 14, border: "1px solid var(--color-border)", overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: GRID_COLS, gap: 10, padding: "10px 16px", background: "var(--color-surface)", borderBottom: "1px solid var(--color-border)" }}>
          <span style={HEADER_CELL}>#</span>
          <span style={HEADER_CELL}>Combination</span>
          {SCORE_DIMENSIONS.map((d) => <span key={d} style={HEADER_CELL} title={d}>{d}</span>)}
          <span style={HEADER_CELL}>Score</span>
        </div>
        {ranked.map((chain, i) => (
          <div key={`${chain.productId}-${chain.icpId}-${chain.personaId}`} style={{ display: "grid", gridTemplateColumns: GRID_COLS, gap: 10, alignItems: "center", padding: "14px 16px", borderBottom: i < ranked.length - 1 ? "1px solid var(--color-border)" : "none" }}>
            <span style={{ fontSize: i === 0 ? 15 : 12.5, fontWeight: 700, color: i === 0 ? "var(--color-warning)" : "var(--color-muted)" }}>{i === 0 ? "★" : i + 1}</span>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--color-heading)", lineHeight: 1.4 }}>{labelFor(chain)}</span>
            {SCORE_DIMENSIONS.map((d) => (
              <span key={d} style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700, color: scoreTone(chain.scores[d]) }}>{chain.scores[d]}</span>
            ))}
            <span style={{ fontFamily: MONO, fontSize: 16, fontWeight: 800, color: scoreTone(overallScore(chain.scores)) }}>{overallScore(chain.scores).toFixed(1)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const LEGEND = [
  { label: "Company", color: "var(--color-brand)" },
  { label: "Product", color: "var(--color-success)" },
  { label: "ICP", color: "var(--color-warning)" },
  { label: "Persona", color: "#d6489a" },
];

function ScoreGraph() {
  const productIds = Array.from(new Set(SCORE_CHAINS.map((c) => c.productId)));
  const nodes: { x: number; y: number; label: string; color: string }[] = [];
  const edges: { from: [number, number]; to: [number, number] }[] = [];

  const companyPos: [number, number] = [4, 50];
  nodes.push({ x: companyPos[0], y: companyPos[1], label: "Company", color: "var(--color-brand)" });

  const productYs = productIds.map((_, i) => (productIds.length === 1 ? 50 : 10 + (i * 80) / (productIds.length - 1)));
  productIds.forEach((pid, pi) => {
    const productPos: [number, number] = [30, productYs[pi]];
    nodes.push({ x: productPos[0], y: productPos[1], label: nameFor("product", pid), color: "var(--color-success)" });
    edges.push({ from: companyPos, to: productPos });

    const icpIds = Array.from(new Set(SCORE_CHAINS.filter((c) => c.productId === pid).map((c) => c.icpId)));
    const icpYs = icpIds.map((_, i) => (icpIds.length === 1 ? productPos[1] : productPos[1] - 14 + (i * 28) / Math.max(1, icpIds.length - 1)));
    icpIds.forEach((iid, ii) => {
      const icpPos: [number, number] = [62, Math.max(4, Math.min(96, icpYs[ii]))];
      nodes.push({ x: icpPos[0], y: icpPos[1], label: nameFor("icp", iid), color: "var(--color-warning)" });
      edges.push({ from: productPos, to: icpPos });

      const personaIds = Array.from(new Set(SCORE_CHAINS.filter((c) => c.productId === pid && c.icpId === iid).map((c) => c.personaId)));
      personaIds.forEach((persId, pj) => {
        const personaPos: [number, number] = [92, Math.max(4, Math.min(96, icpPos[1] + (pj - (personaIds.length - 1) / 2) * 8))];
        nodes.push({ x: personaPos[0], y: personaPos[1], label: nameFor("persona", persId), color: "#d6489a" });
        edges.push({ from: icpPos, to: personaPos });
      });
    });
  });

  return (
    <div>
      <div style={{ display: "flex", gap: 18, marginBottom: 14 }}>
        {LEGEND.map((l) => (
          <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 10, height: 10, borderRadius: "50%", background: l.color }} />
            <span style={{ fontSize: 12, color: "var(--color-body)" }}>{l.label}</span>
          </div>
        ))}
      </div>
      <div style={{ position: "relative", width: "100%", height: 340, borderRadius: 14, border: "1px solid var(--color-border)", background: "var(--color-page)" }}>
        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: "absolute", inset: 0 }}>
          {edges.map((e, i) => (
            <path key={i} d={`M ${e.from[0]} ${e.from[1]} C ${(e.from[0] + e.to[0]) / 2} ${e.from[1]}, ${(e.from[0] + e.to[0]) / 2} ${e.to[1]}, ${e.to[0]} ${e.to[1]}`}
              stroke="var(--color-border-strong)" strokeWidth="0.5" fill="none" vectorEffect="non-scaling-stroke" />
          ))}
        </svg>
        {nodes.map((n, i) => (
          <div key={i} style={{ position: "absolute", left: `${n.x}%`, top: `${n.y}%`, transform: "translate(-8%, -50%)", display: "flex", alignItems: "center", gap: 6, maxWidth: "22%" }}>
            <span style={{ width: 9, height: 9, borderRadius: "50%", background: n.color, flexShrink: 0 }} />
            <span style={{ fontSize: 11, color: "var(--color-heading)", lineHeight: 1.25 }}>{n.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ScoringSection() {
  const [tab, setTab] = useState<Tab>("Product");
  const [view, setView] = useState<"Graph" | "Matrix">("Matrix");
  const [rescored, setRescored] = useState<Set<string>>(new Set());

  const productChains = useMemo(() => new Map(PRODUCTS.map((p) => [p.id, SCORE_CHAINS.filter((c) => c.productId === p.id)])), []);

  return (
    <div style={{ maxWidth: 1080 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18, gap: 12 }}>
        <div style={{ display: "flex", gap: 4, background: "var(--color-surface)", borderRadius: 10, padding: 4 }}>
          {TABS.map((t) => (
            <button key={t} type="button" onClick={() => setTab(t)}
              style={{ fontSize: 13, fontWeight: 700, padding: "7px 16px", borderRadius: 8, border: "none", cursor: "pointer", fontFamily: "inherit", background: tab === t ? "var(--color-page)" : "transparent", color: tab === t ? "var(--color-brand)" : "var(--color-muted)", boxShadow: tab === t ? "var(--shadow-card)" : "none" }}>
              {t}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 4, background: "var(--color-surface)", borderRadius: 10, padding: 4 }}>
          {(["Graph", "Matrix"] as const).map((v) => (
            <button key={v} type="button" onClick={() => setView(v)}
              style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 700, padding: "7px 14px", borderRadius: 8, border: "none", cursor: "pointer", fontFamily: "inherit", background: view === v ? "var(--color-page)" : "transparent", color: view === v ? "var(--color-brand)" : "var(--color-muted)", boxShadow: view === v ? "var(--shadow-card)" : "none" }}>
              <Icon name={v === "Graph" ? "graph" : "grid"} size={13} />
              {v}
            </button>
          ))}
        </div>
      </div>

      {view === "Graph" ? (
        <ScoreGraph />
      ) : tab === "Product" ? (
        <ChainMatrix chains={SCORE_CHAINS} labelFor={(c) => `${nameFor("product", c.productId)} → ${nameFor("icp", c.icpId)} → ${nameFor("persona", c.personaId)}`} />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          {PRODUCTS.map((product) => {
            const chains = productChains.get(product.id) ?? [];
            const key = `${tab}-${product.id}`;
            return (
              <div key={product.id}>
                <h3 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 10px" }}>{product.name}</h3>
                {chains.length === 0 ? (
                  <EmptyState icon="chart" title="Not scored yet" subtitle={`No ${tab.toLowerCase()} combinations have been scored for this product yet.`}
                    action={
                      <button type="button" style={rescored.has(key) ? KC_GHOST_BTN : KC_PRIMARY_BTN} onClick={() => setRescored((s) => new Set(s).add(key))}>
                        <Icon name="clock" size={14} />
                        {rescored.has(key) ? "Re-Score requested" : "Re-Score"}
                      </button>
                    } />
                ) : tab === "ICP" ? (
                  <ChainMatrix chains={chains} labelFor={(c) => nameFor("icp", c.icpId)} />
                ) : (
                  <ChainMatrix chains={chains} labelFor={(c) => nameFor("persona", c.personaId)} />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
