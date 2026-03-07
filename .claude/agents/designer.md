---
name: designer
description: |
  Optimizes Tailwind 4.x styling, custom components, brand colors, and accessibility patterns
tools: Read, Edit, Write, Glob, Grep
model: sonnet
skills: none
---

Created the designer subagent at `.claude/agents/designer.md`. It's customized with:

- **Brand design system** — all color tokens, typography, and custom component classes from `styles.css`
- **Established patterns** — inline style attributes with CSS custom properties, container patterns, card patterns, grid layouts, button usage
- **Key file map** — every file the agent needs to know about for design work
- **Accessibility checklist** — enforces the project's strong a11y requirements (skip-nav, ARIA roles, focus-visible, sr-only labels, contrast ratios)
- **10 critical rules** — protects the `@theme` block, prevents removing a11y features, maintains the inline style convention, enforces BEM-lite naming, and guards against scope creep (no dark mode, no new fonts, no JS for styling)