import { useEffect, useRef } from "react";
import { COMPANY_PROFILE, IcpDetail, PersonaDetail, ProductDetail, icpsForProduct, personaPerformance, personasForIcp, treeKey } from "./data";
import { Icon, formatCurrencyShort } from "./ui";
import { TreeSelection } from "./Tree";

const BRANCH_COLORS = ["#5761fe", "#16a34a", "#db2777", "#d97706"];

export const CHART_STYLES = `
.kc-chart-tree, .kc-chart-tree ul { margin: 0; padding: 0; list-style: none; }
.kc-chart-tree { position: relative; display: inline-flex; justify-content: center; padding-top: 32px; }
.kc-chart-tree ul { display: flex; padding-top: 32px; position: relative; }
.kc-chart-tree::before {
  content: ""; position: absolute; top: 0; left: 50%; width: 0; height: 32px;
  border-left: 1.5px solid var(--color-border-strong);
}
.kc-chart-tree li {
  display: flex; flex-direction: column; align-items: center;
  text-align: center; position: relative; padding: 32px 14px 0 14px;
}
.kc-chart-tree li::before, .kc-chart-tree li::after {
  content: ""; position: absolute; top: 0; right: 50%; width: 50%; height: 32px;
  border-top: 1.5px solid var(--branch-color, var(--color-border-strong));
}
.kc-chart-tree li::after { right: auto; left: 50%; border-left: 1.5px solid var(--branch-color, var(--color-border-strong)); }
.kc-chart-tree li:first-child::before { border-top: 0 none; }
.kc-chart-tree li:first-child::after { border-radius: 8px 0 0 0; }
/* The last child's drop is its ::before border-right (the rounded elbow), so
   ::after must be cleared entirely — leaving its inherited border-left would
   draw a second line right beside the first. */
.kc-chart-tree li:last-child::before { border-right: 1.5px solid var(--branch-color, var(--color-border-strong)); border-radius: 0 8px 0 0; }
.kc-chart-tree li:last-child::after { border: 0 none; }
/* A lone child has no horizontal run — just a straight drop. It keeps its peers'
   padding so every branch's boxes still land on the same row; zeroing that
   padding instead would lift the box out of the row and strand the line above it.
   Must come last: it re-adds the drop the :last-child rule above clears. */
.kc-chart-tree li:only-child::before { display: none; }
.kc-chart-tree li:only-child::after {
  border: 0 none; border-left: 1.5px solid var(--branch-color, var(--color-border-strong)); border-radius: 0;
}
/* Drops from each parent box into its children's horizontal run. Must match
   EVERY nested ul (product→icp and icp→persona), not just doubly-nested ones. */
.kc-chart-tree ul::before {
  content: ""; position: absolute; top: 0; left: 50%; width: 0; height: 32px;
  border-left: 1.5px solid var(--branch-color, var(--color-border-strong));
}
.kc-chart-box { transition: box-shadow 150ms var(--ease-apple); }
/* Boxes carry an inline box-shadow, which would otherwise win over this rule. */
.kc-chart-box:hover { box-shadow: 0 0 0 2px var(--color-brand-tint), var(--shadow-card) !important; }
`;

/* Every box at a level is locked to one height so each generation lands on a
   single row — otherwise a long name in one branch pushes that branch's
   children below its siblings' and the hierarchy reads as ragged. */
const ROW_HEIGHT = { product: 82, icp: 104, persona: 192 };

function boxShadowFor(active: boolean): string {
  return active ? "0 0 0 2px var(--color-brand), var(--shadow-card)" : "var(--shadow-card)";
}

