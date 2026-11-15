/**
 * Which directory listings match an AI search, given the AI's filters.
 *
 * Used by the worker (to give the summary step the real listings, and to know
 * when a search found nothing so the gap is recorded) and MIRRORED in
 * src/js/aiSearch.js, which draws the same listings on the page. Change both
 * together; test-search.mjs pins the behaviour.
 *
 * Rows are /search-index.json rows: n name, a area, l location, c top
 * category, t all top categories, k tags, d description start.
 *
 * Rules (from the 15 November test run):
 *  - Words match at the start of a word ("seizure" finds "seizures"), and
 *    words of four letters or fewer match whole words (plus a plural "s"), so
 *    "OT" doesn't match "Kohl's", "HIPP" doesn't match "hippotherapy", and
 *    "bed" still finds "beds".
 *  - Generic words ("free", "support", "mobility"...) never count: they
 *    matched captioned phones for "free programs" and van dealers for
 *    "adaptive strollers".
 *  - A listing matching more of the search words ranks above one matching a
 *    single word many times. Name 3, tags 2, description 1.
 *  - With a state: that state, then national. Without one: national first,
 *    and other states only if fewer than three national listings match.
 */

export const GENERIC_TERMS = [
  "free", "low cost", "no cost", "cheap", "affordable", "support", "help", "services", "service",
  "care", "resources", "resource", "programs", "program", "options", "mobility", "disability",
  "disabilities", "disabled", "special needs", "kids", "children", "child", "family", "families",
  "parent", "parents", "local", "near me"
];

export const BEST_MATCHES = 8;
export const PER_CATEGORY = 6;

function escapeRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }

/** Lower-case, de-duplicate and drop generic words; compile each to a word-boundary pattern. */
export function cleanTerms(keywords) {
  const seen = [];
  (keywords || []).forEach(k => {
    const t = String(k || "").toLowerCase().replace(/\s+/g, " ").trim();
    if (t.length >= 2 && !GENERIC_TERMS.includes(t) && !seen.includes(t)) seen.push(t);
  });
  return seen.map(t => ({
    text: t,
    re: t.replace(/[^a-z0-9]/g, "").length <= 4
      ? new RegExp("(^|[^a-z0-9])" + escapeRe(t) + "(e?s)?($|[^a-z0-9])")
      : new RegExp("(^|[^a-z0-9])" + escapeRe(t))
  }));
}

export function prepRows(rows) {
  rows.forEach(r => {
    if (r._prepped) return;
    r._name = String(r.n || "").toLowerCase();
    r._tags = String(r.k || "").toLowerCase().replace(/-/g, " ");
    r._desc = String(r.d || "").toLowerCase();
    r._prepped = true;
  });
  return rows;
}

export function scoreRow(row, terms) {
  let score = 0, hits = 0;
  terms.forEach(t => {
    if (t.re.test(row._name)) { score += 3; hits++; }
    else if (t.re.test(row._tags)) { score += 2; hits++; }
    else if (t.re.test(row._desc)) { score += 1; hits++; }
  });
  return { score, hits };
}

function placeTier(row, state) {
  if (state && row.l === state) return 0;
  if (row.l === "National") return 1;
  return 2;
}

function rank(rows, state, place) {
  const p = (place || "").toLowerCase();
  const near = r => (p && String(r.a || "").toLowerCase().includes(p) ? 0 : 1);
  return rows.sort((a, b) =>
    (b._hits - a._hits) || (b._score - a._score) ||
    (placeTier(a, state) - placeTier(b, state)) || (near(a) - near(b)) ||
    String(a.n).localeCompare(String(b.n)));
}

/** Listings in reach: the state plus national; with no state, national (others only to make up three). */
function inReach(rows, state) {
  if (state) return rows.filter(r => r.l === state || r.l === "National");
  const national = rows.filter(r => r.l === "National");
  return national.length >= 3 ? national : rows;
}

/**
 * @returns {{ best: object[], categories: Object<string, {rows: object[], local: number, national: number, total: number}> }}
 */
export function matchListings(rows, filters) {
  prepRows(rows);
  const state = filters.state || null;
  const terms = cleanTerms(filters.keywords);
  rows.forEach(r => {
    const s = terms.length ? scoreRow(r, terms) : { score: 0, hits: 0 };
    r._score = s.score;
    r._hits = s.hits;
  });

  const strong = rows.filter(r => r._score >= 2);
  const best = rank(inReach(strong, state), state, filters.place).slice(0, BEST_MATCHES);

  const categories = {};
  (filters.categories || []).forEach(slug => {
    const inCat = rows.filter(r => (r.t || [r.c]).indexOf(slug) !== -1);
    categories[slug] = {
      rows: rank(inReach(inCat, state), state, filters.place).slice(0, PER_CATEGORY),
      local: state ? inCat.filter(r => r.l === state).length : 0,
      national: inCat.filter(r => r.l === "National").length,
      total: inCat.length
    };
  });
  return { best, categories };
}
