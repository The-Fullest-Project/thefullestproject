All 7 files are in place. Here's a summary of what was created:

**`designing-inapp-guidance` skill** — 7 files in `.claude/skills/designing-inapp-guidance/`

| File | Lines | Key Content |
|------|-------|-------------|
| **SKILL.md** | ~140 | CSS-only tooltip pattern, inline help text, zero-results empty state, filter guidance banner, reusable Nunjucks tooltip macro |
| **references/activation-onboarding.md** | ~130 | localStorage first-visit detection, role-based orientation banner, resource directory first-use hint, form field help text, anti-patterns (modals, JS tour libraries) |
| **references/engagement-adoption.md** | ~140 | Cross-linking strategy via URL params (`?category=therapy`), contextual CTAs at content page bottoms, empty state conversion, newsletter differentiation by placement |
| **references/in-app-guidance.md** | ~150 | Full tooltip system (macro + CSS + usage), `aria-describedby` inline help, progressive disclosure with `<details>`, jump links, breadcrumbs, accessibility requirements |
| **references/product-analytics.md** | ~140 | WARNING about missing analytics, lightweight Plausible recommendation, filter/search/click event tracking, form conversion tracking, privacy-safe metrics |
| **references/roadmap-experiments.md** | ~130 | `features.json` build-time feature flags, client-side A/B testing, 3-phase rollout plan (passive → interactive → behavioral), flag hygiene |
| **references/feedback-insights.md** | ~140 | Hidden Formspree fields for source tracking, "Was this helpful?" CTA routing to contact form, URL param pre-fill, resource link checker script, privacy safeguards |

All examples reference actual files, CSS classes, data attributes, and URL patterns from the codebase. The skill is grounded in the static site architecture — no server-side patterns, no heavy JS libraries, CSS-first approach throughout.