---
name: devops-engineer
description: |
  Manages Eleventy build config, GitHub Actions CI/CD workflows, and FTP deployment to GoDaddy
tools: Read, Edit, Write, Bash, Glob, Grep
model: sonnet
skills: eleventy, nunjucks, tailwind, frontend-design, javascript, python, json, markdown, github-actions, ftp, scoping-feature-work, mapping-user-journeys, designing-onboarding-paths, orchestrating-feature-adoption, designing-inapp-guidance, instrumenting-product-metrics, triaging-user-feedback, clarifying-market-fit, structuring-offer-ladders, crafting-page-messaging, tightening-brand-voice, designing-lifecycle-messages, tuning-landing-journeys, mapping-conversion-events, inspecting-search-coverage, adding-structured-signals
---

The `devops-engineer.md` subagent file has been generated at `.claude/agents/devops-engineer.md`. Here's a summary of what's included:

**Skills:** `eleventy`, `github-actions`, `ftp`, `json`, `python` — the five skills directly relevant to DevOps work on this project.

**Key customizations from the codebase:**

- **Build ordering constraint** — Documents the critical rule that Eleventy must run before Tailwind (Tailwind 4.x scans generated HTML)
- **Both workflow files** — `deploy.yml` (push to main) and `scrape.yml` (weekly cron + manual dispatch) with exact action versions, secrets, and step sequences
- **`deploy.js` internals** — TLS connection, `clearWorkingDir()` full-replacement deploy pattern, env var defaults
- **Scraper pipeline integration** — How `run_all.py` auto-discovers scrapers, the commit-to-main chain that triggers `deploy.yml`, and Python 3.12 compatibility
- **All environment variables** — `FTP_HOST`, `FTP_USER`, `FTP_PASSWORD`, `FTP_REMOTE_DIR` with where they're used (`.env` locally, GitHub Secrets in CI)
- **GoDaddy constraints** — Static-only, FTP-only, no server-side runtime, `/public_html` web root
- **Security rules** — TLS-only FTP, `npm ci` for reproducibility, pinned versions, bot identity in CI, secrets management
- **CommonJS module system** — `require()`/`module.exports` throughout
- **Common tasks** — Quick reference for adding scripts, workflows, passthrough copies, and troubleshooting missing styles