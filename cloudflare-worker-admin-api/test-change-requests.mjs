/**
 * Tests for the Requests tab's response thread, run through the real worker
 * with an in-memory KV. Node stdlib only.
 *
 *   node cloudflare-worker-admin-api/test-change-requests.mjs
 */

import assert from "node:assert/strict";
import worker from "./worker.js";

function fakeKv() {
  const store = new Map();
  return {
    store,
    get: async k => (store.has(k) ? store.get(k) : null),
    put: async (k, v) => { store.set(k, v); },
    delete: async k => { store.delete(k); },
    list: async ({ prefix = "" }) => ({
      keys: [...store.keys()].filter(k => k.startsWith(prefix)).sort().map(name => ({ name })),
      list_complete: true,
    }),
  };
}

const emails = [];
globalThis.fetch = async (url, opts) => {
  if (String(url).includes("api.brevo.com")) emails.push(JSON.parse(opts.body));
  return new Response("{}", { status: 200 });
};

const env = {
  CHANGE_REQUESTS: fakeKv(),
  ADMIN_KEY: "test-key",
  BREVO_API_KEY: "x",
  CR_NOTIFY_EMAILS: "team@example.com",
  ALLOWED_ORIGIN: "https://thefullestproject.org",
};

async function call(method, path, body, headers = { "X-Admin-Key": "test-key" }) {
  const pending = [];
  const res = await worker.fetch(new Request(`https://api.test${path}`, {
    method,
    headers: { "Content-Type": "application/json", Origin: "https://thefullestproject.org", ...headers },
    body: body ? JSON.stringify(body) : undefined,
  }), env, { waitUntil: p => pending.push(p) });
  await Promise.all(pending);
  return { status: res.status, data: await res.json() };
}

const list = async () => (await call("GET", "/change-requests")).data.requests;

// A request with next steps from Patrick, like the live ones.
const { data: filed } = await call("POST", "/change-requests",
  { title: "Awareness months", detail: "List please", askedBy: "Nicole" });
const id = filed.request.id;
await call("POST", "/change-requests", { id, note: "Planned.", repliedBy: "Patrick" });
const before = await env.CHANGE_REQUESTS.get(id);

// Older requests have no replies stored; they must read as an empty thread.
assert.deepEqual((await list())[0].replies, []);

emails.length = 0;
const first = await call("POST", "/change-requests/reply", { id, text: "Start in November?", by: "Nicole" });
assert.equal(first.status, 200);
await new Promise(r => setTimeout(r, 5));
await call("POST", "/change-requests/reply", { id, text: "Yes, will do.", by: "Patrick" });

// The whole point: responses leave the request record byte-for-byte alone.
assert.equal(await env.CHANGE_REQUESTS.get(id), before);

const [r] = await list();
assert.equal(r.note, "Planned.");
assert.equal(r.noteBy, "Patrick");
assert.deepEqual(r.replies.map(x => [x.by, x.text]),
  [["Nicole", "Start in November?"], ["Patrick", "Yes, will do."]]);

// Reply keys must not appear as requests of their own.
assert.equal((await list()).length, 1);

// Editing next steps must not touch the thread.
await call("POST", "/change-requests", { id, note: "Planned, new date.", repliedBy: "Patrick" });
assert.equal((await list())[0].replies.length, 2);

// The team hears about it, and text is escaped.
assert.equal(emails.length, 3);
assert.equal(emails[0].subject, "Response on: Awareness months");
assert.equal(emails[2].subject, "Next steps on: Awareness months");
assert.match(emails[0].htmlContent, /Response from Nicole/);
assert.match(emails[0].htmlContent, /Start in November\?/);
emails.length = 0;
await call("POST", "/change-requests/reply", { id, text: "<b>hi</b>", by: "Erin" });
assert.ok(!emails[0].htmlContent.includes("<b>hi</b>"));

// A named team mailbox is added to the alert list, once, and reported back.
emails.length = 0;
const direct = await call("POST", "/change-requests/reply",
  { id, text: "x".repeat(15000), by: "Patrick", emailTo: "Nicole@thefullestproject.org" });
assert.equal(direct.data.emailed, true);
assert.equal(direct.data.reply.text.length, 15000);
assert.deepEqual(emails[0].to.map(t => t.email), ["team@example.com", "nicole@thefullestproject.org"]);
assert.equal((await call("POST", "/change-requests/reply",
  { id, text: "x", by: "Patrick", emailTo: "someone@gmail.com" })).status, 400);
assert.equal((await call("POST", "/change-requests/reply",
  { id, text: "x", by: "Patrick", emailTo: "a@thefullestproject.org.evil.com" })).status, 400);

// A PDF stays out of the listing, downloads intact, and reaches the email.
const pdf = Buffer.from("%PDF-1.7 test").toString("base64");
emails.length = 0;
const attached = await call("POST", "/change-requests/reply",
  { id, text: "See attached", by: "Patrick", attachment: { name: "List.pdf", data: pdf } });
