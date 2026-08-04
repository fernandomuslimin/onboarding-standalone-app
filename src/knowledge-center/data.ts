/* ════════════════════════════════════════════════════════════════════
   Knowledge Center — types & mock data
   All content below is seed/demo data for a fictional customer of the
   onboarding flow (an AI-assisted outbound sales platform), consistent
   in tone with the research shown earlier in onboarding.
══════════════════════════════════════════════════════════════════════ */

export type NavKey =
  | "company" | "explorer"
  | "scoring" | "campaign" | "strategy"
  | "resources";

export interface NavItem { key: NavKey; label: string }
export interface NavGroup { label: string; items: NavItem[] }

export const NAV_GROUPS: NavGroup[] = [
  { label: "Research", items: [
    { key: "company", label: "Company" },
    { key: "explorer", label: "Explorer" },
  ] },
  { label: "Planning", items: [
    { key: "scoring", label: "Scoring" },
    { key: "campaign", label: "Campaign" },
    { key: "strategy", label: "Strategy" },
  ] },
  { label: "Resources", items: [
    { key: "resources", label: "Resources" },
  ] },
];

export const NAV_LABEL: Record<NavKey, string> = {
  company: "Company", explorer: "Explorer",
  scoring: "Scoring", campaign: "Campaign", strategy: "Strategy", resources: "Resources",
};

// Sections that show the "x/y reviewed" progress indicator in the top bar.
export const REVIEWABLE_SECTIONS: NavKey[] = ["company", "explorer"];

/* ─── Company ───────────────────────────────────────────────────── */
export interface CompanyProfile {
  companyName: string;
  website: string;
  category: string;
  companySize: string;
  annualRevenue: string;
  elevatorPitch: string;
  productServiceSummary: string;
  weHelp: string;
  whoStruggleWith: string;
  byProviding: string;
  unlike: string;
  weUniquely: string;
  coreProblem: string;
  differentiators: string;
  buyingMotion: string;
  proof: string;
  dreamCustomer: string;
  industries: string[];
  products: string[];
  competitors: string[];
  keySellingPoints: string[];
  trustRisksObjections: string[];
  notableCustomers: string[];
  dealOverview: string;
  salesCycle: string;
}

export const COMPANY_CONFIDENCE: Partial<Record<keyof CompanyProfile, number>> = {
  category: 96, companySize: 82, annualRevenue: 64,
  coreProblem: 91, differentiators: 88, buyingMotion: 77, proof: 69, dreamCustomer: 85,
  industries: 90, competitors: 93, trustRisksObjections: 71,
};

export const COMPANY_PROFILE: CompanyProfile = {
  companyName: "B2B Rocket",
  website: "b2brocket.ai",
  category: "Sales & Marketing Outreach Software",
  companySize: "51–200 employees",
  annualRevenue: "$8M–$15M ARR",
  elevatorPitch: "B2B Rocket gets outbound sales teams sending personalized, AI-assisted sequences the same day they sign up — no weeks-long setup, no manual copywriting.",
  productServiceSummary: "An AI-native outbound sending platform that handles domain/mailbox provisioning, warmup, personalization, and multi-channel sequencing (email, LinkedIn, cold calling) from one workspace.",
  weHelp: "B2B sales teams and agencies running outbound at volume",
  whoStruggleWith: "manual prospecting and personalization that doesn't scale past a handful of reps",
  byProviding: "AI-drafted, personalized sequences plus done-for-you infrastructure (domains, mailboxes, warmup) so teams can send the same day",
  unlike: "legacy sales-engagement tools that take weeks to configure and still require manually written copy",
  weUniquely: "combine infrastructure automation with AI personalization in a single workspace, so time-to-first-send is measured in hours, not weeks",
  coreProblem: "Reps spend hours per week hand-personalizing outreach, and quality drops as volume increases — pipeline generation stalls well below quota.",
  differentiators: "Same-day sending infrastructure, AI personalization built into the core workflow (not bolted on), and multi-sender/multi-domain scaling without added headcount.",
  buyingMotion: "Product-led trial for smaller teams, sales-assisted for mid-market accounts with multiple stakeholders (VP Sales + RevOps).",
  proof: "Reference customers report 2–3x reply rates within the first 30 days versus manually written sequences.",
  dreamCustomer: "A mid-market B2B SaaS company with 5–20 reps running outbound who wants to scale volume without scaling headcount or losing message quality.",
  industries: ["B2B SaaS", "Sales & marketing technology", "Professional services", "Fintech"],
  products: ["Outbound Sending Platform", "AI Personalization Engine", "Infrastructure & Deliverability"],
  competitors: ["Outreach", "Apollo", "Instantly", "Smartlead"],
  keySellingPoints: ["Same-day time-to-first-send", "AI personalization at scale", "Multi-sender/domain scaling", "Done-for-you infrastructure"],
  trustRisksObjections: ["\"We already have a sales engagement tool\"", "\"Will AI-written copy sound generic?\"", "Deliverability concerns at high volume"],
  notableCustomers: ["Northwind Analytics", "Fernway Health", "Cedar & Co Consulting"],
  dealOverview: "Typical deal starts as a self-serve or lightly-assisted trial on one sending package, expanding to additional seats, domains, and channels (LinkedIn, cold calling) once initial reply-rate lift is proven.",
  salesCycle: "2–3 weeks for self-serve/mid-market; 4–6 weeks when a security review or multi-stakeholder procurement is involved on larger accounts.",
};

/* ─── Product ───────────────────────────────────────────────────── */
export interface ProductField { label: string; value: string | string[]; confidence?: number }
export interface ProductDetail {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  matchPct: number;
  fields: ProductField[];
}

