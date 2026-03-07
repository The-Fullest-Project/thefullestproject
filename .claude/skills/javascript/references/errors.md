# JavaScript Errors Reference

## Contents
- Null Element References
- Data Attribute Mismatches
- Filter Logic Bugs
- ARIA State Errors
- Build and Deployment Errors
- Debugging Workflow

## Null Element References

The most common error source. Every element lookup can return `null` if the ID is wrong, the element doesn't exist on the current page, or the script runs before DOM is ready.

### WARNING: Missing Guard Clauses

**The Problem:**

```javascript
// BAD — crashes on any page that doesn't have this element
const grid = document.getElementById('resource-grid');
const cards = grid.querySelectorAll('.resource-card'); // TypeError: null has no property 'querySelectorAll'
```

**Why This Breaks:** `resourceFilter.js` is only loaded on `/resources/`, but if it were ever loaded globally (or copy-pasted into another script), this crashes immediately.

**The Fix:**

```javascript
// GOOD — early return if container missing
const grid = document.getElementById('resource-grid');
if (!grid) return;
const cards = grid.querySelectorAll('.resource-card');
```

The existing codebase handles this correctly. Preserve this pattern when adding new scripts.

### Symptom: "Cannot read properties of null"

| Cause | Fix |
|-------|-----|
| Element ID typo in JS | Check ID matches template exactly (kebab-case) |
| Script loaded before DOM | Wrap in `DOMContentLoaded` |
| Element conditionally rendered | Add null check before accessing |
| Template changed, JS not updated | Search for the ID in both `.njk` and `.js` files |

## Data Attribute Mismatches

### Problem: Filter Shows No Results

The filter is working but matches nothing. Common causes:

```javascript
// BUG — comparing lowercase search against non-lowered data
const name = card.getAttribute('data-name'); // "Arc of Northern Virginia" (NOT lowered)
if (searchTerm && !name.includes(searchTerm)) { show = false; }
// searchTerm is lowered but name isn't — no match
```

**Root cause:** The template must apply `| lower` filter to `data-name` and `data-description`. If the Nunjucks template is modified and `| lower` is removed, search breaks silently.

```html
<!-- CORRECT — lowercase at render time -->
data-name="{{ resource.name | lower }}"

<!-- BUG — case mismatch with JS search logic -->
data-name="{{ resource.name }}"
```

### Problem: Location Filter Doesn't Work

The `<select>` option values must exactly match `data-location` values. The comparison is strict equality:

```javascript
if (selectedLocation && location !== selectedLocation) { show = false; }
```

| `<option value="">` | `data-location` | Match? |
|---------------------|-----------------|--------|
| `"Northern Virginia"` | `"Northern Virginia"` | Yes |
| `"Northern Virginia"` | `"northern virginia"` | **No** |
| `"nova"` | `"Northern Virginia"` | **No** |

### Problem: Category Filter Matches Wrong Items

```javascript
// Current approach — substring match
if (selectedCategory && !categories.includes(selectedCategory)) { show = false; }

// "camp" would match "camps" — currently safe because no slug collision exists
// "sport" would match "sports" — same, currently safe
```

If you add categories where one slug is a prefix of another, switch to exact match:

```javascript
const categoryList = categories.split(',');
if (selectedCategory && !categoryList.includes(selectedCategory)) { show = false; }
```

## ARIA State Errors

### WARNING: aria-expanded Not Toggling

**The Problem:**

```javascript
// BUG — getAttribute returns string, not boolean
const isExpanded = menuBtn.getAttribute('aria-expanded');
menuBtn.setAttribute('aria-expanded', !isExpanded);
// !isExpanded is always false because !"true" === false AND !"false" === false
```

**Why This Breaks:** `getAttribute()` returns strings. The string `"false"` is truthy in JavaScript. So `!"false"` is `false`, meaning `aria-expanded` never becomes `"true"`.

**The Fix:**

```javascript
// GOOD — explicit string comparison
const isExpanded = menuBtn.getAttribute('aria-expanded') === 'true';
menuBtn.setAttribute('aria-expanded', !isExpanded);
```

### Mobile Menu Stays Open on Resize

If a user opens the mobile menu, then resizes the browser to desktop width, the menu remains in the DOM with `hidden` removed. This is cosmetic only — the CSS `lg:hidden` on the mobile menu container handles it. But if you add transition animations, consider a `matchMedia` listener to reset state on breakpoint changes.

## Build and Deployment Errors

### Script Not Found (404) in Browser

Diagnosis checklist:
1. Is the file in `src/js/`? Check with `ls src/js/`
2. Is passthrough copy configured? Check `.eleventy.js` for `addPassthroughCopy("src/js")`
3. Is the build output correct? Check `ls _site/js/`
4. Is the `<script>` tag path correct? Must start with `/js/`, not `./js/` or `js/`

```html
<!-- GOOD -->
<script src="/js/resourceFilter.js"></script>

<!-- BAD — relative path breaks on nested pages -->
<script src="js/resourceFilter.js"></script>
<script src="./js/resourceFilter.js"></script>
```

### Node Script Crashes: "Cannot find module"

```javascript
// deploy.js
const ftp = require('basic-ftp'); // Error: Cannot find module 'basic-ftp'
```

**Fix:** Run `npm install`. All Node dependencies are in `package.json` under `dependencies` (not `devDependencies`).

### Deploy Script: Environment Variable Missing

```javascript
// Silently passes undefined to FTP client
await client.access({
  host: process.env.FTP_HOST, // undefined if .env missing
});
```

The FTP client will throw a connection error, not a clear "missing env var" message. Check `.env` exists and has all four variables. See the **ftp** skill.

## Debugging Workflow

### Browser Script Issues

1. Open browser DevTools (F12)
2. Check Console tab for errors
3. Check Network tab — verify script loaded (200, not 404)
4. Add `console.log` inside `DOMContentLoaded` to verify script runs
5. Check Elements tab — verify `data-*` attributes are rendered correctly
6. Verify filter elements exist: type IDs in Console with `document.getElementById('search-input')`

### Validate filter behavior:

```
1. Run `npm run dev`
2. Open /resources/ in browser
3. Open DevTools Console
4. Type: document.querySelectorAll('.resource-card').length
5. Verify count matches expected number of resources
6. Apply filter, re-run query — count should decrease
7. If count unchanged, check data-* attribute values on cards
```

### Node Script Issues

```bash
# Test deploy script without actually deploying
node -e "require('dotenv').config(); console.log('FTP_HOST:', process.env.FTP_HOST ? 'set' : 'MISSING')"

# Test Eleventy config in isolation
npx @11ty/eleventy --dryrun
```

### Cross-File Debugging

When filter behavior is wrong, the bug could be in:
1. **Resource JSON** — data is wrong at the source. See the **json** skill.
2. **Nunjucks template** — data attributes rendered incorrectly. See the **nunjucks** skill.
3. **JavaScript** — filter logic or element targeting is broken.

Check in that order — most "JS bugs" are actually data or template issues.
