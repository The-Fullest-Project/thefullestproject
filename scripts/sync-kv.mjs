#!/usr/bin/env node
// Mirror one Cloudflare KV namespace into another, across accounts.
// Used for the Cloudflare account move (see docs/context/services-and-logins.md).
//
//   node scripts/sync-kv.mjs <fromAccount> <fromNamespace> <toAccount> <toNamespace> [--dry-run]
//
// Copies every key byte-for-byte (values travel base64), deletes keys in the target that no
// longer exist in the source, then verifies both sides hold identical keys and values.
// Auth: the OAuth token from `npx wrangler login`. It must be able to reach both accounts.
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { createHash } from "node:crypto";
import os from "node:os";

const [fromAcct, fromNs, toAcct, toNs] = process.argv.slice(2);
const dryRun = process.argv.includes("--dry-run");
if (!toNs) {
  console.error("usage: node scripts/sync-kv.mjs <fromAccount> <fromNamespace> <toAccount> <toNamespace> [--dry-run]");
  process.exit(2);
}

function wranglerToken() {
  if (process.env.CLOUDFLARE_API_TOKEN) return process.env.CLOUDFLARE_API_TOKEN;
  const candidates = [
    process.env.APPDATA && join(process.env.APPDATA, "xdg.config", ".wrangler", "config", "default.toml"),
    join(os.homedir(), ".wrangler", "config", "default.toml"),
    join(os.homedir(), "Library", "Preferences", ".wrangler", "config", "default.toml"),
    join(os.homedir(), ".config", ".wrangler", "config", "default.toml"),
  ].filter(Boolean);
  for (const file of candidates) {
    if (!existsSync(file)) continue;
    const m = readFileSync(file, "utf8").match(/^oauth_token\s*=\s*"([^"]+)"/m);
    if (m) return m[1];
  }
  throw new Error("No Cloudflare token found. Run `npx wrangler login` first.");
}

const token = wranglerToken();
const api = (acct, ns, path = "") =>
  `https://api.cloudflare.com/client/v4/accounts/${acct}/storage/kv/namespaces/${ns}${path}`;

async function call(url, init = {}) {
  const res = await fetch(url, { ...init, headers: { Authorization: `Bearer ${token}`, ...(init.headers || {}) } });
  if (!res.ok) throw new Error(`${init.method || "GET"} ${url} -> ${res.status} ${await res.text()}`);
  return res;
}

async function listKeys(acct, ns) {
  const keys = [];
  let cursor = "";
  do {
    const res = await call(api(acct, ns, `/keys?limit=1000${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ""}`));
    const body = await res.json();
    keys.push(...body.result);
    cursor = body.result_info?.cursor || "";
  } while (cursor);
  return keys;
}

async function getValue(acct, ns, key) {
  const res = await call(api(acct, ns, `/values/${encodeURIComponent(key)}`));
  return Buffer.from(await res.arrayBuffer());
}

const sha = buf => createHash("sha256").update(buf).digest("hex");

const source = await listKeys(fromAcct, fromNs);
const entries = [];
for (const k of source) {
  const value = await getValue(fromAcct, fromNs, k.name);
  const entry = { key: k.name, value: value.toString("base64"), base64: true };
  if (k.expiration) entry.expiration = k.expiration;
  if (k.metadata) entry.metadata = k.metadata;
  entries.push({ entry, hash: sha(value) });
}

const sourceNames = new Set(source.map(k => k.name));
const stale = (await listKeys(toAcct, toNs)).map(k => k.name).filter(n => !sourceNames.has(n));

console.log(`source keys: ${source.length}; to write: ${entries.length}; to delete from target: ${stale.length}`);
if (dryRun) process.exit(0);

for (let i = 0; i < entries.length; i += 100) {
  await call(api(toAcct, toNs, "/bulk"), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(entries.slice(i, i + 100).map(e => e.entry)),
  });
}
for (let i = 0; i < stale.length; i += 1000) {
  await call(api(toAcct, toNs, "/bulk/delete"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(stale.slice(i, i + 1000)),
  });
}

// Verify by reading every value back by key (listings can lag ~60 s; direct reads do not).
let mismatches = 0;
for (const { entry, hash } of entries) {
  const copy = await getValue(toAcct, toNs, entry.key);
  if (sha(copy) !== hash) { mismatches++; console.error(`MISMATCH ${entry.key}`); }
}
console.log(mismatches ? `FAILED: ${mismatches} values differ` : `verified: all ${entries.length} values identical`);
process.exit(mismatches ? 1 : 0);
