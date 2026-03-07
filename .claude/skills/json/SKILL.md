All three JSON skill files have been created:

**SKILL.md** (85 lines) — Quick overview of the resource schema, field rules, valid category slugs, file locations, and cross-references to related skills.

**references/patterns.md** (148 lines) — Covers:
- Resource schema enforcement with full 14-field example
- Empty field conventions (empty strings, not null)
- Data attribute mapping contract between JSON → Nunjucks → `resourceFilter.js`
- 4 anti-patterns with WARNING headers: category-as-string, null values, duplicate entries, trailing commas

**references/workflows.md** (145 lines) — Covers:
- Adding resources manually (with checklist)
- Adding new state files (auto-discovered by Eleventy)
- Updating `site.json` for forms and social links
- Full scraper-to-template data pipeline diagram
- Adding new categories (3-place sync requirement with checklist)
- JSON validation commands and common parse errors

Files created at:
- `.claude/skills/json/SKILL.md`
- `.claude/skills/json/references/patterns.md`
- `.claude/skills/json/references/workflows.md`