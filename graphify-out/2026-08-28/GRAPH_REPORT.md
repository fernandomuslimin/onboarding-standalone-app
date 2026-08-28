# Graph Report - onboarding-standalone-app  (2026-08-28)

## Corpus Check
- 40 files · ~74,933 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 661 nodes · 1123 edges · 36 communities (22 shown, 14 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 6 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `6e264f65`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Onboarding Step Data & Editing|Onboarding Step Data & Editing]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Build Tooling & Dependencies|Build Tooling & Dependencies]]
- [[_COMMUNITY_App Entry & Standalone Shim|App Entry & Standalone Shim]]
- [[_COMMUNITY_AI Text Revision Helpers|AI Text Revision Helpers]]
- [[_COMMUNITY_Website & Product Step Validation|Website & Product Step Validation]]
- [[_COMMUNITY_Claude Permission Config|Claude Permission Config]]
- [[_COMMUNITY_Domain Step Validation|Domain Step Validation]]
- [[_COMMUNITY_Resume Flow Helpers|Resume Flow Helpers]]
- [[_COMMUNITY_Research Summary Domain Extraction|Research Summary Domain Extraction]]
- [[_COMMUNITY_Invite Step Validation|Invite Step Validation]]
- [[_COMMUNITY_Score Cell Styling|Score Cell Styling]]
- [[_COMMUNITY_Review Order Helpers|Review Order Helpers]]
- [[_COMMUNITY_GitHub Pages Deploy Workflows|GitHub Pages Deploy Workflows]]
- [[_COMMUNITY_Brand Logo Asset|Brand Logo Asset]]
- [[_COMMUNITY_Claude Settings File|Claude Settings File]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]

## God Nodes (most connected - your core abstractions)
1. `Step 4 — Persona` - 24 edges
2. `Icon()` - 21 edges
3. `OnboardingShell()` - 17 edges
4. `Step 2 — Product` - 14 edges
5. `compilerOptions` - 13 edges
6. `IcpDetail` - 13 edges
7. `PersonaDetail` - 13 edges
8. `Step 3 — ICP (Ideal Customer Profile)` - 13 edges
9. `ProductDetail` - 12 edges
10. `KnowledgeCenter()` - 12 edges

## Surprising Connections (you probably didn't know these)
- `Next.js Decoupling Shim (design rationale for standalone export)` --rationale_for--> `OnboardingShell()`  [EXTRACTED]
  README.md → src/onboarding-shell.tsx
- `index.html (dev entry HTML)` --references--> `src/main.tsx (React entry point)`  [EXTRACTED]
  index.html → src/main.tsx
- `StepClearedForLaunch()` --references--> `KnowledgeCenter()`  [INFERRED]
  src/onboarding-shell.tsx → src/knowledge-center/KnowledgeCenter.tsx
- `src/main.tsx (React entry point)` --references--> `OnboardingShell()`  [EXTRACTED]
  src/main.tsx → src/onboarding-shell.tsx
- `overallScore()` --semantically_similar_to--> `overallFit()`  [INFERRED] [semantically similar]
  src/knowledge-center/data.ts → src/knowledge-center/Campaign.tsx

