All JavaScript skill files have been generated. Here's a summary of what was created:

**`.claude/skills/javascript/SKILL.md`** (87 lines) — Overview of the vanilla JS approach, quick start examples for both scripts, key concepts table, common patterns for adding filters and page-specific scripts, cross-references to related skills.

**`references/patterns.md`** (140 lines) — DOM ready pattern, element targeting with guard clauses, data-attribute filtering logic, URL parameter hydration with the locationMap bridge, ARIA state management, event binding conventions, and anti-patterns (frameworks overkill, innerHTML XSS, unscoped queries).

**`references/types.md`** (130 lines) — Data attribute contracts between Nunjucks and JS, element ID registry (global and resources-page), URL parameter schema with slug-to-display-name mapping, filter state shape, client-side resource data shape vs full schema, and Node vs browser execution contexts.

**`references/modules.md`** (120 lines) — File organization, browser script details (main.js, resourceFilter.js), Node script details (.eleventy.js, deploy.js), step-by-step checklists for adding new browser and Node scripts, Eleventy passthrough copy integration.

**`references/errors.md`** (145 lines) — Null element references, data attribute mismatches (case, location names, category substring collisions), ARIA state bugs (string vs boolean gotcha), build/deployment errors (404s, missing modules, env vars), and a debugging workflow covering browser DevTools, Node scripts, and cross-file triage order.

Total: 20+ code blocks across all files, with real examples from this codebase, cross-references to eleventy/nunjucks/tailwind/frontend-design/json/ftp skills, and WARNING blocks for every anti-pattern.