All 5 files for the **github-actions** skill have been created:

```
.claude/skills/github-actions/
├── SKILL.md                      # Overview, quick start, key patterns
└── references/
    ├── ci-cd.md                  # Workflow structure, caching, reusable workflows
    ├── deployment.md             # FTP action config, deploy.js, env vars
    ├── docker.md                 # Not used — guidance if/when to add
    └── monitoring.md             # Missing monitoring gaps + solutions
```

**Key highlights across the files:**

- **SKILL.md** (107 lines) — Maps both workflows, documents required secrets, covers the conditional git commit pattern, and flags common pitfalls (npm install vs npm ci, trailing slashes, push conflicts)
- **references/ci-cd.md** (130 lines) — Full workflow examples from the actual codebase, flags the missing pip cache, warns about duplicated deploy steps, suggests reusable workflow extraction
- **references/deployment.md** (134 lines) — Documents both deploy paths (CI and local), warns about `clearWorkingDir()` destructive behavior, covers `.env` security, includes deployment checklist
- **references/docker.md** (117 lines) — Honest assessment that Docker isn't needed, provides ready-to-use Dockerfile/Compose if it becomes necessary, warns against Dockerizing FTP deploys
- **references/monitoring.md** (138 lines) — Identifies 3 missing monitoring gaps (silent scraper failures, no uptime monitoring, no deploy notifications) with concrete fixes including scraper output validation, uptime checks, and GitHub issue creation on failure

Total code blocks across all files: **22** (exceeds the 15 minimum). All examples use actual project paths, secrets, and workflow patterns.