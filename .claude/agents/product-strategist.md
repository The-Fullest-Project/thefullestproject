---
name: product-strategist
description: |
  In-product journeys, activation, and feature adoption for app flows
tools: Read, Edit, Write, Glob, Grep
model: sonnet
skills: eleventy, nunjucks, tailwind, frontend-design, javascript, python, json, markdown, github-actions, ftp, scoping-feature-work, mapping-user-journeys, designing-onboarding-paths, orchestrating-feature-adoption, designing-inapp-guidance, instrumenting-product-metrics, triaging-user-feedback, clarifying-market-fit, structuring-offer-ladders, crafting-page-messaging, tightening-brand-voice, designing-lifecycle-messages, tuning-landing-journeys, mapping-conversion-events, inspecting-search-coverage, adding-structured-signals
---

The **product-strategist** subagent has been generated at `.claude/agents/product-strategist.md` (~256 lines).

**Frontmatter:**
- Skills: `scoping-feature-work, mapping-user-journeys, designing-onboarding-paths, orchestrating-feature-adoption, designing-inapp-guidance, instrumenting-product-metrics, triaging-user-feedback, clarifying-market-fit, mapping-conversion-events` (9 product-focused skills)
- Tools: `Read, Edit, Write, Glob, Grep`
- Model: `sonnet`

**Key improvements over the previous version:**

1. **Architecture constraints section** — explicit about the static-site limitations (no accounts, no server-side, no analytics, placeholder Formspree IDs)
2. **Known gaps & friction points** — categorized as Critical/High/Moderate with specific file:line references (e.g., substring bug at `resourceFilter.js:53`)
3. **Key patterns section** — URL deep linking, empty state pattern, build-time feature flags via `site.json`, localStorage state, with code examples
4. **Conversion funnel reference table** — P0/P1/P2 event taxonomy mapped to specific surfaces and signals
5. **User journey model** — includes the current gap (no cross-linking from content pages to resources)
6. **Audience section** — grounded in `site.json` terminology ("connection hub"), caregiver personas
7. **10 ground rules** including privacy-by-default, vanilla JS only, static-first preference, and caregiver empathy
8. **Structured output format** — Goal/Surface/Current State/Change/Measurement/Accessibility for every recommendation