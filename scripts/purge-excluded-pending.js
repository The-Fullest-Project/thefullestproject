/**
 * One-off cleanup: remove pending review-queue items that are out-of-scope
 * mental-health / chiropractic / behavioral-health services (admin decision
 * 2026-07). Mirrors scrapers/_category_map.is_excluded so the queue matches
 * what the scraper will now refuse to add going forward.
 *
 * Edits pending/submissions.json + pending/scraped/*.json in place.
 * DRY RUN by default; pass --execute to write.
 */
const fs = require('node:fs');
const path = require('node:path');

const EXECUTE = process.argv.includes('--execute');
const ROOT = path.join(__dirname, '..', 'pending');

const EXCLUDE_KEYWORDS = [
  'chiropract', 'psychotherap', 'psychiatr', 'counseling', 'counselling',
  'counselor', 'counsellor', 'behavioral health', 'behavioural health',
  'mental health', 'mental-health'
];
const EXCLUDE_TAGS = new Set(['psychotherapist', 'mental_health']);

function isExcluded(env) {
  const p = env.payload || {};
  const cats = Array.isArray(p.category) ? p.category : [p.category].filter(Boolean);
  if (cats.includes('mental-health')) return true;
  const tags = (p.tags || []).map(t => String(t).toLowerCase());
  if (tags.some(t => EXCLUDE_TAGS.has(t))) return true;
  const blob = [p.name, p.description].filter(Boolean).join(' ').toLowerCase();
  if (blob.includes('genetic counsel')) return false; // wanted medical service
  return EXCLUDE_KEYWORDS.some(kw => blob.includes(kw));
}

function pendingFiles() {
  const files = [];
  const sub = path.join(ROOT, 'submissions.json');
  if (fs.existsSync(sub)) files.push(sub);
  const scraped = path.join(ROOT, 'scraped');
  if (fs.existsSync(scraped)) {
    for (const f of fs.readdirSync(scraped)) {
      if (f.endsWith('.json')) files.push(path.join(scraped, f));
    }
  }
  return files;
}

let totalRemoved = 0, totalKept = 0;
const removedByType = {};
const sample = [];

for (const file of pendingFiles()) {
  let arr;
  try { arr = JSON.parse(fs.readFileSync(file, 'utf8')); } catch { continue; }
  if (!Array.isArray(arr)) continue;
  const kept = [];
  for (const env of arr) {
    const reviewable = env.type === 'resource' || env.type === 'submission';
    if (reviewable && isExcluded(env)) {
      totalRemoved++;
      const o = (env.origin && env.origin.type) || 'unknown';
      removedByType[o] = (removedByType[o] || 0) + 1;
      if (sample.length < 25) sample.push(`${path.basename(file)}: ${(env.payload || {}).name}`);
    } else {
      kept.push(env);
      totalKept++;
    }
  }
  if (EXECUTE && kept.length !== arr.length) {
    fs.writeFileSync(file, JSON.stringify(kept, null, 2) + '\n');
  }
}

console.log('─'.repeat(60));
console.log(EXECUTE ? 'PURGE — EXECUTE' : 'PURGE — DRY RUN');
console.log('─'.repeat(60));
console.log('removed:', totalRemoved, '| kept:', totalKept);
console.log('removed by origin:', JSON.stringify(removedByType));
console.log('\nsample removed:');
sample.forEach(s => console.log('  - ' + s));
if (!EXECUTE) console.log('\n(dry run — re-run with --execute to write)');
