/**
 * One-off promotion migration: fold the NoVA/Portland pilot files into their
 * state files and delete them.
 *
 * Background: an earlier pass already copied most of nova.json/portland.json
 * into states/VA.json and states/OR.json (as location "Virginia"/"Oregon"),
 * so those pilot files are now mostly duplicate copies rendering twice in the
 * directory. This script finishes the job WITHOUT losing curated data:
 *
 *   1. Rescue orphans — nova/portland entries with no copy in a state file are
 *      added (nova -> VA.json as "Virginia", empty area -> "Northern Virginia";
 *      portland -> OR.json as "Oregon"). This is how PlayTime Pediatric
 *      Therapies (Nicole's flagship "disappearing" resource) gets preserved.
 *   2. Enrich matches — for every pilot entry that already has a state-file
 *      copy, fill ONLY the empty fields of the state copy from the pilot entry
 *      (phone, description, ageRange, ...). Never overwrites existing values,
 *      never touches location/area/website/category. Captures the curated data
 *      before the pilot file is deleted.
 *   3. Dedupe national orgs — a state entry whose name+host matches a National
 *      entry in national.json is a migration artifact (e.g. SSA listed as both
 *      National and Virginia). Merge its unique fields into the national copy,
 *      then remove the state copy so it renders once.
 *   4. Normalize — pilot area values that are actually the state name ("Oregon")
 *      are blanked.
 *   5. Delete nova.json + portland.json.
 *
 * DRY RUN by default. Pass --execute to write files.
 *
 *   node scripts/migrate-pilot-files.js            # report only
 *   node scripts/migrate-pilot-files.js --execute  # apply
 */
const fs = require('node:fs');
const path = require('node:path');

const EXECUTE = process.argv.includes('--execute');
const RES = path.join(__dirname, '..', 'src', '_data', 'resources');
const STATES = path.join(RES, 'states');

const load = f => JSON.parse(fs.readFileSync(path.join(RES, f), 'utf8'));
const nkey = s => String(s || '').toLowerCase().replace(/\s+/g, ' ').trim();
const host = u => {
  try { return new URL(String(u)).host.replace(/^www\./, '').toLowerCase(); }
  catch { return ''; }
};
const isEmpty = v => v == null || (typeof v === 'string' && !v.trim()) ||
  (Array.isArray(v) && v.length === 0);

// Fields whose state-file value is authoritative and must never be overwritten
// or filled from a pilot copy (placement/identity/provenance).
const PROTECTED = new Set(['name', 'location', 'area', 'website', 'category',
  'origin', 'dateAdded', 'lastScraped', 'source']);

// Fill only-empty target fields from src; returns list of filled field names.
function enrich(target, src) {
  const filled = [];
  for (const k of Object.keys(src)) {
    if (PROTECTED.has(k)) continue;
    if (isEmpty(target[k]) && !isEmpty(src[k])) {
      target[k] = JSON.parse(JSON.stringify(src[k]));
      filled.push(k);
    }
  }
  return filled;
}

const report = { orphans: [], enriched: [], nationalDupes: [], orAreaFixed: [], counts: {} };

// ── Load ────────────────────────────────────────────────────────────────────
const national = load('national.json');
const va = load('states/VA.json');
const or = load('states/OR.json');
const nova = load('nova.json');
const portland = load('portland.json');

report.counts.before = {
  national: national.length, VA: va.length, OR: or.length,
  nova: nova.length, portland: portland.length
};

const natIndex = {}; // nkey -> national entry (National only)
national.forEach(r => { if ((r.location || '') === 'National') natIndex[nkey(r.name)] = r; });

function indexBy(arr) {
  const m = {};
  arr.forEach(r => { m[nkey(r.name)] = r; });
  return m;
}

// ── Phase 1+2: migrate nova -> VA (rescue orphans, enrich matches) ───────────
function migrate(pilot, target, targetName, region, emptyAreaLabel) {
  let tIndex = indexBy(target);
  for (const p of pilot) {
    const match = tIndex[nkey(p.name)];
    if (match) {
      const filled = enrich(match, p);
      if (filled.length) report.enriched.push({ name: match.name, file: targetName, filled });
    } else {
      const migrated = JSON.parse(JSON.stringify(p));
      migrated.location = region;
      if (isEmpty(migrated.area)) migrated.area = emptyAreaLabel;
      target.push(migrated);
      tIndex[nkey(migrated.name)] = migrated;
      report.orphans.push({ name: migrated.name, file: targetName, area: migrated.area });
    }
  }
}

