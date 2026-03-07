# Python Types & Data Schema

## Contents
- Resource Schema
- Field Contracts
- Category Slugs
- Location Values
- Type Coercion Rules
- Schema Validation Patterns

## Resource Schema

The canonical resource dict produced by `make_resource()` in `scrapers/base_scraper.py`:

```python
{
    "name": str,           # Required. Display name of the resource
    "category": list[str], # Required. List of category slugs
    "location": str,       # Required. One of the location constants
    "area": str,           # Sub-region within location (often empty)
    "description": str,    # Required. What the resource provides
    "phone": str,          # Contact phone (empty string if unknown)
    "website": str,        # Primary URL
    "address": str,        # Physical address (empty string if unknown)
    "ageRange": str,       # e.g. "birth to 3", "all ages"
    "disabilityTypes": list[str],  # Applicable disability categories
    "cost": str,           # e.g. "Free", "Sliding scale", ""
    "tags": list[str],     # Freeform searchable tags
    "source": str,         # URL where data was scraped from
    "lastScraped": str,    # ISO date string (YYYY-MM-DD)
}
```

Note: JSON field names use **camelCase** (`ageRange`, `disabilityTypes`, `lastScraped`) to match JavaScript conventions in the front-end. Python variables in scraper code use **snake_case** (`age_range`, `disability_types`). The `make_resource()` function handles this mapping.

## Field Contracts

### Required Fields

These must always be non-empty:

| Field | Constraint | Example |
|-------|-----------|---------|
| `name` | Non-empty string | `"The Arc of Northern Virginia"` |
| `category` | Non-empty list of slug strings | `["housing", "financial"]` |
| `location` | Must match a known location value | `"Northern Virginia"` |
| `description` | Non-empty string | `"Advocacy organization for..."` |

### Optional Fields (default to empty)

`make_resource()` defaults these via `or ""` / `or []`:

```python
# These are all valid — empty values are acceptable
make_resource(
    name="Resource",
    category=["housing"],
    location="National",
    description="A resource.",
    # phone, website, address, area, age_range, cost → ""
    # disability_types, tags → []
    # source → falls back to website value
    # lastScraped → auto-set to today's date
)
```

### Category Coercion

`make_resource()` normalizes `category` to always be a list:

```python
# Both produce {"category": ["housing"]}
make_resource(name="...", category="housing", ...)    # string → list
make_resource(name="...", category=["housing"], ...)   # list → list
```

## Location Values

Three valid location strings, matched exactly in the front-end filter. See the **javascript** skill for how `resourceFilter.js` reads these.

| Value | JSON file | Description |
|-------|-----------|-------------|
| `"Northern Virginia"` | `nova.json` | NoVA pilot region |
| `"Portland"` | `portland.json` | Portland, OR pilot region |
| `"National"` | `national.json` | Nationwide resources |

## Category Slugs

Used in both `category` and `tags` fields. Must be kebab-case:

```python
VALID_CATEGORIES = [
    "early-intervention", "transition", "financial", "insurance",
    "planning", "mental-health", "transportation", "housing",
    "medical", "camps", "sibling-support", "assistive-tech",
    "sports", "emergency", "home-modifications", "nonprofit",
]
```

## Deduplication Key

`merge_resources()` uses the tuple `(name, location)` as the unique key:

```python
# These are the SAME resource (will merge):
{"name": "NAMI", "location": "National", ...}
{"name": "NAMI", "location": "National", ...}  # overwrites first

# These are DIFFERENT resources (both kept):
{"name": "NAMI", "location": "National", ...}
{"name": "NAMI", "location": "Northern Virginia", ...}
```

### WARNING: Name Inconsistency Causes Duplicates

**The Problem:**

```python
# BAD - creates two entries for the same org
make_resource(name="The Arc of NoVA", ...)
make_resource(name="The Arc of Northern Virginia", ...)
```

**Why This Breaks:** Dedup matches on exact `name` string. Slight variations create duplicates in the JSON output, which then render as duplicate cards on the resource page.

**The Fix:** Standardize names. Use the organization's official name consistently across all scrapers that touch the same JSON file.

## Schema Validation Pattern

No runtime validation exists yet. When adding resources, verify output manually:

```python
import json

def validate_resource(r):
    """Sanity check a resource dict."""
    assert r.get("name"), "name is required"
    assert isinstance(r.get("category"), list), "category must be a list"
    assert r.get("location") in ("Northern Virginia", "Portland", "National"), \
        f"invalid location: {r.get('location')}"
    assert r.get("description"), "description is required"
    return True
```

## WARNING: Missing Runtime Validation

**Detected:** No schema validation library in `scrapers/requirements.txt`.

**Impact:** Malformed resources (missing name, wrong location string, category as string instead of list) silently pass through and may break the Eleventy build or produce invisible resource cards.

### Recommended Solution

Add `pydantic` for schema enforcement:

```bash
pip install pydantic
```

```python
from pydantic import BaseModel

class Resource(BaseModel):
    name: str
    category: list[str]
    location: str
    description: str
    website: str = ""
    phone: str = ""
    # ... remaining fields
```

This catches bad data at scrape time instead of at build time.
