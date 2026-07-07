# Scrapers

Two kinds of modules live in `scrapers/sources/` (all auto-discovered by
`run_all.py`, which calls each module's `scrape()`):

## 1. Discovery scrapers (genuine automated resource discovery)

These query free, structured, key-less data sources and **queue newly-found
resources to `pending/` for admin review** — they never write live data files,
so hand-curated entries are never overwritten.

| Module | Source | Notes |
|--------|--------|-------|
| `osm_overpass.py` | OpenStreetMap Overpass API | **Primary.** Local disability/therapy/rehab/social facilities per state. Free, no key, ODbL (attribution in site footer). Sweeps all 50 states + DC, rotated by week under a run-wide cap so review isn't flooded. |
| `cms_providers.py` | CMS Open Data API | Supplement: Medicare home-health agencies (caregiver-relevant). Public domain. Pilot states by default. |
| `news_leads.py` | Google News RSS | **Off by default** (`TFP_NEWS_LEADS=1` to enable). Personal-use ToS caveat; produces website-less leads tagged `needs-website` for human resolution. |
| `seed_propublica.py` *(root, not auto-run)* | ProPublica Nonprofit Explorer | One-time manual seed of disability nonprofits: `python scrapers/seed_propublica.py [STATES...]`. No websites/descriptions — reviewers enrich. |

Shared helpers (in `scrapers/`, underscore-prefixed so `run_all` skips them):
`_category_map.py` (source category → site slug, state tables, relevance/noise
filters), `_extraction.py` (free schema.org/JSON-LD/OG/tel: field extraction;
optional Claude-Haiku fallback, **off** unless `TFP_LLM_ENRICH=1`),
`_source_health.py` (fail-loud `SourceRun` + env parsing).

### Why queue-only + fail-loud

The previous scrapers silently fell back to hard-coded seed data when a fetch
failed, so an outage looked identical to "nothing new." Discovery scrapers now:
- **queue only** via `base_scraper.queue_new_resources()` (dedup against all live
  + pending by case/whitespace-insensitive `(name, location)`); nothing reaches
  the live site without admin approval in `/admin/review/`.
- **fail loud**: `SourceRun` logs `FAILED` (source down) or `PARSED_ZERO` (HTTP
  200 but nothing parsed — a schema break) to `scrapers/logs/scrape_log.json`,
  which `scrape_digest.py` surfaces in the weekly email instead of swallowing.

### Config (env vars)

| Var | Default | Effect |
|-----|---------|--------|
| `TFP_OSM_STATES` | all 50 + DC (week-rotated) | comma-separated codes to limit the OSM sweep |
| `TFP_OSM_MAX_PER_STATE` | none (25 in CI) | cap candidates per state |
| `TFP_OSM_MAX_TOTAL` | none (250 in CI) | run-wide intake cap |
| `TFP_OSM_DELAY` | 2 | seconds between state queries (politeness) |
| `TFP_OSM_REQUIRE_WEBSITE` | 1 (on) | skip OSM candidates without a website (admin decision, July 2026); `0` to queue them anyway |
| `TFP_CMS_STATES` | `VA,OR` | states for CMS supplement |
| `TFP_NEWS_LEADS` | off | `1` to enable Google News leads |
| `TFP_LLM_ENRICH` | off | `1` to enable optional paid Claude-Haiku extraction |

## 2. Curated catalogs (hand-maintained lists, not scraping)

`national_resources.py` and `nova_resources.py` publish hand-maintained lists.
Despite the historical "scraper" naming they do **no** live discovery (the audit
confirmed this). They flow through `base_scraper.save_resources()`, which queues
genuinely-new entries and refreshes already-live ones in place.

## Content scrapers (news, not resources)

`positive_stories.py`, `spotlight_scraper.py`, `blog_content.py` pull from Google
News RSS and queue stories/spotlights/blog candidates to `pending/` for review.

## Tests

```
python scrapers/test_pending_store.py        # pending store + gating + dedup
python scrapers/test_discovery_scrapers.py   # category map + extraction
```

## Pipeline

`run_all.py` → discovery + curated scrapers → `pending/` (+ live refresh for
curated). Weekly via `.github/workflows/scrape.yml`: scrape → prune stale →
digest email → commit → GitHub Pages deploy. Approvals happen in the admin
portal (`/admin/review/`) via the `tfp-admin-api` worker, which commits approved
items to live data. See the repo `CLAUDE.md` "Admin Review Pipeline" section.
