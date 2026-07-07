/**
 * Unified resource directory for the category pages.
 *
 * Loads EVERY resource JSON under src/_data/resources/ (national.json,
 * nova.json, portland.json, states/*.json — recursive glob, so it works
 * identically before and after the pilot files are migrated into their state
 * files). This supersedes allResources.js, which skipped nova/portland and
 * left ~164 resources invisible on the site.
 *
 * Each resource is stamped with `topCategories`: its category slugs resolved
 * to the 30 top-level categories in categories.json (exact match, then prefix
 * match like `therapy-pt` → `therapy`, then the alias map, else `other`).
 */
const fs = require('node:fs');
const path = require('node:path');

// Granular/legacy slugs that don't prefix-match a top-level category
const CATEGORY_ALIASES = {
  'advocacy': 'legal',
  'adaptive-sports': 'sports',
  'artists': 'recreation',
  'books': 'education',
  'caregiver-support': 'community',
  'dental': 'medical',
  'disability-language': 'education',
  'gaming': 'recreation',
  'grief': 'mental-health',
  'hearing': 'medical',
  'home-care': 'respite',
  'homeschool': 'education',
  'incontinence': 'equipment',
  'inclusion': 'community',
  'influencers': 'community',
  'movies': 'recreation',
  'nutrition': 'medical',
  'residential': 'housing',
  'safety': 'emergency',
  'service-animals': 'other',
  'switch-adapted': 'assistive-tech',
  'vehicle-mods': 'transportation',
  'vision': 'medical'
};

function loadJsonArray(file) {
  try {
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function collectResourceFiles(dir) {
  let files = [];
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    if (fs.statSync(full).isDirectory()) {
      files = files.concat(collectResourceFiles(full));
    } else if (name.endsWith('.json')) {
      files.push(full);
    }
  }
  return files;
}

module.exports = function() {
  const resourcesDir = path.join(__dirname, 'resources');
  const topLevel = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'categories.json'), 'utf8')
  ).map(c => c.value);

  const toTop = slug => {
    if (topLevel.includes(slug)) return slug;
    const prefix = topLevel.find(t => slug.startsWith(t + '-'));
    if (prefix) return prefix;
    return CATEGORY_ALIASES[slug] || 'other';
  };

  let all = [];
  if (fs.existsSync(resourcesDir)) {
    for (const file of collectResourceFiles(resourcesDir)) {
      all = all.concat(loadJsonArray(file));
    }
  }

  return all
    .filter(r => r && r.name)
    .map(r => ({
      ...r,
      topCategories: [...new Set((r.category || []).map(toTop))]
    }));
};
