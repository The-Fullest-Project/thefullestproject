All three skill files have been generated. Here's a summary:

**SKILL.md** (~75 lines) - Overview of the dual deployment paths (local `deploy.js` via `basic-ftp` and CI via `SamKirkland/FTP-Deploy-Action`), environment variables, key concepts table, and a prominent warning about `clearWorkingDir()` destroying non-build files.

**references/patterns.md** (~130 lines) - Covers:
- Connection/authentication with FTPS requirement
- Full-replace vs incremental sync upload strategies
- Credential management (local `.env` vs GitHub Secrets)
- Error handling with `finally` block for connection cleanup
- 3 anti-patterns with WARNING headers: disabling TLS, committing credentials, omitting `client.close()`
- Build pipeline integration

**references/workflows.md** (~140 lines) - Covers:
- Local deploy checklist and validation loop
- CI/CD deploy pipeline (push to main trigger)
- Weekly scrape-and-deploy pipeline flow
- 5 troubleshooting scenarios (timeout, auth failure, too many connections, permission denied, empty site)
- Adding pre/post-deploy steps (build verification, protecting non-build files, excluding files in CI)

Cross-references: **eleventy** skill (build output), **github-actions** skill (workflow config), **python** skill (scraper pipeline). 17 code blocks total across all files.