function Avatar({ name }: { name: string }) {
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("");
  return (
    <div style={{ width: 34, height: 34, borderRadius: "50%", background: "var(--color-brand)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12.5, fontWeight: 700, flexShrink: 0 }}>
      {initials || "?"}
    </div>
  );
}

function AddGhost({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="kc-chart-box"
      style={{
        width: 168, minHeight: 56, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
        border: "1.5px dashed var(--color-border-strong)", borderRadius: 10, background: "transparent",
        color: "var(--color-muted)", fontFamily: "inherit", fontSize: 12, fontWeight: 600, cursor: "pointer",
      }}>
      <Icon name="plus" size={13} />
      {label}
    </button>
  );
}

function ProductBox({ product, active, reviewed, onSelect }: { product: ProductDetail; active: boolean; reviewed: boolean; onSelect: () => void }) {
  return (
    <button type="button" onClick={onSelect} className="kc-chart-box" data-level="product"
      style={{
        width: 200, minHeight: ROW_HEIGHT.product, boxSizing: "border-box",
        textAlign: "left", fontFamily: "inherit", cursor: "pointer",
        background: "var(--color-page)", border: "1px solid var(--color-border)",
        borderRadius: 12, padding: "12px 14px", boxShadow: boxShadowFor(active),
      }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
        <span style={{ fontSize: 13.5, fontWeight: 700, color: "var(--color-heading)", lineHeight: 1.3 }}>{product.name}</span>
        {reviewed && <Icon name="check" size={13} color="var(--color-success)" />}
      </div>
      <div style={{ fontSize: 11.5, color: "var(--color-muted)", marginTop: 2 }}>{product.matchPct}% match</div>
    </button>
  );
}

function IcpBox({ icp, active, reviewed, onSelect }: { icp: IcpDetail; active: boolean; reviewed: boolean; onSelect: () => void }) {
  return (
    <button type="button" onClick={onSelect} className="kc-chart-box" data-level="icp"
      style={{
        width: 200, minHeight: ROW_HEIGHT.icp, boxSizing: "border-box",
        textAlign: "left", fontFamily: "inherit", cursor: "pointer",
        background: "var(--color-page)", border: "1px solid var(--color-border)",
        borderRadius: 12, padding: "12px 14px", boxShadow: boxShadowFor(active),
      }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: "var(--color-heading)", lineHeight: 1.3 }}>{icp.name}</span>
        {reviewed && <Icon name="check" size={13} color="var(--color-success)" />}
      </div>
      <div style={{ fontSize: 11, color: "var(--color-muted)", marginTop: 4, background: "var(--color-surface)", display: "inline-block", borderRadius: 999, padding: "2px 8px" }}>{icp.industryTag}</div>
    </button>
  );
}

const CARD_TINTS = [
  { bg: "#ecfdf5", border: "#86efac" },
  { bg: "#fffbeb", border: "#fde68a" },
];

function PersonaCard({ persona, icp, active, reviewed, onSelect, tintIndex }: {
  persona: PersonaDetail; icp: IcpDetail; active: boolean; reviewed: boolean; onSelect: () => void; tintIndex: number;
}) {
  const tint = CARD_TINTS[tintIndex % CARD_TINTS.length];
  const { products, opportunities, pipelineValue } = personaPerformance(persona.id);
  const bullets = [persona.department, icp.industryTag, icp.geographies[0], icp.companySizes[0]].filter(Boolean) as string[];
  const stats = [
    { label: "Products", value: String(products) },
    { label: "Opportunities", value: String(opportunities) },
    { label: "Pipeline", value: formatCurrencyShort(pipelineValue) },
  ];

  return (
    <button type="button" onClick={onSelect} className="kc-chart-box" data-level="persona"
      style={{
        width: 240, minHeight: ROW_HEIGHT.persona, boxSizing: "border-box",
        display: "flex", flexDirection: "column",
        textAlign: "left", fontFamily: "inherit", cursor: "pointer", overflow: "hidden",
        background: tint.bg, border: `1px solid ${tint.border}`,
        borderRadius: 12, boxShadow: boxShadowFor(active),
      }}>
      <div style={{ padding: "14px 14px 10px", flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <Avatar name={persona.name} />
          <div style={{ minWidth: 0, display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--color-heading)", textDecoration: "underline", lineHeight: 1.3 }}>{persona.name}</span>
            {reviewed && <Icon name="check" size={12} color="var(--color-success)" />}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {bullets.map((b, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 6, fontSize: 11, color: "var(--color-body)", lineHeight: 1.5, textAlign: "left" }}>
              <span style={{ width: 3, height: 3, borderRadius: "50%", background: "var(--color-muted)", marginTop: 6, flexShrink: 0 }} />
              <span>{b}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", borderTop: "1px solid rgba(0,0,0,0.08)" }}>
        {stats.map((s, i) => (
          <div key={s.label} style={{ padding: "8px 4px", textAlign: "center", borderRight: i < stats.length - 1 ? "1px solid rgba(0,0,0,0.08)" : "none" }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: "var(--color-muted)", textTransform: "uppercase", letterSpacing: "0.03em" }}>{s.label}</div>
            <div style={{ fontSize: 13, fontWeight: 800, color: "var(--color-heading)" }}>{s.value}</div>
          </div>
        ))}
      </div>
    </button>
  );
}

export function KnowledgeDiagram({
  products, icps, personas, selection, onSelect, reviewedKeys, onAddProduct, onAddIcp, onAddPersona,
}: {
  products: ProductDetail[]; icps: IcpDetail[]; personas: PersonaDetail[];
  selection: TreeSelection | null; onSelect: (sel: TreeSelection) => void;
  reviewedKeys: Set<string>;
  onAddProduct: () => void; onAddIcp: (productId: string) => void; onAddPersona: (icpId: string) => void;
}) {
  const chartRef = useRef<HTMLDivElement>(null);

  // The tree is centred on the company node, so a wide chart would otherwise
  // open scrolled hard left with the root off-screen.
  const centred = useRef(false);
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart || centred.current || chart.scrollWidth <= chart.clientWidth) return;
    chart.scrollLeft = (chart.scrollWidth - chart.clientWidth) / 2;
    centred.current = true;
  }, [products, icps, personas]);

  return (
    <div>
      <style>{CHART_STYLES}</style>

      <div ref={chartRef} className="kc-scrollbar" style={{ overflowX: "auto", paddingBottom: 24 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: "max-content" }}>
          <div className="kc-chart-box" data-level="company"
            style={{ background: "var(--color-heading)", color: "#fff", borderRadius: 12, padding: "12px 22px", fontSize: 14, fontWeight: 800, boxShadow: "var(--shadow-card)" }}>
            {COMPANY_PROFILE.companyName}
          </div>

          <ul className="kc-chart-tree">
            {products.map((product, pi) => {
              const productIcps = icpsForProduct(product.id, icps);
              const branchColor = BRANCH_COLORS[pi % BRANCH_COLORS.length];
              return (
                <li key={product.id} style={{ ["--branch-color" as string]: branchColor }}>
                  <ProductBox
                    product={product}
                    active={selection?.type === "product" && selection.id === product.id}
                    reviewed={reviewedKeys.has(treeKey("product", product.id))}
                    onSelect={() => onSelect({ type: "product", id: product.id })}
                  />
                  <ul>
                    {productIcps.map((icp) => {
                      const icpPersonas = personasForIcp(icp.id, personas);
                      return (
                        <li key={icp.id}>
                          <IcpBox
                            icp={icp}
                            active={selection?.type === "icp" && selection.id === icp.id}
                            reviewed={reviewedKeys.has(treeKey("icp", icp.id))}
                            onSelect={() => onSelect({ type: "icp", id: icp.id })}
                          />
                          <ul>
                            {icpPersonas.map((persona, pji) => (
                              <li key={persona.id}>
                                <PersonaCard
                                  persona={persona} icp={icp} tintIndex={pji}
                                  active={selection?.type === "persona" && selection.id === persona.id}
                                  reviewed={reviewedKeys.has(treeKey("persona", persona.id))}
                                  onSelect={() => onSelect({ type: "persona", id: persona.id })}
                                />
                              </li>
                            ))}
                            <li><AddGhost label="Add Persona" onClick={() => onAddPersona(icp.id)} /></li>
                          </ul>
                        </li>
                      );
                    })}
                    <li><AddGhost label="Add ICP" onClick={() => onAddIcp(product.id)} /></li>
                  </ul>
                </li>
              );
            })}
            <li><AddGhost label="Add Product" onClick={onAddProduct} /></li>
          </ul>
        </div>
      </div>
    </div>
  );
}
