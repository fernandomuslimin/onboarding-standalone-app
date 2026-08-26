import { z } from "zod";
import { makeEnvelope } from "./envelope.js";
import { collapseEnvelopes } from "./helpers.js";


// Web Search → generative fallback) lives centrally in prompts/sections.js fieldResolutionRules.

export const ICPSchema = z.object({
  // ── Identity & fit ───────────────────────────────────────────────────────────
  icpName: makeEnvelope().describe(
    "Short descriptive label for this ICP segment (e.g. 'Mid-Market SaaS VP Sales', 'SMB Agency Owner'). Source: the ICP seed brief and the firmographic filters below. Derive a specific, firmographic label — not a generic category.",
  ),
  fitReasoning: makeEnvelope().describe(
    "Explanation of why this company profile is an ideal customer — connecting their pains to the product's value prop. Source: the seller's website/value prop and the segment definition. Derive from those; always produce a substantive answer, never leave blank.",
  ),
  // painAlignment:              makeEnvelope().describe("How the ICP's primary pains map directly to the product's core value proposition."),
  buyingTriggers: z
    .array(makeEnvelope())
    .describe(
      "Events or conditions at target companies that signal readiness to buy (e.g. funding round, SDR attrition, missed quota). Source: funding/press announcements, job postings, leadership-change news, and buying-trigger guides for this category. Infer the triggers most likely for this segment from its industry, stage, and the pains the product solves — do not require them to be explicitly stated. One per item. Provide 3-8 items.",
    ),
  exclusionCriteria: z
    .array(makeEnvelope())
    .describe(
      "Company attributes or signals that disqualify a company from this ICP — who should NOT be targeted. Source: the segment definition and the product's poor-fit signals (wrong size, wrong business model, no relevant pain, regulatory blockers). Infer from where the product clearly does not fit. One per item. Provide 3-8 items.",
    ),

  // ── Firmographic filters ─────────────────────────────────────────────────────
  targetIndustries: z
    .array(makeEnvelope())
    .describe(
      "Industries or verticals that define this ICP (e.g. 'B2B SaaS', 'IT Services', 'Marketing Agencies'). Source: the seller's customer/case-study pages, G2/Capterra category, and the seed brief. Derive from those plus adjacent verticals where the same pains and fit hold. One per item. Provide 3-10 items.",
    ),
  companySize: z
    .array(makeEnvelope())
    .describe(
      "Target employee headcount ranges for this ICP (e.g. '6-50 employees', '51-200 employees'). Source priority: (1) the ICP seed brief, (2) firmographic databases such as LinkedIn, Apollo, or ZoomInfo. If the seed brief specifies a company-size range, that range is authoritative and MUST appear in the output exactly as stated. Only expand to immediately adjacent ranges if they are clearly compatible. Never replace a specific employee range with vague labels such as 'SMBs', 'small businesses', 'mid-market', or 'enterprises'. Never broaden beyond the seed unless evidence strongly supports it. One range per item. Provide 2-5 items.",
    ),

  revenueRange: z
    .array(makeEnvelope())
    .describe(
      "Target annual revenue or ARR ranges for this ICP (e.g. '$5M-$20M ARR', '$20M-$50M ARR'). Source: Growjo/Latka/press for the segment, or estimate from headcount using ARR-per-employee benchmarks. Do not leave empty just because no figure is stated. One per item. Provide 2-5 items.",
    ),
  geographies: z
    .array(makeEnvelope())
    .describe(
      "Target geographic markets for this ICP (e.g. 'North America', 'Western Europe'). Source: the locations of the seller's named customers, plus where the product's category has demand. Infer where this segment concentrates. One per item. Provide 2-6 items.",
    ),
  techStack: z
    .array(makeEnvelope())
    .describe(
      "Technology signals indicating fit — tools the TARGET accounts use that suggest compatibility or need for the product (e.g. a CRM, marketing platform, or category-adjacent tool a rep could detect). Source: BuiltWith/Wappalyzer tech detection, tools named in the target's job postings, and integrations the seller lists. This is NOT the seller's own engineering/build stack — do NOT list programming languages, databases, or cloud infrastructure (e.g. Node.js, PostgreSQL, Kubernetes, GCP) the seller built its product with. One per item. Provide 3-10 items.",
    ),
  businessModel: z
    .array(makeEnvelope())
    .describe(
      "Business models of target companies in this ICP (e.g. 'B2B SaaS', 'Managed Services'). Source: the seed brief and the target companies' own positioning. Derive from those. One per item. Provide 1-4 items.",
    ),
  fundingStage: z
    .array(makeEnvelope())
    .describe(
      "Target funding stages for this ICP (e.g. 'Seed', 'Series A', 'Series B'). Source: Crunchbase/PitchBook/press for this segment. Infer the stages that match this segment's size and maturity; omit only if the segment is clearly stage-agnostic. One per item. Provide 1-4 items.",
    ),
  decisionMakingUnit: z
    .array(makeEnvelope())
    .describe(
      "Typical buying committee — who holds budget, who champions, who influences, and who can block the deal. Source: LinkedIn org structure at target-size companies and B2B buying-committee research. Infer the roles for this segment from the function the product is sold into and typical org structure at this company size. One per item. Provide 3-6 items.",
    ),

  // ── Intelligence signals ─────────────────────────────────────────────────────
  // headcountGrowthSignal:      z.array(makeEnvelope()).describe("Hiring patterns or team growth signals that indicate this ICP is in an active buying window. One per item. Do not exceed 8 items."),
  icpProof: z
    .array(makeEnvelope())
    .describe(
      "Real named companies that match this ICP profile, used only as proof that the targeting criteria describe actual businesses. Source priority: (1) seller customer logos/case studies, (2) customer names explicitly mentioned in trusted reviews or testimonials, (3) well-known peer companies that clearly match the same firmographic profile. Every item MUST be a real, legally identifiable company name (e.g. 'Ramp', 'Notion', 'HubSpot'). Never return the seller itself. Never return taglines, product descriptions, market statistics, review excerpts, analyst commentary, industries, or any other text that is not a company name. Reject any candidate whose cited source is the seller's own marketing page unless that page explicitly names the customer company. If no real companies can be verified with confidence, return an EMPTY list. An empty list is always preferred over fabricated or inferred examples.",
    ),
  competitiveDisplacementFit: makeEnvelope().describe(
    "Assessment of how likely this ICP is to switch from their current solution to this product, and what drives that switch. Source: the incumbentTools this segment uses, G2 'compare' pages, and the product's differentiation. Reason from those; always produce an assessment, never leave blank.",
  ),

  // ── Persona discovery ─────────────────────────────────────────────────────────
  // Candidate persona names + short descriptions
  personas: z
    .array(
      makeEnvelope(
        z.object({
          name: z
            .string()
            .describe(
              "Persona name or role title for this ICP (e.g. 'VP of Sales', 'RevOps Manager').",
            ),
          description: z
            .string()
            .describe(
              "1–2 sentence description of this candidate persona — their role and why they matter within this ICP.",
            ),
        }),
      ),
    )
    .describe(
      "Candidate buyer personas discovered for this ICP — name and short description only. Source: LinkedIn job titles at target-size companies in this segment and the function the product serves. Infer the plausible roles from the function and typical org structure at this company size. Do not infer beyond plausible roles; detailed targeting and messaging belong in PersonaSchema. Provide 2 items.",
    ),

  summary: makeEnvelope().describe(
    "Neutral overview of this ICP segment — who they are at a glance, independent of the fit justification. Source: the segment definition and the firmographic fields above. Always produce an overview.",
  ),
  growthStage: z
    .array(makeEnvelope())
    .describe(
      "Company growth stage for this ICP (e.g. 'Startup', 'SMB', 'Mid-Market', 'Enterprise'). Source: the companySize and fundingStage fields above. Infer from the segment's size and stage. One per item. Provide 1-3 items.",
    ),
  useCases: z
    .array(makeEnvelope())
    .describe(
      "Typical use cases or jobs-to-be-done this ICP turns to the product for. Source: the seller's product/use-case pages and this segment's pains. Derive from the product's capabilities applied to this segment. One per item. Provide 3-7 items.",
    ),

  maturity: makeEnvelope().describe(
    "How mature the target company is across process and technology — the maturity of its processes, team structure, and operations (e.g. ad-hoc, defined, optimized) together with how technically sophisticated it is and how much it relies on modern tooling. Source: the segment's stage/industry norms and its techStack. This is NOT funding stage — do NOT list Seed/Series A/B/C here (that belongs in fundingStage); describe operational and technical sophistication only. Infer the typical maturity; always produce an assessment, never leave blank.",
  ),

  painPoints: z
    .array(makeEnvelope())
    .describe(
      "Core pains this ICP feels acutely — the problems the product most directly addresses, roughly ordered by severity. Source: the seller's product/problem pages and reviews or forums from this segment. Derive from the product's value prop and this segment's context. One per item. Provide 3-7 items.",
    ),

  businessGoals: z
    .array(makeEnvelope())
    .describe(
      "Strategic, board-level outcomes this ICP is trying to achieve over the next 1-3 years. Source: the product's value proposition and the known priorities of this industry/stage — what a CEO or VP would put on a strategy deck (e.g. 'Grow ARR from $10M to $25M', 'Expand into the EU market', 'Improve net revenue retention to 120%'). Ground each in the product's value prop or the segment's stage, not generic platitudes. One per item. Provide 3-6 items.",
    ),

  operationalGoals: z
    .array(makeEnvelope())
    .describe(
      "Concrete, measurable KPIs the target team is responsible for improving with this product. These are success metrics, NOT product use cases or workflows. Every item should describe a quantifiable operational outcome (e.g. 'Reduce lead response time below 5 minutes', 'Increase outbound reply rate above 5%', 'Book 30+ qualified meetings per SDR each month', 'Cut manual data entry by 80%'). Source: operational benchmarks for the function, buyer interviews, product ROI messaging, and category best practices. Do NOT repeat product capabilities, use cases, or jobs-to-be-done from useCases. One metric per item. Provide 3-6 items.",
    ),

  // ── Targeting filters (account selection) ─────────────────────────────────────
  departmentSize: z
    .array(makeEnvelope())
    .describe(
      "Size of the specific function/department being sold into, not total headcount (e.g. 'Sales team of 10+', '5+ SDRs', 'Eng org > 50'). Source: LinkedIn team/department headcount at target-size companies and org-structure benchmarks. Infer from the segment's size and the function the product is sold into. One per item. Provide 2-5 items.",
    ),

  intentSignals: z
    .array(makeEnvelope())
    .describe(
      "Observable, third-party behaviors that signal a target account is actively researching this product's category — and where a rep would actually see them. Source (name it per item): the behavior AND its source (e.g. 'Bombora surge on \"sales engagement\" topic', 'Comparing vendors on G2/Capterra in this category', 'Downloading category buyer guides or attending category webinars', 'Spike in relevant keyword search / ad engagement'). Infer the signals most relevant to this product's category. Tie the topics to this product's category, not generic buying interest. Distinct from buyingTriggers (events) — these are research behaviors. One per item. Provide 3-6 items.",
    ),

  incumbentTools: z
    .array(makeEnvelope())
    .describe(
      "Named competing or adjacent tools a target account likely already uses that this product would rip-and-replace or sit beside. Source: the product's/company's known competitors and category, then tools detectable in the wild (via BuiltWith/Wappalyzer tech detection, tools named in their job postings, or G2 'compare' pairings) — e.g. 'Outreach', 'Salesloft', 'HubSpot Sequences'. Each named tool is a concrete displacement signal a rep can verify. One per item. Provide 3-8 items.",
    ),

  outreachAccessibility: z
    .array(makeEnvelope())
    .describe(
      "How reachable the buyers in this ICP actually are — the channels that work and any barriers to contact. Source: contact-data coverage in Apollo/ZoomInfo, LinkedIn activity of these roles, and deliverability norms at this company size. Each item should name a channel and its viability (e.g. 'Decision-maker emails readily available via Apollo/ZoomInfo', 'Highly active on LinkedIn — reply well to DMs', 'Gatekept — phone routes through EA', 'Low email deliverability at enterprise domains'). Focus on practical reachability a rep can act on, not who the buyer is. One per item. Provide 3-6 items.",
    ),

  // ── Market sizing ─────────────────────────────────────────────────────────────
  marketSize: makeEnvelope().describe(
    "How large and reachable this ICP segment is — an estimate of the addressable universe (TAM/SAM or the approximate count of companies matching the firmographic filters) and how buildable a target list is. Source: category market-research reports (e.g. Gartner/market.us/industry reports) or a firmographic count from LinkedIn/Apollo using the filters above. Ground the estimate in the industry/geography/size filters; note the source or basis for the number and whether the accounts are easy to enumerate. Always produce an estimate with its basis, never leave blank.",
  ),

  // marketSizeNumeric/companySizeMin/Max were removed — derived deterministically
  // from their text siblings instead (productScore.js#resolveMarketSize).
  // expectedCloseRate stays AI-judged since it has no text sibling to derive from.
  expectedCloseRate: makeEnvelope(z.number().nullable()).describe(
    "Expected close rate for this ICP segment, as a decimal fraction (e.g. 0.05 for 5%). Use your judgment to produce the single most representative figure from whatever evidence you found — not a formulaic average, a realistic estimate of what this segment's close rate actually tends to be. Source: the seller's own funnel/CRM conversion data for deals matching this segment, or category benchmarks for this deal size/motion if segment-specific data isn't available. Used as the close-rate input for Revenue Potential scoring — falls back to Product.defaultCloseRate, then a fixed 2% default, when unavailable.",
  ),
});

export const collapsedEnvelopeSchema = collapseEnvelopes(ICPSchema);

export default ICPSchema;

