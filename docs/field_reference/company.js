import { z } from 'zod';
import { makeEnvelope } from './envelope.js';
import { collapseEnvelopes } from './helpers.js';

const Schema = z.object({
  // ── Business profile ─────────────────────────────────────────────────────────
  name: makeEnvelope().describe("Name of the company, as found on their website, LinkedIn, or Crunchbase."),
  // NOTE: Excel marks 'website' as User-only — orchestrator should not produce this field.
  // Kept here as an extractive fallback for pipelines where the user omits it.
  // website: makeEnvelope().describe("Primary website URL. Use the user-supplied value; extract from search results only as a fallback."),
  industries: z.array(makeEnvelope(z.object({
    name: z.string().describe("Industry name that best describes what this company does."),
    naics_code: z.string().nullable().describe("6-digit NAICS code from the official NAICS registry."),
  }))).describe("Industries representing the company's core business activity, not the markets it sells into."),
  employeeCount: makeEnvelope().describe("Employee headcount band of the company, sourced from their LinkedIn or Crunchbase profile (e.g. '10–50 employees')."),
  revenue: makeEnvelope().describe("Annual revenue or ARR band from public data or press (e.g. '$1M–$5M ARR'). Use standard bands — do not interpolate."),
  category: makeEnvelope().describe("Industry-recognised product category using analyst or comparison-site language (e.g. 'Sales Engagement Platform'). Do not invent categories."),

  // ── Products & market position ────────────────────────────────────────────────
  productSummary: makeEnvelope().describe("Short noun phrase naming what the company sells at the highest level, extracted from the homepage hero or primary nav (e.g. 'AI-powered outbound sales platform')."),
  // Product names/tiers only — detailed per-product research belongs in ProductSchema.
  products: z.array(makeEnvelope(z.object({
    name: z.string().describe("Exact product, tier, or module name as stated on the company's website."),
    linkToProduct: z.string().describe("URL of the dedicated product or feature page."),
  }))).describe("Each distinct product, tier, or module explicitly named on the company's website. Do not infer product lines — only include offerings with a dedicated name and page. Do not exceed 3 items."),
  competitors: z.array(makeEnvelope()).describe("Competitors the company EXPLICITLY names on its own website, comparison pages, or press releases. Extract each name exactly as stated. Do not infer from the market category. Do not exceed 10 items."),
  keySellingPoints: z.array(makeEnvelope()).describe("Short phrases lifted verbatim or near-verbatim from the company's own marketing copy — their language, not your summary. Do not exceed 10 items."),
  differentiation: makeEnvelope().describe("What sets this company apart from competitors — concrete and specific. Avoid generic claims like 'best-in-class' or 'easy to use'."),
  buyingMotion: makeEnvelope().describe("How customers typically buy — 1 sentence (e.g. 'Self-serve trial with sales assist for deals above $10K')."),
  trustRisks: z.array(makeEnvelope()).describe("Specific objections or trust barriers a prospect would likely raise — each grounded in a concrete signal: a product claim, a pricing model pattern, a known category risk, or a recurring theme in customer reviews. Do not generalize. Do not exceed 10 items."),

  // ── Evidence & credibility ────────────────────────────────────────────────────
  proof: makeEnvelope().describe("Specific, attributable evidence of customer results — named case studies, cited metrics, or direct testimonials. Avoid vague paraphrases."),
  notableCustomers: z.array(makeEnvelope()).describe("Named customers the company publicly claims, extracted exactly as stated. One name per item. Do not exceed 10 items."),

  // ── Messaging framework ───────────────────────────────────────────────────────
  // Each field is a sentence fragment completing a fixed stem. Keep them tight.
  pitch: makeEnvelope().describe("Single sentence describing what the company does — no superlatives or marketing adjectives (e.g. '[Company] helps B2B sales teams automate outbound prospecting')."),
  whoWeHelp: makeEnvelope().describe("Sentence completion of 'We help…' — name a specific customer type by industry, role, or stage, not a generic audience."),
  targetStruggle: makeEnvelope().describe("Sentence completion of '…who struggle with…' — the customer's pain in their own language, extracted from homepage copy or customer quotes."),
  solutionStatement: makeEnvelope().describe("Sentence completion of '…by providing…' — the concrete deliverable, not an abstract benefit."),
  vsCompetitors: makeEnvelope().describe("Sentence completion of '…unlike…' — the category or approach being displaced, not necessarily a named competitor."),
  uniqueAdvantage: makeEnvelope().describe("Sentence completion of '…we uniquely…' — the specific mechanism or capability that makes this solution distinctively better."),
  coreProblem: makeEnvelope().describe("1 sentence stating the systemic market problem this company was built to solve — the category-level problem, distinct from the individual customer's struggle."),
  dreamCustomer: makeEnvelope().describe("1–2 sentences describing the ideal customer this company most wants to attract — the profile where they win most and deliver the most value."),

  // ── Review: fields not in Excel Company spec ──────────────────────────────────
  // TODO: 'dealOverview' and 'salesCycle' not present in Excel Company Profile sheet.
  // May belong on the Product schema or be user-provided. Review before keeping.
  dealOverview: makeEnvelope().describe("High-level pricing structure and deal model, inferred from the pricing page, press, or peer companies if not explicitly stated."),
  salesCycle: makeEnvelope().describe("Typical sales cycle length and how deals progress from first touch to close, inferred from product complexity, deal size, and buying motion."),

  // NOTE: Excel treats these as User-only → Generative (user fills first; agent infers if missing).
  // Kept so the agent can infer them from website positioning when the user hasn't provided them.
  // excludeList: z.array(makeEnvelope()).describe("Company types, industries, or profiles that are a poor fit — inferred from the company's stated positioning and who they do not mention as customers."),
  // avoidList: z.array(makeEnvelope()).describe("Messaging angles, claims, or topics to avoid in outreach — inferred from the company's brand tone, competitive positioning, and any stated sensitivities."),

  // ── Product Component Scoring inputs (Fit Assessment Layer) ───────────────────
  // New, additive field for the deterministic Product Component score. Distinct
  // from salesCycle above (which is a prose description) — this is the numeric
  // goal used as the denominator in Sales-Cycle Fit scoring. Not read by any
  // existing consumer yet.
  goalTimeline: makeEnvelope(z.number().positive().nullable()).describe("Target number of days this company aims to close a deal within — the sales-cycle goal, as a plain positive number of days (e.g. 45). Must be a positive number greater than zero; never zero or negative. Source priority: (1) the seller's explicitly stated sales-cycle target; (2) if not explicitly stated, you MUST still infer a plausible number from this company's own deal profile — its pricing/buying motion (self-serve vs sales-assisted vs enterprise) and deal size signals from dealOverview/salesCycle/buyingMotion above. Use standard B2B SaaS benchmarks by deal size as your inference anchor: self-serve or low-ticket deals (roughly <$10K ACV) → 14-30 days; mid-market/sales-assisted deals → 30-90 days; enterprise/complex deals → 90-180+ days. Only return null if the data gives no usable signal at all about this company's deal size or buying motion — the mere absence of an explicit stated number is NOT sufficient reason to return null. Compared against Product.avgDaysToClose for Sales-Cycle Fit scoring."),
});

export const collapsedEnvelopeSchema = collapseEnvelopes(Schema);

export default Schema;