migrate(nova, va, 'states/VA.json', 'Virginia', 'Northern Virginia');
migrate(portland, or, 'states/OR.json', 'Oregon', 'Portland');

// ── Phase 3: dedupe national orgs out of the state files ─────────────────────
function dedupeNational(arr, arrName) {
  const kept = [];
  for (const r of arr) {
    const nat = natIndex[nkey(r.name)];
    if (nat && (host(r.website) === host(nat.website) || !host(r.website) || !host(nat.website))) {
      const filled = enrich(nat, r); // keep any unique field from the state copy
      report.nationalDupes.push({ name: r.name, removedFrom: arrName, mergedInto: 'national.json', filled });
    } else {
      kept.push(r);
    }
  }
  return kept;
}

const vaClean = dedupeNational(va, 'states/VA.json');
const orClean = dedupeNational(or, 'states/OR.json');

// ── Phase 4: normalize state-name-as-area ("Oregon"/"Virginia") ──────────────
function fixArea(arr, stateName) {
  arr.forEach(r => {
    if (r.area && nkey(r.area) === nkey(stateName)) {
      report.orAreaFixed.push({ name: r.name, was: r.area, file: stateName });
      r.area = '';
    }
  });
}
fixArea(orClean, 'Oregon');
fixArea(vaClean, 'Virginia');

report.counts.after = { national: national.length, VA: vaClean.length, OR: orClean.length };

// ── Residual duplicate check across the final combined directory ─────────────
function combinedAfter() {
  const files = ['national.json'];
  for (const f of fs.readdirSync(STATES)) if (f.endsWith('.json')) files.push('states/' + f);
  const all = [];
  for (const f of files) {
    if (f === 'states/VA.json') { vaClean.forEach(r => all.push({ f, r })); continue; }
    if (f === 'states/OR.json') { orClean.forEach(r => all.push({ f, r })); continue; }
    load(f).forEach(r => all.push({ f, r }));
  }
  const seen = {};
  all.forEach(({ f, r }) => { (seen[nkey(r.name)] = seen[nkey(r.name)] || []).push({ f, loc: r.location }); });
  return Object.entries(seen).filter(([, v]) => v.length > 1);
}
const residual = combinedAfter();

// ── Output ───────────────────────────────────────────────────────────────────
const line = '─'.repeat(70);
console.log(line);
console.log(EXECUTE ? 'MIGRATION — EXECUTE (writing files)' : 'MIGRATION — DRY RUN (no files written)');
console.log(line);
console.log('\nBefore:', JSON.stringify(report.counts.before));
console.log('After :', JSON.stringify(report.counts.after));

console.log(`\nOrphans rescued: ${report.orphans.length}`);
report.orphans.forEach(o => console.log(`   + ${o.file}  "${o.name}"  (area="${o.area}")`));

console.log(`\nEntries enriched (empty fields filled): ${report.enriched.length}`);
report.enriched.slice(0, 40).forEach(e => console.log(`   ~ ${e.name}: [${e.filled.join(', ')}]`));
if (report.enriched.length > 40) console.log(`   … and ${report.enriched.length - 40} more`);

console.log(`\nNational-org duplicates removed from state files: ${report.nationalDupes.length}`);
report.nationalDupes.forEach(d => console.log(`   - ${d.removedFrom}  "${d.name}"  (merged fields into national: [${d.filled.join(', ')}])`));

console.log(`\nState-name-as-area normalized: ${report.orAreaFixed.length}`);
report.orAreaFixed.forEach(a => console.log(`   * ${a.file}  "${a.name}"  was area="${a.was}" -> ""`));

console.log(`\nResidual duplicate names (appear in >1 file after migration): ${residual.length}`);
residual.forEach(([k, v]) => console.log(`   ! "${k}"  ${v.map(x => x.f + '(' + x.loc + ')').join(', ')}`));

if (EXECUTE) {
  const write = (f, data) => fs.writeFileSync(path.join(RES, f), JSON.stringify(data, null, 2) + '\n');
  write('national.json', national);
  write('states/VA.json', vaClean);
  write('states/OR.json', orClean);
  fs.unlinkSync(path.join(RES, 'nova.json'));
  fs.unlinkSync(path.join(RES, 'portland.json'));
  console.log('\n✔ Wrote national.json, states/VA.json, states/OR.json');
  console.log('✔ Deleted nova.json, portland.json');
} else {
  console.log('\n(dry run — re-run with --execute to apply)');
}
