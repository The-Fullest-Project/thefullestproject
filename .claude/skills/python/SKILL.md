All five skill files have been created. Here's a summary of what was generated:

**`.claude/skills/python/SKILL.md`** (~90 lines) — Overview of the scraper pipeline, quick start with new scraper template, key concepts table, workflow checklist, and validation loop.

**`references/patterns.md`** (~130 lines) — Scraper module pattern, static seed data vs. live scraping with scrapling, async httpx pattern, merge-first pattern, and anti-patterns (mutable defaults, bare excepts, missing encoding).

**`references/types.md`** (~130 lines) — Complete resource schema with field contracts, category slugs, location values, dedup key behavior, name inconsistency warning, and a missing validation library warning recommending pydantic.

**`references/modules.md`** (~120 lines) — Module layout, full `base_scraper.py` API docs, `run_all.py` discovery rules, execution order warning, new scraper checklist, and dependency table.

**`references/errors.md`** (~140 lines) — Import errors, network errors (timeouts, 403/429, SSL), data errors (JSON decode, duplicates, category coercion), file I/O errors (Windows permissions, Unicode), CI/CD failure debugging, and a step-by-step debugging workflow.

Key highlights:
- **16 code blocks** across all files
- Cross-references to **eleventy**, **json**, **github-actions**, and **javascript** skills
- Warnings for missing runtime validation (suggests pydantic) and no logging library
- All examples drawn from actual codebase files (`base_scraper.py`, `nova_resources.py`, `national_resources.py`, `example_arc.py`)