## Hyperedges (group relationships)
- **Onboarding Wizard Step Sequence** — src_onboarding_shell_onboardingshell, src_onboarding_shell_stepsplash, src_onboarding_shell_stepwelcome, src_onboarding_shell_stepwebsite, src_onboarding_shell_stepproducts, src_onboarding_shell_stepconnect, src_onboarding_shell_stepresearch, src_onboarding_shell_stepcompanyresearch, src_onboarding_shell_steptamicp, src_onboarding_shell_steppersonas, src_onboarding_shell_stepoutreachcampaign, src_onboarding_shell_stepclearedforlaunch, knowledge_center_knowledgecenter_knowledgecenter [EXTRACTED 1.00]
- **Vite Build & Single-File Export Pipeline** — package_json, vite_config_ts, tsconfig_json, vite_config_singlefile_ts, onboarding_standalone_html [EXTRACTED 1.00]
- **GitHub Pages Deployment Pipeline** — workflows_deploy, workflows_deploy_preview, package_json [INFERRED 0.85]
- **List + Detail Master-Detail UI Pattern** — knowledge_center_icp_icpsection, knowledge_center_persona_personasection, knowledge_center_resources_resourcessection, knowledge_center_product_productsection [INFERRED 0.85]
- **Product / ICP / Persona Combination Data Model** — knowledge_center_data_productdetail, knowledge_center_data_icpdetail, knowledge_center_data_personadetail, knowledge_center_data_scorechain, knowledge_center_data_campaigncombo [INFERRED 0.90]
- **Reviewed-Sections Progress Tracking Flow** — knowledge_center_knowledgecenter_knowledgecenter, knowledge_center_company_companysection, knowledge_center_product_productsection, knowledge_center_icp_icpsection, knowledge_center_persona_personasection [EXTRACTED 1.00]

## Communities (36 total, 14 thin omitted)

### Community 0 - "Onboarding Step Data & Editing"
Cohesion: 0.01
Nodes (79): ALL_STEPS, AvailStatus, BACK_BTN, BRAND_HIGHLIGHTS, Campaign, CAMPAIGNS, CampaignStep, CARD (+71 more)

### Community 1 - "Community 1"
Cohesion: 0.06
Nodes (63): CampaignSection(), CHANNEL_ICON, ComboRow(), HEADER_CELL, overallFit(), STATUS_STYLE, tone(), CampaignSequenceView() (+55 more)

### Community 2 - "Community 2"
Cohesion: 0.15
Nodes (10): ReferenceableField(), ReferenceableSection(), HistorySource, BLOCK_LABEL, IcpSummary(), LogField, CheckboxPills(), EditableField() (+2 more)

### Community 3 - "Build Tooling & Dependencies"
Cohesion: 0.05
Nodes (34): dependencies, react, react-dom, devDependencies, playwright, @types/react, @types/react-dom, typescript (+26 more)

### Community 4 - "App Entry & Standalone Shim"
Cohesion: 0.14
Nodes (14): focusStyle(), isValidUrl(), Next.js Decoupling Shim (design rationale for standalone export), OnboardingShell(), StepClearedForLaunch(), StepConnect(), StepOutreachCampaign(), StepPersonas() (+6 more)

### Community 5 - "AI Text Revision Helpers"
Cohesion: 0.21
Nodes (12): firstSentence(), reviseCallPrepNotes(), reviseCompetitive(), reviseIcpBundle(), revisePositioning(), reviseProductBundle(), reviseProofBundle(), reviseSectionContent() (+4 more)

### Community 6 - "Website & Product Step Validation"
Cohesion: 0.06
Nodes (35): reasoning, value, data, rules, sendingSchedule, sequence, reasoning, value (+27 more)

### Community 7 - "Claude Permission Config"
Cohesion: 0.50
Nodes (3): permissions, allow, prefersReducedMotion

### Community 8 - "Domain Step Validation"
Cohesion: 0.67
Nodes (3): isValidDomain(), StepForwardingDomain(), StepPrimaryDomain()

### Community 9 - "Resume Flow Helpers"
Cohesion: 0.67
Nodes (3): lastPhaseLabel(), StepResume(), timeAgo()

### Community 17 - "Community 17"
Cohesion: 0.06
Nodes (35): reasoning, value, data, rules, sendingSchedule, sequence, reasoning, value (+27 more)

### Community 18 - "Community 18"
Cohesion: 0.12
Nodes (14): index.html (dev entry HTML), Build, code:bash (npm install), code:bash (npm run build), code:bash (npm run build:single), code:bash (npm run build:single && cp dist-single/index.html onboarding), code:tsx (import { useRouter } from "next/navigation";), Onboarding — standalone (+6 more)

