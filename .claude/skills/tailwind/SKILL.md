All three files are created. Here's a summary of what was generated:

**`.claude/skills/tailwind/SKILL.md`** (~110 lines)
- Overview of the hybrid Tailwind 4.x approach (custom classes + utilities + CSS custom properties)
- Quick start with card and responsive section examples
- Design token table (all `@theme` values)
- Custom component class inventory with combination guidance
- Responsive breakpoint reference
- Critical warning about never using Tailwind color classes
- Build commands
- Cross-references to **eleventy**, **nunjucks**, **frontend-design**, and **javascript** skills

**`references/patterns.md`** (~150 lines)
- Section layout container pattern
- Three card variants: content card, resource card (with data-attributes), blog post card
- Responsive grid column patterns
- Navigation responsive pattern (desktop flex / mobile toggle)
- Form layout pattern (stacked → horizontal)
- Accessibility patterns (skip-nav, sr-only, aria-hidden, focus-visible)
- Three WARNING anti-patterns with problem/why/fix structure:
  - Using Tailwind color classes instead of CSS custom properties
  - Recreating custom component styles with raw utilities
  - Removing focus outlines without alternatives

**`references/workflows.md`** (~130 lines)
- Adding a new page section (checklist + template)
- Adding a new custom component class (with validation steps)
- Modifying design tokens
- Build and dev pipeline (dev, production, CSS-only)
- Debugging CSS issues (missing classes, dynamic class names warning, inline style debugging)
- Adding a new page (8-step checklist)

All examples are drawn directly from the actual codebase (`index.njk`, `resources.njk`, `nav.njk`, `footer.njk`, `styles.css`). 18 code blocks total across all files.