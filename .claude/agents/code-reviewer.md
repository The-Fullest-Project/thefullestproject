---
name: code-reviewer
description: |
  Reviews code quality, accessibility patterns, and adherence to CLAUDE.md conventions
tools: Read, Grep, Glob, Bash
model: inherit
skills: none
---

Created `.claude/agents/code-reviewer.md`. The subagent is customized with:

- **10-point review checklist** covering naming conventions, accessibility, template patterns, Tailwind styling, vanilla JS, Python scrapers, resource data schema, CI/CD config, security, and general code quality
- **Project-specific naming convention table** mapping each context (JS, Python, CSS, HTML IDs, etc.) to its required convention
- **Accessibility section** treating all ARIA, landmark, and focus requirements as non-negotiable
- **Resource data schema validation** including required fields and valid location values
- **Structured feedback format** (Critical / Warnings / Suggestions / Passed) with file:line references
- **CRITICAL rules** that prevent approving code that breaks accessibility, hardcodes values, introduces frameworks, or leaks secrets