const meta = attached.data.reply.attachment;
assert.equal(meta.name, "List.pdf");
assert.equal(emails[0].attachment[0].content, pdf);
const listed = (await list())[0].replies.find(x => x.attachment);
assert.ok(!JSON.stringify(listed).includes(pdf));
const fetched = await call("GET", `/change-requests/file?key=${encodeURIComponent(meta.key)}`);
assert.equal(fetched.data.data, pdf);
assert.equal((await call("GET", `/change-requests/file?key=${encodeURIComponent(id)}`)).status, 400);
assert.equal((await call("GET", `/change-requests/file?key=${encodeURIComponent(meta.key)}`, undefined, {})).status, 401);
assert.equal((await call("POST", "/change-requests/reply",
  { id, text: "x", by: "Patrick", attachment: { name: "a.pdf", data: "aGVsbG8=" } })).status, 400);
assert.equal((await call("POST", "/change-requests/reply",
  { id, text: "x", by: "Patrick", attachment: { name: "a.exe", data: pdf } })).status, 400);
assert.equal((await call("POST", "/change-requests/reply",
  { id, text: "x", by: "Patrick", attachment: { name: "a.pdf", data: "JVBERi0" + "A".repeat(7000000) } })).status, 400);

// Word files attach too, but a renamed file does not pass as one.
const docx = Buffer.from("PK\x03\x04 test").toString("base64");
assert.equal((await call("POST", "/change-requests/reply",
  { id, text: "Editable copy", by: "Patrick", attachment: { name: "Drafts.docx", data: docx } })).status, 200);
assert.equal((await call("POST", "/change-requests/reply",
  { id, text: "x", by: "Patrick", attachment: { name: "a.docx", data: pdf } })).status, 400);

// Bad input.
assert.equal((await call("POST", "/change-requests/reply", { id, text: "  ", by: "Nicole" })).status, 400);
assert.equal((await call("POST", "/change-requests/reply", { id, text: "x", by: "Stranger" })).status, 400);
assert.equal((await call("POST", "/change-requests/reply", { text: "x", by: "Nicole" })).status, 400);
assert.equal((await call("POST", "/change-requests/reply", { id: "cr-nope", text: "x", by: "Nicole" })).status, 404);

// Admin only.
assert.equal((await call("POST", "/change-requests/reply", { id, text: "x", by: "Nicole" }, {})).status, 401);

// Deleting a request takes its thread with it, and only its own.
const { data: other } = await call("POST", "/change-requests", { title: "Other", askedBy: "Erin" });
await call("POST", "/change-requests/reply", { id: other.request.id, text: "Keep me", by: "Erin" });
await call("DELETE", `/change-requests?id=${encodeURIComponent(id)}`);
assert.deepEqual([...env.CHANGE_REQUESTS.store.keys()].filter(k => k.includes(id)), []);
assert.equal((await list())[0].replies[0].text, "Keep me");

// Keep both: the pair stops being flagged, in either name order, and only it.
const file = "src/_data/resources/states/VA.json";
const index = ["Alpha House", "Alpha House Inc", "Beta Care", "Beta Care LLC"].map(name =>
  ({ name, file, location: "Virginia", website: `https://${name.split(" ")[0].toLowerCase()}.example.org` }));
const brevoFetch = globalThis.fetch;
globalThis.fetch = async (url, opts) => String(url).includes("duplicate-index.json")
  ? new Response(JSON.stringify(index), { status: 200 })
  : brevoFetch(url, opts);
const flagged = async () => (await call("GET", "/duplicates")).data.pairs.map(p => p.a.name);
assert.deepEqual((await flagged()).sort(), ["Alpha House", "Beta Care"]);
assert.equal((await call("POST", "/duplicates/keep-both",
  { file, nameA: "Alpha House Inc", nameB: "Alpha House" })).status, 200);
assert.deepEqual(await flagged(), ["Beta Care"]);
assert.equal((await call("GET", "/duplicates")).data.pairCount, 1);
assert.equal((await call("POST", "/duplicates/keep-both", { file: "../etc", nameA: "a", nameB: "b" })).status, 400);
assert.equal((await call("POST", "/duplicates/keep-both", { file, nameA: "a", nameB: "b" }, {})).status, 401);
assert.equal((await list()).length, 1);

// Undo: the kept pair is listed, and removing it flags the pair again.
const kept = (await call("GET", "/duplicates")).data.kept;
assert.deepEqual(kept.map(k => k.nameA), ["Alpha House Inc"]);
const crKey = encodeURIComponent(id);
assert.equal((await call("DELETE", `/duplicates/keep-both?key=${crKey}`)).status, 400);
assert.equal((await call("DELETE", `/duplicates/keep-both?key=${encodeURIComponent(kept[0].key)}`, undefined, {})).status, 401);
assert.equal((await call("DELETE", `/duplicates/keep-both?key=${encodeURIComponent(kept[0].key)}`)).status, 200);
assert.deepEqual((await flagged()).sort(), ["Alpha House", "Beta Care"]);
assert.deepEqual((await call("GET", "/duplicates")).data.kept, []);

console.log("change-request thread tests passed");
