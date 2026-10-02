/**
 * Category groups for the /resources/ hub — Jason Collier's seven sections.
 *
 * Resolution happens HERE, not in the template. An earlier version matched
 * slugs to labels in Nunjucks with `selectattr('value','equalto',slug)`, which
 * silently does not filter: `first` then returned categories[0], so every tile
 * on the page was titled "Adaptive Clothing" and linked to /resources/clothing/.
 * Nothing errored. Resolving in JS makes that class of bug impossible and lets
 * the invariant below fail the build instead of shipping.
 *
 * INVARIANT: every slug in categories.json appears in exactly one group.
 * A slug in no group vanishes from the page; a slug in two double-lists.
 */
const fs = require('node:fs');
const path = require('node:path');
const directory = require('./directory.js');

// Group definitions live in categoryGroupDefs.json, not here, so the admin
// portal can add a category to a group when one is created from the review
// queue. Resolution and the invariants below stay in code.
const GROUPS = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'categoryGroupDefs.json'), 'utf8')
);

module.exports = function () {
  const categories = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'categories.json'), 'utf8')
  );
  const resources = typeof directory === 'function' ? directory() : directory;

  const byValue = new Map(categories.map(c => [c.value, c]));
  const counts = new Map();
  for (const r of resources) {
    for (const slug of r.topCategories || []) {
      counts.set(slug, (counts.get(slug) || 0) + 1);
    }
  }

  // Fail the build rather than silently dropping or duplicating a category.
  const grouped = GROUPS.flatMap(g => g.slugs);
  const dupes = grouped.filter((s, i) => grouped.indexOf(s) !== i);
  if (dupes.length) {
    throw new Error(`categoryGroups: slug in more than one group: ${dupes.join(', ')}`);
  }
  const missing = categories.map(c => c.value).filter(v => !grouped.includes(v));
  if (missing.length) {
    throw new Error(`categoryGroups: category not in any group: ${missing.join(', ')}`);
  }
  const unknown = grouped.filter(s => !byValue.has(s));
  if (unknown.length) {
    throw new Error(`categoryGroups: group names a slug not in categories.json: ${unknown.join(', ')}`);
  }

  return GROUPS.map(g => ({
    name: g.name,
    blurb: g.blurb,
    categories: g.slugs
      .map(slug => ({
        value: slug,
        label: byValue.get(slug).label,
        count: counts.get(slug) || 0
      }))
      .filter(c => c.count > 0)
      .sort((a, b) => a.label.localeCompare(b.label))
  })).filter(g => g.categories.length > 0);
};
