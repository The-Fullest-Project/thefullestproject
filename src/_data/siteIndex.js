/**
 * Slim build-time index of live content, emitted at /api/site-index.json
 * (see src/pages/api/site-index.njk). The admin review portal's History tab
 * reads it same-origin to group "what went live" by week and by origin.
 * Same computed-data pattern as allResources.js.
 */
const fs = require('node:fs');
const path = require('node:path');

function readJson(p, fallback) {
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch {
    return fallback;
  }
}

module.exports = function() {
  const dataDir = __dirname;
  const statesDir = path.join(dataDir, 'resources', 'states');

  let resources = readJson(path.join(dataDir, 'resources', 'national.json'), []);
  if (fs.existsSync(statesDir)) {
    for (const f of fs.readdirSync(statesDir).filter(f => f.endsWith('.json'))) {
      resources = resources.concat(readJson(path.join(statesDir, f), []));
    }
  }

  const states = readJson(path.join(dataDir, 'states.json'), []);
  const categories = readJson(path.join(dataDir, 'categories.json'), []);

  return {
    generated: new Date().toISOString(),
    resources: resources.map(r => ({
      name: r.name,
      location: r.location,
      area: r.area || '',
      category: r.category,
      dateAdded: r.dateAdded || '',
      lastScraped: r.lastScraped || '',
      origin: r.origin || null
    })),
    stories: readJson(path.join(dataDir, 'stories.json'), []).map(s => ({
      title: s.title,
      category: s.category,
      date: s.date,
      addedDate: s.addedDate || ''
    })),
    spotlights: readJson(path.join(dataDir, 'spotlights.json'), []).map(s => ({
      name: s.name,
      category: s.category,
      date: s.date,
      approvedAt: s.approvedAt || ''
    })),
    taxonomies: {
      categories,
      locations: ['National'].concat(states.map(s => s.name))
    }
  };
};