export const PRODUCTS: ProductDetail[] = [
  {
    id: "sending-platform",
    name: "Outbound Sending Platform",
    subtitle: "Core multi-channel outbound product",
    description: "The core workspace for planning, personalizing, and sending outbound sequences across email, LinkedIn, and cold calling.",
    matchPct: 94,
    fields: [
      { label: "Category", value: "Sales engagement / outbound automation", confidence: 95 },
      { label: "Use Cases", value: ["Cold email at scale", "Multi-channel sequencing", "Rep onboarding & ramp"], confidence: 88 },
      { label: "Key Features", value: ["AI-personalized sequences", "Multi-sender rotation", "Built-in warmup", "Reply detection & auto-pause"] },
      { label: "Problems Solved", value: ["Manual personalization doesn't scale", "Deliverability drops at volume", "Slow time-to-first-send"], confidence: 90 },
      { label: "Value Proposition", value: "Get reps sending personalized sequences the same day, without adding headcount or a setup team." },
      { label: "Time To Value", value: "Same day for first send; 2–3 weeks to full sender ramp", confidence: 82 },
      { label: "Ideal Customer", value: "B2B teams with 5–20 reps running structured outbound" },
      { label: "Market Maturity", value: "Growth stage — category is well established, still consolidating" },
      { label: "Competitors", value: ["Outreach", "Salesloft", "Instantly"] },
      { label: "Buyer Objections", value: ["\"We already have a sales engagement tool\"", "\"Our reps won't adopt another tool\""] },
      { label: "Switch Triggers", value: ["Reply rates plateau on current tool", "Rep headcount grows faster than manual personalization can scale"] },
      { label: "Deal Type", value: "Subscription, seat + volume based" },
      { label: "ACV", value: "$18,000" },
      { label: "MRR", value: "$1,500 avg. per account" },
      { label: "Contract Length", value: "Annual, with monthly self-serve option" },
      { label: "Renewal Rate", value: "91%", confidence: 74 },
      { label: "LTV", value: "$54,000 (3-yr avg.)" },
      { label: "Proof Points", value: ["2–3x reply rate lift in first 30 days", "Same-day sending on 87% of new accounts"] },
      { label: "ROI Metrics", value: ["Hours saved per rep per week", "Cost per meeting booked"] },
      { label: "Case Studies", value: ["Northwind Analytics — 3x pipeline in 60 days", "Cedar & Co — cut SDR ramp time in half"] },
      { label: "Industry / Social Proof", value: "Featured in G2's Sales Engagement category, 4.6/5 across 200+ reviews", confidence: 80 },
      { label: "Objection Rebuttals", value: ["\"Migration takes one afternoon, not weeks\"", "\"AI drafts stay on-brand — reps approve before send\""] },
      { label: "Unsolved Impact", value: "Reps still lose time qualifying replies manually before booking" },
      { label: "Elevator Pitch", value: "Personalized, multi-channel outbound sending the same day you sign up." },
      { label: "Positioning Statement", value: "For B2B sales teams outgrowing manual outreach, the Outbound Sending Platform is the fastest way to scale personalized sequences without adding headcount." },
      { label: "Messaging Do's", value: ["Lead with time-to-first-send", "Use concrete reply-rate numbers"] },
      { label: "Messaging Don'ts", value: ["Don't claim to fully replace reps", "Avoid vague \"AI-powered\" claims without specifics"] },
      { label: "Messaging Hooks", value: ["\"Sending the same day you sign up\"", "\"Stop copy-pasting the same three templates\""] },
      { label: "Tagged Case Studies", value: ["Northwind Analytics — #midmarket #saas", "Cedar & Co — #agency #consulting"] },
    ],
  },
  {
    id: "personalization-engine",
    name: "AI Personalization Engine",
    subtitle: "Sequence drafting & personalization layer",
    description: "AI layer that drafts and personalizes sequence copy per-recipient using firmographic and signal data.",
    matchPct: 87,
    fields: [
      { label: "Category", value: "AI content generation / sales copy", confidence: 91 },
      { label: "Use Cases", value: ["Per-recipient personalization at scale", "Tone/brand-voice consistency across reps"] },
      { label: "Key Features", value: ["Signal-based personalization", "Brand voice guardrails", "One-click regenerate"] },
      { label: "Problems Solved", value: ["Generic templated copy converts poorly", "Reps write inconsistent messaging"] },
      { label: "Value Proposition", value: "Personalized copy in seconds without sounding like a template." },
      { label: "Time To Value", value: "Immediate — enabled by default on every sequence" },
      { label: "Ideal Customer", value: "Teams sending 500+ emails/week who can't personalize manually" },
      { label: "Market Maturity", value: "Emerging — most competitors bolt this on rather than build it in" },
      { label: "Competitors", value: ["Lavender", "Copy.ai (sales use case)"] },
      { label: "Buyer Objections", value: ["\"Will AI-written copy sound generic?\""] },
      { label: "Switch Triggers", value: ["Reply rates plateau", "Rep team can no longer personalize manually at current volume"] },
      { label: "Deal Type", value: "Bundled with sending platform; add-on for other tools" },
      { label: "ACV", value: "$6,000 (add-on)" },
      { label: "MRR", value: "$500 avg." },
      { label: "Contract Length", value: "Co-terms with sending platform" },
      { label: "Renewal Rate", value: "89%" },
      { label: "LTV", value: "$18,000 (3-yr avg.)" },
      { label: "Proof Points", value: ["Reduces copywriting time ~70%"] },
      { label: "ROI Metrics", value: ["Reply rate lift", "Copywriting hours saved"] },
      { label: "Case Studies", value: ["Fernway Health — 70% less time drafting sequences"] },
      { label: "Industry / Social Proof", value: "Cited in 3 industry outbound benchmarking reports" },
      { label: "Objection Rebuttals", value: ["\"Every draft is reviewable and editable before send\""] },
      { label: "Unsolved Impact", value: "Doesn't yet personalize follow-up calls, only written channels" },
      { label: "Elevator Pitch", value: "AI that drafts on-brand, personalized copy for every recipient." },
      { label: "Positioning Statement", value: "For teams who can't personalize at volume, the Personalization Engine turns signal data into on-brand copy automatically." },
      { label: "Messaging Do's", value: ["Show a before/after example"] },
      { label: "Messaging Don'ts", value: ["Don't over-promise fully autonomous writing"] },
      { label: "Messaging Hooks", value: ["\"Stop sounding like a template\""] },
      { label: "Tagged Case Studies", value: ["Fernway Health — #healthcare"] },
    ],
  },
  {
    id: "infra-deliverability",
    name: "Infrastructure & Deliverability",
    subtitle: "Domains, mailboxes, and warmup",
    description: "Automated domain and mailbox provisioning plus warmup to protect sender reputation at scale.",
    matchPct: 79,
    fields: [
      { label: "Category", value: "Email infrastructure / deliverability" },
      { label: "Use Cases", value: ["Multi-domain provisioning", "Automated mailbox warmup"] },
      { label: "Key Features", value: ["Auto domain purchase & DNS setup", "Warmup scheduler", "Reputation monitoring"] },
      { label: "Problems Solved", value: ["Manual domain/DNS setup takes days", "Cold sending damages sender reputation"] },
      { label: "Value Proposition", value: "Infrastructure that scales with sending volume without manual DevOps work." },
      { label: "Time To Value", value: "Domains live within hours; full warmup in 14 days" },
      { label: "Ideal Customer", value: "Teams scaling past a handful of sending mailboxes" },
      { label: "Market Maturity", value: "Mature — commoditizing, differentiation is automation depth" },
      { label: "Competitors", value: ["Mailscale", "Warmup Inbox"] },
      { label: "Buyer Objections", value: ["Deliverability concerns at high volume"] },
      { label: "Switch Triggers", value: ["Domain reputation issues on current provider"] },
      { label: "Deal Type", value: "Bundled by package tier (Starter/Growth/Scale)" },
      { label: "ACV", value: "Included in package pricing" },
      { label: "MRR", value: "N/A — bundled" },
      { label: "Contract Length", value: "Co-terms with sending platform" },
      { label: "Renewal Rate", value: "94%" },
      { label: "LTV", value: "N/A — bundled" },
      { label: "Proof Points", value: ["99.1% inbox placement across warmed domains"] },
      { label: "ROI Metrics", value: ["Setup hours saved", "Inbox placement rate"] },
      { label: "Case Studies", value: ["Cedar & Co — zero deliverability incidents across 12 client domains"] },
      { label: "Industry / Social Proof", value: "Referenced in deliverability best-practice guides" },
      { label: "Objection Rebuttals", value: ["\"Warmup is automatic and monitored daily\""] },
      { label: "Unsolved Impact", value: "Doesn't cover phone number reputation for cold calling yet" },
      { label: "Elevator Pitch", value: "Domains, mailboxes, and warmup — handled for you." },
      { label: "Positioning Statement", value: "For teams scaling sending volume, infrastructure is provisioned and protected automatically." },
      { label: "Messaging Do's", value: ["Lead with inbox placement rate"] },
      { label: "Messaging Don'ts", value: ["Don't understate the 14-day warmup window"] },
      { label: "Messaging Hooks", value: ["\"Deliverability, handled\""] },
      { label: "Tagged Case Studies", value: ["Cedar & Co — #agency"] },
    ],
  },
];

/* ─── ICP ───────────────────────────────────────────────────────── */
export const COMPANY_SIZE_BUCKETS = ["1–50", "51–200", "201–1,000", "1,001–5,000", "5,000+"];
export const FUNDING_STAGE_BUCKETS = ["Bootstrapped", "Seed", "Series A", "Series B", "Series C+", "Public"];

export interface IcpDetail {
  id: string;
  name: string;
  industryTag: string;
  matchPct: number;
  productId: string;
  summary: string;
  fitReasoning: string;
  buyingTriggers: string[];
  exclusionCriteria: string[];
  targetIndustries: string[];
  companySizes: string[];
  revenueRange: string;
  geographies: string[];
  fundingStages: string[];
  growthStage: string;
  businessModel: string;
  techStackSignals: string[];
  decisionMakingUnit: string;
  painPoints: string[];
  businessGoals: string[];
  operationalGoals: string[];
  useCases: string[];
  exampleCompanies: string[];
  competitiveDisplacementFitPct: number;
  maturityPct: number;
  intentSignals: string[];
  incumbentTools: string[];
  departmentSize: string;
  outreachAccessibility: string;
  marketSizePct: number;
  confidence?: Partial<Record<string, number>>;
}

