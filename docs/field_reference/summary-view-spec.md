# Onboarding Review Wizard — Summary View Specification

## Purpose

The onboarding pipeline researches a company and produces four records (Company Profile,
Product, ICP, Persona), each defined by a Zod schema. The 4-step review wizard shows the
user a **summarized view** of each record — not the raw field set — so they can sanity-check
the research without being overwhelmed. The full record stays available underneath, queryable
and editable through the AI Copilot.

This document specifies, for each step of the wizard, exactly which summary blocks to render,
which schema fields feed each block, and how each block is produced.

Each block below also carries an **Implemented as** line, reconciling the spec against the
actual wizard code (`src/onboarding-shell.tsx`) as of 2026-08-26 — see
[Implementation status](#implementation-status) for how to read it.

---

## Mechanisms

Every summary block is produced one of three ways:

| Mechanism | What it means | Implementation |
|---|---|---|
| **AI-Synthesized** | Two or more raw fields are passed to the AI, which writes new, original prose combining them. Used when the underlying fields are fragments that only make sense read together. | Requires a new synthesis call (one prompt per block type). Cache the result on the record; invalidate and regenerate only when a source field changes (via Copilot edit or re-research). |
| **Field-Join** | One or more raw fields are shown directly, grouped into a UI section, with no AI rewriting. | Pure data mapping — pull the field values straight from the record and render. No AI call needed. |
| **Verbatim Passthrough** | A single field is already authored as reader-ready prose for this exact purpose (e.g. `Persona.summary`, `Product.elevatorPitch`). | Render as-is. Don't re-synthesize or join it with anything else — that would be redundant work and risks diluting text that's already well-formed. |

A field marked **Not Shown** doesn't appear in the wizard at all. It's still fully present in
the record, editable via Copilot, and may feed other things (scoring, downstream generation).

## Priority tiers

| Tier | Behavior |
|---|---|
| **Primary** | Visible by default, above the fold. The minimum needed to approve/reject the section with confidence. |
| **Secondary (expandable)** | On the page, collapsed behind a "show more" / accordion. |
| **Hidden – Copilot only** | Not rendered in the wizard. Fully queryable/editable via Copilot, and may be used elsewhere downstream (e.g. campaign copy generation). |
| **Hidden – internal only** | Not user-facing anywhere. These are scoring inputs (`goalTimeline`, `defaultCloseRate`, `expectedCloseRate`, `roleFamily`) with no narrative value to a reviewer. |

> **Implementation note:** as of 2026-08-26, the wizard code renders every Secondary block
> always-expanded — there is no collapse/"show more" affordance anywhere in
> `StepCompanyResearch` or the Product/ICP/Personas review step. The Primary/Secondary split
> still exists structurally (main column vs. right rail on Company/Product; merged into one
> card on ICP), but it no longer controls visibility, only layout.

## General implementation notes

- **Coverage guarantee:** every field in every schema maps to exactly one summary block below (or explicitly to "Not Shown"). Nothing is silently dropped — if a new field is added to a schema, it needs a new row here before it ships.
- **Caching AI-Synthesized blocks:** these should be generated once per record and stored (e.g. a `summaryBlocks` object alongside the record, or a small cache table keyed by record id + block id + a hash of the source field values). Regenerate only when a source field's value changes.
- **Copilot edits must invalidate synthesized blocks:** if the user edits `pitch` via Copilot, the "Who You Are" block (which is synthesized from `pitch`) needs to be marked stale and regenerated before it's shown again.
- **Field-Join blocks need no AI budget** — they're the cheap, fast path. Prefer Field-Join over AI-Synthesized wherever the raw fields are already short/discrete (facts, lists, single sentences); reserve AI-Synthesized for genuine fragments that read poorly split apart.
- **Envelope metadata (confidence/source):** each field is wrapped in `makeEnvelope()`, carrying a confidence score. Consider surfacing a low-confidence indicator (e.g. a small dot/badge) on Primary blocks where the underlying envelope confidence is below some threshold, so the user knows what to scrutinize.

---

## Step 1 — Company Profile

*Source schema: `company.js` · 25 fields → 10 summary blocks*

*Implemented in `StepCompanyResearch` (`src/onboarding-shell.tsx`).*

### 1. Header Strip
- **Priority:** Primary
- **Mechanism:** Field-Join
- **Display:** Single-line quick-facts strip, top of card
- **Fields:** `name`, `category`, `employeeCount`, `revenue`
- **Notes:** Fast yes/no verification facts — not reading material.
- **Implemented as:** "Category, Size & Revenue" header strip. `name` isn't repeated here — it's already the page heading.

### 2. Who You Are & The Problem You Solve
- **Priority:** Primary
- **Mechanism:** AI-Synthesized
- **Display:** Paragraph (2–3 sentences)
- **Fields:** `pitch`, `whoWeHelp`, `targetStruggle`, `solutionStatement`, `coreProblem`
- **Notes:** These fields are authored as clauses of one generated positioning sentence ("We help… who struggle with… by providing…") plus the standalone `coreProblem`. Stitch into one paragraph.
- **Implemented as:** "Company Overview" (renamed).

### 3. What Makes You Different
- **Priority:** Primary
- **Mechanism:** AI-Synthesized
- **Display:** Paragraph (1–2 sentences)
- **Fields:** `vsCompetitors`, `uniqueAdvantage`, `differentiation`
- **Notes:** Combines the "unlike… we uniquely…" positioning clauses with the free-form differentiation field.
- **Implemented as:** "Competitive Differentiation" (renamed).

### 4. What You Sell
- **Priority:** Primary
- **Mechanism:** Field-Join
- **Display:** Lead-in phrase + chip list (chips link out via `linkToProduct`)
- **Fields:** `productSummary`, `products[].name`, `products[].linkToProduct`
- **Notes:** `productSummary` as a one-line lead-in; each product as a clickable chip.
- **Implemented as:** "Products & Offerings" (renamed).

### 5. Proof & Credibility
- **Priority:** Primary
- **Mechanism:** Field-Join
- **Display:** Two short lists + one quoted line
- **Fields:** `keySellingPoints`, `notableCustomers`, `proof`
- **Notes:** The fastest recognition/validation signals — show as-is.
- **Implemented as:** "Proof & Credibility" (exact match).

### 6. Market Context
- **Priority:** Secondary (expandable)
- **Mechanism:** Field-Join
- **Display:** Two chip lists
- **Fields:** `industries`, `competitors`
- **Notes:** Useful context, not essential for approving the profile itself.
- **Implemented as:** "Market Context" (exact match).

### 7. Deal Snapshot
- **Priority:** Secondary (expandable)
- **Mechanism:** Field-Join
- **Display:** Quick facts row
- **Fields:** `buyingMotion`, `dealOverview`, `salesCycle`
- **Notes:** More relevant to campaign setup than to verifying "is this our company."
- **Implemented as:** "Deal Snapshot" (exact match).

### 8. Risks to Address
- **Priority:** Secondary (expandable)
- **Mechanism:** Field-Join
- **Display:** Bullet list
- **Fields:** `trustRisks`
- **Notes:** Useful but framed as objections — keep behind "show more."
- **Implemented as:** "Risks to Address" (exact match).

### 9. Dream Customer — **Not Shown**
- **Priority:** Hidden – Copilot only
- **Fields:** `dreamCustomer`
- **Notes:** Overlaps with `ICP.fitReasoning`/`ICP.summary`. Showing it here risks contradicting the ICP step. Let it inform ICP generation only; surface via Copilot on request.
- **Implemented as:** Not implemented in code.

### 10. Scoring Input — **Not Shown**
- **Priority:** Hidden – internal only
- **Fields:** `goalTimeline`
- **Notes:** Feeds Sales-Cycle Fit scoring against `Product.avgDaysToClose`. No narrative value.
- **Implemented as:** Not implemented in code.

---

## Step 2 — Product

*Source schema: `product.js` · 41 fields → 13 summary blocks (identical structure per product)*

*Implemented in `ProductServicesPanel` (`src/onboarding-shell.tsx`), part of `StepProductReview`.*

### 1. Header
- **Priority:** Primary
- **Mechanism:** Field-Join
- **Display:** Quick facts + badge
- **Fields:** `name`, `category`, `timeToValue`
- **Implemented as:** Unlabeled header row (name / badge / time-to-value) — no section title, matches spec's plain "quick facts" display.

### 2. Elevator Pitch
- **Priority:** Primary
- **Mechanism:** Verbatim Passthrough
- **Display:** Tagline / quote line
- **Fields:** `elevatorPitch`
- **Notes:** Already a punchy 1–2 sentence line for exactly this purpose — don't re-synthesize.
- **Implemented as:** "Elevator Pitch" (exact match).

### 3. What It Does & Solves
- **Priority:** Primary
- **Mechanism:** AI-Synthesized
- **Display:** Paragraph (2–3 sentences)
- **Fields:** `description`, `useCases`, `problemsSolved`, `valueProposition`
- **Implemented as:** "Product Overview" (renamed).

### 4. Key Capabilities
- **Priority:** Primary
- **Mechanism:** Field-Join
- **Display:** Chip list (top 5–7)
- **Fields:** `keyFeatures`
- **Implemented as:** "Key Capabilities" (exact match).

### 5. Who It's For
- **Priority:** Primary
- **Mechanism:** Field-Join
- **Display:** Short line + chip list
- **Fields:** `idealCustomer`, `icps[].name`
- **Notes:** `icps` previews the candidate segments feeding the ICP step.
- **Implemented as:** "Target Customer" (renamed).

### 6. Proof It Works
- **Priority:** Primary
- **Mechanism:** Field-Join
- **Display:** Short list + one highlighted case study card
- **Fields:** `proofPoints`, `roiMetrics`, `caseStudies` (show top items + first case study only; rest available on expand)
- **Implemented as:** "Proof Points" (renamed, simplified — no case-study card).

### 7. Competitive Snapshot
- **Priority:** Secondary (expandable)
- **Mechanism:** Field-Join
- **Display:** Chip list + badge
- **Fields:** `competitors`, `marketMaturity`
- **Implemented as:** "Competitive Snapshot" (exact match).

### 8. Deal Basics
- **Priority:** Primary
- **Mechanism:** Field-Join
- **Display:** Quick facts row
- **Fields:** `acv`, `dealType`, `contractLength`, `avgDaysToClose`
- **Implemented as:** "Commercial Terms" (renamed); content is mocked generically ("Subscription pricing, available month-to-month or annual") rather than rendering `acv`/`dealType`/`contractLength`/`avgDaysToClose`.

### 9. Objections & Switch Triggers
- **Priority:** Secondary (expandable)
- **Mechanism:** Field-Join
- **Display:** Two short lists
- **Fields:** `buyerObjections`, `switchTriggers`
- **Implemented as:** "Objections & Switch Triggers" (exact match).

### 10. Messaging Guidance — **Not Shown**
- **Priority:** Hidden – Copilot only
- **Fields:** `unsolvedImpact`, `positioningStatement`, `messagingDos`, `messagingDonts`, `objectionRebuttals`
- **Notes:** Copy-level playbook detail — surface via Copilot or the campaign-copy step.
- **Implemented as:** "Messaging Guidance" (exact match) in `hiddenSections` — one illustrative mock field rather than the full field list, per the code comment on `PSProductState`.

### 11. Extended Commercials — **Not Shown**
- **Priority:** Hidden – Copilot only
- **Fields:** `mrr`, `renewalRate`, `expansionRevenue`, `ltv`, `closeRateByStage`, `dealStakeholders`, `discountAuthority`, `paymentTerms`, `avgDealSize`, `repeatRate`, `referralRate`
- **Notes:** ⚠️ `avgDealSize`, `repeatRate`, `referralRate` are flagged in the schema itself as not present in the original field spec — candidates for a schema cleanup pass (possible overlap with `acv`/`renewalRate`). Excluded from the summary regardless of that cleanup.
- **Implemented as:** "Extended Commercials" (exact match) in `hiddenSections` — illustrative mock field only.

### 12. Additional Proof — **Not Shown**
- **Priority:** Hidden – Copilot only
- **Fields:** `industryProof`, `socialProof`
- **Implemented as:** "Additional Proof" (exact match) in `hiddenSections` — illustrative mock field only.

### 13. Scoring Input — **Not Shown**
- **Priority:** Hidden – internal only
- **Fields:** `defaultCloseRate`
- **Implemented as:** Not implemented in code.

---

## Step 3 — ICP (Ideal Customer Profile)

*Source schema: `icp.js` · 28 fields → 11 summary blocks*

*Implemented in `IcpPanel` / `IcpCandidateCard` (`src/onboarding-shell.tsx`), part of `StepProductReview`.*

> **Implementation addition not in this spec:** the code renders a page-level **"Total
> Addressable Market"** block (`tamDescription`) above the candidate list, sourced from a
> field this spec doesn't define. Treat as a gap to reconcile — either add a TAM field to
> `icp.js` and a block here, or fold it into an existing block.

### 1. Header
- **Priority:** Primary
- **Mechanism:** Field-Join
- **Display:** Header strip + badge
- **Fields:** `icpName`, `growthStage`
- **Notes:** `companySize` is a filter value and appears once, in block 3 below — not repeated here.
- **Implemented as:** Unlabeled header row (icp.name / growthStage / recommendation badge) — no section title.

### 2. Who This Is & Why They Fit
- **Priority:** Primary
- **Mechanism:** AI-Synthesized
- **Display:** Paragraph (3–4 sentences)
- **Fields:** `summary`, `fitReasoning`
- **Notes:** These already answer "who are they" and "why do they fit" separately — combine into one block.
- **Implemented as:** Unlabeled prose (summary + fitReasoning) — no section title, just two paragraphs under the header.

### 3. Firmographic Snapshot
- **Priority:** Primary
- **Mechanism:** Field-Join
- **Display:** Chip groups
- **Fields:** `targetIndustries`, `companySize`, `revenueRange`, `geographies`
- **Implemented as:** "Firmographic Snapshot" (exact match).

### 4. Pains & Goals
- **Priority:** Primary
- **Mechanism:** Field-Join
- **Display:** Two short lists, side-by-side
- **Fields:** `painPoints`, `businessGoals`
- **Notes:** Both already list-shaped and specific — join rather than smooth into prose.
- **Implemented as:** Split into two side-by-side sub-labels, "Pain Points" and "Business Goals" — not rendered as one combined "Pains & Goals" block.

### 5. Buying Signals
- **Priority:** Primary
- **Mechanism:** Field-Join
- **Display:** Two short lists
- **Fields:** `buyingTriggers`, `intentSignals`
- **Implemented as:** Split into two side-by-side sub-labels, "Buying Triggers" and "Intent Signals" — not rendered as one combined "Buying Signals" block.

### 6. Real Companies Like This
- **Priority:** Primary
- **Mechanism:** Field-Join
- **Display:** Chip list
- **Fields:** `icpProof`
- **Notes:** Named companies are the fastest trust/sanity-check signal for whether an ICP is real.
- **Implemented as:** "Real Companies Like This" (exact match).

### 7. Candidate Personas
- **Priority:** Primary
- **Mechanism:** Field-Join
- **Display:** Card list (name + description)
- **Fields:** `personas[].name`, `personas[].description`
- **Notes:** Previews Step 4 — lets the user catch a wrong persona direction early.
- **Implemented as:** Not rendered in the ICP card. The code comment on `IcpCandidateCard` explains this is deliberate: the Personas section immediately after already covers it, so it isn't duplicated here.

### 8. Market Size
- **Priority:** Secondary (expandable)
- **Mechanism:** Verbatim Passthrough
- **Display:** Short paragraph
- **Fields:** `marketSize`
- **Implemented as:** "Market Size" sub-label inside the combined card described in block 9.

### 9. Deeper Firmographics
- **Priority:** Secondary (expandable)
- **Mechanism:** Field-Join
- **Display:** Chip lists
- **Fields:** `techStack`, `businessModel`, `fundingStage`, `decisionMakingUnit`
- **Implemented as:** Merged with block 8 into one card titled **"Market Sizing & Additional Firmographics"**, with `techStack`/`businessModel`/`fundingStage`/`decisionMakingUnit` as sub-labels ("Tech Stack Signals", "Business Model", "Funding Stage", "Decision-Making Unit"). This combined title doesn't appear verbatim in this spec.

### 10. Targeting Filters — **Not Shown**
- **Priority:** Hidden – Copilot only
- **Fields:** `departmentSize`, `incumbentTools`, `outreachAccessibility`, `exclusionCriteria`, `competitiveDisplacementFit`, `useCases`, `maturity`, `operationalGoals`
- **Implemented as:** Not implemented in code.

### 11. Scoring Input — **Not Shown**
- **Priority:** Hidden – internal only
- **Fields:** `expectedCloseRate`
- **Implemented as:** Not implemented in code.

---

## Step 4 — Persona

*Source schema: `persona2.js` · 64 fields → 22 summary blocks (identical structure per persona)*

*Implemented in `PersonasPanel` (`src/onboarding-shell.tsx`), part of `StepProductReview`.*

### 1. Header
- **Priority:** Primary
- **Mechanism:** Field-Join
- **Display:** Header strip + chips
- **Fields:** `displayName`, `departments`
- **Implemented as:** Unlabeled header row (title + `roleTag` chip) — no section title; `departments` isn't rendered as chips.

### 2. Who They Are
- **Priority:** Primary
- **Mechanism:** Verbatim Passthrough
- **Display:** Paragraph (as-authored, 4–6 sentences)
- **Fields:** `summary`
- **Notes:** Already written as the overview paragraph for exactly this purpose.
- **Implemented as:** Folded into the header block as `subtitle` text — no separate section.

### 3. What They're Responsible For
- **Priority:** Primary
- **Mechanism:** Field-Join
- **Display:** Short list + KPI chips
- **Fields:** `keyResponsibility`, `successMetrics`
- **Implemented as:** "Key Responsibilities" (renamed); `successMetrics` KPI chips aren't separately represented.

### 4. Goals
- **Priority:** Primary
- **Mechanism:** Field-Join
- **Display:** Two short lists
- **Fields:** `professionalGoals`, `desiredOutcomes`
- **Implemented as:** "Goals" (exact match).

### 5. Primary Pain
- **Priority:** Primary
- **Mechanism:** Verbatim Passthrough
- **Display:** Paragraph (as-authored, 3–5 sentences)
- **Fields:** `primaryPain`
- **Notes:** The emotional core of the persona — show as-is.
- **Implemented as:** "Primary Pain" (exact match).

### 6. Current Tools
- **Priority:** Primary
- **Mechanism:** Field-Join
- **Display:** Chip list
- **Fields:** `existingTools`
- **Implemented as:** "Current Tools" (exact match).

### 7. Best Way to Reach Them
- **Priority:** Primary
- **Mechanism:** Field-Join
- **Display:** Quick facts card
- **Fields:** `bestChannel`, `bestContactTime`, `emailPreference`
- **Implemented as:** "Preferred Outreach Channels" (renamed).

### 8. Objections to Expect
- **Priority:** Primary
- **Mechanism:** Field-Join
- **Display:** Short list (phrases only, shown as quotes)
- **Fields:** `objections[].text`
- **Notes:** Rebuttals for these same objections are hidden — see block 13.
- **Implemented as:** "Anticipated Objections" (renamed).

### 9. Opening Hook
- **Priority:** Primary
- **Mechanism:** Verbatim Passthrough
- **Display:** Quoted line
- **Fields:** `outreachHook`
- **Implemented as:** "Opening Hook" (exact match).

### 10. Qualification Snapshot
- **Priority:** Secondary (expandable)
- **Mechanism:** Field-Join
- **Display:** Short list
- **Fields:** `meetingReadyCriteria`
- **Notes:** One qualification tier is enough for a sanity check; the full ladder is Copilot depth (see block 21).
- **Implemented as:** "Qualification Snapshot" (exact match).

### 11. Deeper Pain & Risk Context — **Not Shown**
- **Priority:** Hidden – Copilot only
- **Fields:** `supportingPainPoints`, `frictionPoints`, `frustrations`, `risks`, `fears`, `statusQuoCost`
- **Implemented as:** Not implemented in code.

### 12. Challenges — **Not Shown**
- **Priority:** Hidden – Copilot only
- **Fields:** `operationalChallenges`, `strategicChallenges`
- **Implemented as:** Not implemented in code.

### 13. Decision-Making Detail — **Not Shown**
- **Priority:** Hidden – Copilot only
- **Fields:** `purchasingInfluence`, `budgetOwnership`, `decisionAuthority`, `evaluationCriteria`, `objections[].rebuttalText`
- **Implemented as:** "Decision-Making Detail" (exact match) in `hiddenSections` — one illustrative mock field rather than the full field list.

### 14. Current-Solution Detail — **Not Shown**
- **Priority:** Hidden – Copilot only
- **Fields:** `workflows`, `alternatives`, `incumbentStrengths`, `switchingTriggers`, `displacementMessaging`
- **Implemented as:** Not implemented in code.

### 15. Buying Signals Detail — **Not Shown**
- **Priority:** Hidden – Copilot only
- **Fields:** `directBuyingSignals`, `indirectBuyingSignals`
- **Implemented as:** Not implemented in code.

### 16. Buyer Psychology — **Not Shown**
- **Priority:** Hidden – Copilot only
- **Fields:** `motivations`, `priorities`, `careAbout`, `nightmares`, `aspirations`
- **Implemented as:** "Buyer Psychology" (exact match) in `hiddenSections` — one illustrative mock field rather than the full field list.

### 17. Extended Messaging Guidance — **Not Shown**
- **Priority:** Hidden – Copilot only
- **Fields:** `valuePropositions`, `messagingAngles`, `emphasizeTopics`, `avoidTopics`, `toneRecommendations`, `proofPoints`, `clientWins`, `ctaRecommendations`, `ctaVariation`
- **Implemented as:** Not implemented in code.

### 18. Account Intelligence — **Not Shown**
- **Priority:** Hidden – Copilot only
- **Fields:** `subPersonas`, `winLossPatterns`
- **Implemented as:** Not implemented in code.

### 19. Prospecting & Search Detail — **Not Shown**
- **Priority:** Hidden – Copilot only
- **Fields:** `jobTitleVariations`, `relatedTitles`, `seniorityLevels`, `exampleJobTitles`, `linkedinTitles`
- **Implemented as:** Not implemented in code.

### 20. Extended Outreach Strategy — **Not Shown**
- **Priority:** Hidden – Copilot only
- **Fields:** `emailResponsePattern`, `sequenceStrategy`, `linkedinActivity`, `phoneAccessibility`
- **Implemented as:** Not implemented in code.

### 21. Remaining Qualification Tiers — **Not Shown**
- **Priority:** Hidden – Copilot only
- **Fields:** `interestedCriteria`, `warmCriteria`, `notNowCriteria`, `deadCriteria`
- **Implemented as:** Not implemented in code.

### 22. Scoring Input — **Not Shown**
- **Priority:** Hidden – internal only
- **Fields:** `roleFamily`
- **Implemented as:** Not implemented in code.

---

## Implementation status

Reconciled against the wizard code (`src/onboarding-shell.tsx`) on 2026-08-26, resolving open
item 3 below. Summary of the pattern across all four steps:

- **Renamed:** roughly half of all Primary/Secondary blocks render under different copy than
  this spec's block titles (e.g. "What You Sell" → "Products & Offerings", "Best Way to Reach
  Them" → "Preferred Outreach Channels"). See each block's **Implemented as** line for the
  exact rendered title.
- **Restructured:** ICP blocks 4 and 5 (spec: one combined block each) are each split into two
  side-by-side sub-labels in code. ICP blocks 8 and 9 (spec: two separate Secondary blocks) are
  merged into one card, "Market Sizing & Additional Firmographics."
  ICP also renders a page-level "Total Addressable Market" block that isn't defined anywhere in
  this spec.
  Company's Header Strip is renamed and no longer repeats `name`. ICP's "Candidate Personas"
  (block 7) is intentionally *not* rendered inside the ICP card — deferred to the Personas step.
- **Visibility:** Secondary blocks are no longer collapsed behind "show more" anywhere in the
  wizard — see the note under [Priority tiers](#priority-tiers).
- **Hidden – Copilot only coverage:** only 5 of this spec's ~20 Hidden – Copilot only blocks
  have any code representation, and those 5 (Product's Messaging Guidance / Extended
  Commercials / Additional Proof; Persona's Decision-Making Detail / Buyer Psychology) are each
  a single illustrative mock field rather than their full field list.
- **Hidden – internal only:** none of the four scoring-input blocks (Company block 10, Product
  block 13, ICP block 11, Persona block 22) are implemented — there's no scoring logic in the
  wizard yet.

This is a snapshot, not a source of truth — re-check against the code before relying on it for
scope decisions, and update the affected **Implemented as** lines whenever the wizard changes.

---

## Open items to resolve before/during implementation

1. **Company.dreamCustomer** — confirm suppressing it from the Company step (in favor of ICP.fitReasoning/summary) is the right call, vs. showing a short version.
2. **Product schema cleanup** — decide whether to consolidate `avgDealSize`/`repeatRate`/`referralRate` with existing fields (`acv`, `renewalRate`) or keep them as-is but Copilot-only.
3. ~~**Reconcile against existing UI** — this spec should be checked against the wizard screens already built, to catch any block/field mismatches before implementation.~~ **Resolved 2026-08-26** — see the per-block **Implemented as** lines and the [Implementation status](#implementation-status) section above.
4. **ICP's Total Addressable Market block** — the wizard renders this but this spec doesn't define a source field for it (see the note at the top of Step 3). Either add it to `icp.js` and this spec, or remove it from the wizard.
