/**
 * slug -> { label, group } for every category.
 *
 * The search index needs each resource's category label and which of the seven
 * groups it sits under, so search results can be grouped the same way the
 * Resources page is rather than collapsing into one alphabetical list.
 *
 * Unlike categoryGroups.js this keeps EVERY category, including ones with no
 * resources yet — a lookup that silently omitted a slug would leave matching
 * resources with no group heading to sit under.
 */
const fs = require('node:fs');
const path = require('node:path');

module.exports = function () {
  const categories = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'categories.json'), 'utf8')
  );
  const groups = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'categoryGroupDefs.json'), 'utf8')
  );

  const groupOf = new Map();
  for (const g of groups) {
    for (const slug of g.slugs) groupOf.set(slug, g.name);
  }

  const bySlug = {};
  for (const c of categories) {
    bySlug[c.value] = {
      label: c.label,
      group: groupOf.get(c.value) || 'Other'
    };
  }
  return bySlug;
};
