# JavaScript Modules Reference

## Contents
- File Organization
- Browser Scripts
- Node Scripts
- Adding New Browser Scripts
- Adding New Node Scripts
- Integration with Eleventy

## File Organization

```
src/js/                    # Browser scripts (passthrough-copied to _site/js/)
├── main.js                # Global: mobile menu toggle (loaded on every page)
└── resourceFilter.js      # Page-specific: resource directory filter/search

.eleventy.js               # Node: Eleventy configuration (CommonJS)
deploy.js                  # Node: FTP deployment script (CommonJS)
```

**Naming:** Browser scripts use camelCase (`resourceFilter.js`). Node scripts use either camelCase or dot-separated names (`.eleventy.js`).

## Browser Scripts

### main.js — Global Interactivity

**Loaded in:** `src/_includes/layouts/base.njk` (line 36), just before `</body>`
**Scope:** Every page on the site
**Purpose:** Mobile menu toggle with ARIA state management

```javascript
// Complete module — this is the entire file
document.addEventListener('DOMContentLoaded', function() {
  const menuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');

  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', function() {
      const isExpanded = menuBtn.getAttribute('aria-expanded') === 'true';
      menuBtn.setAttribute('aria-expanded', !isExpanded);
      mobileMenu.classList.toggle('hidden');
    });
  }
});
```

Depends on HTML elements from `src/_includes/components/nav.njk`. See the **nunjucks** skill.

### resourceFilter.js — Resource Directory

**Loaded in:** `src/pages/resources.njk` (line 170), at bottom of page template
**Scope:** Only the `/resources/` page
**Purpose:** Client-side search, location filter, category filter, URL param support

Structure:
1. Wait for `DOMContentLoaded`
2. Grab element references by ID
3. Guard clause — exit if `resource-grid` missing
4. Cache all `.resource-card` elements (NodeList, queried once)
5. Read URL params, hydrate `<select>` values
6. Define `filterResources()` — iterates cards, applies AND logic, toggles visibility
7. Bind event listeners on inputs
8. Run initial filter (applies URL param state)

## Node Scripts

### .eleventy.js — Build Configuration

**Runtime:** Node 20+ via `npx @11ty/eleventy`
**Module system:** CommonJS (`module.exports`)

```javascript
module.exports = function(eleventyConfig) {
  eleventyConfig.addPassthroughCopy("src/js");  // copies browser JS to _site/
  // Collections, filters, directory config...
};
```

Key Eleventy filters written in JS:

```javascript
eleventyConfig.addFilter("dateFormat", function(date) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  });
});

eleventyConfig.addFilter("filterByCategory", function(resources, category) {
  if (!category) return resources;
  return resources.filter(r => r.category && r.category.includes(category));
});
```

See the **eleventy** skill for full configuration details.

### deploy.js — FTP Deployment

**Runtime:** Node 20+ via `node deploy.js`
**Module system:** CommonJS (`require()`)
**Dependencies:** `basic-ftp`, `dotenv`, `path`

```javascript
require('dotenv').config();
const ftp = require('basic-ftp');

async function deploy() {
  const client = new ftp.Client();
  try {
    await client.access({
      host: process.env.FTP_HOST,
      user: process.env.FTP_USER,
      password: process.env.FTP_PASSWORD,
      secure: true
    });
    await client.uploadFromDir(path.join(__dirname, '_site'));
  } catch (err) {
    console.error('Deploy failed:', err);
    process.exit(1);
  } finally {
    client.close();
  }
}
```

See the **ftp** skill for deployment details.

## Adding New Browser Scripts

Copy this checklist and track progress:
- [ ] Step 1: Create `src/js/scriptName.js` (camelCase)
- [ ] Step 2: Wrap all code in `DOMContentLoaded` listener
- [ ] Step 3: Use guard clauses for all element references
- [ ] Step 4: Add `<script src="/js/scriptName.js"></script>` at bottom of target template
- [ ] Step 5: Verify script appears in `_site/js/` after build

```javascript
// Template for a new page-specific script
document.addEventListener('DOMContentLoaded', function() {
  var targetElement = document.getElementById('my-element-id');
  if (!targetElement) return;

  // Feature code here
});
```

### WARNING: Adding Scripts in `<head>`

**The Problem:**

```html
<!-- BAD — script runs before DOM is ready -->
<head>
  <script src="/js/myScript.js"></script>
</head>
```

**Why This Breaks:** Elements don't exist yet. All `getElementById` calls return `null`. The `DOMContentLoaded` wrapper helps, but the user sees a flash of unstyled/non-functional content.

**The Fix:** Place scripts before `</body>`, matching the existing pattern in `base.njk`.

## Adding New Node Scripts

Node scripts go in the project root (alongside `deploy.js`) or in a dedicated directory for larger utilities.

```javascript
// Node script template
require('dotenv').config();

async function main() {
  try {
    // Script logic
    console.log('Done.');
  } catch (err) {
    console.error('Failed:', err);
    process.exit(1);
  }
}

main();
```

Add to `package.json` scripts:

```json
{
  "scripts": {
    "my-task": "node my-script.js"
  }
}
```

## Integration with Eleventy

Eleventy's passthrough copy is configured in `.eleventy.js`:

```javascript
eleventyConfig.addPassthroughCopy("src/js");
```

This copies the **entire `src/js/` directory** to `_site/js/`. Any `.js` file added to `src/js/` is automatically available at `/js/filename.js` without additional config.

Validation loop for new scripts:
1. Create the script file in `src/js/`
2. Run `npm run dev`
3. Check browser DevTools console for errors
4. Verify the script appears at `http://localhost:8080/js/scriptName.js`
5. If missing, check that passthrough copy config is still intact in `.eleventy.js`
