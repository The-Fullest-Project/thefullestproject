// Tests for AI-assisted search (search.js). No network, no spending:
// fetch, KV and the category loader are all fakes.
//   node cloudflare-worker-admin-api/test-search.mjs
import assert from "node:assert/strict";
import {
  handleSearch, handleSearchOutcome, handleSearchStats,
  cleanResult, buildSchema, costUSD, settings, utcDay, errorCode
} from "./search.js";

const CATS = [
  { value: "respite", label: "Respite Care" },
  { value: "camps", label: "Camps & After-School" },
  { value: "other", label: "Other" }
];

function fakeKV() {
  const m = new Map();
  return {
    m,
    async get(k) { return m.has(k) ? m.get(k) : null; },
    async put(k, v) { m.set(k, v); }
  };
}

function env(extra = {}) {
  return {
    SEARCH_STATS: fakeKV(),
    ANTHROPIC_SEARCH_API_KEY: "test-key",
    TURNSTILE_SECRET_KEY: "test-secret",
    EDIT_SESSION_SECRET: "salt",
    SEARCH_DAILY_LIMIT: "2",
    ...extra
  };
}

const ctx = { pending: [], waitUntil(p) { this.pending.push(p); } };
const deps = { loadCategories: async () => CATS };

function req(body, origin = "https://preview.thefullestproject.org", ip = "1.2.3.4") {
  return new Request("https://w.example/search", {
    method: "POST",
    headers: { "Origin": origin, "Content-Type": "application/json", "CF-Connecting-IP": ip },
    body: JSON.stringify(body)
  });
}

let aiCalls = 0;
let lastAiBody = null;
let turnstileOk = true;
let aiReply = { categories: ["camps", "nonsense"], state: "Virginia", place: "Fairfax", crisis: false, offTopic: false };

globalThis.fetch = async (url, init) => {
  if (String(url).includes("turnstile")) {
    return new Response(JSON.stringify({ success: turnstileOk }));
  }
  if (String(url).includes("api.anthropic.com")) {
    aiCalls++;
    lastAiBody = JSON.parse(init.body);
    return new Response(JSON.stringify({
      model: "claude-opus-5-5",
      stop_reason: "end_turn",
      usage: { input_tokens: 1000, output_tokens: 200 },
      content: [{ type: "thinking", thinking: "" }, { type: "text", text: JSON.stringify(aiReply) }]
    }));
  }
  throw new Error("unexpected fetch " + url);
};

async function call(e, body, origin, ip) {
  const res = await handleSearch(req(body, origin, ip), e, ctx, deps);
  await Promise.all(ctx.pending.splice(0));
  return { status: res.status, data: res.status === 204 ? null : await res.json() };
}

// ── pure helpers ─────────────────────────────────────────────────────────────
{
  const r = cleanResult({ categories: ["camps", "camps", "bogus", "respite"], state: "Narnia", place: "<b>Fairfax</b>", crisis: 1, offTopic: false }, CATS);
  assert.deepEqual(r.categories, ["camps", "respite"], "unknown and duplicate categories dropped");
  assert.equal(r.state, null, "unknown state dropped");
  assert.equal(r.place, "bFairfax/b", "angle brackets stripped from place");
  assert.equal(r.crisis, true);
  assert.deepEqual(cleanResult({ categories: ["camps"], offTopic: true }, CATS).categories, [], "off-topic clears categories");
  assert.deepEqual(
    cleanResult({ categories: [], keywords: ["Safety Bed", "safety bed", "<b>g-tube</b>", "x", 7, "a", "b2", "c3", "d4", "e5"] }, CATS).keywords,
    ["safety bed", "b g-tube b", "b2", "c3", "d4"],
    "keywords lower-cased, de-duplicated, cleaned, capped at five");

  const schema = buildSchema(CATS.filter(c => c.value !== "other"));
  assert.deepEqual(schema.properties.categories.items.enum, ["respite", "camps"]);
  assert.equal(schema.additionalProperties, false);

  assert.equal(costUSD("claude-opus-5-5", { input_tokens: 1e6, output_tokens: 0 }), 4);
  assert.equal(costUSD("claude-haiku-5-5", { input_tokens: 0, output_tokens: 1e6 }), 0.5);
  assert.equal(costUSD("unknown-model", { input_tokens: 1e6 }), 4, "unknown model priced high");

  assert.equal(settings({}).limit, 15, "default limit is 15");
  assert.equal(settings({ SEARCH_DAILY_LIMIT: "abc" }).limit, 15);
  assert.equal(settings({}).budget, 1.6);
  assert.match(utcDay(new Date("2026-11-14T23:00:00Z")), /^2026-11-14$/);
}

// ── origin and input checks ──────────────────────────────────────────────────
{
  const e = env();
  assert.equal((await call(e, { q: "respite in Fairfax", token: "t" }, "https://evil.example")).status, 403);
  assert.equal((await call(e, { q: "hi", token: "t" })).status, 400, "too short");
  assert.equal((await call(e, { q: "x".repeat(301), token: "t" })).status, 400, "too long");
}

