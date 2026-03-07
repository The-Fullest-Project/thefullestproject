# Python Scraper Patterns

## Contents
- Scraper Module Pattern
- Data Source Patterns
- Live Scraping with scrapling
- Async HTTP with httpx
- Merge-First Pattern
- Anti-Patterns

## Scraper Module Pattern

Every scraper in `scrapers/sources/` follows the same structure. The runner discovers modules by filename and calls `scrape()`.

```python
"""Scraper for [region] [topic] resources."""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from base_scraper import make_resource, save_resources, load_existing, merge_resources

def scrape():
    scraped = []
    # ... build scraped list ...
    existing = load_existing('target.json')
    merged = merge_resources(existing, scraped)
    save_resources(merged, 'target.json')

if __name__ == '__main__':
    scrape()
```

The `sys.path.insert` is required because `run_all.py` imports via `importlib.import_module('sources.module_name')` — without it, `from base_scraper import ...` fails.

## Data Source Patterns

### Static Seed Data (national_resources.py pattern)

For curated directories where URLs are known upfront, define a `SOURCES` dict keyed by category:

```python
SOURCES = {
    "category-slug": [
        {
            "url": "https://example.org",
            "name": "Resource Name",
            "description": "What it provides.",
        },
    ],
}

def scrape():
    scraped = []
    for category, sources in SOURCES.items():
        for src in sources:
            resource = make_resource(
                name=src["name"],
                category=[category],
                location="National",
                description=src["description"],
                website=src["url"],
                source=src["url"],
                tags=[category],
            )
            scraped.append(resource)
    # ... merge and save ...
```

### Live Scraping with scrapling

For pages that need HTML parsing, use scrapling's `Fetcher`. Always handle the import gracefully:

```python
try:
    from scrapling import Fetcher
    HAS_SCRAPLING = True
except ImportError:
    HAS_SCRAPLING = False
    print("WARNING: scrapling not installed. Using seed data only.")
```

Then enrich after building the base list:

```python
if HAS_SCRAPLING:
    fetcher = Fetcher(auto_match=False)
    for resource in scraped:
        try:
            page = fetcher.get(resource["website"])
            phone_el = page.css('a[href^="tel:"]')
            if phone_el:
                resource["phone"] = phone_el[0].text.strip()
        except Exception as e:
            print(f"  Could not enrich {resource['name']}: {e}")
```

### Async HTTP with httpx

For bulk fetching where scrapling's sync fetcher is too slow:

```python
import httpx
import asyncio

async def fetch_all(urls):
    async with httpx.AsyncClient(timeout=30.0) as client:
        tasks = [client.get(url) for url in urls]
        return await asyncio.gather(*tasks, return_exceptions=True)

results = asyncio.run(fetch_all(url_list))
for url, result in zip(url_list, results):
    if isinstance(result, Exception):
        print(f"  Failed: {url}: {result}")
        continue
    # parse result.text ...
```

## Merge-First Pattern

ALWAYS load existing data before saving. This preserves manually curated entries.

```python
# GOOD - preserves manual entries
existing = load_existing('nova.json')
merged = merge_resources(existing, scraped)
save_resources(merged, 'nova.json')
```

```python
# BAD - destroys manual entries
save_resources(scraped, 'nova.json')
```

**Why this matters:** Some resources are added by hand (community submissions via Formspree). Skipping the merge obliterates them on the next scrape run.

## WARNING: Mutable Default Arguments

**The Problem:**

```python
# BAD - shared list across all calls
def make_resource(name, tags=[]):
    tags.append("auto-scraped")
    return {"name": name, "tags": tags}
```

**Why This Breaks:** The default `[]` is created once at function definition time. Every call that uses the default mutates the same list object, causing tags to accumulate across calls.

**The Fix:**

```python
# GOOD - base_scraper.py already does this correctly
def make_resource(name, tags=None):
    return {"tags": tags or []}
```

## WARNING: Bare except Clauses

**The Problem:**

```python
# BAD - catches KeyboardInterrupt, SystemExit, everything
try:
    page = fetcher.get(url)
except:
    pass
```

**Why This Breaks:** Swallows `KeyboardInterrupt` (Ctrl+C), `SystemExit`, and `MemoryError`. You can't stop a runaway scraper. The CI job hangs instead of failing.

**The Fix:**

```python
# GOOD - catch specific exceptions, log the error
try:
    page = fetcher.get(url)
except (httpx.HTTPError, ConnectionError, TimeoutError) as e:
    print(f"  Could not fetch {url}: {e}")
```

## WARNING: Missing Encoding Parameter

**The Problem:**

```python
# BAD on Windows - uses system default encoding (often cp1252)
with open(path, 'w') as f:
    json.dump(data, f)
```

**Why This Breaks:** Resource descriptions contain Unicode characters (em dashes, curly quotes). On Windows, the default encoding isn't UTF-8, producing `UnicodeEncodeError` or mojibake in the JSON output.

**The Fix:**

```python
# GOOD - base_scraper.py uses this correctly
with open(path, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)
```
