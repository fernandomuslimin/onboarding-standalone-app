import { z } from 'zod';
import { makeEnvelope } from './envelope.js';
import { collapseEnvelopes } from './helpers.js';


export const PersonaSchema2 = z.object({
  // ── Overview ────────────────────────────────────────────────────────────────
  displayName: makeEnvelope().describe("Short descriptive label combining this persona's job role and company context (e.g. 'IT Director' , 'VP of Marketing' , 'CEO of a startup' , etc.). Source: the target persona seed brief and the ICP segment name. Derive a specific CRM-style segment name, not a human name."),
  summary: makeEnvelope().describe("Neutral 4-6 sentence profile covering who this persona is, their daily mandate, the problem space they own, and why they are a relevant buyer. Source: the segment definition and the firmographic fields. Always produce an overview in the third person without bullet points."),
  departments: z.array(makeEnvelope()).describe("Primary departments this persona belongs to (e.g. 'Engineering', 'Revenue Operations'). Source: standard org charts for this role at the ICP company size. Infer where they sit within the company structure. One per item. Provide 1-2 items."),

  // ── Responsibilities ───────────────────────────────────────────────────────
  keyResponsibility: z.array(makeEnvelope()).describe("Concrete, recurring tasks this persona owns weekly or monthly. Source: job postings for this role and day-in-the-life articles. Infer exactly what they do, avoiding restatement of metrics. Each item must start with an action verb (e.g. 'Reviews quarterly infrastructure spend'). One per item. Provide 3-5 items."),
  successMetrics: z.array(makeEnvelope()).describe("Quantifiable KPIs tied to this persona's performance review (e.g. 'Net revenue retention %'). Source: performance management frameworks and job posting requirements for this role. Provide specific metric names only. One per item. Provide 3-5 items."),

  // ── Goals ──────────────────────────────────────────────────────────────────
  professionalGoals: z.array(makeEnvelope()).describe("Individual career-advancement goals for this persona (e.g. 'Get promoted to VP'). Source: career communities and professional development guides for this role. Highlight what they strive for personally, separate from team targets. One per item. Provide 2-4 items."),
  desiredOutcomes: z.array(makeEnvelope()).describe("Specific outcomes this persona wants to be true AFTER adopting a solution. Source: the seller's case studies and the persona's success metrics. Explain exactly why they would seek out a solution. One per item. Provide 3-5 items."),

  // ── Pain Points ────────────────────────────────────────────────────────────
  primaryPain: makeEnvelope().describe("The most acute, daily pain this persona experiences as a suffering practitioner. Source: role-specific forums (e.g., Reddit, Glassdoor), customer interviews, and the ICP pain context. Describe the exact workflow that breaks and its emotional toll. Write a 3-5 sentence paragraph."),
  supportingPainPoints: z.array(makeEnvelope()).describe("Secondary pain points that compound the primary pain. Source: role-specific friction points discussed in professional communities. Provide concrete situations distinct from the primary pain. One per item. Provide 2-4 items."),
  frictionPoints: z.array(makeEnvelope()).describe("Internal political or structural obstacles that block this persona from buying. Source: B2B sales loss-reason data and committee dynamics research for this company size. Focus on budget defense struggles or IT security bottlenecks. One per item. Provide 2-4 items."),
  frustrations: z.array(makeEnvelope()).describe("Lower-stakes emotional irritants this persona experiences day-to-day. Source: peer review sites and community venting. Name the exact tasks they hate doing. One per item. Provide 3-5 items."),
  risks: z.array(makeEnvelope()).describe("Severe negative business consequences this persona is actively trying to prevent. Source: industry risk assessments and role accountability norms. Frame as worst-case scenarios they are held accountable for. One per item. Provide 2-4 items."),
  fears: z.array(makeEnvelope()).describe("Personal and career-level anxieties this persona has about failing in their role. Source: career communities and exit interview patterns. Detail identity-level fears. One per item. Provide 2-4 items."),
  statusQuoCost: makeEnvelope().describe("The cumulative cost to this persona's organization of NOT changing their current approach. Source: industry benchmarks and ROI studies for the problem space. Include concrete figures or proxies (e.g. wasted hours, lost revenue). Write a single cohesive paragraph."),

  // ── Challenges ─────────────────────────────────────────────────────────────
  operationalChallenges: z.array(makeEnvelope()).describe("Tactical, present-tense execution obstacles tied to process, tooling, or resourcing. Source: job postings and peer communities. One per item. Provide 3-5 items."),
  strategicChallenges: z.array(makeEnvelope()).describe("Longer-horizon structural obstacles tied to growth, scale, or market shifts. Source: industry analyst reports and thought leadership. One per item. Provide 2-4 items."),

  // ── Decision Making ────────────────────────────────────────────────────────
  purchasingInfluence: makeEnvelope().describe("This persona's typical role in the buying process (e.g. 'Champion', 'Economic Buyer'). Source: B2B sales frameworks and committee research for this ICP size. Justify why they hold this influence. Write a single short paragraph."),
  budgetOwnership: makeEnvelope().describe("Whether this persona controls, approves, or merely requests budget, and at what threshold. Source: organizational hierarchy norms and procurement process research. Explain precisely. Write a single short paragraph."),
  decisionAuthority: makeEnvelope().describe("This persona's actual authority to approve or reject a vendor during a purchase process (e.g. 'Final approver' vs 'Technical sign-off only'). Source: B2B deal-flow research. Write a single short paragraph."),
  evaluationCriteria: z.array(makeEnvelope()).describe("Highly specific technical, financial, or security criteria this persona uses to compare vendors. Source: RFP templates and product review sites (e.g. G2). Use specific benchmarks like 'SOC 2 Type II compliance'. One per item. Provide 3-5 items."),
  // Tagged with each objection's rebuttal, so Campaign-Copy Viability
  // scoring reads this ONE field, not two that could drift apart.
  objections: z.array(makeEnvelope(z.object({
    text:         z.string().describe("The specific pushback phrase this persona raises, written exactly as they would actually say it in quotes. Source: sales call transcripts and CRM loss-reason data."),
    rebuttalText: z.string().nullable().describe("The response a rep should give to this specific objection. Source: sales playbooks and how top reps actually respond to this objection in practice. Use null (not an empty string) if no rebuttal is established yet."),
  }))).describe("Specific pushback phrases this persona raises during sales conversations, each paired with its rebuttal — counted unconditionally as copy anchors for Campaign-Copy Viability scoring. One per item. Provide 3-5 items."),

  // ── Current Solutions ──────────────────────────────────────────────────────
  existingTools: z.array(makeEnvelope()).describe("Specific named software tools and platforms this persona is likely already using. Source: LinkedIn tech stack data and BuiltWith/Wappalyzer detections for this ICP. Use exact product names. One per item. Provide 3-5 items."),
  workflows: z.array(makeEnvelope()).describe("Exact step-by-step manual processes or workarounds this persona currently follows to solve the problem without the seller's product. Source: process documentation and workflow case studies. One per item. Provide 2-4 items."),
  alternatives: z.array(makeEnvelope()).describe("Specific other vendor products, build-vs-buy options, or workaround approaches this persona would realistically consider as alternatives. Source: comparison sites and industry analyst reports. One per item. Provide 2-4 items."),
  incumbentStrengths: makeEnvelope().describe("Exactly why their current solution is sticky and hard to displace. Source: product review sites and competitive analysis. Cover switching costs and specific integrations. Write a short paragraph."),
  switchingTriggers: z.array(makeEnvelope()).describe("Highly specific events that cause this dissatisfied customer to leave their current incumbent vendor. Source: churn analysis data and customer exit interviews. One per item. Provide 2-4 items."),
  displacementMessaging: makeEnvelope().describe("Outward-facing displacement copy targeting this persona. Source: incumbent strengths and the seller's differentiation angle. Reframe the incumbent's complexity as a cost. Write a short paragraph."),

  // ── Buying Behavior ────────────────────────────────────────────────────────
  directBuyingSignals: z.array(makeEnvelope()).describe("Directly observable, first-party behaviors indicating active purchase intent right now. Source: CRM engagement data and email platform analytics. One per item. Provide 3-5 items."),
  indirectBuyingSignals: z.array(makeEnvelope()).describe("Indirect or third-party signals suggesting active buying cycle. Source: Bombora, G2 Buyer Intent, and job board monitoring. One per item. Provide 3-5 items."),

  // ── Buyer Psychology ───────────────────────────────────────────────────────
  motivations: z.array(makeEnvelope()).describe("Underlying psychological and professional root-cause drivers behind this persona's actions. Source: leadership interviews and role-specific psychological profiles. One per item. Provide 2-4 items."),
  priorities: z.array(makeEnvelope()).describe("Time-bound priorities this persona is actively focused on right now this quarter or year, ranked by urgency. Source: industry trend reports and quarterly earnings themes. One per item. Provide 2-4 items."),
  careAbout: z.array(makeEnvelope()).describe("Specific qualitative and quantitative topics, metrics, and outcomes this persona pays close attention to in meetings and reporting. Source: role-specific KPI frameworks. One per item. Provide 3-5 items."),
  nightmares: z.array(makeEnvelope()).describe("Worst-case, catastrophic scenarios this persona is haunted by. Source: incident post-mortems and industry disaster case studies. One per item. Provide 2-3 items."),
  aspirations: z.array(makeEnvelope()).describe("Personal definitions of 'winning' for this persona in their role. Source: career aspiration surveys and LinkedIn thought leadership. One per item. Provide 2-3 items."),

  // ── Messaging Guidance ─────────────────────────────────────────────────────
  valuePropositions: z.array(makeEnvelope()).describe("Highly specific benefit statements tailored to this persona's pain points. Source: mapping their primary pains against the seller's product capabilities. Write as outward-facing pitch lines. One per item. Provide 2-4 items."),
  messagingAngles: z.array(makeEnvelope()).describe("Distinct strategic framings or narrative hooks for outreach. Source: their psychological drivers and priorities. One per item. Provide 2-4 items."),
  emphasizeTopics: z.array(makeEnvelope()).describe("Specific short topic labels representing subjects, features, or proof points to foreground in conversations. Source: their evaluation criteria and success metrics. One per item. Provide 3-5 items."),
  avoidTopics: z.array(makeEnvelope()).describe("Specific subjects or language likely to backfire. Source: known objections and sensitivities. Explain why. One per item. Provide 2-4 items."),
  toneRecommendations: makeEnvelope().describe("The exact communication style that resonates with this persona in a sales context (e.g. 'Direct, data-led'). Source: their seniority and role culture. Write a single clear directive."),
  outreachHook: makeEnvelope().describe("A single concrete example of a first-touch opening line or subject line written exactly as it would appear in a cold email. Source: their primary pain point and the seller's most relevant value proposition."),
  proofPoints: z.array(makeEnvelope()).describe("Exact categories of evidence likely to build credibility (e.g. 'Case study with a direct competitor'). Source: their evaluation criteria and trust signals. One per item. Provide 2-4 items."),
  clientWins: makeEnvelope().describe("A narrative 'after state' summarizing what this persona's life looks like post-purchase. Source: their desired outcomes and documented customer success stories. Write a highly specific paragraph."),
  ctaRecommendations: z.array(makeEnvelope()).describe("Specific, low-friction next-step asks appropriate for this persona's buying stage. Source: their preferred channels and decision authority. One per item. Provide 2-4 items."),
  ctaVariation: makeEnvelope().describe("The exact call-to-action copy variation to use in outreach for this persona. Source: what converts best for their profile. Write the exact string."),

  // ── Account intelligence ───────────────────────────────────────────────────
  subPersonas: z.array(makeEnvelope()).describe("Distinct sub-segments within this persona requiring slightly different messaging. Source: variations in company sizes or sub-industries from the ICP. One per item. Provide 2-3 items."),
  winLossPatterns: z.array(makeEnvelope()).describe("Exact patterns in won and lost deals to explain what typically predicts a win versus a loss. Source: sales cycle analysis. One per item. Provide 2-4 items."),

  // ── Prospecting & Search ───────────────────────────────────────────────────
  jobTitleVariations: z.array(makeEnvelope()).describe("Exact real-world job titles used interchangeably for this role across companies. Source: LinkedIn title variations for this role function. One per item. Provide 3-8 items."),
  relatedTitles: z.array(makeEnvelope()).describe("Adjacent titles that are NOT the same role but frequently get conflated with it. Source: org charts and common mis-targeting lists. One per item. Provide 2-5 items."),
  seniorityLevels: z.array(makeEnvelope()).describe("Exact seniority tier labels that map to this persona across different company sizes. Source: typical reporting structures in this industry. One per item. Provide 1-4 items."),

  // ── Representative Examples ────────────────────────────────────────────────
  exampleJobTitles: z.array(makeEnvelope()).describe("Concrete, verbatim job titles as they would appear on a LinkedIn profile. Source: actual LinkedIn searches. One per item. Provide 3-10 items."),
  linkedinTitles: z.array(makeEnvelope()).describe("Realistic LinkedIn headline strings as this persona might actually write them. Source: how they brand themselves on social media. One per item. Provide 3-5 items."),

  // ── Outreach Strategy ──────────────────────────────────────────────────────
  bestChannel: z.array(makeEnvelope()).describe("Exact communication channels this persona is most responsive on, ranked most effective first. Source: industry channel-response research. One per item. Provide 1-3 items."),
  emailPreference: makeEnvelope().describe("Hyper-specific guidance on the ideal email length, structure, and style. Source: their role seniority and time constraints. Write a single short paragraph."),
  emailResponsePattern: makeEnvelope().describe("Exactly how this persona typically replies to sales emails when they do engage (e.g. 'Responds with a forward'). Source: reply-pattern analysis for this seniority. Write a single short paragraph."),
  bestContactTime: makeEnvelope().describe("The exact best day(s) and time window to reach this persona and why. Source: their typical work schedule and meeting patterns. Write a single short paragraph."),
  sequenceStrategy: makeEnvelope().describe("A concrete multi-touch outreach plan with numbered steps specifying the channel, timing, and intent. Source: their buying cycle and best practices. Write a single short paragraph."),
  linkedinActivity: makeEnvelope().describe("This persona's exact typical LinkedIn engagement level (e.g. 'Posts daily'). Source: social media habits of this role. Write a single short phrase or sentence."),
  phoneAccessibility: makeEnvelope().describe("This persona's phone accessibility level (e.g. 'Direct mobile dial available'). Source: contactability norms for this level of seniority. Write a single short phrase or sentence."),

  // ── Qualification ──────────────────────────────────────────────────────────
  interestedCriteria: z.array(makeEnvelope()).describe("Observable signals that qualify this persona as merely 'Interested'. Source: top-of-funnel engagement patterns. One per item. Provide 2-5 items."),
  warmCriteria: z.array(makeEnvelope()).describe("Observable signals indicating this persona has moved beyond passive interest into active engagement. Source: mid-funnel interaction patterns. One per item. Provide 2-5 items."),
  meetingReadyCriteria: z.array(makeEnvelope()).describe("Observable signals indicating this persona is ready for a sales conversation. Source: bottom-of-funnel qualification frameworks (e.g. BANT/MEDDIC). One per item. Provide 2-5 items."),
  notNowCriteria: z.array(makeEnvelope()).describe("Observable signals indicating genuine interest but bad timing. Source: common deferral patterns. One per item. Provide 2-5 items."),
  deadCriteria: z.array(makeEnvelope()).describe("Observable signals indicating permanent disqualification. Source: strict exclusion criteria. One per item. Provide 2-5 items."),

  // Product Component Scoring input — coarser/more consistent than
  // exampleJobTitles/jobTitleVariations, used to match this persona against
  // case studies and objections by role.
  roleFamily: makeEnvelope().describe("Categorical role-family bucket for this persona (e.g. 'Sales Leadership', 'Marketing Ops', 'IT/Security', 'Finance'). Source: the departments and exampleJobTitles fields above. Pick the single closest-fitting bucket, not a list. Used for Campaign-Copy Viability scoring to match this persona against case studies and objections tagged by role."),
});

export const collapsedEnvelopeSchema = collapseEnvelopes(PersonaSchema2);

export default PersonaSchema2;
