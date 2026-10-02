/**
 * Flat index of every published resource, for the portal's duplicate check.
 *
 * Why this exists: the worker originally read all 52 resource files from the
 * GitHub API to compare them, which is 53 subrequests and Cloudflare caps a
 * Worker invocation at 50 — the endpoint failed with "Too many subrequests"
 * once it covered every state. Building the index here means the worker makes
 * ONE request for it instead.
 *
 * Only already-public fields. `file` is the repo path holding the record, so
 * the portal can hand it straight to the Edit Live form.
 */
const states = require('./states.json');
const directory = require('./directory.js');

const STATE_CODES = Object.fromEntries(states.map(s => [s.name, s.code]));

function targetFile(location) {
  if (!location || location === 'National') return 'src/_data/resources/national.json';
  // Pilot-market names route to their state file; the region lives in `area`.
  if (location === 'Northern Virginia') return 'src/_data/resources/states/VA.json';
  if (location === 'Portland' || location === 'Portland, OR') return 'src/_data/resources/states/OR.json';
  const code = STATE_CODES[location];
  return code ? `src/_data/resources/states/${code}.json`
              : 'src/_data/resources/national.json';
}

module.exports = function () {
  const rows = typeof directory === 'function' ? directory() : directory;
  return rows.map(r => ({
    name: r.name || '',
    location: r.location || '',
    area: r.area || '',
    website: r.website || '',
    phone: r.phone || '',
    address: r.address || '',
    category: r.category || [],
    file: targetFile(r.location)
  }));
};