// ── happy path, counts, and privacy ──────────────────────────────────────────
{
  const e = env();
  aiCalls = 0;
  const { data } = await call(e, { q: "summer camp for my autistic son in Fairfax", token: "t" });
  assert.equal(data.mode, "ai");
  assert.deepEqual(data.categories, ["camps"], "only real categories come back");
  assert.equal(data.state, "Virginia");
  assert.equal(data.remaining, 1);
  assert.equal(aiCalls, 1);
  assert.equal(lastAiBody.model, "claude-opus-5-5");
  assert.equal(lastAiBody.output_config.format.type, "json_schema");
  assert.ok(!("temperature" in lastAiBody), "no sampling params on 2026-10-21");
  assert.ok(!lastAiBody.system.includes("autistic"), "query is not in the system prompt");
  assert.ok(lastAiBody.system.includes("respite: Respite Care") && !lastAiBody.system.includes("other: Other"), "category list excludes 'other'");

  const stored = [...e.SEARCH_STATS.m.values()].join("\n");
  assert.ok(!stored.includes("autistic") && !stored.includes("Fairfax"), "search text is never stored");

  const day = JSON.parse(e.SEARCH_STATS.m.get("day-" + utcDay()));
  assert.equal(day.searches, 1);
  assert.equal(day.categories.camps, 1);
  assert.ok(day.spendUSD > 0, "spend recorded");

  // outcome is counted for a visitor who searched today, and ignored otherwise
  const out = await handleSearchOutcome(req({ found: true }), e, ctx);
  await Promise.all(ctx.pending.splice(0));
  assert.equal(out.status, 204);
  await handleSearchOutcome(req({ found: true }, undefined, "9.9.9.9"), e, ctx);
  await Promise.all(ctx.pending.splice(0));
  assert.equal(JSON.parse(e.SEARCH_STATS.m.get("day-" + utcDay())).found, 1, "stranger's outcome ignored");

  // per-visitor limit (2 in this test env)
  await call(e, { q: "respite care in Fairfax", token: "t" });
  aiCalls = 0;
  const third = await call(e, { q: "respite care in Fairfax", token: "t" });
  assert.equal(third.data.mode, "fallback");
  assert.equal(third.data.reason, "limit");
  assert.equal(aiCalls, 0, "no AI call once the limit is reached");
  const other = await call(e, { q: "respite care in Fairfax", token: "t" }, undefined, "5.6.7.8");
  assert.equal(other.data.mode, "ai", "a different visitor still gets AI");
}

// ── bot check, budget, kill switch, missing setup ────────────────────────────
{
  const e = env();
  turnstileOk = false; aiCalls = 0;
  assert.equal((await call(e, { q: "respite care please", token: "t" })).data.reason, "botcheck");
  assert.equal(aiCalls, 0);
  turnstileOk = true;

  // a bot check that failed in the browser is counted with its error code
  const eb = env();
  assert.equal((await call(eb, { q: "respite care please", token: "", botError: "110200" })).data.reason, "botcheck");
  assert.equal(aiCalls, 0);
  const fb = JSON.parse(eb.SEARCH_STATS.m.get("day-" + utcDay())).fallbacks;
  assert.equal(fb["botcheck-browser-110200"], 1);
  assert.equal(errorCode("<script>"), "script");

  const e2 = env();
  e2.SEARCH_STATS.m.set("day-" + utcDay(), JSON.stringify({ spendUSD: 1.61 }));
  assert.equal((await call(e2, { q: "respite care please", token: "t" })).data.reason, "budget");
  assert.equal(aiCalls, 0, "no AI call over budget");

  assert.equal((await call(env({ SEARCH_ENABLED: "0" }), { q: "respite care please", token: "t" })).data.reason, "off");
  assert.equal((await call(env({ SEARCH_SIGNED_IN_ONLY: "1" }), { q: "respite care please", token: "t" })).data.reason, "signin");
  assert.equal((await call(env({ ANTHROPIC_SEARCH_API_KEY: "" }), { q: "respite care please", token: "t" })).data.reason, "unavailable");
}

// ── crisis and off-topic pass through ────────────────────────────────────────
{
  aiReply = { categories: [], state: null, place: "", crisis: true, offTopic: false };
  const { data } = await call(env(), { q: "I can't do this anymore", token: "t" });
  assert.equal(data.crisis, true);
  aiReply = { categories: ["camps"], state: null, place: "", crisis: false, offTopic: true };
  const off = await call(env(), { q: "best pizza recipe", token: "t" });
  assert.equal(off.data.offTopic, true);
  assert.deepEqual(off.data.categories, []);
}

// ── haiku leaves out the fallback parameter ──────────────────────────────────
{
  aiReply = { categories: ["respite"], state: null, place: "", crisis: false, offTopic: false };
  await call(env({ SEARCH_MODEL: "claude-haiku-5-5" }), { q: "respite care please", token: "t" });
  assert.ok(!("fallbacks" in lastAiBody), "no fallbacks param for haiku");
}

// ── stats endpoint ───────────────────────────────────────────────────────────
{
  const e = env();
  await call(e, { q: "respite care please", token: "t" });
  const res = await handleSearchStats(new URL("https://w.example/search-stats?days=3"), e);
  const data = await res.json();
  assert.equal(data.days.length, 3);
  assert.equal(data.settings.limit, 2);
  assert.deepEqual(data.keys, { search: true, turnstile: true });
}

console.log("search tests passed");
