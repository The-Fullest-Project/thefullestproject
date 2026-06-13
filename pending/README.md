# Pending Review Store

Content waiting for admin approval before it goes live on the site.
Reviewed at https://thefullestproject.org/admin/review/

| File | Written by | Contents |
|------|-----------|----------|
| `submissions.json` | tfp-admin-api worker only | Website resource submissions (incl. Quick Submit bookmarklet) and bulk imports |
| `scraped/<date>-<type>s.json` | Weekly scrape Action only | New items found by scrapers: resources, stories, spotlights, blog article candidates |

The weekly Action only **creates** new dated batch files; the worker only
**edits/deletes** existing ones (approve moves the payload into `src/_data/`,
reject removes it and blocklists scraped items). Because the two writers never
touch the same file, the Sunday scrape commit and portal approval commits
cannot conflict.

Every item is wrapped in an envelope:

```json
{
  "id": "res-20260614-3fa1b2c8",
  "type": "resource | story | spotlight | blog | submission",
  "status": "pending",
  "origin": { "type": "scraper | submission | quick-submit | bulk-import", "detail": "nova_resources", "submittedAt": "ISO timestamp" },
  "targetFile": "src/_data/resources/nova.json",
  "payload": { }
}
```

Rules:

- This directory lives **outside `src/_data/`** on purpose — Eleventy must never
  build pending data into the site.
- **No emails.** The repo is public; `submitterEmail` never enters an envelope
  (it goes only to Formspree notifications and Brevo).
- Unreviewed stories/spotlights/blog candidates expire after 28 days
  (`pending_store.prune_stale`, run by the weekly digest step). Resources and
  human submissions are never auto-pruned.
