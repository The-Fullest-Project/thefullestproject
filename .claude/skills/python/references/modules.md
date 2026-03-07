# Python Module Structure

## Contents
- Module Layout
- base_scraper.py API
- run_all.py Discovery
- Scraper Source Modules
- Adding a New Scraper
- Dependencies

## Module Layout

```
scrapers/
├── base_scraper.py         # Shared utilities (import target for all scrapers)
├── run_all.py              # Pipeline runner (entry point)
├── requirements.txt        # scrapling>=0.2, httpx>=0.27
├── sources/                # Individual scraper modules
│   ├── national_resources.py
│   ├── nova_resources.py
│   └── example_arc.py      # Template scraper
└── output/                 # Raw JSON output (gitignored intermediate)
```

## base_scraper.py API

The shared module at `scrapers/base_scraper.py`. All scrapers import from here.

### `make_resource(**kwargs) -> dict`

Factory that produces a standardized resource dict. Handles:
- `category` string-to-list coercion
- `None` → empty string/list defaults
- `source` fallback to `website` value
- `lastScraped` auto-set to `date.today().isoformat()`

```python
from base_scraper import make_resource

r = make_resource(
    name="Resource Name",
    category=["housing"],       # or just "housing"
    location="Northern Virginia",
    description="What it does.",
    website="https://example.org",
    phone="555-1234",           # optional
    tags=["housing", "nova"],   # optional
)
```

### `save_resources(resources: list, filename: str) -> None`

Writes JSON to **two locations**:
1. `scrapers/output/{filename}` — raw output for debugging
2. `src/_data/resources/{filename}` — consumed by Eleventy

Supports subdirectories: `save_resources(data, 'states/VA.json')`.

### `load_existing(filename: str) -> list`

Loads current JSON from `src/_data/resources/{filename}`. Returns `[]` if file doesn't exist. Use before `merge_resources()` to preserve manual entries.

### `merge_resources(existing: list, scraped: list) -> list`

Deduplicates by `(name, location)` tuple. When a key exists in both lists:
- Scraped data **overwrites** existing fields
- Tags are **merged** (union of both sets)
- Manual-only entries (not in scraped) are **preserved**

```python
existing = load_existing('nova.json')
merged = merge_resources(existing, scraped)
# merged contains: all existing + all new scraped + updated existing
```

## run_all.py Discovery

The pipeline runner at `scrapers/run_all.py`. Auto-discovers and executes scrapers.

**Discovery rules:**
- Scans `scrapers/sources/` for `.py` files
- Skips files starting with `_` (e.g., `__init__.py`)
- Imports each as `sources.{module_name}` via `importlib.import_module`
- Calls `module.scrape()` if the function exists
- Logs a warning if `scrape()` is missing
- Catches and logs exceptions per-module (one failure doesn't stop others)

```python
# How run_all.py discovers modules:
scraper_files = [
    f[:-3] for f in os.listdir(sources_dir)
    if f.endswith('.py') and not f.startswith('_')
]
```

### WARNING: No Execution Order Guarantee

**The Problem:** `os.listdir()` returns files in filesystem order, which varies by OS. If one scraper depends on another's output (e.g., portland scraper reads nova.json), execution order is unpredictable.

**The Fix:** Each scraper must be independent. Never read another scraper's output file as input. If shared data is needed, put it in `base_scraper.py` as a constant.

## Scraper Source Modules

### Module Contract

Every file in `scrapers/sources/` must:
1. Be a valid Python module (snake_case filename)
2. Export a `scrape()` function (no arguments, no return value)
3. Handle its own errors gracefully (print warnings, don't raise)
4. Call `save_resources()` to persist results

### Path Setup

Because `run_all.py` manipulates `sys.path`, scraper modules need their own path fix for standalone execution:

```python
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from base_scraper import make_resource, save_resources, load_existing, merge_resources
```

This enables both `python scrapers/run_all.py` and `python scrapers/sources/my_scraper.py`.

## Adding a New Scraper

Copy this checklist:
- [ ] Create `scrapers/sources/your_region_resources.py`
- [ ] Add `sys.path.insert` and base_scraper imports
- [ ] Define `SOURCES` dict with categories and entries
- [ ] Implement `scrape()` using the merge-first pattern
- [ ] Add `if __name__ == '__main__': scrape()` guard
- [ ] Test standalone: `python scrapers/sources/your_region_resources.py`
- [ ] Verify output: check both `scrapers/output/` and `src/_data/resources/`
- [ ] Test via runner: `python scrapers/run_all.py`

## Dependencies

From `scrapers/requirements.txt`:

| Package | Version | Purpose |
|---------|---------|---------|
| `scrapling` | >=0.2 | HTML fetching and CSS-selector-based parsing |
| `httpx` | >=0.27 | Modern async HTTP client (alternative to requests) |

Both are optional at runtime — scrapers degrade gracefully if `scrapling` is missing (seed data only, no live enrichment). The **github-actions** skill's `scrape.yml` workflow installs these automatically in CI.

### WARNING: No Logging Library

**Detected:** All scrapers use `print()` for output. In CI (GitHub Actions), this works fine. For local debugging with multiple scrapers, output interleaves unpredictably.

**Recommendation:** For a pipeline this size, `print()` is acceptable. If the pipeline grows beyond ~10 scrapers, consider Python's `logging` module with per-scraper loggers.
