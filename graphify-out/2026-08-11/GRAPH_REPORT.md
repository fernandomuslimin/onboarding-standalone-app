# Graph Report - onboarding-standalone-app  (2026-08-11)

## Corpus Check
- 28 files · ~54,020 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 461 nodes · 769 edges · 24 communities (14 shown, 10 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 6 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `c1e93372`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Onboarding Step Data & Editing|Onboarding Step Data & Editing]]
- [[_COMMUNITY_Knowledge Center UI Components|Knowledge Center UI Components]]
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
- [[_COMMUNITY_Community 28|Community 28]]

## God Nodes (most connected - your core abstractions)
1. `Icon()` - 20 edges
2. `OnboardingShell()` - 17 edges
3. `compilerOptions` - 13 edges
4. `IcpDetail` - 12 edges
5. `PersonaDetail` - 12 edges
6. `KnowledgeCenter()` - 12 edges
7. `ProductDetail` - 11 edges
8. `PRODUCTS` - 10 edges
9. `CampaignCombo` - 10 edges
10. `formatCurrencyShort()` - 10 edges

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

## Communities (24 total, 10 thin omitted)

### Community 0 - "Onboarding Step Data & Editing"
Cohesion: 0.02
Nodes (69): ALL_STEPS, AvailStatus, BACK_BTN, BRAND_HIGHLIGHTS, Campaign, CAMPAIGNS, CampaignStep, CARD (+61 more)

### Community 2 - "Knowledge Center UI Components"
Cohesion: 0.09
Nodes (37): CHIP_FIELDS, CompanySection(), CompanySummary(), positioningStatement(), PROSE, TEXT_FIELDS, campaignCombosForPersona(), COMPANY_CONFIDENCE (+29 more)

### Community 3 - "Build Tooling & Dependencies"
Cohesion: 0.05
Nodes (34): dependencies, react, react-dom, devDependencies, playwright, @types/react, @types/react-dom, typescript (+26 more)

### Community 4 - "App Entry & Standalone Shim"
Cohesion: 0.13
Nodes (15): focusStyle(), isValidUrl(), Next.js Decoupling Shim (design rationale for standalone export), OnboardingShell(), StepClearedForLaunch(), StepCompanyResearch(), StepConnect(), StepOutreachCampaign() (+7 more)

### Community 5 - "AI Text Revision Helpers"
Cohesion: 0.29
Nodes (7): firstSentence(), reviseCallPrepNotes(), reviseCompetitive(), reviseProductBundle(), reviseText(), reviseValueProps(), titleCase()

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
Cohesion: 0.07
Nodes (44): HEADER_CELL, KnowledgeDashboard(), NUM_CELL, PerformanceRow, Row(), Tier, TIER_META, TIER_ORDER (+36 more)

### Community 23 - "Community 23"
Cohesion: 0.08
Nodes (46): CampaignSection(), CHANNEL_ICON, ComboRow(), HEADER_CELL, overallFit(), STATUS_STYLE, tone(), CampaignSequenceView() (+38 more)

## Ambiguous Edges - Review These
- `CAMPAIGN_COMBOS` → `RoadmapPhase`  [AMBIGUOUS]
  src/knowledge-center/data.ts · relation: references

## Knowledge Gaps
- **187 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+182 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **10 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `CAMPAIGN_COMBOS` and `RoadmapPhase`?**
  _Edge tagged AMBIGUOUS (relation: references) - confidence is low._
- **Why does `OnboardingShell()` connect `App Entry & Standalone Shim` to `Onboarding Step Data & Editing`, `Community 18`, `Community 23`?**
  _High betweenness centrality (0.166) - this node is a cross-community bridge._
- **Why does `KnowledgeCenter()` connect `Community 23` to `Onboarding Step Data & Editing`, `Knowledge Center UI Components`, `App Entry & Standalone Shim`?**
  _High betweenness centrality (0.096) - this node is a cross-community bridge._
- **Why does `Icon()` connect `Knowledge Center UI Components` to `Community 21`, `Community 23`?**
  _High betweenness centrality (0.067) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _188 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Onboarding Step Data & Editing` be split into smaller, more focused modules?**
  _Cohesion score 0.016129032258064516 - nodes in this community are weakly interconnected._
- **Should `Knowledge Center UI Components` be split into smaller, more focused modules?**
  _Cohesion score 0.08603145235892692 - nodes in this community are weakly interconnected._