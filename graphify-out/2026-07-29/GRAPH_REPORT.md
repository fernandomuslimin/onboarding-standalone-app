# Graph Report - .  (2026-07-29)

## Corpus Check
- Corpus is ~45,598 words - fits in a single context window. You may not need a graph.

## Summary
- 300 nodes · 534 edges · 17 communities (9 shown, 8 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 12 edges (avg confidence: 0.85)
- Token cost: 0 input · 199,049 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Onboarding Step Data & Editing|Onboarding Step Data & Editing]]
- [[_COMMUNITY_Knowledge Center Data Model|Knowledge Center Data Model]]
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

## God Nodes (most connected - your core abstractions)
1. `OnboardingShell()` - 17 edges
2. `KnowledgeCenter()` - 17 edges
3. `Icon()` - 16 edges
4. `PERSONAS` - 14 edges
5. `compilerOptions` - 13 edges
6. `PRODUCTS` - 12 edges
7. `ICPS` - 10 edges
8. `ScoringSection()` - 9 edges
9. `IcpSection()` - 9 edges
10. `ChipList()` - 9 edges

## Surprising Connections (you probably didn't know these)
- `Next.js Decoupling Shim (design rationale for standalone export)` --rationale_for--> `OnboardingShell()`  [EXTRACTED]
  README.md → src/onboarding-shell.tsx
- `index.html (dev entry HTML)` --references--> `src/main.tsx (React entry point)`  [EXTRACTED]
  index.html → src/main.tsx
- `StepClearedForLaunch()` --references--> `KnowledgeCenter()`  [INFERRED]
  src/onboarding-shell.tsx → src/knowledge-center/KnowledgeCenter.tsx
- `overallScore()` --semantically_similar_to--> `overallFit()`  [INFERRED] [semantically similar]
  src/knowledge-center/data.ts → src/knowledge-center/Campaign.tsx
- `ChainMatrix()` --semantically_similar_to--> `ComboRow()`  [INFERRED] [semantically similar]
  src/knowledge-center/Scoring.tsx → src/knowledge-center/Campaign.tsx

## Hyperedges (group relationships)
- **Onboarding Wizard Step Sequence** — src_onboarding_shell_onboardingshell, src_onboarding_shell_stepsplash, src_onboarding_shell_stepwelcome, src_onboarding_shell_stepwebsite, src_onboarding_shell_stepproducts, src_onboarding_shell_stepconnect, src_onboarding_shell_stepresearch, src_onboarding_shell_stepcompanyresearch, src_onboarding_shell_steptamicp, src_onboarding_shell_steppersonas, src_onboarding_shell_stepoutreachcampaign, src_onboarding_shell_stepclearedforlaunch, knowledge_center_knowledgecenter_knowledgecenter [EXTRACTED 1.00]
- **Vite Build & Single-File Export Pipeline** — package_json, vite_config_ts, tsconfig_json, vite_config_singlefile_ts, onboarding_standalone_html [EXTRACTED 1.00]
- **GitHub Pages Deployment Pipeline** — workflows_deploy, workflows_deploy_preview, package_json [INFERRED 0.85]
- **List + Detail Master-Detail UI Pattern** — knowledge_center_icp_icpsection, knowledge_center_persona_personasection, knowledge_center_resources_resourcessection, knowledge_center_product_productsection [INFERRED 0.85]
- **Product / ICP / Persona Combination Data Model** — knowledge_center_data_productdetail, knowledge_center_data_icpdetail, knowledge_center_data_personadetail, knowledge_center_data_scorechain, knowledge_center_data_campaigncombo [INFERRED 0.90]
- **Reviewed-Sections Progress Tracking Flow** — knowledge_center_knowledgecenter_knowledgecenter, knowledge_center_company_companysection, knowledge_center_product_productsection, knowledge_center_icp_icpsection, knowledge_center_persona_personasection [EXTRACTED 1.00]

## Communities (17 total, 8 thin omitted)

### Community 0 - "Onboarding Step Data & Editing"
Cohesion: 0.02
Nodes (63): ALL_STEPS, AvailStatus, Campaign, CAMPAIGNS, CampaignStep, CARD, Channel, CHANNEL_BADGE (+55 more)

### Community 1 - "Knowledge Center Data Model"
Cohesion: 0.07
Nodes (47): CHANNEL_ICON, ComboRow(), HEADER_CELL, overallFit(), STATUS_STYLE, tone(), CAMPAIGN_COMBOS, CampaignCombo (+39 more)

### Community 2 - "Knowledge Center UI Components"
Cohesion: 0.12
Nodes (40): CampaignSection(), CHIP_FIELDS, CompanySection(), computeCompletion(), TEXT_FIELDS, NAV_GROUPS, NAV_LABEL, REVIEWABLE_SECTIONS (+32 more)

### Community 3 - "Build Tooling & Dependencies"
Cohesion: 0.06
Nodes (33): dependencies, react, react-dom, devDependencies, @types/react, @types/react-dom, typescript, vite (+25 more)

### Community 4 - "App Entry & Standalone Shim"
Cohesion: 0.12
Nodes (14): index.html (dev entry HTML), onboarding-standalone.html (checked-in single-file build output), src/main.tsx (React entry point), Next.js Decoupling Shim (design rationale for standalone export), OnboardingShell(), StepClearedForLaunch(), StepCompanyResearch(), StepConnect() (+6 more)

### Community 5 - "AI Text Revision Helpers"
Cohesion: 0.29
Nodes (7): firstSentence(), reviseCallPrepNotes(), reviseCompetitive(), reviseProductBundle(), reviseText(), reviseValueProps(), titleCase()

### Community 6 - "Website & Product Step Validation"
Cohesion: 0.50
Nodes (4): focusStyle(), isValidUrl(), StepProducts(), StepWebsite()

### Community 8 - "Domain Step Validation"
Cohesion: 0.67
Nodes (3): isValidDomain(), StepForwardingDomain(), StepPrimaryDomain()

### Community 9 - "Resume Flow Helpers"
Cohesion: 0.67
Nodes (3): lastPhaseLabel(), StepResume(), timeAgo()

## Ambiguous Edges - Review These
- `CAMPAIGN_COMBOS` → `RoadmapPhase`  [AMBIGUOUS]
  src/knowledge-center/data.ts · relation: references

## Knowledge Gaps
- **115 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+110 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `CAMPAIGN_COMBOS` and `RoadmapPhase`?**
  _Edge tagged AMBIGUOUS (relation: references) - confidence is low._
- **Why does `OnboardingShell()` connect `App Entry & Standalone Shim` to `Onboarding Step Data & Editing`, `Knowledge Center UI Components`, `Website & Product Step Validation`?**
  _High betweenness centrality (0.239) - this node is a cross-community bridge._
- **Why does `KnowledgeCenter()` connect `Knowledge Center UI Components` to `Onboarding Step Data & Editing`, `Knowledge Center Data Model`, `App Entry & Standalone Shim`?**
  _High betweenness centrality (0.121) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _116 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Onboarding Step Data & Editing` be split into smaller, more focused modules?**
  _Cohesion score 0.01818181818181818 - nodes in this community are weakly interconnected._
- **Should `Knowledge Center Data Model` be split into smaller, more focused modules?**
  _Cohesion score 0.07474747474747474 - nodes in this community are weakly interconnected._
- **Should `Knowledge Center UI Components` be split into smaller, more focused modules?**
  _Cohesion score 0.11510204081632654 - nodes in this community are weakly interconnected._