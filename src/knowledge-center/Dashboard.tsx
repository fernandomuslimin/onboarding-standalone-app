import { IcpDetail, PersonaDetail, ProductDetail, personaPerformance, treeKey } from "./data";
import { EmptyState, Icon, StatTile, formatCurrencyShort } from "./ui";
import { TreeSelection } from "./Tree";
import { PersonaCard } from "./Diagram";

/* ════════════════════════════════════════════════════════════════════
   Performance dashboard — personas ranked by pipeline and bucketed into
   top / mid / low tiers, relative to the leading persona.
══════════════════════════════════════════════════════════════════════ */

type Tier = "top" | "mid" | "low";

/* Share of the leading persona's pipeline required to reach each tier.
   Relative rather than fixed terciles so a persona with no pipeline always
   lands in "low" instead of being pushed up to fill a bucket. */
const TIER_SHARE: Record<Exclude<Tier, "low">, number> = { top: 0.6, mid: 0.25 };

/* Tiers are ordered categories, so they take an ordinal ramp: one hue,
   light→dark. Verified with the dataviz validator (`--ordinal`, light mode):
   monotone lightness, visible step gaps, light end clears the surface.
   Deliberately NOT applied to the bars — tier is derived from pipeline, and
   colouring bars by it would double-encode the length they already show. */
const TIER_META: Record<Tier, { label: string; color: string; note: string }> = {
  top: { label: "Top performers", color: "#2f39c7", note: "60%+ of the leading persona's pipeline" },
  mid: { label: "Mid performers", color: "#6f77ee", note: "25–60% of the leading persona's pipeline" },
  low: { label: "Low performers", color: "#9aa0f5", note: "Under 25% of the leading persona's pipeline" },
};

const TIER_ORDER: Tier[] = ["top", "mid", "low"];

function tierFor(pipelineValue: number, leader: number): Tier {
  if (leader <= 0) return "low";
  const share = pipelineValue / leader;
  if (share >= TIER_SHARE.top) return "top";
  if (share >= TIER_SHARE.mid) return "mid";
  return "low";
}

interface PerformanceRow {
  persona: PersonaDetail;
  icp?: IcpDetail;
  product?: ProductDetail;
  opportunities: number;
  pipelineValue: number;
  campaigns: number;
}

function TierChip({ tier, count }: { tier: Tier; count: number }) {
  const meta = TIER_META[tier];
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
        <span style={{ width: 10, height: 10, borderRadius: 3, background: meta.color, flexShrink: 0 }} />
        <span style={{ fontSize: 14, fontWeight: 700, color: "var(--color-heading)" }}>{meta.label}</span>
      </span>
      <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--color-muted)", fontVariantNumeric: "tabular-nums" }}>
        {count} {count === 1 ? "persona" : "personas"}
      </span>
      <span style={{ fontSize: 11.5, color: "var(--color-subtle)" }}>{meta.note}</span>
    </div>
  );
}

function PerformanceCard({ row, active, reviewed, onSelect }: {
  row: PerformanceRow; active: boolean; reviewed: boolean; onSelect: () => void;
}) {
  const context = [row.icp?.name, row.product?.name].filter(Boolean).join(" · ");

  // The card itself is icp-scoped (it needs one to render bullets/stats), so
  // this only renders once we actually found the persona's icp — true for
  // every persona in practice, since orphans are deleted alongside their icp.
  if (!row.icp) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, width: 240 }}>
      <div style={{ fontSize: 11, color: "var(--color-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {context || "Unassigned"}
      </div>
      <PersonaCard
        persona={row.persona} icp={row.icp} tintIndex={0} variant="plain"
        active={active} reviewed={reviewed} onSelect={onSelect}
      />
    </div>
  );
}

export function KnowledgeDashboard({ products, icps, personas, selection, onSelect, reviewedKeys }: {
  products: ProductDetail[]; icps: IcpDetail[]; personas: PersonaDetail[];
  selection: TreeSelection | null; onSelect: (sel: TreeSelection) => void;
  reviewedKeys: Set<string>;
}) {
  const rows: PerformanceRow[] = personas.map((persona) => {
    const perf = personaPerformance(persona.id);
    const icp = icps.find((i) => i.id === persona.icpId);
    const product = icp ? products.find((p) => p.id === icp.productId) : undefined;
    return {
      persona, icp, product,
      opportunities: perf.opportunities,
      pipelineValue: perf.pipelineValue,
      campaigns: perf.combos.length,
    };
  });

  const ranked = [...rows].sort((a, b) => b.pipelineValue - a.pipelineValue);
  const leader = ranked[0]?.pipelineValue ?? 0;
  const totalPipeline = rows.reduce((sum, r) => sum + r.pipelineValue, 0);
  const totalOpportunities = rows.reduce((sum, r) => sum + r.opportunities, 0);
  const totalCampaigns = rows.reduce((sum, r) => sum + r.campaigns, 0);

  const byTier: Record<Tier, PerformanceRow[]> = { top: [], mid: [], low: [] };
  for (const row of ranked) byTier[tierFor(row.pipelineValue, leader)].push(row);

  if (personas.length === 0) {
    return <EmptyState icon="chart" title="No personas yet" subtitle="Add a persona to start tracking campaign performance." />;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22, maxWidth: 1080 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14 }}>
        <StatTile icon="dollar" label="Total Pipeline" value={formatCurrencyShort(totalPipeline)} />
        <StatTile icon="target" label="Opportunities" value={String(totalOpportunities)} />
        <StatTile icon="route" label="Campaigns" value={String(totalCampaigns)} />
        <StatTile icon="users" label="Personas" value={String(personas.length)} />
      </div>

      {TIER_ORDER.map((tier) => {
        const tierRows = byTier[tier];
        return (
          <div key={tier}>
            <div style={{ marginBottom: 10 }}>
              <TierChip tier={tier} count={tierRows.length} />
            </div>
            {tierRows.length === 0 ? (
              <div style={{ padding: "16px", fontSize: 12.5, color: "var(--color-subtle)", fontStyle: "italic", background: "var(--color-page)", border: "1px solid var(--color-border)", borderRadius: 14 }}>
                No personas in this tier.
              </div>
            ) : (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
                {tierRows.map((row) => (
                  <PerformanceCard
                    key={row.persona.id}
                    row={row}
                    active={selection?.type === "persona" && selection.id === row.persona.id}
                    reviewed={reviewedKeys.has(treeKey("persona", row.persona.id))}
                    onSelect={() => onSelect({ type: "persona", id: row.persona.id })}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}

      <p style={{ margin: 0, fontSize: 11.5, color: "var(--color-subtle)", lineHeight: 1.6 }}>
        <Icon name="chart" size={11} /> Tiers are relative to the leading persona&apos;s pipeline
        ({formatCurrencyShort(leader)}), so they re-balance as campaign results change.
      </p>
    </div>
  );
}
