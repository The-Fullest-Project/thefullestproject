# JSON Patterns Reference

## Contents
- Resource Schema Enforcement
- Data Attribute Mapping
- Site Metadata Structure
- Scraper Output Format
- Anti-Patterns

---

## Resource Schema Enforcement

Every resource entry must include all 14 fields. Omitting a field causes `undefined` in templates; using `null` causes literal "null" text in rendered HTML.

```json
{
  "name": "Fairfax County Therapeutic Recreation",
  "category": ["recreation"],
  "location": "Virginia",
  "area": "Northern Virginia",
  "description": "County-run adaptive recreation programs for residents with disabilities.",
  "phone": "703-324-8563",
  "website": "https://www.fairfaxcounty.gov/neighborhood-community-services/therapeutic-recreation",
  "address": "12011 Government Center Pkwy, Fairfax, VA",
  "ageRange": "All ages",
  "disabilityTypes": ["physical", "intellectual", "developmental"],
  "cost": "Varies by program",
  "tags": ["recreation", "county", "adaptive"],
  "source": "https://www.fairfaxcounty.gov/neighborhood-community-services/therapeutic-recreation",
  "lastScraped": "2026-03-06"
}
```

### Empty Field Convention

Use empty strings for missing scalar fields, empty arrays for missing list fields:

```json
{
  "phone": "",
  "address": "",
  "ageRange": "",
  "disabilityTypes": [],
  "cost": "",
  "tags": []
}
```

NEVER use `null` — Nunjucks renders `null` as the literal string "null" in HTML output.

---

## Data Attribute Mapping

The `resources.njk` template maps JSON fields to `data-*` attributes that `resourceFilter.js` reads. This mapping is the critical contract between server-side data and client-side filtering.

| JSON Field | Template Expression | HTML Attribute | Filter Behavior |
|------------|-------------------|----------------|-----------------|
| `name` | `resource.name \| lower` | `data-name` | Substring search |
| `description` | `resource.description \| lower` | `data-description` | Substring search |
| `location` | `resource.location` | `data-location` | Exact match against `<select>` value |
| `category` | `resource.category \| join(',')` | `data-category` | `includes()` check (comma-separated) |

```html
<div class="resource-card"
     data-location="{{ resource.location }}"
     data-category="{{ resource.category | join(',') }}"
     data-name="{{ resource.name | lower }}"
     data-description="{{ resource.description | lower }}">
```

### WARNING: Location Value Mismatch

**The Problem:**

```json
{
  "location": "N. Virginia"
}
```

**Why This Breaks:**
1. `resourceFilter.js` does exact-match comparison: `location !== selectedLocation`
2. The `<select>` options use full state names (e.g., `"Virginia"`)
3. A mismatch means the resource is invisible when that location is selected — a silent data loss

**The Fix:**

```json
{
  "location": "Virginia"
}
```

Location values must exactly match one of: `"National"` or a US state name as it appears in the location `<select>` dropdown. Use `area` for sub-regions like `"Northern Virginia"`.

---

## Site Metadata Structure

`src/_data/site.json` is a single object (not an array) accessed globally as `site.*` in all templates:

```json
{
  "name": "The Fullest Project",
  "tagline": "Living Life to the Fullest",
  "description": "A connection hub for caregivers...",
  "url": "https://thefullestproject.org",
  "email": "hello@thefullestproject.org",
  "social": {
    "instagram": "",
    "facebook": ""
  },
  "formspree": {
    "contact": "YOUR_FORMSPREE_CONTACT_ID",
    "submitResource": "YOUR_FORMSPREE_RESOURCE_ID",
    "newsletter": "YOUR_FORMSPREE_NEWSLETTER_ID"
  }
}
```

Template access: `{{ site.formspree.contact }}`, `{{ site.email }}`, `{{ site.social.instagram }}`.

---

## Scraper Output Format

Python scrapers produce JSON via `make_resource()` in `base_scraper.py`. The function enforces the schema at creation time. See the **python** skill for scraper implementation details.

```python
make_resource(
    name="The Arc of Northern Virginia",
    category=["nonprofit"],
    location="Northern Virginia",
    description="Advocacy organization for people with IDD.",
    website="https://thearcofnova.org",
    tags=["advocacy", "intellectual-disability"]
)
```

Produces:

```json
{
  "name": "The Arc of Northern Virginia",
  "category": ["nonprofit"],
  "location": "Northern Virginia",
  "area": "",
  "description": "Advocacy organization for people with IDD.",
  "phone": "",
  "website": "https://thearcofnova.org",
  "address": "",
  "ageRange": "",
  "disabilityTypes": [],
  "cost": "",
  "tags": ["advocacy", "intellectual-disability"],
  "source": "https://thearcofnova.org",
  "lastScraped": "2026-03-06"
}
```

---

## Anti-Patterns

### WARNING: Category as String Instead of Array

**The Problem:**

```json
{
  "category": "nonprofit"
}
```

**Why This Breaks:**
1. `resource.category | join(',')` in Nunjucks calls `join` on a string, producing `"n,o,n,p,r,o,f,i,t"` in `data-category`
2. Category filtering with `includes("nonprofit")` still matches by accident, but `includes("recreation")` also matches `"r,e,c,r,e,a,t,i,o,n"` — false positives
3. `{% for cat in resource.category %}` iterates characters, rendering one `<span>` per letter

**The Fix:**

```json
{
  "category": ["nonprofit"]
}
```

Always use an array, even for a single category.

### WARNING: Using null Instead of Empty String

**The Problem:**

```json
{
  "phone": null,
  "address": null
}
```

**Why This Breaks:**
1. Nunjucks renders `null` as the literal text "null" in HTML
2. `{% if resource.phone %}` is truthy for the string "null"
3. Users see "null" displayed as contact information

**The Fix:**

```json
{
  "phone": "",
  "address": ""
}
```

### WARNING: Duplicate Name + Location Entries

**The Problem:**

Two entries in the same file with identical `name` and `location`:

```json
[
  { "name": "NAMI", "location": "National", "description": "Old description" },
  { "name": "NAMI", "location": "National", "description": "Updated description" }
]
```

**Why This Breaks:**
1. Both render as separate cards — users see duplicates
2. `merge_resources()` deduplicates by `(name, location)` tuple, but only during scraper runs
3. Manual edits bypass the dedup pipeline entirely

**The Fix:**

Before adding a resource manually, search the target file for the name. Use `merge_resources()` programmatically when possible.

### WARNING: Trailing Commas in JSON

JSON does not allow trailing commas. This is valid JavaScript but invalid JSON:

```json
{
  "tags": ["therapy", "local",]
}
```

Always strip trailing commas. Use `json.dump()` from Python (which never produces them) rather than hand-editing large files.
