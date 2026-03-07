---
name: refactor-agent
description: |
  Improves code organization in scrapers, templates, and JavaScript modules
tools: Read, Edit, Write, Glob, Grep, Bash
model: sonnet
skills: none
---

The `refactor-agent.md` has been created at `.claude/agents/refactor-agent.md`. Here's a summary of what's customized for this project:

**Key customizations:**
- **Build verification commands** mapped to each file type (Eleventy, Tailwind, Python `py_compile`, JS `node --check`) — no linting tools are configured in this project
- **Code smells specific to this codebase**: duplicate patterns across `nova_resources.py`/`national_resources.py`, repeated inline styles in templates, duplicated nav markup, hardcoded seed data dicts, magic category/location strings
- **Refactoring catalog tailored to the stack**: Extract Nunjucks Partial, Extract Scraper Helper, Externalize Seed Data, Introduce Nunjucks Macro — not generic OOP patterns
- **11 project-specific constraints**: vanilla JS only, CommonJS modules, build order (Eleventy before Tailwind), scraper merge behavior preservation, accessibility non-negotiables, layout chain requirements
- **Concrete examples**: extracting shared scraper logic into `base_scraper.py` (not a new file), extracting Nunjucks partials while preserving `data-*` attributes for `resourceFilter.js`
- **Naming conventions** matching all five languages/contexts in the project