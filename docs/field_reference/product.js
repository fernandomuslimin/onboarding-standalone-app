import { z } from 'zod';
import { makeEnvelope } from './envelope.js';
import { collapseEnvelopes } from './helpers.js';

const Schema = z.object({
  // ── Core identity ─────────────────────────────────────────────────────────────
  name:                 makeEnvelope().describe("The product's name as the company refers to it."),
  category:             makeEnvelope().describe("Industry-recognised product category from analyst/comparison-page language — do NOT invent categories."),
  description:          makeEnvelope().describe("2-4 sentence description: what it is, who it's for, and what the customer gets."),
  keyFeatures:          z.array(makeEnvelope()).describe("3-10 features or capabilities lifted from product pages. One short phrase or sentence per item."),
  useCases:             z.array(makeEnvelope()).describe("3-7 use cases or jobs-to-be-done this product serves. One per item."),
  problemsSolved:       z.array(makeEnvelope()).describe("3-5 problems the product solves, in customer language. One per item."),
  valueProposition:     makeEnvelope().describe("1-2 sentence value prop: the primary outcome the customer achieves."),
  timeToValue:          makeEnvelope().describe("Short phrase or duration describing how quickly a customer sees results (e.g. '3-7 days to first campaign live')."),

  // ── Market & customer ─────────────────────────────────────────────────────────
  idealCustomer:        makeEnvelope().describe("1-2 sentences describing the ideal customer — company type, size, and persona."),
  // Candidate ICP names + seed-brief descriptions only — full targeting lives in ICPSchema.
  icps:                 z.array(makeEnvelope(z.object({
    name:        z.string().describe("Specific, distinguishing label for this candidate ICP segment that captures the firmographic core — not a generic category. Good: 'Series A–B vertical SaaS, 50-200 employees, outbound-led'. Weak: 'SaaS companies'."),
    description: z.string().describe("Self-contained 2-3 sentence brief that seeds downstream ICP research — it is passed as the only context into the ICP step, so it must stand alone. Cover: (1) the company profile (industry/vertical, size, stage, business model); (2) the core pain or trigger that makes them need this product; (3) why this product is a strong fit for them. Be concrete and specific — avoid generic filler the ICP step cannot build on."),
  }))).describe("Candidate Ideal Customer Profiles discovered for this product — name and seed-brief description only. Each must be distinct and meaningful enough to anchor a full ICP research pass; detailed firmographics, signals, and targeting belong in ICPSchema. Do not infer implausible segments. Do not exceed 2 items."),

  marketMaturity:       makeEnvelope().describe("Market maturity level for this product's category (e.g. Emerging, Growth, Mature). Use recognised designations."),
  competitors:          z.array(makeEnvelope()).describe("Specific competitors EXPLICITLY named on the company's product page or site. Do not exceed 10 items."),
  buyerObjections:      z.array(makeEnvelope()).describe("Common objections buyers raise during the sales process for this product. One per item. Do not exceed 8 items."),
  switchTriggers:       z.array(makeEnvelope()).describe("Events or conditions that motivate a buyer to switch from their current solution to this product. One per item. Do not exceed 8 items."),

  // ── Evidence & proof ──────────────────────────────────────────────────────────
  proofPoints:          z.array(makeEnvelope()).describe("3-7 strongest proof points — specific statistics, benchmarks, or outcome claims extracted from the website."),
  roiMetrics:           z.array(makeEnvelope()).describe("Key metrics customers use to measure ROI (e.g. 'meetings booked', '3x pipeline increase'). Numeric when available. Do not exceed 7 items."),
  industryProof:        makeEnvelope().describe("Industries or verticals where this product has demonstrated adoption. Sourced from case studies or customer pages."),
  socialProof:          makeEnvelope().describe("Customer reviews, testimonials, G2/Capterra ratings, or social validation signals."),

  // ── Messaging ─────────────────────────────────────────────────────────────────
  unsolvedImpact:       makeEnvelope().describe("Consequence framing — what the customer continues to suffer if they don't adopt. Quantified where possible."),
  elevatorPitch:        makeEnvelope().describe("1-2 sentences max deliverable in 30 seconds, capturing the product's essence and core value."),
  positioningStatement: makeEnvelope().describe("1 sentence positioning: 'For X who Y, [Product] is Z that W, unlike V.'"),
  // Tagged (industry) so Campaign-Copy Viability scoring and campaign-copy
  // generation both read this ONE field, not two that could drift apart.
  messagingDos:         z.array(makeEnvelope(z.object({
    text:      z.string().describe("The messaging principle or angle itself, as a short phrase (e.g. 'Lead with speed of setup, not feature depth')."),
    industry:  z.string().nullable().describe("The single industry/vertical this messaging angle resonates most strongly with, matching one of ICP.targetIndustries (e.g. 'B2B SaaS'). Use null (not an empty string) if the angle is industry-agnostic."),
  }))).describe("3-5 messaging principles or angles that resonate with buyers of this product, each tagged with the industry it resonates with — used to match against an ICP's targetIndustries for Campaign-Copy Viability scoring. One per item."),

  // ── Deal & commercials ────────────────────────────────────────────────────────
  // NOTE: Excel marks these as User-only → Generative — user fills first;
  // agent infers from peer company data when the user hasn't provided them.
  acv:                  makeEnvelope(z.string().min(1)).describe("Annual contract value — typical range (e.g. '$24,000/year'). Always required; if no direct evidence exists, use the generative bucket with your best reasoned estimate."),
  mrr:                  makeEnvelope().describe("Monthly recurring revenue per customer — typical range (e.g. '$2,000/month')."),
  dealType:             makeEnvelope().describe("Deal structure — one-time, subscription, usage-based, retainer, etc."),
  contractLength:       makeEnvelope().describe("Typical contract duration (e.g. 'month-to-month', 'annual', 'multi-year')."),
  avgDaysToClose:       makeEnvelope().describe("Average number of days from first contact to closed-won (e.g. '30-60 days')."),
  renewalRate:          makeEnvelope().describe("Customer renewal or retention rate at contract expiry (e.g. '92% annual renewal')."),
  expansionRevenue:     makeEnvelope().describe("Expansion revenue rate — upsell or upgrade likelihood (e.g. '35% upgrade within 6 months')."),
  ltv:                  makeEnvelope().describe("Estimated customer lifetime value based on ACV and average retention duration."),
  closeRateByStage:     makeEnvelope().describe("Conversion rates at each funnel stage (e.g. 'Lead→Demo: 25%, Demo→Proposal: 60%')."),
  dealStakeholders:     makeEnvelope().describe("Typical buying committee description — who buys, who champions, who approves, who can block."),
  discountAuthority:    makeEnvelope().describe("How much discount sales reps can offer unilaterally and what approval thresholds apply."),
  paymentTerms:         makeEnvelope().describe("Accepted payment methods, billing cycles, and standard payment terms."),
  // NOTE: Excel marks this as type=text (not array) — deviated: tagged array
  // so scoring and campaign-copy generation read this ONE field, not two.
  caseStudies:          z.array(makeEnvelope(z.object({
    title:      z.string().describe("Short identifying label for this case study (e.g. customer name or a generic descriptor if the name can't be disclosed, like 'Mid-market fintech client')."),
    summary:    z.string().describe("2-3 sentence narrative: the customer's situation, what they did with the product, and the outcome achieved."),
    metrics:    z.string().nullable().describe("The single strongest measurable outcome, as a short phrase (e.g. '3x pipeline growth in 6 months'). Null if no metric is available."),
    industry:   z.string().nullable().describe("The single industry/vertical this case study belongs to, matching one of ICP.targetIndustries (e.g. 'B2B SaaS'). Null if not identifiable."),
    buyerRole:  z.string().nullable().describe("The single role-family of the buyer/champion in this case study, matching Persona.roleFamily (e.g. 'Sales Leadership'). Null if not identifiable."),
  }))).describe("2-3 customer case studies with measurable outcomes, each tagged with its industry and buyer role so it can be matched against a specific ICP and persona for Campaign-Copy Viability scoring. User-provided or agent-inferred."),
  // NOTE: Excel marks objectionRebuttals as User-only → Generative and type=text (not array).
  objectionRebuttals:   makeEnvelope().describe("Rebuttal playbook — how to respond to the most common buyer objections. Prose or 'Objection → Rebuttal' format."),
  // NOTE: Excel marks messagingDonts as User-only → Generative (user fills first).
  messagingDonts:       z.array(makeEnvelope()).describe("Messaging angles, claims, or language to avoid when selling this product. One per item. Do not exceed 8 items."),

  // FROM_JSON: prod_notes — free-form notes field present on product objects in JB_CX_TOOL_output.json.
  // Not in the Excel Product spec. Keep for agent-generated annotations or override notes.
  // notes:                makeEnvelope().describe("Free-form notes or additional context about this product — agent annotations, caveats, or open questions."),

  // ── Review: fields not in Excel Product spec ──────────────────────────────────
  // TODO: 'avgDealSize' not in Excel — review if needed or consolidate with acv.
  avgDealSize:          makeEnvelope().describe("Average deal size or contract value (ACV or TCV)."),
  // TODO: 'repeatRate' not in Excel — review if relevant for this product type.
  repeatRate:           makeEnvelope().describe("Rate at which customers make repeat purchases or expand their contract."),
  // TODO: 'referralRate' not in Excel — review if relevant.
  referralRate:         makeEnvelope().describe("Estimated percentage of new customers sourced from referrals or word-of-mouth."),

  // acvNumeric/avgDaysToCloseNumeric were removed — derived deterministically
  // from the acv/avgDaysToClose text instead (productScore.js#resolveAcv).
  // defaultCloseRate stays AI-judged since it has no text sibling to derive from.
  defaultCloseRate:     makeEnvelope(z.number().positive().nullable()).describe("Default close rate for this product overall, as a decimal fraction between 0 and 1, exclusive of zero (e.g. 0.03 for 3%). Must be a positive number greater than zero. Use your judgment to produce the single most representative figure from whatever evidence you found — not a formulaic average of any range, a realistic estimate of what this product's close rate actually tends to be. Use null only if truly no reasonable rate can be derived at all, never zero or negative. Source: the seller's aggregate funnel/CRM conversion data across all segments, or category benchmarks for this deal size/motion. Fallback used for Revenue Potential scoring when the ICP's own expectedCloseRate is absent."),
});

export const collapsedEnvelopeSchema = collapseEnvelopes(Schema);

export default Schema;