export const ICPS: IcpDetail[] = [
  {
    id: "vp-sales-midmarket",
    name: "VP Sales / Head of RevOps — Mid-Market B2B",
    industryTag: "B2B SaaS",
    matchPct: 92,
    productId: "sending-platform",
    summary: "Mid-market B2B teams running multi-sender outbound who need faster time-to-send without adding headcount.",
    fitReasoning: "Closest match to the core use case — owns outbound quota, actively evaluating tools to replace manual prospecting, and holds budget authority.",
    buyingTriggers: ["Missed a quarterly pipeline target", "Just hired new reps who need to ramp fast", "Existing tool's reply rates have plateaued"],
    exclusionCriteria: ["No dedicated outbound function", "Sub-10 employee team"],
    targetIndustries: ["B2B SaaS", "Sales & marketing technology", "Professional services"],
    companySizes: ["51–200", "201–1,000"],
    revenueRange: "$5M–$50M ARR",
    geographies: ["North America", "UK & Ireland"],
    fundingStages: ["Series A", "Series B"],
    growthStage: "Growth",
    businessModel: "B2B SaaS, subscription",
    techStackSignals: ["Salesforce or HubSpot CRM", "LinkedIn Sales Navigator", "An existing sales engagement tool being outgrown"],
    decisionMakingUnit: "VP Sales (economic buyer) + Head of RevOps (technical evaluator)",
    painPoints: ["Reps spend hours per week manually personalizing outreach", "Quality drops as sending volume increases"],
    businessGoals: ["Hit pipeline targets without adding headcount", "Consistent messaging across a growing rep team"],
    operationalGoals: ["Reduce ramp time for new reps", "Standardize sequence quality across the team"],
    useCases: ["Replace manual prospecting workflow", "Onboard new reps faster"],
    exampleCompanies: ["Northwind Analytics", "Vantage Metrics", "Coretech Software"],
    competitiveDisplacementFitPct: 78,
    maturityPct: 84,
    intentSignals: ["Job posting for SDR/BDR roles", "Recent Series B raise", "Current tool contract renewal within 90 days"],
    incumbentTools: ["Outreach", "Salesloft"],
    departmentSize: "8–25 reps",
    outreachAccessibility: "High — active on LinkedIn, responsive to peer benchmarking data",
    marketSizePct: 46,
    confidence: { fitReasoning: 90, competitiveDisplacementFitPct: 72, marketSizePct: 68 },
  },
  {
    id: "founder-led-startup",
    name: "Founder-Led Sales — Early-Stage Startup",
    industryTag: "Early-Stage SaaS",
    matchPct: 74,
    productId: "sending-platform",
    summary: "Small teams wearing multiple hats who need to move fast on outbound without a dedicated SDR function.",
    fitReasoning: "Values low setup friction over deep customization; price-sensitive and favors usage-based plans.",
    buyingTriggers: ["Just raised a seed round and needs to show pipeline", "Manual outbound isn't keeping up with target account list"],
    exclusionCriteria: ["Pre-product / no paying customers yet"],
    targetIndustries: ["Early-stage B2B SaaS", "Technical founder-led sales"],
    companySizes: ["1–50"],
    revenueRange: "Pre-revenue – $2M ARR",
    geographies: ["North America"],
    fundingStages: ["Seed", "Series A"],
    growthStage: "Early",
    businessModel: "B2B SaaS, usage or seat-based",
    techStackSignals: ["Lightweight or no CRM yet", "Founder still doing outbound personally"],
    decisionMakingUnit: "Founder (sole decision-maker)",
    painPoints: ["Founder personally writing every outbound email"],
    businessGoals: ["Show pipeline to investors", "Land first 10 reference customers"],
    operationalGoals: ["Get outbound live with minimal setup time"],
    useCases: ["Founder-led outbound without hiring an SDR"],
    exampleCompanies: ["Basecamp Robotics", "LoopWorks", "Fielder"],
    competitiveDisplacementFitPct: 41,
    maturityPct: 52,
    intentSignals: ["Recent seed announcement", "First sales hire job posting"],
    incumbentTools: ["Manual Gmail/Outlook", "Spreadsheet prospect list"],
    departmentSize: "1 (founder)",
    outreachAccessibility: "Medium — reachable but time-constrained",
    marketSizePct: 31,
  },
  {
    id: "agency-fractional-sdr",
    name: "Agency / Fractional SDR Teams",
    industryTag: "Agency",
    matchPct: 58,
    productId: "infra-deliverability",
    summary: "Runs outbound for multiple clients and needs to standardize quality without a separate setup per account.",
    fitReasoning: "Could adopt per-client, but requires multi-workspace support that may not be a priority yet.",
    buyingTriggers: ["Onboarding a new client and need outbound live fast", "A client complained about inconsistent messaging quality"],
    exclusionCriteria: ["Single-client agencies with no growth plan"],
    targetIndustries: ["B2B lead generation agencies", "Fractional SDR / outsourced sales teams"],
    companySizes: ["1–50", "51–200"],
    revenueRange: "$1M–$10M revenue",
    geographies: ["North America", "Western Europe"],
    fundingStages: ["Bootstrapped"],
    growthStage: "Steady",
    businessModel: "Services, managed accounts",
    techStackSignals: ["Multiple sending tools chosen per client", "Client reporting spreadsheets or dashboards"],
    decisionMakingUnit: "Agency owner / operations lead",
    painPoints: ["Standing up outbound per client takes real setup time", "Quality varies by which junior SDR writes copy"],
    businessGoals: ["Protect margin on fixed-fee engagements"],
    operationalGoals: ["Standardize quality across every client account"],
    useCases: ["Multi-client workspace management"],
    exampleCompanies: ["Cedar & Co Consulting", "OutboundWorks Agency"],
    competitiveDisplacementFitPct: 22,
    maturityPct: 35,
    intentSignals: ["Client roster growth past 10 accounts"],
    incumbentTools: ["Mixed sending tools per client"],
    departmentSize: "5–20 client accounts managed",
    outreachAccessibility: "Low — not yet actively evaluating",
    marketSizePct: 12,
  },
];

/* ─── Tree helpers (Product → ICP → Persona) ───────────────────── */
export type TreeNodeType = "product" | "icp" | "persona";

export function treeKey(type: TreeNodeType, id: string): string {
  return `${type}:${id}`;
}

export function icpsForProduct(productId: string, icps: IcpDetail[] = ICPS): IcpDetail[] {
  return icps.filter((i) => i.productId === productId);
}

export function personasForIcp(icpId: string, personas: PersonaDetail[] = PERSONAS): PersonaDetail[] {
  return personas.filter((p) => p.icpId === icpId);
}

/* ─── Persona ───────────────────────────────────────────────────── */
export interface PersonaField { label: string; value: string | string[]; confidence?: number }
export interface PersonaSection { heading: string; fields: PersonaField[] }
export interface PersonaDetail {
  id: string;
  name: string;
  department: string;
  matchPct: number;
  icpId: string;
  subtitle: string;
  sections: PersonaSection[];
}

