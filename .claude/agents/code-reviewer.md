---
name: code-reviewer
description: |
  Reviews code quality, accessibility patterns, and adherence to CLAUDE.md conventions
tools: Read, Grep, Glob, Bash
model: inherit
skills: eleventy, nunjucks, tailwind, frontend-design, javascript, python, json, markdown, github-actions, ftp, scoping-feature-work, mapping-user-journeys, designing-onboarding-paths, orchestrating-feature-adoption, designing-inapp-guidance, instrumenting-product-metrics, triaging-user-feedback, clarifying-market-fit, structuring-offer-ladders, crafting-page-messaging, tightening-brand-voice, designing-lifecycle-messages, tuning-landing-journeys, mapping-conversion-events, inspecting-search-coverage, adding-structured-signals
---

The **code-reviewer** subagent has been generated at `.claude/agents/code-reviewer.md` (~234 lines). Here's what it includes:

**Frontmatter:**
- Skills: `eleventy, nunjucks, tailwind, javascript, python, json, github-actions` (7 project-relevant skills)
- Tools: `Read, Grep, Glob, Bash`

**10-point review checklist covering:**
1. **Naming conventions** — full table mapping every context (JS, Python, CSS, HTML IDs, etc.) to its required convention
2. **Accessibility** — all ARIA, landmark, focus, and label requirements treated as Critical (non-negotiable)
3. **Template patterns** — front matter, layout chain, component includes, data access, Formspree integration
4. **Styling** — CSS custom properties over Tailwind color classes, custom component class inventory, responsive patterns
5. **JavaScript** — vanilla-only enforcement, DOM patterns, data-attribute contracts with `resourceFilter.js`
6. **Python scrapers** — `scrape()` export, `make_resource()`/`merge_resources()` usage, error handling
7. **Resource data schema** — all 14 fields validated, no nulls, valid location values, array-not-string for categories
8. **CI/CD** — workflow patterns, `npm ci` over `npm install`, secret management
9. **Security** — no hardcoded secrets, no innerHTML from user input, no eval
10. **General code quality** — duplication, dead code, naming clarity

**Structured feedback format:** Summary → Critical → Warnings → Suggestions → Passed Checks, all with `file_path:line_number` references.