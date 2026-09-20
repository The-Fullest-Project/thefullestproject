/**
 * One-off accuracy cleanup (MCP task cmra17na, September 2026).
 *
 * The pilot-file migration (59de543) left a handful of genuinely national
 * organisations filed under a single state, plus one org listed in two states.
 * Moves them to national.json with location "National" and drops the state
 * copies. Deliberately conservative: DC-metro services (WMATA MetroAccess,
 * Children's National) and state programs (Virginia Early Intervention) are
 * left where they are, because they are not national in reach.
 *
 *   node scripts/reclassify-national-orgs.js --dry-run
 *   node scripts/reclassify-national-orgs.js --apply
 */
const fs = require('fs');
const path = require('path');

const DATA = path.join(__dirname, '..', 'src', '_data', 'resources');
const NATIONAL = path.join(DATA, 'national.json');

// name -> state files it should be removed from
const MOVE = {
  'BlazeSports America': ['VA', 'GA'],
  'Healthcare.gov - Appeals & Grievances': ['VA'],
  'National Alliance to End Homelessness': ['VA'],
  'ServiceSource': ['VA'],
};

const read = (f) => JSON.parse(fs.readFileSync(f, 'utf8'));
const write = (f, d) => fs.writeFileSync(f, JSON.stringify(d, null, 2) + '\n', 'utf8');
const norm = (s) => (s || '').toLowerCase().trim();

const apply = process.argv.includes('--apply');
const national = read(NATIONAL);
const nationalNames = new Set(national.map((r) => norm(r.name)));
const log = [];

for (const [name, states] of Object.entries(MOVE)) {
  let moved = null;
  for (const code of states) {
    const file = path.join(DATA, 'states', `${code}.json`);
    const rows = read(file);
    const keep = rows.filter((r) => norm(r.name) !== norm(name));
    const removed = rows.length - keep.length;
    if (!removed) {
      log.push(`  !  ${name}: not found in ${code}.json`);
      continue;
    }
    // Keep the richest copy (most filled fields) as the national entry.
    const candidate = rows.find((r) => norm(r.name) === norm(name));
    const score = (r) => Object.values(r).filter((v) => v && v.length).length;
    if (!moved || score(candidate) > score(moved)) moved = { ...candidate };
    log.push(`  -  removed ${name} from ${code}.json`);
    if (apply) write(file, keep);
  }
  if (moved && !nationalNames.has(norm(name))) {
    moved.location = 'National';
    moved.area = '';
    national.push(moved);
    nationalNames.add(norm(name));
    log.push(`  +  added ${name} to national.json`);
  }
}

if (apply) write(NATIONAL, national);
console.log(log.join('\n'));
console.log(apply ? `\nnational.json now ${national.length} entries` : '\n(dry run — use --apply)');