export const PERSONAS: PersonaDetail[] = [
  {
    id: "vp-sales-revops",
    name: "VP Sales / Head of RevOps",
    department: "Sales",
    matchPct: 92,
    icpId: "vp-sales-midmarket",
    subtitle: "Owns the outbound quota and is judged on pipeline generated, not activity.",
    sections: [
      { heading: "Overview", fields: [
        { label: "Role Summary", value: "Owns outbound pipeline generation for a growing mid-market sales org.", confidence: 90 },
        { label: "Reports To", value: "CRO or CEO" },
        { label: "Team Size Managed", value: "8–25 reps" },
      ] },
      { heading: "Responsibilities", fields: [
        { label: "Core Responsibilities", value: ["Own pipeline generation targets", "Hire and ramp new reps", "Select and manage sales tooling"] },
      ] },
      { heading: "Goals", fields: [
        { label: "Primary Goal", value: "Hit quarterly pipeline targets without adding headcount", confidence: 85 },
        { label: "Secondary Goals", value: ["Improve rep ramp time", "Keep messaging consistent across the team"] },
      ] },
      { heading: "Pain Points", fields: [
        { label: "Primary Pain", value: "Reps spend hours per week hand-personalizing outreach, and quality drops as volume increases." },
        { label: "Secondary Pains", value: ["Inconsistent messaging across reps", "New reps take too long to ramp"] },
      ] },
      { heading: "Challenges", fields: [
        { label: "Organizational Challenges", value: ["Budget scrutiny on new tool spend", "Rep adoption resistance to new tools"] },
      ] },
      { heading: "Decision Making", fields: [
        { label: "Role In Decision", value: "Economic buyer — final approval" },
        { label: "Other Stakeholders", value: ["Head of RevOps (technical evaluation)", "Reps (adoption feedback)"] },
      ] },
      { heading: "Current Solutions", fields: [
        { label: "Tools In Use", value: ["Outreach or Salesloft", "Salesforce/HubSpot CRM"] },
        { label: "Satisfaction Level", value: "Moderate — plateaued reply rates" },
      ] },
      { heading: "Buying Behavior", fields: [
        { label: "Evaluation Style", value: "Runs a structured pilot with 2–3 reps before full rollout" },
        { label: "Budget Cycle", value: "Approves within quarterly tooling budget" },
      ] },
      { heading: "Buyer Psychology", fields: [
        { label: "Primary Motivator", value: "Fear of missing pipeline targets" },
        { label: "Risk Tolerance", value: "Moderate — wants proof before full commitment", confidence: 66 },
      ] },
      { heading: "Messaging Guidance", fields: [
        { label: "Opening Hook", value: "Your reps are spending hours a week hand-personalizing emails and still missing quota. AI can draft it in seconds without sounding generic — worth a look?" },
        { label: "CTA Style", value: "Request a 15-minute demo" },
        { label: "Objections They Raise", value: ["\"We already have a sales engagement platform\"", "\"Our reps won't adopt another tool\""] },
      ] },
      { heading: "Account Intelligence", fields: [
        { label: "Trigger Events", value: ["Missed a quarterly pipeline target", "Just hired new reps who need to ramp fast"] },
        { label: "Tech Stack Signals", value: ["Salesforce or HubSpot CRM", "LinkedIn Sales Navigator"] },
      ] },
      { heading: "Prospecting & Search", fields: [
        { label: "Search Keywords", value: ["\"VP Sales\"", "\"Head of Revenue Operations\"", "\"Head of RevOps\""] },
        { label: "Firmographic Filters", value: "51–1,000 employees, B2B SaaS" },
      ] },
      { heading: "Representative Examples", fields: [
        { label: "Example Accounts", value: ["Northwind Analytics", "Vantage Metrics"] },
      ] },
      { heading: "Outreach Strategy", fields: [
        { label: "Best Channel", value: "Email primary, LinkedIn for warm-up" },
        { label: "Best Time To Reach", value: "Tuesday–Thursday, 8–10am local time" },
      ] },
      { heading: "Qualification", fields: [
        { label: "Warm Lead", value: "Asked about pricing or replied requesting more detail on personalization quality." },
        { label: "Meeting-Ready", value: "Explicitly asked for a demo and mentioned a specific pipeline target or rep count." },
      ] },
    ],
  },
  {
    id: "founder-first-hire",
    name: "Founder or First Sales Hire",
    department: "Founder / Sales",
    matchPct: 74,
    icpId: "founder-led-startup",
    subtitle: "Wearing multiple hats with no dedicated SDR — needs outbound running without setup overhead.",
    sections: [
      { heading: "Overview", fields: [
        { label: "Role Summary", value: "Self-serve buyer running outbound personally at an early-stage startup." },
        { label: "Reports To", value: "N/A — founder" },
      ] },
      { heading: "Responsibilities", fields: [
        { label: "Core Responsibilities", value: ["Run all outbound personally", "Close first reference customers"] },
      ] },
      { heading: "Goals", fields: [
        { label: "Primary Goal", value: "Get outbound live fast with minimal setup" },
      ] },
      { heading: "Pain Points", fields: [
        { label: "Primary Pain", value: "Personally writing every outbound email, which doesn't scale past a handful of prospects a day." },
      ] },
      { heading: "Challenges", fields: [
        { label: "Constraints", value: ["Tight pre-revenue budget", "No time to configure complex tooling"] },
      ] },
      { heading: "Decision Making", fields: [
        { label: "Role In Decision", value: "Sole decision-maker" },
      ] },
      { heading: "Current Solutions", fields: [
        { label: "Tools In Use", value: ["Manual emails from a personal inbox", "Spreadsheet-based prospect list"] },
      ] },
      { heading: "Buying Behavior", fields: [
        { label: "Evaluation Style", value: "Self-serve signup, decides same-week" },
      ] },
      { heading: "Buyer Psychology", fields: [
        { label: "Primary Motivator", value: "Need to show pipeline to investors" },
      ] },
      { heading: "Messaging Guidance", fields: [
        { label: "Opening Hook", value: "Still writing every cold email yourself? Get AI-personalized sequences live today, no setup team required." },
        { label: "CTA Style", value: "Easy yes/no reply" },
      ] },
      { heading: "Account Intelligence", fields: [
        { label: "Trigger Events", value: ["Just raised a seed round", "Manual outbound isn't keeping up with target list"] },
      ] },
      { heading: "Prospecting & Search", fields: [
        { label: "Search Keywords", value: ["\"Founder\"", "\"Co-Founder\"", "\"Head of Growth\""] },
      ] },
      { heading: "Representative Examples", fields: [
        { label: "Example Accounts", value: ["Basecamp Robotics", "LoopWorks"] },
      ] },
      { heading: "Outreach Strategy", fields: [
        { label: "Best Channel", value: "Email and LinkedIn DM" },
        { label: "Best Time To Reach", value: "Evenings or early morning" },
      ] },
      { heading: "Qualification", fields: [
        { label: "Warm Lead", value: "Signed up for a trial or asked about self-serve pricing." },
        { label: "Meeting-Ready", value: "Mentioned a specific launch or fundraising timeline driving urgency." },
      ] },
    ],
  },
  {
    id: "agency-owner",
    name: "Agency Owner",
    department: "Operations",
    matchPct: 58,
    icpId: "agency-fractional-sdr",
    subtitle: "Runs outbound for multiple clients and needs to standardize quality without a separate setup per account.",
    sections: [
      { heading: "Overview", fields: [
        { label: "Role Summary", value: "Manages the tool stack and quality bar across every client account." },
      ] },
      { heading: "Responsibilities", fields: [
        { label: "Core Responsibilities", value: ["Manage client outbound quality", "Own vendor selection across accounts"] },
      ] },
      { heading: "Goals", fields: [
        { label: "Primary Goal", value: "Consistent quality across every client without per-client setup" },
      ] },
      { heading: "Pain Points", fields: [
        { label: "Primary Pain", value: "Standing up outbound for each new client takes real setup time; quality varies by junior SDR." },
      ] },
      { heading: "Challenges", fields: [
        { label: "Constraints", value: ["Cost must work across the whole client roster", "Clients are on different tools already"] },
      ] },
      { heading: "Decision Making", fields: [
        { label: "Role In Decision", value: "Owner or operations lead — final say" },
      ] },
      { heading: "Current Solutions", fields: [
        { label: "Tools In Use", value: ["Mixed sending tools chosen per client", "Manual QA process for outbound copy"] },
      ] },
      { heading: "Buying Behavior", fields: [
        { label: "Evaluation Style", value: "Requests a no-prep trial run on one client before rollout" },
      ] },
      { heading: "Buyer Psychology", fields: [
        { label: "Primary Motivator", value: "Protecting margin on fixed-fee engagements" },
      ] },
      { heading: "Messaging Guidance", fields: [
        { label: "Opening Hook", value: "Standardize outbound quality across every client account — AI-personalized sequences without a per-client setup project." },
        { label: "CTA Style", value: "Offer a no-prep trial run on one client" },
      ] },
      { heading: "Account Intelligence", fields: [
        { label: "Trigger Events", value: ["Onboarding a new client", "A client complained about inconsistent messaging"] },
      ] },
      { heading: "Prospecting & Search", fields: [
        { label: "Search Keywords", value: ["\"Agency Owner\"", "\"Fractional SDR\""] },
      ] },
      { heading: "Representative Examples", fields: [
        { label: "Example Accounts", value: ["Cedar & Co Consulting", "OutboundWorks Agency"] },
      ] },
      { heading: "Outreach Strategy", fields: [
        { label: "Best Channel", value: "Email and LinkedIn, multi-channel" },
        { label: "Best Time To Reach", value: "Weekday mid-morning or early afternoon" },
      ] },
      { heading: "Qualification", fields: [
        { label: "Warm Lead", value: "Asked about multi-client or per-seat pricing." },
        { label: "Meeting-Ready", value: "Confirmed active client count and a specific onboarding timeline." },
      ] },
    ],
  },
  {
    id: "head-of-revops",
    name: "Head of Revenue Operations",
    department: "Revenue Operations",
    matchPct: 88,
    icpId: "vp-sales-midmarket",
    subtitle: "Technical evaluator who owns the tool stack — judges on data hygiene, integration depth, and admin overhead.",
    sections: [
      { heading: "Overview", fields: [
        { label: "Role Summary", value: "Owns the revenue tech stack and the data flowing through it; evaluates every new tool before it reaches reps.", confidence: 88 },
        { label: "Reports To", value: "VP Sales or CRO" },
        { label: "Team Size Managed", value: "2–5 ops analysts" },
      ] },
      { heading: "Responsibilities", fields: [
        { label: "Core Responsibilities", value: ["Own CRM data integrity", "Evaluate and administer sales tooling", "Report pipeline accuracy to leadership"] },
      ] },
      { heading: "Goals", fields: [
        { label: "Primary Goal", value: "Consolidate the stack without losing reporting fidelity", confidence: 84 },
        { label: "Secondary Goals", value: ["Cut admin time per tool", "Keep attribution clean across channels"] },
      ] },
      { heading: "Pain Points", fields: [
        { label: "Primary Pain", value: "Every new outbound tool writes messy data back into the CRM, breaking pipeline reporting." },
        { label: "Secondary Pains", value: ["Manual sync between sending tool and CRM", "No single view of sequence performance"] },
      ] },
      { heading: "Challenges", fields: [
        { label: "Organizational Challenges", value: ["Asked to cut tool spend while adding capability", "Reps bypass process when tooling is clunky"] },
      ] },
      { heading: "Decision Making", fields: [
        { label: "Role In Decision", value: "Technical evaluator — can veto, rarely signs" },
        { label: "Other Stakeholders", value: ["VP Sales (economic buyer)", "IT/Security for review"] },
      ] },
      { heading: "Current Solutions", fields: [
        { label: "Tools In Use", value: ["Salesforce or HubSpot", "Outreach/Salesloft", "Data enrichment vendor"] },
        { label: "Satisfaction Level", value: "Low on integration quality, moderate on core function" },
      ] },
      { heading: "Buying Behavior", fields: [
        { label: "Evaluation Style", value: "Requests a sandbox and tests CRM sync before any pilot" },
        { label: "Budget Cycle", value: "Influences annual stack budget planning" },
      ] },
      { heading: "Buyer Psychology", fields: [
        { label: "Primary Motivator", value: "Avoiding another tool that creates cleanup work" },
        { label: "Risk Tolerance", value: "Low — burned by past migrations", confidence: 72 },
      ] },
      { heading: "Messaging Guidance", fields: [
        { label: "Opening Hook", value: "Native two-way CRM sync means sequence activity lands clean in Salesforce — no middleware, no cleanup jobs." },
        { label: "CTA Style", value: "Offer a technical walkthrough or sandbox access" },
        { label: "Objections They Raise", value: ["\"How does this write back to our CRM?\"", "\"Who administers this day to day?\""] },
      ] },
      { heading: "Account Intelligence", fields: [
        { label: "Trigger Events", value: ["Stack consolidation initiative", "CRM migration or re-implementation"] },
        { label: "Tech Stack Signals", value: ["Salesforce admin job posting", "RevOps headcount growth"] },
      ] },
      { heading: "Prospecting & Search", fields: [
        { label: "Search Keywords", value: ["\"Head of Revenue Operations\"", "\"Director of RevOps\"", "\"Sales Operations Manager\""] },
        { label: "Firmographic Filters", value: "51–1,000 employees, B2B SaaS with an existing CRM" },
      ] },
      { heading: "Outreach Strategy", fields: [
        { label: "Best Channel", value: "Email primary; LinkedIn for technical content" },
        { label: "Best Time To Reach", value: "Tuesday–Thursday, early afternoon" },
      ] },
      { heading: "Qualification", fields: [
        { label: "Warm Lead", value: "Asked how the integration works or requested API docs." },
        { label: "Meeting-Ready", value: "Named their CRM and asked for a technical walkthrough." },
      ] },
    ],
  },
  {
    id: "sdr-manager",
    name: "SDR Manager",
    department: "Sales Development",
    matchPct: 81,
    icpId: "vp-sales-midmarket",
    subtitle: "Runs the SDR floor day to day — lives in reply rates, activity volume, and how fast new reps get productive.",
    sections: [
      { heading: "Overview", fields: [
        { label: "Role Summary", value: "Manages a team of SDRs against weekly meeting targets and owns sequence quality in practice.", confidence: 86 },
        { label: "Reports To", value: "VP Sales" },
        { label: "Team Size Managed", value: "5–12 SDRs" },
      ] },
      { heading: "Responsibilities", fields: [
        { label: "Core Responsibilities", value: ["Hit weekly meetings-booked targets", "Coach reps on messaging", "Maintain sequence library"] },
      ] },
      { heading: "Goals", fields: [
        { label: "Primary Goal", value: "Raise reply rates without raising activity volume", confidence: 82 },
        { label: "Secondary Goals", value: ["Cut new-rep ramp from 90 to 45 days", "Reduce time reps spend writing copy"] },
      ] },
      { heading: "Pain Points", fields: [
        { label: "Primary Pain", value: "Reps burn half their day writing personalization that still reads like a template." },
        { label: "Secondary Pains", value: ["Quality varies wildly rep to rep", "Coaching doesn't scale past ~8 reps"] },
      ] },
      { heading: "Challenges", fields: [
        { label: "Organizational Challenges", value: ["Judged on activity metrics that don't map to pipeline", "Rep churn resets ramp progress"] },
      ] },
      { heading: "Decision Making", fields: [
        { label: "Role In Decision", value: "Champion and daily user — strong influence, no budget" },
        { label: "Other Stakeholders", value: ["VP Sales (approves)", "RevOps (evaluates)"] },
      ] },
      { heading: "Current Solutions", fields: [
        { label: "Tools In Use", value: ["Outreach or Salesloft", "LinkedIn Sales Navigator", "Shared template docs"] },
        { label: "Satisfaction Level", value: "Frustrated — tooling doesn't help with copy quality" },
      ] },
      { heading: "Buying Behavior", fields: [
        { label: "Evaluation Style", value: "Wants two reps trialing it live within a week" },
        { label: "Budget Cycle", value: "No direct budget — builds the internal case" },
      ] },
      { heading: "Buyer Psychology", fields: [
        { label: "Primary Motivator", value: "Looking good on the weekly meetings number" },
        { label: "Risk Tolerance", value: "High — will try anything that might lift replies", confidence: 70 },
      ] },
      { heading: "Messaging Guidance", fields: [
        { label: "Opening Hook", value: "Your reps spend half the day writing personalization. AI drafts it per-prospect and they approve before send — replies typically 2–3x." },
        { label: "CTA Style", value: "Offer a live trial with two reps this week" },
        { label: "Objections They Raise", value: ["\"Will my reps actually use it?\"", "\"Does the copy sound like us?\""] },
      ] },
      { heading: "Account Intelligence", fields: [
        { label: "Trigger Events", value: ["Hiring a batch of new SDRs", "Missed team target two months running"] },
        { label: "Tech Stack Signals", value: ["Multiple SDR job postings", "Sales engagement tool in stack"] },
      ] },
      { heading: "Prospecting & Search", fields: [
        { label: "Search Keywords", value: ["\"SDR Manager\"", "\"BDR Manager\"", "\"Head of Sales Development\""] },
        { label: "Firmographic Filters", value: "51–1,000 employees with a dedicated SDR function" },
      ] },
      { heading: "Outreach Strategy", fields: [
        { label: "Best Channel", value: "LinkedIn primary — highly active; email secondary" },
        { label: "Best Time To Reach", value: "Monday morning or Friday afternoon" },
      ] },
      { heading: "Qualification", fields: [
        { label: "Warm Lead", value: "Asked about reply-rate benchmarks or requested an example sequence." },
        { label: "Meeting-Ready", value: "Named their rep count and asked to see it running live." },
      ] },
    ],
  },
  {
    id: "head-of-growth",
    name: "Head of Growth",
    department: "Growth / Marketing",
    matchPct: 69,
    icpId: "founder-led-startup",
    subtitle: "First growth hire running pipeline experiments solo — no SDR team, no patience for setup projects.",
    sections: [
      { heading: "Overview", fields: [
        { label: "Role Summary", value: "Owns every acquisition channel at an early-stage startup, outbound included.", confidence: 78 },
        { label: "Reports To", value: "Founder/CEO" },
      ] },
      { heading: "Responsibilities", fields: [
        { label: "Core Responsibilities", value: ["Run acquisition experiments across channels", "Own the pipeline number with the founder", "Pick and wire up the growth stack"] },
      ] },
      { heading: "Goals", fields: [
        { label: "Primary Goal", value: "Find one repeatable outbound motion before the next raise" },
        { label: "Secondary Goals", value: ["Prove channel economics with real numbers"] },
      ] },
      { heading: "Pain Points", fields: [
        { label: "Primary Pain", value: "Testing outbound properly means weeks of setup they can't spare from other channels." },
        { label: "Secondary Pains", value: ["No one to write sequence copy", "Deliverability is a black box"] },
      ] },
      { heading: "Challenges", fields: [
        { label: "Constraints", value: ["Runway pressure on every tool decision", "Wearing four hats at once"] },
      ] },
      { heading: "Decision Making", fields: [
        { label: "Role In Decision", value: "Recommends; founder signs off on spend" },
      ] },
      { heading: "Current Solutions", fields: [
        { label: "Tools In Use", value: ["Apollo or Instantly", "Spreadsheet-based lists", "Personal inbox sending"] },
        { label: "Satisfaction Level", value: "Mixed — works, but doesn't scale past a few hundred sends" },
      ] },
      { heading: "Buying Behavior", fields: [
        { label: "Evaluation Style", value: "Self-serve trial, decides within the week on gut plus early numbers" },
      ] },
      { heading: "Buyer Psychology", fields: [
        { label: "Primary Motivator", value: "Showing a working channel before the next board update" },
      ] },
      { heading: "Messaging Guidance", fields: [
        { label: "Opening Hook", value: "Test outbound properly this week, not next quarter — domains, warmup, and AI-drafted sequences handled for you." },
        { label: "CTA Style", value: "Point at a self-serve trial, no demo required" },
        { label: "Objections They Raise", value: ["\"I don't have time to set this up\"", "\"Is this worth it at our volume?\""] },
      ] },
      { heading: "Account Intelligence", fields: [
        { label: "Trigger Events", value: ["Recent seed or Series A", "First growth/marketing hire announced"] },
      ] },
      { heading: "Prospecting & Search", fields: [
        { label: "Search Keywords", value: ["\"Head of Growth\"", "\"Growth Lead\"", "\"Demand Generation Manager\""] },
        { label: "Firmographic Filters", value: "1–50 employees, seed to Series A" },
      ] },
      { heading: "Outreach Strategy", fields: [
        { label: "Best Channel", value: "LinkedIn DM and email" },
        { label: "Best Time To Reach", value: "Early morning or evening" },
      ] },
      { heading: "Qualification", fields: [
        { label: "Warm Lead", value: "Started a trial or asked about self-serve pricing." },
        { label: "Meeting-Ready", value: "Shared a target account list size and a timeline to show results." },
      ] },
    ],
  },
  {
    id: "agency-ops-lead",
    name: "Agency Operations Lead",
    department: "Operations",
    matchPct: 54,
    icpId: "agency-fractional-sdr",
    subtitle: "Keeps delivery consistent across every client account and owns the QA bar on outbound copy.",
    sections: [
      { heading: "Overview", fields: [
        { label: "Role Summary", value: "Runs delivery operations across the client roster — onboarding, QA, and reporting.", confidence: 74 },
        { label: "Reports To", value: "Agency owner or managing partner" },
        { label: "Team Size Managed", value: "4–10 junior SDRs across accounts" },
      ] },
      { heading: "Responsibilities", fields: [
        { label: "Core Responsibilities", value: ["Onboard new client accounts", "QA outbound copy before it ships", "Produce per-client performance reports"] },
      ] },
      { heading: "Goals", fields: [
        { label: "Primary Goal", value: "Cut per-client setup time so margin holds on fixed-fee work" },
        { label: "Secondary Goals", value: ["One consistent quality bar across all accounts"] },
      ] },
      { heading: "Pain Points", fields: [
        { label: "Primary Pain", value: "Every new client means standing up domains, mailboxes, and sequences from scratch." },
        { label: "Secondary Pains", value: ["Copy quality depends on which junior SDR wrote it", "Reporting is stitched together manually"] },
      ] },
      { heading: "Challenges", fields: [
        { label: "Constraints", value: ["Tooling cost must work across the whole roster", "Clients arrive on different existing stacks"] },
      ] },
      { heading: "Decision Making", fields: [
        { label: "Role In Decision", value: "Evaluates and recommends; owner approves" },
      ] },
      { heading: "Current Solutions", fields: [
        { label: "Tools In Use", value: ["Mixed sending tools per client", "Manual copy QA checklist", "Spreadsheet reporting"] },
        { label: "Satisfaction Level", value: "Low — too much manual work per account" },
      ] },
      { heading: "Buying Behavior", fields: [
        { label: "Evaluation Style", value: "Pilots on one client account before rolling to the roster" },
      ] },
      { heading: "Buyer Psychology", fields: [
        { label: "Primary Motivator", value: "Getting hours back on every client onboarding" },
      ] },
      { heading: "Messaging Guidance", fields: [
        { label: "Opening Hook", value: "Onboard a new client's outbound in an afternoon — domains, warmup, and on-brand sequences, same quality bar every time." },
        { label: "CTA Style", value: "Offer a no-prep pilot on a single client account" },
        { label: "Objections They Raise", value: ["\"Can we separate workspaces per client?\"", "\"How does billing work across accounts?\""] },
      ] },
      { heading: "Account Intelligence", fields: [
        { label: "Trigger Events", value: ["Client roster growing past 10 accounts", "New delivery/ops hire"] },
      ] },
      { heading: "Prospecting & Search", fields: [
        { label: "Search Keywords", value: ["\"Head of Delivery\"", "\"Operations Lead\"", "\"Client Success Manager\""] },
        { label: "Firmographic Filters", value: "1–200 employees, lead-gen or outsourced sales agencies" },
      ] },
      { heading: "Outreach Strategy", fields: [
        { label: "Best Channel", value: "Email primary, LinkedIn secondary" },
        { label: "Best Time To Reach", value: "Weekday mid-morning" },
      ] },
      { heading: "Qualification", fields: [
        { label: "Warm Lead", value: "Asked about multi-workspace support or per-client pricing." },
        { label: "Meeting-Ready", value: "Confirmed roster size and offered a client account to pilot on." },
      ] },
    ],
  },
];

