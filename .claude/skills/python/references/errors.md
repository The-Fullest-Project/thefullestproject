# Python Scraper Errors

## Contents
- Import Errors
- Network Errors
- Data Errors
- File I/O Errors
- CI/CD Failures
- Debugging Workflow

## Import Errors

### ModuleNotFoundError: base_scraper

**Cause:** Running a scraper module without the path fix.

```
ModuleNotFoundError: No module named 'base_scraper'
```

**Fix:** Ensure the `sys.path.insert` is at the top of every scraper:

```python
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from base_scraper import make_resource, save_resources, load_existing, merge_resources
```

### ImportError: scrapling

**Cause:** `scrapling` not installed. This is expected in environments without the scraper dependencies.

```
ImportError: No module named 'scrapling'
```

**Fix:** Graceful degradation pattern used by `nova_resources.py`:

```python
try:
    from scrapling import Fetcher
    HAS_SCRAPLING = True
except ImportError:
    HAS_SCRAPLING = False
    print("WARNING: scrapling not installed. Using seed data only.")
```

NEVER let a missing optional dependency crash the scraper. Seed data should always work without network access.

## Network Errors

### Connection Timeouts

**Cause:** Target site is slow or blocking automated requests.

```python
# BAD - no timeout, hangs forever
page = fetcher.get(url)
```

```python
# GOOD - explicit timeout
import httpx
async with httpx.AsyncClient(timeout=30.0) as client:
    response = await client.get(url)
```

For scrapling's `Fetcher`, timeouts are configured at initialization. Check scrapling docs for current API.

### HTTP 403/429 Errors

**Cause:** Site blocks scraper or rate limits.

```python
# GOOD - handle per-resource, don't stop the pipeline
try:
    page = fetcher.get(resource["website"])
except Exception as e:
    print(f"  Could not enrich {resource['name']}: {e}")
    # Continue to next resource — don't raise
```

**When rate-limited in bulk scraping:**

```python
import time

for url in urls:
    try:
        page = fetcher.get(url)
        # ... extract data ...
    except Exception as e:
        print(f"  Failed {url}: {e}")
    time.sleep(1)  # Be polite — 1 second between requests
```

### SSL/TLS Errors

**Cause:** Expired or self-signed certificates on target sites.

```python
# GOOD - log and skip, never disable verification globally
try:
    page = fetcher.get(url)
except Exception as e:
    if "SSL" in str(e) or "certificate" in str(e):
        print(f"  SSL error for {url} — skipping (cert may be expired)")
    else:
        raise
```

## Data Errors

### JSON Decode Error on load_existing()

**Cause:** Corrupted or empty JSON file in `src/_data/resources/`.

```
json.decoder.JSONDecodeError: Expecting value: line 1 column 1 (char 0)
```

**Fix:** `load_existing()` returns `[]` if the file doesn't exist, but crashes on malformed JSON. If this happens, check the file manually — it may have been partially written after a crash.

```python
# Defensive load pattern
def load_existing_safe(filename):
    data_path = os.path.join(DATA_DIR, filename)
    if not os.path.exists(data_path):
        return []
    try:
        with open(data_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except json.JSONDecodeError as e:
        print(f"WARNING: Corrupt JSON in {data_path}: {e}")
        return []
```

### Duplicate Resources After Scrape

**Cause:** Same org with slightly different names across scrapers.

**Diagnosis:** Check the output JSON for near-duplicates:

```python
import json
from collections import Counter

with open('src/_data/resources/nova.json') as f:
    data = json.load(f)

names = Counter(r['name'] for r in data)
for name, count in names.most_common():
    if count > 1:
        print(f"  DUPLICATE: {name} ({count}x)")
```

**Fix:** Standardize names in the `SOURCES` dict. The dedup key is `(name, location)` — exact match only.

### WARNING: category as String Instead of List

**The Problem:**

```python
# BAD - Eleventy template expects an array
make_resource(name="...", category="housing", ...)
# Produces: {"category": ["housing"]}  ← make_resource handles this
```

`make_resource()` coerces strings to lists, so this is handled. But if you bypass `make_resource()` and build dicts manually:

```python
# BAD - bypassing make_resource
resource = {"name": "...", "category": "housing"}  # String, not list!
```

**The Fix:** Always use `make_resource()`. Never build resource dicts by hand.

## File I/O Errors

### PermissionError on Windows

**Cause:** Another process (editor, git) has the JSON file locked.

```
PermissionError: [Errno 13] Permission denied: 'src/_data/resources/nova.json'
```

**Fix:** Close editors viewing the file. If running `npm run dev` concurrently, Eleventy may be watching the file — this is usually fine, but on Windows file locking can interfere.

### UnicodeEncodeError

**Cause:** Writing Unicode without explicit encoding on Windows.

```python
# BAD - uses system default encoding
with open(path, 'w') as f:
    json.dump(data, f)

# GOOD - explicit UTF-8
with open(path, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)
```

`base_scraper.py` already handles this correctly. The error only surfaces if you write files outside the base_scraper utilities.

## CI/CD Failures

See the **github-actions** skill for workflow configuration details.

### Scraper Fails in GitHub Actions but Works Locally

**Common causes:**
1. **Missing dependency:** Check `scrapers/requirements.txt` matches local pip freeze
2. **Network access:** GitHub Actions runners can reach public URLs, but some sites block cloud IPs
3. **Python version:** CI uses 3.12 — ensure no 3.13+ features
4. **Path differences:** Linux paths are case-sensitive; `Nova.json` != `nova.json`

### "No changes to commit" in Scrape Workflow

This is **expected behavior** when scraped data hasn't changed. The workflow uses:

```yaml
git diff --staged --quiet || git commit -m "Update scraped resource data"
```

The `||` means: only commit if there are staged changes. Not an error.

## Debugging Workflow

1. Run the single scraper: `python scrapers/sources/your_scraper.py`
2. Check console output for error messages
3. If errors, fix and repeat step 1
4. Inspect output JSON: read `src/_data/resources/<target>.json`
5. Verify JSON is valid: `python -m json.tool src/_data/resources/<target>.json`
6. Run full pipeline: `python scrapers/run_all.py`
7. Only proceed when all scrapers pass without errors
8. Build site to verify Eleventy consumes the data: `npm run build`
