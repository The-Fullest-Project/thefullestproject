/**
 * One-off backfill: stamp dateAdded + origin on every live resource entry.
 *
 * The admin review portal groups the History tab by week of dateAdded, and
 * shows source analytics from origin — entries created before the review
 * pipeline existed have neither. dateAdded falls back to lastScraped (the
 * closest record of when the entry appeared), origin is marked as
 * legacy-backfill so pre-tracking entries are distinguishable.
 *
 * Run once from the repo root:  node scripts/backfill-date-added.js
 * Re-running is safe — entries that already have the fields are untouched.
 */

const fs = require("fs");
const path = require("path");

const RESOURCES_DIR = path.join(__dirname, "..", "src", "_data", "resources");
const TODAY = new Date().toISOString().split("T")[0];

let filesChanged = 0;
let entriesStamped = 0;

function walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    if (fs.statSync(full).isDirectory()) {
      walk(full);
    } else if (name.endsWith(".json")) {
      backfillFile(full);
    }
  }
}

function backfillFile(file) {
  let entries;
  try {
    entries = JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    console.warn(`Skipping unparseable file: ${file}`);
    return;
  }
  if (!Array.isArray(entries)) return;

  let changed = false;
  for (const entry of entries) {
    if (!entry || typeof entry !== "object" || !entry.name) continue;
    if (!entry.dateAdded) {
      entry.dateAdded = entry.lastScraped || TODAY;
      changed = true;
      entriesStamped++;
    }
    if (!entry.origin) {
      entry.origin = { type: "scraper", detail: "legacy-backfill" };
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(file, JSON.stringify(entries, null, 2), "utf8");
    filesChanged++;
    console.log(`Backfilled ${path.relative(RESOURCES_DIR, file)}`);
  }
}

walk(RESOURCES_DIR);
console.log(`\nDone: stamped ${entriesStamped} entries across ${filesChanged} files.`);