/* ─── Scoring ───────────────────────────────────────────────────── */
export const SCORE_DIMENSIONS = ["Market Size", "Product Fit", "Pain Urgency", "Reachability", "Competition"] as const;
export type ScoreDimension = (typeof SCORE_DIMENSIONS)[number];

export interface ScoreChain {
  productId: string;
  icpId: string;
  personaId: string;
  scores: Record<ScoreDimension, number>;
}

export const SCORE_CHAINS: ScoreChain[] = [
  { productId: "sending-platform", icpId: "vp-sales-midmarket", personaId: "vp-sales-revops", scores: { "Market Size": 8, "Product Fit": 10, "Pain Urgency": 9, Reachability: 8, Competition: 6 } },
  { productId: "sending-platform", icpId: "founder-led-startup", personaId: "founder-first-hire", scores: { "Market Size": 9, "Product Fit": 6, "Pain Urgency": 6, Reachability: 6, Competition: 7 } },
  { productId: "personalization-engine", icpId: "vp-sales-midmarket", personaId: "vp-sales-revops", scores: { "Market Size": 7, "Product Fit": 8, "Pain Urgency": 8, Reachability: 7, Competition: 5 } },
  { productId: "sending-platform", icpId: "vp-sales-midmarket", personaId: "head-of-revops", scores: { "Market Size": 8, "Product Fit": 9, "Pain Urgency": 7, Reachability: 7, Competition: 6 } },
  { productId: "sending-platform", icpId: "vp-sales-midmarket", personaId: "sdr-manager", scores: { "Market Size": 8, "Product Fit": 9, "Pain Urgency": 9, Reachability: 9, Competition: 6 } },
  { productId: "personalization-engine", icpId: "founder-led-startup", personaId: "head-of-growth", scores: { "Market Size": 7, "Product Fit": 7, "Pain Urgency": 6, Reachability: 7, Competition: 6 } },
  { productId: "infra-deliverability", icpId: "agency-fractional-sdr", personaId: "agency-ops-lead", scores: { "Market Size": 5, "Product Fit": 7, "Pain Urgency": 6, Reachability: 4, Competition: 5 } },
];
// infra-deliverability x agency-fractional-sdr intentionally has no chain yet — used for the "Not scored yet" empty state.

