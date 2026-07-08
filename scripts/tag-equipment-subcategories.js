/**
 * Tag equipment-category resources with the six Adaptive Equipment subcategories
 * shown on /adaptive-equipment/ (Mobility, Communication, Daily Living, Sensory,
 * Seating & Positioning, Technology). Those tags become the "Type" filter facets
 * on /resources/equipment/, so the icon cards can deep-link (?type=<slug>).
 *
 * A resource can match several buckets (e.g. a power wheelchair with seating is
 * both mobility and seating-positioning). Tags are ADDED, never removed.
 *
 * DRY RUN by default; pass --execute to write.
 *   node scripts/tag-equipment-subcategories.js
 *   node scripts/tag-equipment-subcategories.js --execute
 */
const fs = require('node:fs');
const path = require('node:path');

const EXECUTE = process.argv.includes('--execute');
const RES = path.join(__dirname, '..', 'src', '_data', 'resources');
const STATES = path.join(RES, 'states');

// slug -> keyword list (matched against name + description + existing tags)
const BUCKETS = {
  'mobility': ['wheelchair', 'walker', 'stander', 'standing frame', 'standing-frame',
    'gait', 'mobility', 'scooter', 'all-terrain', 'all terrain', 'trail-chair', 'trail chair',
    'beach-wheelchair', 'beach wheelchair', 'hiking', 'stroller', 'rollator', 'power-wheelchair',
    'power wheelchair', 'quickie', 'freedom chair', 'complex-rehab', 'complex rehab'],
  'communication': ['aac', 'communication', 'eye-tracking', 'eye tracking', 'eye-gaze', 'eye gaze',
    'speech-generating', 'speech generating', 'speech', 'boardmaker', 'pcs symbols', 'symbols',
    'talker', 'dynavox'],
  'daily-living': ['incontinence', 'catheter', 'diaper', 'utensil', 'dining', 'eating', 'feeding',
    'bath', 'toilet', 'dressing', 'daily living', 'daily-living', 'kitchen', 'self-care', 'self care',
    'oral motor', 'silverware', 'grip', 'independent-eating', 'independent eating',
    'caregiving-supplies', 'caregiving supplies', 'low vision', 'living aids'],
  'sensory': ['sensory', 'weighted', 'fidget', 'swing', 'chew', 'compression', 'noise-canceling',
    'noise canceling', 'headphone', 'calming', 'multisensory', 'sensory integration', 'sensory room'],
  'seating-positioning': ['seating', 'positioning', 'postural', 'car-seat', 'car seat', 'wedge',
    'transfer-seat', 'transfer seat', 'transfer', 'alignment'],
  'technology': ['switch-adapted', 'switch adapted', 'switch-adapted toys', 'assistive-technology',
    'assistive technology', 'tablet', 'environmental control', 'timer', 'device-mounting',
    'device mounting', 'hands-free', 'hands free', 'computer', 'eye-tracking', 'eye tracking', 'mount']
};

// Which category slugs mean "equipment" (mirrors directory.js toTop for equipment)
function isEquipment(r) {
  const cats = r.category || [];
  return cats.some(c => c === 'equipment' || c === 'incontinence' || String(c).startsWith('equipment-'));
}

function bucketsFor(r) {
  const hay = [r.name, r.description, ...(r.tags || []), ...(r.category || [])]
    .join(' ').toLowerCase();
  const hits = [];
  for (const [slug, words] of Object.entries(BUCKETS)) {
    if (words.some(w => hay.includes(w))) hits.push(slug);
  }
  return hits;
}

function files() {
  const list = [path.join(RES, 'national.json')];
  for (const f of fs.readdirSync(STATES)) if (f.endsWith('.json')) list.push(path.join(STATES, f));
  return list;
}

const counts = {}; const report = []; let equipTotal = 0; let taggedTotal = 0; let untagged = [];
for (const file of files()) {
  const arr = JSON.parse(fs.readFileSync(file, 'utf8'));
  let changed = false;
  for (const r of arr) {
    if (!isEquipment(r)) continue;
    equipTotal++;
    const buckets = bucketsFor(r);
    if (buckets.length === 0) { untagged.push(r.name); continue; }
    r.tags = r.tags || [];
    const added = [];
    for (const b of buckets) {
      counts[b] = (counts[b] || 0) + 1;
      if (!r.tags.includes(b)) { r.tags.push(b); added.push(b); changed = true; }
    }
    if (added.length) { taggedTotal++; report.push(`${path.basename(file)}  ${r.name} += [${added.join(', ')}]`); }
  }
  if (changed && EXECUTE) fs.writeFileSync(file, JSON.stringify(arr, null, 2) + '\n');
}

console.log('─'.repeat(60));
console.log(EXECUTE ? 'TAGGING — EXECUTE' : 'TAGGING — DRY RUN');
console.log('─'.repeat(60));
console.log('equipment resources scanned:', equipTotal);
console.log('resources newly tagged:', taggedTotal);
console.log('\nper-bucket counts:', JSON.stringify(counts, null, 0));
console.log('\nuntagged (no bucket matched):', untagged.length);
untagged.forEach(n => console.log('   - ' + n));
console.log('\nsample assignments:');
report.slice(0, 40).forEach(l => console.log('   ' + l));
if (report.length > 40) console.log(`   … and ${report.length - 40} more`);
if (!EXECUTE) console.log('\n(dry run — re-run with --execute to write)');
