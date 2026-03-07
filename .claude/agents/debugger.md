---
name: debugger
description: |
  Investigates build errors, template rendering issues, and scraper data pipeline problems
tools: Read, Edit, Bash, Grep, Glob
model: sonnet
skills: none
---

Created `.claude/agents/debugger.md` with project-specific customizations including:

- **7 error categories** mapped to this project's actual architecture: Eleventy build, Nunjucks templates, Tailwind CSS, resource data pipeline, client-side JS, scraper pipeline, and deployment/CI
- **Cross-system data flow debugging** trace path (scraper → JSON → template → HTML → JS filter)
- **Actual file paths** and configuration references from the codebase
- **Known fragile patterns** like `filterByCategory` requiring arrays, `load_existing()` lacking corrupt JSON handling, build order constraints, and case sensitivity between template filters and JS comparisons
- **Verification commands** for each error category to isolate failures
- **Structured output format** (root cause, evidence, fix, verification, prevention)