export function overallScore(scores: Record<ScoreDimension, number>): number {
  const values = SCORE_DIMENSIONS.map((d) => scores[d]);
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

/* ─── Campaign ──────────────────────────────────────────────────── */
export interface SequenceStep {
  day: number;
  channel: "Email" | "LinkedIn" | "Cold Calling";
  subject?: string;
  copy: string;
}

export interface CampaignCombo {
  id: string;
  productId: string;
  icpId: string;
  personaId: string;
  icpScore: number;
  personaScore: number;
  productScore: number;
  channel: "Email" | "LinkedIn" | "Cold Calling";
  campaignName: string;
  status: "Completed" | "Active" | "Scheduled" | "Draft";
  detail: string;
  opportunities: number;
  pipelineValue: number;
  sequence: SequenceStep[];
}

export const CAMPAIGN_COMBOS: CampaignCombo[] = [
  {
    id: "combo-1", productId: "sending-platform", icpId: "vp-sales-midmarket", personaId: "vp-sales-revops",
    icpScore: 9.2, personaScore: 8.8, productScore: 9.4, channel: "Email", campaignName: "Time-to-First-Send — Mid-Market",
    status: "Completed", detail: "6-step email sequence emphasizing same-day sending and reply-rate proof points. Sent to 1,240 contacts, 14.2% reply rate.",
    opportunities: 14, pipelineValue: 210000,
    sequence: [
      { day: 1, channel: "Email", subject: "Sending live today, not in 3 weeks", copy: "Hi {{firstName}} — most teams your size spend 2-3 weeks on domains, mailboxes, and warmup before their first send. B2B Rocket gets you sending the same day you sign up. Worth a 15-min look?" },
      { day: 3, channel: "Email", subject: "Re: Sending live today, not in 3 weeks", copy: "Bumping this up — reference customers are seeing 2-3x reply rates in the first 30 days versus manually written sequences. Happy to share the benchmark data if useful." },
      { day: 6, channel: "Email", subject: "How {{competitor}} teams cut setup to zero", copy: "Quick one: teams switching off {{competitor}} skip the setup project entirely — domains, mailboxes, and warmup are handled for you. Want the 2-min walkthrough?" },
      { day: 10, channel: "Email", subject: "14.2% reply rate, 1,240 sends", copy: "Sharing a proof point: a mid-market team just like yours hit a 14.2% reply rate on their first 1,240 sends using this exact setup. Can I send the playbook?" },
      { day: 14, channel: "Email", subject: "Closing the loop", copy: "Haven't heard back — assuming timing isn't right. If reply rates and time-to-first-send become a priority again, I'm here." },
      { day: 21, channel: "Email", subject: "One more idea", copy: "Last note from me: if it'd help, I can run a free deliverability check on your current sending domain — no strings attached. Just reply 'yes'." },
    ],
  },
  {
    id: "combo-2", productId: "sending-platform", icpId: "vp-sales-midmarket", personaId: "vp-sales-revops",
    icpScore: 9.2, personaScore: 8.8, productScore: 9.4, channel: "LinkedIn", campaignName: "RevOps Peer Benchmarking",
    status: "Active", detail: "LinkedIn connection + 3-touch DM sequence sharing peer benchmarking data on reply rates.",
    opportunities: 9, pipelineValue: 95000,
    sequence: [
      { day: 1, channel: "LinkedIn", copy: "Connection note: Following the RevOps benchmarking work you've posted about — would love to stay connected." },
      { day: 3, channel: "LinkedIn", copy: "Thanks for connecting! Curious what reply rates your team is seeing on outbound right now — we've been benchmarking mid-market RevOps orgs and the spread is bigger than I expected." },
      { day: 7, channel: "LinkedIn", copy: "Following up with that benchmark data I mentioned — mid-market teams using AI-personalized sequences are averaging 2-3x the reply rate of manually written ones. Happy to send the full breakdown." },
      { day: 12, channel: "LinkedIn", copy: "No pressure either way — if peer benchmarking data like this is useful for your planning, I'm glad to keep sharing what we're seeing across the market." },
    ],
  },
  {
    id: "combo-3", productId: "sending-platform", icpId: "founder-led-startup", personaId: "founder-first-hire",
    icpScore: 7.2, personaScore: 6.6, productScore: 7.4, channel: "Email", campaignName: "Founder-Led Outbound Starter",
    status: "Scheduled", detail: "4-step lightweight sequence, easy yes/no CTA, timed around seed-round announcements.",
    opportunities: 4, pipelineValue: 38000,
    sequence: [
      { day: 1, channel: "Email", subject: "Congrats on the raise — quick q", copy: "Saw the seed round news — congrats. Fast question: are you doing outbound yourself right now, or is that on the roadmap post-raise?" },
      { day: 4, channel: "Email", subject: "Re: Congrats on the raise — quick q", copy: "If outbound's on the list, worth knowing you can be sending personalized sequences same-day, no setup team needed. Interested?" },
      { day: 8, channel: "Email", subject: "Yes or no?", copy: "Totally fine if now's not the time — just say no and I'll leave it there. If it's worth 10 minutes, say yes and I'll send a slot." },
      { day: 13, channel: "Email", subject: "Closing this out", copy: "Assuming outbound isn't the priority right now post-raise. I'll check back in a quarter — good luck scaling the team." },
    ],
  },
  {
    id: "combo-4", productId: "personalization-engine", icpId: "vp-sales-midmarket", personaId: "vp-sales-revops",
    icpScore: 9.2, personaScore: 8.8, productScore: 8.0, channel: "Cold Calling", campaignName: "Personalization Engine Cross-Sell",
    status: "Draft", detail: "Cold-call script for existing sending-platform accounts, positioning the personalization add-on.",
    opportunities: 2, pipelineValue: 21000,
    sequence: [
      { day: 1, channel: "Cold Calling", copy: "Opener: \"Hey {{firstName}}, it's {{repName}} from B2B Rocket — you've been on the Sending Platform for about two months now. Got 90 seconds? I want to flag something that could bump your reply rates without adding any manual work.\"" },
      { day: 1, channel: "Cold Calling", copy: "Pitch: \"The Personalization Engine drafts per-recipient copy using firmographic and signal data — it's a layer on top of what you're already sending, no new tool to learn. Teams see reply rates jump noticeably in the first month.\"" },
      { day: 1, channel: "Cold Calling", copy: "Objection handling: \"Totally fair if budget's tight this quarter — it's usage-based, so you'd only pay for what you send, and I can get you a trial period to test the lift before committing.\"" },
      { day: 1, channel: "Cold Calling", copy: "Close: \"Can I get 15 minutes on your calendar this week with one of our solutions folks to walk through what it'd look like on your current sequences?\"" },
    ],
  },
  {
    id: "combo-5", productId: "sending-platform", icpId: "vp-sales-midmarket", personaId: "head-of-revops",
    icpScore: 9.2, personaScore: 8.4, productScore: 9.4, channel: "Email", campaignName: "CRM Sync & Data Hygiene",
    status: "Active", detail: "5-step technical sequence leading with native two-way CRM sync and zero cleanup jobs. Sent to 680 contacts, 11.8% reply rate.",
    opportunities: 7, pipelineValue: 84000,
    sequence: [
      { day: 1, channel: "Email", subject: "No more Salesforce cleanup jobs", copy: "Hi {{firstName}} — how much time does your team spend each week reconciling outbound activity back into Salesforce? B2B Rocket syncs natively, two-way, no middleware." },
      { day: 3, channel: "Email", subject: "Re: No more Salesforce cleanup jobs", copy: "To be specific: activity, replies, and status changes land in Salesforce in real time — no batch jobs, no field-mapping projects. Worth a look?" },
      { day: 6, channel: "Email", subject: "The data hygiene angle", copy: "A lot of RevOps leads we talk to inherit messy outbound data because the sending tool and CRM don't agree on source of truth. This setup removes that problem entirely." },
      { day: 9, channel: "Email", subject: "11.8% reply rate, zero cleanup", copy: "One data point: a similar mid-market team is at 680 sends, 11.8% reply rate, and reports zero manual CRM cleanup since switching. Happy to share how it's configured." },
      { day: 13, channel: "Email", subject: "Last check-in", copy: "I'll leave this here — if CRM sync and data hygiene become a pain point again, feel free to reach back out." },
    ],
  },
  {
    id: "combo-6", productId: "sending-platform", icpId: "vp-sales-midmarket", personaId: "sdr-manager",
    icpScore: 9.2, personaScore: 8.1, productScore: 9.4, channel: "LinkedIn", campaignName: "SDR Ramp Time Play",
    status: "Completed", detail: "Connection request plus 4-touch DM sequence built around cutting new-rep ramp from 90 to 45 days.",
    opportunities: 11, pipelineValue: 132000,
    sequence: [
      { day: 1, channel: "LinkedIn", copy: "Connection note: Managing SDR ramp time is one of the harder parts of scaling a team — following your posts on it, would love to connect." },
      { day: 3, channel: "LinkedIn", copy: "Thanks for connecting — quick question: what's ramp time looking like for new SDRs on your team right now, roughly?" },
      { day: 6, channel: "LinkedIn", copy: "Reason I ask: teams using AI-drafted sequences are cutting new-rep ramp from ~90 days to ~45, since reps aren't starting from a blank page on messaging quality." },
      { day: 10, channel: "LinkedIn", copy: "If cutting ramp time in half is useful for your Q-planning, happy to share how the messaging library and coaching workflow are set up — no pitch, just the playbook." },
    ],
  },
  {
    id: "combo-7", productId: "personalization-engine", icpId: "founder-led-startup", personaId: "head-of-growth",
    icpScore: 7.2, personaScore: 6.9, productScore: 8.0, channel: "Email", campaignName: "Growth Experiment Starter",
    status: "Scheduled", detail: "3-step sequence timed to funding announcements, positioning outbound as a channel test they can run this week.",
    opportunities: 3, pipelineValue: 27000,
    sequence: [
      { day: 1, channel: "Email", subject: "Testing outbound as a growth channel", copy: "Hi {{firstName}} — if outbound is on your list of channels to test this quarter, you can have a personalized sequence live this week, not next. Want the quick version?" },
      { day: 5, channel: "Email", subject: "Re: Testing outbound as a growth channel", copy: "The AI drafts and personalizes copy per-recipient using firmographic signals, so there's no manual copywriting to get a real test running." },
      { day: 9, channel: "Email", subject: "Worth a test or not?", copy: "Totally fine either way — just let me know if outbound experimentation is a priority right now or if it's better to check back later this quarter." },
    ],
  },
  {
    id: "combo-8", productId: "infra-deliverability", icpId: "agency-fractional-sdr", personaId: "agency-ops-lead",
    icpScore: 5.8, personaScore: 5.4, productScore: 7.9, channel: "Email", campaignName: "Multi-Client Deliverability",
    status: "Draft", detail: "Sequence for agency ops leads on standing up client outbound in an afternoon instead of a week.",
    opportunities: 1, pipelineValue: 12000,
    sequence: [
      { day: 1, channel: "Email", subject: "Onboarding a new client's outbound in an afternoon", copy: "Hi {{firstName}} — how long does it typically take your team to stand up domains, mailboxes, and warmup for a new client account?" },
      { day: 4, channel: "Email", subject: "Re: Onboarding a new client's outbound in an afternoon", copy: "With B2B Rocket's infrastructure layer, that same setup is done in an afternoon, same quality bar every time, across as many client accounts as you're running." },
      { day: 8, channel: "Email", subject: "Multi-client deliverability, one dashboard", copy: "If managing deliverability across multiple client domains is a recurring headache, this consolidates it into one view instead of juggling separate tools per client." },
    ],
  },
];

export function campaignCombosForPersona(personaId: string): CampaignCombo[] {
  return CAMPAIGN_COMBOS.filter((c) => c.personaId === personaId);
}

export function personaPerformance(personaId: string): { combos: CampaignCombo[]; products: number; opportunities: number; pipelineValue: number } {
  const combos = campaignCombosForPersona(personaId);
  return {
    combos,
    products: new Set(combos.map((c) => c.productId)).size,
    opportunities: combos.reduce((sum, c) => sum + c.opportunities, 0),
    pipelineValue: combos.reduce((sum, c) => sum + c.pipelineValue, 0),
  };
}

/* ─── Strategy ──────────────────────────────────────────────────── */
export interface InfrastructureChannel {
  key: string;
  label: string;
  status: "warming_up" | "ready" | "placeholder";
  detail: string;
}

export const INFRASTRUCTURE_STATUS: InfrastructureChannel[] = [
  { key: "email", label: "Email", status: "warming_up", detail: "9 days remaining" },
  { key: "linkedin", label: "LinkedIn", status: "ready", detail: "Ready to send" },
  { key: "cold-calling", label: "Cold Calling", status: "ready", detail: "Ready to dial" },
  { key: "phases", label: "Phases", status: "placeholder", detail: "Defined once roadmap is generated" },
];

export interface RoadmapPhase {
  phase: string;
  window: string;
  combos: string[];
}

export const ROADMAP_PHASES: RoadmapPhase[] = [
  { phase: "Phase 1", window: "Week 1–2", combos: ["Time-to-First-Send — Mid-Market (Email)", "RevOps Peer Benchmarking (LinkedIn)"] },
  { phase: "Phase 2", window: "Week 3–4", combos: ["Founder-Led Outbound Starter (Email)"] },
  { phase: "Phase 3", window: "Week 5+", combos: ["Personalization Engine Cross-Sell (Cold Calling)"] },
];

/* ─── Resources ─────────────────────────────────────────────────── */
export interface ResourcePage {
  title: string;
  url: string;
}

export interface ResourceRun {
  id: string;
  url: string;
  completed: boolean;
  pageCount: number;
  timestamp: string;
  pages: ResourcePage[];
}

export const RESOURCE_RUNS: ResourceRun[] = [
  {
    id: "run-1", url: "b2brocket.ai", completed: true, pageCount: 18, timestamp: "Jul 24, 2026 · 9:12am",
    pages: [
      { title: "B2B Rocket — AI Outbound Sales Platform", url: "b2brocket.ai" },
      { title: "Product — Outbound Sending Platform", url: "b2brocket.ai/product/sending" },
      { title: "Product — AI Personalization Engine", url: "b2brocket.ai/product/personalization" },
      { title: "Pricing", url: "b2brocket.ai/pricing" },
      { title: "Customers — Northwind Analytics", url: "b2brocket.ai/customers/northwind" },
      { title: "Customers — Cedar & Co Consulting", url: "b2brocket.ai/customers/cedar-co" },
      { title: "Blog — Time-to-First-Send Benchmarks", url: "b2brocket.ai/blog/time-to-first-send" },
      { title: "About", url: "b2brocket.ai/about" },
    ],
  },
  {
    id: "run-2", url: "b2brocket.ai/docs", completed: true, pageCount: 7, timestamp: "Jul 22, 2026 · 2:47pm",
    pages: [
      { title: "Docs — Getting Started", url: "b2brocket.ai/docs/getting-started" },
      { title: "Docs — Domains & Mailboxes", url: "b2brocket.ai/docs/domains" },
      { title: "Docs — Warmup Guide", url: "b2brocket.ai/docs/warmup" },
      { title: "Docs — API Reference", url: "b2brocket.ai/docs/api" },
    ],
  },
  {
    id: "run-3", url: "linkedin.com/company/b2brocket", completed: false, pageCount: 3, timestamp: "Jul 26, 2026 · 11:03am",
    pages: [
      { title: "B2B Rocket — LinkedIn Company Page", url: "linkedin.com/company/b2brocket" },
      { title: "Posts — Product Updates", url: "linkedin.com/company/b2brocket/posts" },
    ],
  },
];
