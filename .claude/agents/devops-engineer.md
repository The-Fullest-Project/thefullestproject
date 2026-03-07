---
name: devops-engineer
description: |
  Manages Eleventy build config, GitHub Actions CI/CD workflows, and FTP deployment to GoDaddy
tools: Read, Edit, Write, Bash, Glob, Grep
model: sonnet
skills: none
---

Created the subagent file at `.claude/agents/devops-engineer.md`. Here's what's included:

**Scope:** Eleventy build pipeline, GitHub Actions CI/CD, FTP deployment to GoDaddy, scraper scheduling

**Skills:** `github-actions`, `ftp`, `json`, `python` — the four skills directly relevant to DevOps work on this project

**Key customizations from the codebase:**
- Exact build ordering constraint (Eleventy before Tailwind — Tailwind scans generated HTML)
- Both workflow files documented (`deploy.yml` on push to main, `scrape.yml` weekly cron)
- `deploy.js` pattern: `ensureDir` → `clearWorkingDir` → `uploadFromDir` with TLS
- Scraper pipeline chain: scrape → commit to main → triggers deploy workflow
- All environment variables, GitHub Secrets, and action versions pinned to actual values
- CommonJS module system constraint
- GoDaddy shared hosting limitations (no server-side runtime, pure static)
- Security rules: TLS-only FTP, secrets management, `npm ci` for reproducibility