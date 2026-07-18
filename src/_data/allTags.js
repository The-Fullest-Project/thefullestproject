/**
 * Sorted, de-duplicated list of the tags (facets) currently in use across the
 * directory — powers the "Tags" suggestion dropdown on the submit-resource form
 * so submitters can pick existing tags or add their own. Mirrors the facet
 * computation in directory.js (noise already filtered there).
 */
const buildDirectory = require('./directory.js');

module.exports = function() {
  const set = new Set();
  for (const r of buildDirectory()) {
    for (const f of (r.facets || [])) set.add(f);
  }
  return [...set].filter(Boolean).sort();
};
