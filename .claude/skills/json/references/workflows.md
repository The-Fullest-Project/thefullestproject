# JSON Workflows Reference

## Contents
- Adding a Resource Manually
- Adding a New State File
- Updating site.json
- Scraper-to-Template Data Pipeline
- Adding a New Category
- Validating JSON Files

---

## Adding a Resource Manually

Add entries directly to the appropriate JSON file when data comes from user submissions or manual research rather than scrapers.

**Target file selection:**
- National scope: `src/_data/resources/national.json`
- State-specific: `src/_data/resources/states/{STATE}.json` (two-letter code, e.g., `VA.json`)

```json
{
  "name": "Sensory-Friendly Swim at Burke Racquet",
  "category": ["recreation", "sensory"],
  "location": "Virginia",
  "area": "Northern Virginia",
  "description": "Weekly sensory-friendly open swim with reduced noise and lighting.",
  "phone": "703-323-0505",
  "website": "https://www.burkeclub.com/aquatics",
  "address": "6001 Burke Commons Rd, Burke, VA 22015",
  "ageRange": "All ages",
  "disabilityTypes": ["autism", "sensory-processing"],
  "cost": "Member: Free, Non-member: $10",
  "tags": ["sensory-friendly", "swimming", "recreation"],
  "source": "",
  "lastScraped": ""
}
```

Copy this checklist and track progress:
- [ ] Step 1: Identify correct target file (national vs. state)
- [ ] Step 2: Search file for existing entry with same name to avoid duplicates
- [ ] Step 3: Add entry with ALL 14 fields — no omissions, no nulls
- [ ] Step 4: Verify `category` is an array and slugs match the valid list
- [ ] Step 5: Verify `location` matches a `<select>` option value exactly
- [ ] Step 6: Run `npm run build` and check for JSON parse errors
- [ ] Step 7: Open `/resources/` and verify the card renders with correct filtering

---

## Adding a New State File

When expanding coverage to a new state:

1. Create `src/_data/resources/states/{STATE}.json` with an empty array:

```json
[]
```

2. The Eleventy config in `.eleventy.js` auto-discovers all `*.json` files in `states/`:

```javascript
if (fs.existsSync(statesDir)) {
  fs.readdirSync(statesDir).filter(f => f.endsWith('.json')).forEach(f => {
    const data = JSON.parse(fs.readFileSync(path.join(statesDir, f), 'utf8'));
    all = all.concat(data);
  });
}
```

No config changes needed — just drop the file. See the **eleventy** skill for how `addGlobalData("allResources")` merges these files.

3. For scraper integration, update the scraper to save with subdirectory path:

```python
save_resources(merged, 'states/GA.json')
```

Copy this checklist and track progress:
- [ ] Step 1: Create `src/_data/resources/states/{STATE}.json` with `[]`
- [ ] Step 2: Add initial resources following the schema
- [ ] Step 3: Verify `location` field uses the full state name (e.g., `"Georgia"`, not `"GA"`)
- [ ] Step 4: Run `npm run build` — file is auto-discovered
- [ ] Step 5: Test filtering by the new state on `/resources/`

---

## Updating site.json

`src/_data/site.json` controls global metadata available as `site.*` in every template. Changes here affect the entire site.

**Adding a new Formspree form ID:**

```json
{
  "formspree": {
    "contact": "xyzformid1",
    "submitResource": "xyzformid2",
    "newsletter": "xyzformid3",
    "volunteer": "xyzformid4"
  }
}
```

Then reference in a template: `action="https://formspree.io/f/{{ site.formspree.volunteer }}"`. See the **nunjucks** skill for form template patterns.

**Adding social media links:**

```json
{
  "social": {
    "instagram": "https://instagram.com/thefullestproject",
    "facebook": "https://facebook.com/thefullestproject",
    "tiktok": "https://tiktok.com/@thefullestproject"
  }
}
```

---

## Scraper-to-Template Data Pipeline

The full data flow from scraper to rendered HTML:

```
Python scraper
  → make_resource() (enforces schema)
  → merge_resources() (dedup by name+location)
  → save_resources() (writes to scrapers/output/ AND src/_data/resources/)
  → Eleventy build reads src/_data/resources/
  → .eleventy.js addGlobalData("allResources") merges all JSON files
  → resources.njk loops allResources, renders cards with data-* attributes
  → resourceFilter.js reads data-* attributes for client-side filtering
```

### Validation at Each Stage

1. **Scraper output** — `make_resource()` sets defaults, ensures arrays. See the **python** skill.
2. **Build time** — Eleventy fails with a parse error if JSON is malformed. Check terminal output.
3. **Runtime** — `resourceFilter.js` does string operations on `data-*` values. Wrong types are silent failures.

Feedback loop for scraper changes:
1. Edit scraper in `scrapers/sources/`
2. Run: `python scrapers/run_all.py`
3. Verify output: check `src/_data/resources/` for updated JSON
4. Build: `npm run build`
5. If build fails (JSON parse error), fix the scraper output and repeat from step 2
6. Open `/resources/` in browser, test filters for new/updated entries

---

## Adding a New Category

Categories are slug strings used in three places that must stay in sync:

1. **Resource JSON** — `"category": ["new-category"]`
2. **Template dropdowns** — `<option value="new-category">` in both `resources.njk` and `submit-resource.njk`
3. **Client-side filter** — `resourceFilter.js` uses `includes()` on the comma-joined category string

```json
{
  "category": ["dental"]
}
```

```html
<!-- In resources.njk AND submit-resource.njk -->
<option value="dental">Dental Care</option>
```

No JavaScript changes needed — `includes("dental")` works automatically on the comma-separated `data-category` value.

Copy this checklist and track progress:
- [ ] Step 1: Choose a kebab-case slug (e.g., `dental`)
- [ ] Step 2: Add `<option>` to `src/pages/resources.njk` category `<select>`
- [ ] Step 3: Add same `<option>` to `src/pages/submit-resource.njk` category `<select>`
- [ ] Step 4: Add resources with the new category to the appropriate JSON file
- [ ] Step 5: Build and verify filtering works for the new category

See the **nunjucks** skill for template editing and the **javascript** skill for filter behavior.

---

## Validating JSON Files

JSON parse errors crash the Eleventy build. Validate before committing.

**Using Node.js (quick check):**

```bash
node -e "JSON.parse(require('fs').readFileSync('src/_data/resources/national.json','utf8'))"
```

**Using Python (with formatting):**

```bash
python -m json.tool src/_data/resources/national.json > /dev/null
```

**Common parse errors:**
- Trailing comma after last array element or object property
- Single quotes instead of double quotes
- Unescaped special characters in strings (`\n`, `\t`, `"` inside strings)
- BOM (byte order mark) at file start — save as UTF-8 without BOM

**Build-time validation feedback loop:**
1. Edit JSON file
2. Run `npm run build`
3. If error: fix the JSON syntax issue reported in the error message
4. Repeat until build succeeds