### Community 21 - "Community 21"
Cohesion: 0.15
Nodes (17): CopilotContext, CopilotContextValue, CopilotProvider(), useCopilot(), useRegisterCopilotAdapter(), CopilotWidget(), Message, classifyIntent() (+9 more)

### Community 23 - "Community 23"
Cohesion: 0.04
Nodes (45): 10. Messaging Guidance — **Not Shown**, 10. Scoring Input — **Not Shown**, 10. Targeting Filters — **Not Shown**, 11. Extended Commercials — **Not Shown**, 11. Scoring Input — **Not Shown**, 12. Additional Proof — **Not Shown**, 13. Scoring Input — **Not Shown**, 1. Header (+37 more)

### Community 24 - "Community 24"
Cohesion: 0.16
Nodes (15): AccordionBlock(), CardSection(), Drawer(), EmptyState(), FieldValue(), FILLED_ICONS, firstSentence(), Icon() (+7 more)

### Community 30 - "Community 30"
Cohesion: 0.13
Nodes (11): fieldConfidence(), fieldList(), fieldValue(), LabeledField, LogField, OVERVIEW_TABS, OverviewTab, PERSONA_SUMMARY_FIELDS (+3 more)

### Community 31 - "Community 31"
Cohesion: 0.08
Nodes (24): 10. Qualification Snapshot, 11. Deeper Pain & Risk Context — **Not Shown**, 12. Challenges — **Not Shown**, 13. Decision-Making Detail — **Not Shown**, 14. Current-Solution Detail — **Not Shown**, 15. Buying Signals Detail — **Not Shown**, 16. Buyer Psychology — **Not Shown**, 17. Extended Messaging Guidance — **Not Shown** (+16 more)

### Community 32 - "Community 32"
Cohesion: 0.24
Nodes (8): LogField, PersonaSummaryView(), PROSE, SECTION_ICON, sectionField(), sectionFieldList(), KC_DANGER_BTN, ProgressBar()

### Community 33 - "Community 33"
Cohesion: 0.05
Nodes (50): HEADER_CELL, KnowledgeDashboard(), NUM_CELL, Row(), Tier, TIER_META, TIER_ORDER, TIER_SHARE (+42 more)

### Community 34 - "Community 34"
Cohesion: 0.11
Nodes (20): BASIC_FIELDS, CHIP_FIELDS, COMPANY_BLOCKS, COMPANY_TEXT_FIELDS, companyBlockId(), CompanySummary(), DEEP_DIVE_FIELDS, differentiationParagraph() (+12 more)

### Community 35 - "Community 35"
Cohesion: 0.22
Nodes (12): fieldByLabel(), fieldId(), fieldList(), fieldText(), LogField, productOverviewParagraph(), ProductSummary(), PROSE (+4 more)

## Ambiguous Edges - Review These
- `CAMPAIGN_COMBOS` → `RoadmapPhase`  [AMBIGUOUS]
  src/knowledge-center/data.ts · relation: references

## Knowledge Gaps
- **298 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+293 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **14 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `CAMPAIGN_COMBOS` and `RoadmapPhase`?**
  _Edge tagged AMBIGUOUS (relation: references) - confidence is low._
- **Why does `OnboardingShell()` connect `App Entry & Standalone Shim` to `Onboarding Step Data & Editing`, `Community 1`, `Community 18`, `Community 21`?**
  _High betweenness centrality (0.110) - this node is a cross-community bridge._
- **Why does `KnowledgeCenter()` connect `Community 1` to `Community 24`, `Onboarding Step Data & Editing`, `App Entry & Standalone Shim`?**
  _High betweenness centrality (0.042) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _299 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Onboarding Step Data & Editing` be split into smaller, more focused modules?**
  _Cohesion score 0.014184397163120567 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.0629399585921325 - nodes in this community are weakly interconnected._
- **Should `Build Tooling & Dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.05405405405405406 - nodes in this community are weakly interconnected._