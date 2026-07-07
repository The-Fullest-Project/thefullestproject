/**
 * Cloudflare Worker: tfp-admin-api
 *
 * Backend for the admin review portal (/admin/review/) and the public
 * resource-submission / newsletter intake.
 *
 * Public routes:
 *   POST /submit      — resource form intake → pending/submissions.json
 *                       (+ Formspree notification forward + Brevo thank-you)
 *   POST /newsletter  — newsletter signup → Brevo double-opt-in
 *
 * Admin routes (GitHub OAuth token with push permission, or X-Admin-Key):
 *   GET  /pending     — every pending envelope across the store
 *   POST /approve     — {items:[{id, file, payload?}]} or {all:true, type?}
 *   POST /reject      — {items:[{id, file}], block?:true}
 *   POST /bulk-import — {items:[resource fields], detail?, publish?:false}
 *   GET  /emails      — Brevo contacts proxy (read-only)
 *
 * Environment (Cloudflare dashboard):
 *   GITHUB_TOKEN              — PAT with repo scope (worker's own commits)
 *   GITHUB_REPO               — "The-Fullest-Project/thefullestproject"
 *   ALLOWED_ORIGIN            — "https://thefullestproject.org"
 *   ADMIN_KEY                 — break-glass admin header for curl use
 *   FORMSPREE_SUBMIT_ID       — xpqywwla (resource submissions)
 *   FORMSPREE_NEWSLETTER_ID   — meeroozw (newsletter signups)
 *   BREVO_API_KEY             — Brevo v3 API key (email features no-op if unset)
 *   BREVO_LIST_ID             — numeric id of the "TFP Community" list
 *   BREVO_THANKYOU_TEMPLATE_ID — transactional template for submitter thank-you
 *   BREVO_DOI_TEMPLATE_ID     — double-opt-in confirmation template
 */

const SUBMISSIONS_PATH = "pending/submissions.json";
const NEWSLETTER_DRAFTS_PATH = "pending/newsletter-drafts.json";
const SCRAPED_DIR = "pending/scraped";
const BLOCKLIST_PATH = "scrapers/blocklist.json";
const STORIES_PATH = "src/_data/stories.json";
const SPOTLIGHTS_PATH = "src/_data/spotlights.json";
const MAX_STORIES = 6; // mirrors scrapers/sources/positive_stories.py
const MAX_CHANGED_FILES = 40; // stay well under the 50-subrequest cap

const STATE_CODES = {
  "Alabama": "AL", "Alaska": "AK", "Arizona": "AZ", "Arkansas": "AR",
  "California": "CA", "Colorado": "CO", "Connecticut": "CT", "Delaware": "DE",
  "District of Columbia": "DC", "Florida": "FL", "Georgia": "GA", "Hawaii": "HI",
  "Idaho": "ID", "Illinois": "IL", "Indiana": "IN", "Iowa": "IA",
  "Kansas": "KS", "Kentucky": "KY", "Louisiana": "LA", "Maine": "ME",
  "Maryland": "MD", "Massachusetts": "MA", "Michigan": "MI", "Minnesota": "MN",
  "Mississippi": "MS", "Missouri": "MO", "Montana": "MT", "Nebraska": "NE",
  "Nevada": "NV", "New Hampshire": "NH", "New Jersey": "NJ", "New Mexico": "NM",
  "New York": "NY", "North Carolina": "NC", "North Dakota": "ND", "Ohio": "OH",
  "Oklahoma": "OK", "Oregon": "OR", "Pennsylvania": "PA", "Rhode Island": "RI",
  "South Carolina": "SC", "South Dakota": "SD", "Tennessee": "TN", "Texas": "TX",
  "Utah": "UT", "Vermont": "VT", "Virginia": "VA", "Washington": "WA",
  "West Virginia": "WV", "Wisconsin": "WI", "Wyoming": "WY"
};

export default {
  async fetch(request, env, ctx) {
    if (request.method === "OPTIONS") {
      return cors(env, new Response(null, { status: 204 }));
    }

    const path = new URL(request.url).pathname.replace(/\/+$/, "") || "/";

    try {
      if (request.method === "POST" && path === "/submit") {
        return cors(env, await handleSubmit(request, env, ctx));
      }
      if (request.method === "POST" && path === "/newsletter") {
        return cors(env, await handleNewsletter(request, env, ctx));
      }
      if (path === "/health") {
        return cors(env, json({ status: "ok" }));
      }

      // Everything else is admin-only
      const auth = await requireAdmin(request, env);
      if (auth.error) {
        return cors(env, json({ error: auth.message }, auth.error));
      }

      if (request.method === "GET" && path === "/pending") {
        return cors(env, await handlePending(env));
      }
      if (request.method === "POST" && path === "/approve") {
        return cors(env, await handleApprove(await request.json(), env, auth));
      }
      if (request.method === "POST" && path === "/reject") {
        return cors(env, await handleReject(await request.json(), env, auth));
      }
      if (request.method === "POST" && path === "/bulk-import") {
        return cors(env, await handleBulkImport(await request.json(), env, auth));
      }
      if (request.method === "GET" && path === "/emails") {
        return cors(env, await handleEmails(new URL(request.url), env));
      }
      if (request.method === "GET" && path === "/newsletter-drafts") {
        return cors(env, await handleNewsletterDraftsGet(env));
      }
      if (request.method === "POST" && path === "/newsletter-drafts") {
        return cors(env, await handleNewsletterDraftsPost(await request.json(), env, auth));
      }

      return cors(env, json({ error: "Not found" }, 404));
    } catch (err) {
      return cors(env, json({ error: "Internal error", detail: err.message }, 500));
    }
  }
};

// ─── Auth ────────────────────────────────────────────────────────────────────

async function requireAdmin(request, env) {
  const adminKey = request.headers.get("X-Admin-Key");
  if (adminKey && env.ADMIN_KEY && adminKey === env.ADMIN_KEY) {
    return { ok: true, actor: "admin-key" };
  }

  const header = request.headers.get("Authorization") || "";
  const token = header.replace(/^(token|bearer)\s+/i, "").trim();
  if (!token) {
    return { error: 401, message: "Missing Authorization header" };
  }

  // The repo is public, so reads succeed for anyone — the actual gate is
  // push permission, which GitHub only reports for the authenticated user.
  const res = await fetch(`https://api.github.com/repos/${env.GITHUB_REPO}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "User-Agent": "tfp-admin-api"
    }
  });
  if (res.status === 401) {
    return { error: 401, message: "Invalid or expired GitHub token" };
  }
  if (!res.ok) {
    return { error: 403, message: "Could not verify repository access" };
  }
  const repo = await res.json();
  if (!repo.permissions || !repo.permissions.push) {
    return { error: 403, message: "Your GitHub account does not have push access to the site repository" };
  }

  // Best-effort actor name for commit messages
  let actor = "github-admin";
  try {
    const userRes = await fetch("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${token}`, "User-Agent": "tfp-admin-api" }
    });
    if (userRes.ok) actor = (await userRes.json()).login || actor;
  } catch { /* non-fatal */ }

  return { ok: true, actor };
}

// ─── Public: resource submission ─────────────────────────────────────────────

async function handleSubmit(request, env, ctx) {
  const formData = await request.formData();
  const data = Object.fromEntries(formData.entries());

  const required = ["resourceName", "location", "category", "description"];
  const missing = required.filter(f => !data[f]?.trim());
  if (missing.length > 0) {
    return json({ error: `Missing required fields: ${missing.join(", ")}` }, 400);
  }

  const today = new Date().toISOString().split("T")[0];
  const isBookmarklet = data.submissionSource === "quick-submit";
  // PII rule: submitterEmail never enters the envelope — the repo is public.
  const payload = {
    name: data.resourceName.trim().slice(0, 200),
    category: [data.category.trim()],
    location: data.location.trim(),
    area: "",
    description: data.description.trim(),
    phone: (data.contactInfo || "").trim(),
    website: (data.website || "").trim(),
    address: "",
    ageRange: "",
    disabilityTypes: [],
    cost: "",
    tags: [],
    source: (data.website || "").trim() || "website-submission",
    lastScraped: today
  };

  const envelope = {
    id: await pendingId("sub", `submission|${payload.name}|${payload.location}`),
    type: "submission",
    status: "pending",
    origin: {
      type: isBookmarklet ? "quick-submit" : "submission",
      detail: isBookmarklet ? "bookmarklet" : "submit-resource-form",
      submittedAt: new Date().toISOString()
    },
    targetFile: resourceTargetFile(payload.location),
    payload
  };

  const err = await appendSubmission(envelope, env);
  if (err) return err;

  // Formspree notification forward (carries submitterEmail) — fire and forget
  if (env.FORMSPREE_SUBMIT_ID) {
    const body = new FormData();
    for (const [k, v] of Object.entries(data)) body.append(k, v);
    body.append("_pendingId", envelope.id);
    ctx.waitUntil(fetch(`https://formspree.io/f/${env.FORMSPREE_SUBMIT_ID}`, {
      method: "POST", body, headers: { Accept: "application/json" }
    }).catch(() => {}));
  }

  // Brevo: thank a NEW submitter and invite them to the list — never blocks
  const email = (data.submitterEmail || "").trim();
  if (email) {
    ctx.waitUntil(brevoThankSubmitter(email, env).catch(() => {}));
  }

  return json({
    success: true,
    pendingId: envelope.id,
    message: "Thank you! Your resource has been submitted for review and will appear on the site once approved."
  }, 201);
}

async function appendSubmission(envelope, env) {
  // Contents-API read-modify-write with SHA-conflict retry
  for (let attempt = 0; attempt < 3; attempt++) {
    const file = await readRepoFile(env, SUBMISSIONS_PATH);
    const submissions = file ? file.json : [];
    if (submissions.some(e => e.id === envelope.id)) {
      return null; // duplicate submission — treat as success
    }
    submissions.push(envelope);
    const res = await fetch(
      `https://api.github.com/repos/${env.GITHUB_REPO}/contents/${SUBMISSIONS_PATH}`,
      {
        method: "PUT",
        headers: ghHeaders(env),
        body: JSON.stringify({
          message: `New resource submission: ${envelope.payload.name}`,
          content: b64encode(JSON.stringify(submissions, null, 2)),
          sha: file ? file.sha : undefined,
          committer: { name: "TFP Admin API", email: "worker@thefullestproject.org" }
        })
      }
    );
    if (res.ok) return null;
    if (res.status !== 409 && res.status !== 422) {
      return json({ error: "Failed to save submission", detail: await res.text() }, 502);
    }
    // stale SHA — loop and re-read
  }
  return json({ error: "Failed to save submission after retries" }, 502);
}

// ─── Public: newsletter ──────────────────────────────────────────────────────

async function handleNewsletter(request, env, ctx) {
  const formData = await request.formData();
  const email = (formData.get("email") || "").trim();
  if (!email || !email.includes("@")) {
    return json({ error: "A valid email address is required" }, 400);
  }

  if (env.FORMSPREE_NEWSLETTER_ID) {
    const body = new FormData();
    body.append("email", email);
    ctx.waitUntil(fetch(`https://formspree.io/f/${env.FORMSPREE_NEWSLETTER_ID}`, {
      method: "POST", body, headers: { Accept: "application/json" }
    }).catch(() => {}));
  }

  if (brevoConfigured(env)) {
    try {
      await brevoDoubleOptIn(email, "newsletter-form", env);
    } catch (err) {
      // Formspree still captured the signup; report success to the visitor
      console.log("Brevo DOI failed:", err.message);
    }
  }

  return json({
    success: true,
    message: "Almost there — check your inbox for a confirmation email."
  });
}

// ─── Admin: pending queue ────────────────────────────────────────────────────

async function handlePending(env) {
  const items = [];
  const counts = {};

  const dir = await listRepoDir(env, SCRAPED_DIR);
  const batchFiles = dir.filter(f => f.name.endsWith(".json"));
  for (const f of batchFiles) {
    const file = await readRepoFile(env, f.path);
    if (!file) continue;
    for (const envls of file.json) {
      items.push({ ...envls, file: f.path });
    }
  }

  const submissions = await readRepoFile(env, SUBMISSIONS_PATH);
  if (submissions) {
    for (const envls of submissions.json) {
      items.push({ ...envls, file: SUBMISSIONS_PATH });
    }
  }

  for (const item of items) {
    counts[item.type] = (counts[item.type] || 0) + 1;
  }

  return json({ items, counts });
}

// ─── Admin: approve ──────────────────────────────────────────────────────────

async function handleApprove(body, env, auth) {
  const selection = await resolveSelection(body, env);
  if (selection.error) return selection.error;
  const { byFile, overrides, newsletterFlags } = selection;

  const approved = [], failed = [];
  const paragraphCache = new Map(); // id -> generated paragraph (survives commit retries)
  const result = await commitWithRetry(env, async () => {
    approved.length = 0; failed.length = 0;
    const changes = new Map(); // repo path -> content string | null (delete)
    const liveCache = new Map();

    const readLive = async (path, fallback) => {
      if (!liveCache.has(path)) {
        const file = await readRepoFile(env, path);
        liveCache.set(path, file ? file.json : fallback);
      }
      return liveCache.get(path);
    };

    const today = new Date().toISOString().split("T")[0];
    const approvedSpotlights = [];

    for (const [pendingPath, wanted] of byFile.entries()) {
      const pendingFile = await readRepoFile(env, pendingPath);
      const envelopes = pendingFile ? pendingFile.json : [];
      const remaining = [];

      for (const envl of envelopes) {
        if (!wanted.has(envl.id)) { remaining.push(envl); continue; }
        wanted.delete(envl.id);
        const payload = overrides.get(envl.id) || envl.payload;

        try {
          if (envl.type === "resource" || envl.type === "submission") {
            const target = envl.targetFile || resourceTargetFile(payload.location);
            const live = await readLive(target, []);
            if (live.some(r => r.name === payload.name && r.location === payload.location)) {
              failed.push({ id: envl.id, reason: "already-live" });
            } else {
              delete payload.submitterEmail; // defense in depth — repo is public
              live.push({ ...payload, dateAdded: today, origin: stripTimestamps(envl.origin) });
              changes.set(target, pretty(live));
              approved.push(envl.id);

              // Flagged for the newsletter: copy into the drafts store with an
              // AI-drafted (or template) starter paragraph, same atomic commit.
              if (newsletterFlags && newsletterFlags.has(envl.id)) {
                const drafts = await readLive(NEWSLETTER_DRAFTS_PATH, []);
                if (!drafts.some(d => d.sourceId === envl.id)) {
                  if (!paragraphCache.has(envl.id)) {
                    paragraphCache.set(envl.id, await generateParagraph(payload, env));
                  }
                  drafts.push({
                    id: `nld-${today.replace(/-/g, "")}-${envl.id.slice(-8)}`,
                    sourceId: envl.id,
                    type: envl.type,
                    flaggedAt: new Date().toISOString(),
                    payload: { name: payload.name, category: payload.category,
                               location: payload.location, website: payload.website || "",
                               description: payload.description || "" },
                    paragraph: paragraphCache.get(envl.id)
                  });
                  changes.set(NEWSLETTER_DRAFTS_PATH, pretty(drafts));
                }
              }
            }
          } else if (envl.type === "story") {
            const stories = await readLive(STORIES_PATH, []);
            stories.unshift({ ...payload, addedDate: today });
            stories.sort((a, b) => (b.date || "").localeCompare(a.date || ""));
            liveCache.set(STORIES_PATH, stories.slice(0, MAX_STORIES));
            changes.set(STORIES_PATH, pretty(liveCache.get(STORIES_PATH)));
            approved.push(envl.id);
          } else if (envl.type === "spotlight") {
            const spotlights = await readLive(SPOTLIGHTS_PATH, []);
            spotlights.unshift({ ...payload, approvedAt: today });
            approvedSpotlights.push(payload.name);
            spotlights.sort((a, b) => (b.date || "").localeCompare(a.date || ""));
            changes.set(SPOTLIGHTS_PATH, pretty(spotlights));
            approved.push(envl.id);
          } else if (envl.type === "blog") {
            const mdPath = `src/blog/${payload.slug}.md`;
            const exists = await readRepoFile(env, mdPath);
            if (exists) {
              failed.push({ id: envl.id, reason: "slug-exists" });
            } else {
              changes.set(mdPath, renderBlogMarkdown(payload, today));
              approved.push(envl.id);
            }
          } else {
            failed.push({ id: envl.id, reason: `unknown type: ${envl.type}` });
          }
        } catch (err) {
          failed.push({ id: envl.id, reason: err.message });
          remaining.push(envl);
        }
      }

      for (const id of wanted) failed.push({ id, reason: "already-resolved" });
      writePendingChange(changes, pendingPath, remaining);
    }

    // Featured rotation: exactly one featured spotlight — the newest approved
    if (approvedSpotlights.length > 0 && liveCache.has(SPOTLIGHTS_PATH)) {
      const spotlights = liveCache.get(SPOTLIGHTS_PATH);
      let crowned = false;
      for (const s of spotlights) {
        if (!crowned && approvedSpotlights.includes(s.name)) {
          s.featured = true;
          crowned = true;
        } else {
          s.featured = false;
        }
      }
      changes.set(SPOTLIGHTS_PATH, pretty(spotlights));
    }

    return changes;
  }, () => `Approve ${approved.length} item(s) via admin portal (by ${auth.actor})`);

  if (result.error) return result.error;
  return json({ approved, failed, commitSha: result.sha });
}

// ─── Admin: reject ───────────────────────────────────────────────────────────

async function handleReject(body, env, auth) {
  const selection = await resolveSelection(body, env);
  if (selection.error) return selection.error;
  const { byFile } = selection;
  const block = body.block !== false; // default: blocklist scraped items

  const rejected = [], blocked = [], failed = [];
  const result = await commitWithRetry(env, async () => {
    rejected.length = 0; blocked.length = 0; failed.length = 0;
    const changes = new Map();

    const blocklistFile = await readRepoFile(env, BLOCKLIST_PATH);
    const blocklist = blocklistFile ? blocklistFile.json : { urls: [], names: [] };
    let blocklistChanged = false;

    for (const [pendingPath, wanted] of byFile.entries()) {
      const pendingFile = await readRepoFile(env, pendingPath);
      const envelopes = pendingFile ? pendingFile.json : [];
      const remaining = [];

      for (const envl of envelopes) {
        if (!wanted.has(envl.id)) { remaining.push(envl); continue; }
        wanted.delete(envl.id);
        rejected.push(envl.id);

        if (block && envl.origin?.type === "scraper") {
          const p = envl.payload || {};
          const url = p.website || p.sourceUrl || p.url || "";
          const name = p.name || p.title || "";
          if (url && !blocklist.urls.includes(url)) {
            blocklist.urls.push(url); blocklistChanged = true;
          }
          if (name && !blocklist.names.includes(name)) {
            blocklist.names.push(name); blocklistChanged = true;
          }
          if (name) blocked.push(name);
        }
      }

      for (const id of wanted) failed.push({ id, reason: "already-resolved" });
      writePendingChange(changes, pendingPath, remaining);
    }

    if (blocklistChanged) changes.set(BLOCKLIST_PATH, pretty(blocklist));
    return changes;
  }, () => `Reject ${rejected.length} item(s) via admin portal (by ${auth.actor})`);

  if (result.error) return result.error;
  return json({ rejected, blocked, failed, commitSha: result.sha });
}

// ─── Admin: bulk import ──────────────────────────────────────────────────────

async function handleBulkImport(body, env, auth) {
  const items = Array.isArray(body.items) ? body.items : [];
  if (items.length === 0) {
    return json({ error: "items array is required" }, 400);
  }
  if (items.length > 200) {
    return json({ error: "Maximum 200 items per import — split the file" }, 400);
  }

  const detail = (body.detail || "admin-portal").slice(0, 100);
  const today = new Date().toISOString().split("T")[0];
  const errors = [];
  const envelopes = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (!item.name?.trim() || !item.location?.trim() || !item.category || !item.description?.trim()) {
      errors.push({ row: i + 1, reason: "name, location, category, and description are required" });
      continue;
    }
    const payload = {
      name: item.name.trim().slice(0, 200),
      category: Array.isArray(item.category) ? item.category : [String(item.category).trim()],
      location: item.location.trim(),
      area: (item.area || "").trim(),
      description: item.description.trim(),
      phone: (item.phone || "").trim(),
      website: (item.website || "").trim(),
      address: (item.address || "").trim(),
      ageRange: (item.ageRange || "").trim(),
      disabilityTypes: Array.isArray(item.disabilityTypes) ? item.disabilityTypes : [],
      cost: (item.cost || "").trim(),
      tags: Array.isArray(item.tags) ? item.tags : [],
      source: (item.website || "").trim() || `bulk-import:${detail}`,
      lastScraped: today
    };
    envelopes.push({
      id: await pendingId("sub", `bulk|${payload.name}|${payload.location}|${i}`),
      type: "submission",
      status: "pending",
      origin: { type: "bulk-import", detail, submittedAt: new Date().toISOString() },
      targetFile: resourceTargetFile(payload.location),
      payload
    });
  }

  if (envelopes.length === 0) {
    return json({ accepted: 0, errors }, 400);
  }

  if (body.publish === true) {
    // Direct publish: append straight to live target files in one commit
    const published = [];
    const result = await commitWithRetry(env, async () => {
      published.length = 0;
      const changes = new Map();
      const liveCache = new Map();
      for (const envl of envelopes) {
        const target = envl.targetFile;
        if (!liveCache.has(target)) {
          const file = await readRepoFile(env, target);
          liveCache.set(target, file ? file.json : []);
        }
        const live = liveCache.get(target);
        if (live.some(r => r.name === envl.payload.name && r.location === envl.payload.location)) {
          errors.push({ row: envl.payload.name, reason: "already-live" });
          continue;
        }
        live.push({ ...envl.payload, dateAdded: new Date().toISOString().split("T")[0], origin: stripTimestamps(envl.origin) });
        changes.set(target, pretty(live));
        published.push(envl.payload.name);
      }
      return changes;
    }, () => `Bulk import: publish ${published.length} resource(s) via admin portal (by ${auth.actor})`);
    if (result.error) return result.error;
    return json({ published: published.length, errors, commitSha: result.sha });
  }

  // Default: queue for review like any other submission
  for (const envl of envelopes) {
    const err = await appendSubmission(envl, env);
    if (err) return err;
  }
  return json({ queued: envelopes.map(e => e.id), accepted: envelopes.length, errors });
}

// ─── Admin: Brevo contacts proxy ─────────────────────────────────────────────

async function handleEmails(url, env) {
  if (!brevoConfigured(env)) {
    return json({ total: 0, contacts: [], note: "Brevo is not configured yet" });
  }
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "100", 10), 500);
  const offset = parseInt(url.searchParams.get("offset") || "0", 10);

  const res = await fetch(
    `https://api.brevo.com/v3/contacts?limit=${limit}&offset=${offset}&sort=desc`,
    { headers: { "api-key": env.BREVO_API_KEY, Accept: "application/json" } }
  );
  if (!res.ok) {
    return json({ error: "Brevo request failed", detail: await res.text() }, 502);
  }
  const data = await res.json();
  const listId = parseInt(env.BREVO_LIST_ID || "0", 10);
  const contacts = (data.contacts || []).map(c => ({
    email: c.email,
    dateAdded: c.attributes?.DATE_ADDED || (c.createdAt || "").split("T")[0],
    source: c.attributes?.SOURCE || "",
    optIn: c.emailBlacklisted ? "unsubscribed"
      : (c.listIds || []).includes(listId) ? "confirmed"
      : c.attributes?.OPT_IN_STATUS || "unknown"
  }));
  return json({ total: data.count || contacts.length, contacts });
}

// ─── Admin: newsletter drafts ────────────────────────────────────────────────

async function handleNewsletterDraftsGet(env) {
  const file = await readRepoFile(env, NEWSLETTER_DRAFTS_PATH);
  return json({ drafts: file ? file.json : [] });
}

/** POST {id, paragraph} updates a draft's paragraph; {id, remove:true} deletes it. */
async function handleNewsletterDraftsPost(body, env, auth) {
  const id = (body.id || "").trim();
  if (!id) return json({ error: "id is required" }, 400);

  let found = false;
  const result = await commitWithRetry(env, async () => {
    const changes = new Map();
    const file = await readRepoFile(env, NEWSLETTER_DRAFTS_PATH);
    const drafts = file ? file.json : [];
    const idx = drafts.findIndex(d => d.id === id);
    found = idx !== -1;
    if (!found) return changes; // empty = nothing to commit

    if (body.remove === true) {
      drafts.splice(idx, 1);
    } else {
      drafts[idx].paragraph = String(body.paragraph || "").slice(0, 4000);
      drafts[idx].editedAt = new Date().toISOString();
    }
    changes.set(NEWSLETTER_DRAFTS_PATH, pretty(drafts));
    return changes;
  }, () => `${body.remove ? "Remove" : "Edit"} newsletter draft via admin portal (by ${auth.actor})`);

  if (result.error) return result.error;
  if (!found) return json({ error: "Draft not found" }, 404);
  return json({ success: true, commitSha: result.sha });
}

/** Starter paragraph for a newsletter-flagged resource: what it is, when to use
 *  it, why it's interesting. Claude Haiku when ANTHROPIC_API_KEY is set; a
 *  serviceable template otherwise. Never throws. */
async function generateParagraph(payload, env) {
  const template = () => {
    const cat = (Array.isArray(payload.category) && payload.category[0]) || "disability services";
    const where = !payload.location || payload.location === "National" ? "nationwide" : `in ${payload.location}`;
    const desc = payload.description ? ` ${payload.description}` : "";
    return `${payload.name} offers ${cat.replace(/-/g, " ")} ${where}.${desc} Learn more at ${payload.website || "their website"}.`;
  };

  if (!env.ANTHROPIC_API_KEY) return template();
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json"
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 250,
        messages: [{
          role: "user",
          content: `Write a warm, plain-language 2-3 sentence newsletter blurb for caregivers of individuals with disabilities about this resource. Cover: what it is, when a family might use it, and why it's worth knowing about. No headings, no markdown, no salesy tone.\n\nName: ${payload.name}\nCategory: ${(payload.category || []).join(", ")}\nLocation: ${payload.location || ""}\nDescription: ${payload.description || "(none provided)"}\nWebsite: ${payload.website || "(none)"}`
        }]
      })
    });
    if (!res.ok) return template();
    const data = await res.json();
    const text = data.content && data.content[0] && data.content[0].text;
    return (text || "").trim() || template();
  } catch {
    return template();
  }
}

// ─── Brevo helpers ───────────────────────────────────────────────────────────

function brevoConfigured(env) {
  return Boolean(env.BREVO_API_KEY && env.BREVO_LIST_ID);
}

function brevoHeaders(env) {
  return {
    "api-key": env.BREVO_API_KEY,
    "Content-Type": "application/json",
    Accept: "application/json"
  };
}

async function brevoContactExists(email, env) {
  const res = await fetch(
    `https://api.brevo.com/v3/contacts/${encodeURIComponent(email)}`,
    { headers: brevoHeaders(env) }
  );
  return res.status === 200;
}

/** Thank-you for resource submitters: transactional email, sent ONLY when the
 *  email is new to us. Contact is stored as transactional_only — list
 *  membership requires the double-opt-in linked from the email's CTA. */
async function brevoThankSubmitter(email, env) {
  if (!brevoConfigured(env) || !env.BREVO_THANKYOU_TEMPLATE_ID) return;
  if (await brevoContactExists(email, env)) return; // not new — no email

  const today = new Date().toISOString().split("T")[0];
  await fetch("https://api.brevo.com/v3/contacts", {
    method: "POST",
    headers: brevoHeaders(env),
    body: JSON.stringify({
      email,
      attributes: { SOURCE: "resource-submission", DATE_ADDED: today, OPT_IN_STATUS: "transactional_only" },
      updateEnabled: true
    })
  });
  await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: brevoHeaders(env),
    body: JSON.stringify({
      to: [{ email }],
      templateId: parseInt(env.BREVO_THANKYOU_TEMPLATE_ID, 10)
    })
  });
}

/** Newsletter signups: Brevo-native double-opt-in. The contact is only added
 *  to the list when they click the confirmation link Brevo sends. */
async function brevoDoubleOptIn(email, source, env) {
  if (!env.BREVO_DOI_TEMPLATE_ID) return;
  const today = new Date().toISOString().split("T")[0];
  const res = await fetch("https://api.brevo.com/v3/contacts/doubleOptinConfirmation", {
    method: "POST",
    headers: brevoHeaders(env),
    body: JSON.stringify({
      email,
      includeListIds: [parseInt(env.BREVO_LIST_ID, 10)],
      templateId: parseInt(env.BREVO_DOI_TEMPLATE_ID, 10),
      redirectionUrl: "https://thefullestproject.org/subscribed/",
      attributes: { SOURCE: source, DATE_ADDED: today, OPT_IN_STATUS: "pending_doi" }
    })
  });
  if (!res.ok && res.status !== 204) {
    throw new Error(`Brevo DOI ${res.status}: ${await res.text()}`);
  }
}

// ─── Selection (shared by approve/reject) ────────────────────────────────────

/** Normalize {items:[{id, file, payload?, newsletterFlag?}]} or {all:true, type?}
 *  into a Map<pendingFilePath, Set<id>> plus per-id payload overrides and the
 *  set of ids flagged for the newsletter. */
async function resolveSelection(body, env) {
  const byFile = new Map();
  const overrides = new Map();
  const newsletterFlags = new Set();

  if (body.all === true) {
    const pendingRes = await handlePending(env);
    const { items } = await pendingRes.json();
    for (const item of items) {
      if (body.type && item.type !== body.type) continue;
      if (!byFile.has(item.file)) byFile.set(item.file, new Set());
      byFile.get(item.file).add(item.id);
    }
  } else {
    const items = Array.isArray(body.items) ? body.items : [];
    if (items.length === 0) {
      return { error: json({ error: "items array (or all:true) is required" }, 400) };
    }
    for (const item of items) {
      if (!item.id || !item.file || !item.file.startsWith("pending/")) {
        return { error: json({ error: `Each item needs id and a pending/ file path` }, 400) };
      }
      if (!byFile.has(item.file)) byFile.set(item.file, new Set());
      byFile.get(item.file).add(item.id);
      if (item.payload && typeof item.payload === "object") {
        overrides.set(item.id, item.payload);
      }
      if (item.newsletterFlag === true) {
        newsletterFlags.add(item.id);
      }
    }
  }

  if (byFile.size === 0) {
    return { error: json({ error: "Nothing selected" }, 400) };
  }
  return { byFile, overrides, newsletterFlags };
}

function writePendingChange(changes, pendingPath, remaining) {
  if (remaining.length === 0 && pendingPath !== SUBMISSIONS_PATH) {
    changes.set(pendingPath, null); // delete emptied scraped batch file
  } else {
    changes.set(pendingPath, pretty(remaining));
  }
}

function stripTimestamps(origin) {
  return { type: origin?.type || "unknown", detail: origin?.detail || "" };
}

// ─── Git data API: one atomic commit, conflict-safe ──────────────────────────

/** buildChanges() re-reads every file it touches and returns
 *  Map<path, content|null>. On a concurrent-commit conflict the whole build
 *  is re-run against the new head, so mutations re-apply cleanly. */
async function commitWithRetry(env, buildChanges, message, retries = 3) {
  for (let attempt = 0; attempt < retries; attempt++) {
    const changes = await buildChanges();
    if (changes.size === 0) {
      return { sha: null }; // nothing to commit (e.g. everything already-resolved)
    }
    if (changes.size > MAX_CHANGED_FILES) {
      return { error: json({ error: `Too many files in one batch (${changes.size} > ${MAX_CHANGED_FILES}) — split the selection` }, 400) };
    }

    const refRes = await fetch(
      `https://api.github.com/repos/${env.GITHUB_REPO}/git/ref/heads/main`,
      { headers: ghHeaders(env) }
    );
    if (!refRes.ok) {
      return { error: json({ error: "Failed to read branch ref", detail: await refRes.text() }, 502) };
    }
    const headSha = (await refRes.json()).object.sha;

    const commitRes = await fetch(
      `https://api.github.com/repos/${env.GITHUB_REPO}/git/commits/${headSha}`,
      { headers: ghHeaders(env) }
    );
    if (!commitRes.ok) {
      return { error: json({ error: "Failed to read head commit" }, 502) };
    }
    const baseTree = (await commitRes.json()).tree.sha;

    const tree = [...changes.entries()].map(([path, content]) =>
      content === null
        ? { path, mode: "100644", type: "blob", sha: null }
        : { path, mode: "100644", type: "blob", content }
    );

    const treeRes = await fetch(
      `https://api.github.com/repos/${env.GITHUB_REPO}/git/trees`,
      { method: "POST", headers: ghHeaders(env), body: JSON.stringify({ base_tree: baseTree, tree }) }
    );
    if (!treeRes.ok) {
      return { error: json({ error: "Failed to build git tree", detail: await treeRes.text() }, 502) };
    }
    const newTree = (await treeRes.json()).sha;

    const newCommitRes = await fetch(
      `https://api.github.com/repos/${env.GITHUB_REPO}/git/commits`,
      {
        method: "POST", headers: ghHeaders(env),
        body: JSON.stringify({
          message: typeof message === "function" ? message() : message,
          tree: newTree,
          parents: [headSha],
          author: { name: "TFP Admin API", email: "worker@thefullestproject.org" }
        })
      }
    );
    if (!newCommitRes.ok) {
      return { error: json({ error: "Failed to create commit" }, 502) };
    }
    const newSha = (await newCommitRes.json()).sha;

    const patchRes = await fetch(
      `https://api.github.com/repos/${env.GITHUB_REPO}/git/refs/heads/main`,
      { method: "PATCH", headers: ghHeaders(env), body: JSON.stringify({ sha: newSha }) }
    );
    if (patchRes.ok) {
      return { sha: newSha };
    }
    if (patchRes.status !== 422 && patchRes.status !== 409) {
      return { error: json({ error: "Failed to update branch", detail: await patchRes.text() }, 502) };
    }
    // Non-fast-forward: someone committed mid-flight. Loop — buildChanges()
    // re-reads everything against the new head and re-applies.
  }
  return { error: json({ error: "Could not commit after retries — the repository is busy, try again" }, 409) };
}

// ─── GitHub content helpers ──────────────────────────────────────────────────

function ghHeaders(env) {
  return {
    Authorization: `Bearer ${env.GITHUB_TOKEN}`,
    Accept: "application/vnd.github+json",
    "User-Agent": "tfp-admin-api",
    "Content-Type": "application/json"
  };
}

async function readRepoFile(env, path) {
  const res = await fetch(
    `https://api.github.com/repos/${env.GITHUB_REPO}/contents/${path}`,
    { headers: ghHeaders(env) }
  );
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GitHub read failed for ${path}: ${res.status}`);
  const data = await res.json();
  const text = b64decode(data.content);
  return { json: JSON.parse(text), sha: data.sha, text };
}

async function listRepoDir(env, path) {
  const res = await fetch(
    `https://api.github.com/repos/${env.GITHUB_REPO}/contents/${path}`,
    { headers: ghHeaders(env) }
  );
  if (res.status === 404) return [];
  if (!res.ok) throw new Error(`GitHub list failed for ${path}: ${res.status}`);
  return (await res.json()).map(f => ({ name: f.name, path: f.path }));
}

// ─── Content rendering ───────────────────────────────────────────────────────

/** Canonical blog post generator — ported from scrapers/sources/blog_content.py
 *  create_blog_post(); keep the two in sync if the template changes. */
function renderBlogMarkdown(article, approvedAt) {
  const titleEscaped = article.title.replace(/"/g, '\\"');
  const categorySlug = article.category.toLowerCase().replace(/ /g, "-");
  return `---
layout: layouts/post.njk
title: "${titleEscaped}"
date: ${article.date}
author: "via ${article.source}"
category: "${article.category}"
excerpt: "Curated from ${article.source} — read the original article for the full story."
sourceUrl: "${article.url}"
autoGenerated: true
approvedAt: ${approvedAt}
tags:
  - curated
  - ${categorySlug}
---

*This article was curated from [${article.source}](${article.url}). Visit the original source for the full story.*

## ${article.title}

This article from ${article.source} covers topics relevant to the disability community, including ${article.category.toLowerCase()}. We've highlighted it here because we believe it offers valuable information for caregivers and families.

[Read the full article at ${article.source}](${article.url})

---

*Know of a great article or resource we should feature? [Submit it here](/submit-resource/) or use our [Quick Submit tool](/quick-submit/).*
`;
}

function resourceTargetFile(location) {
  if (!location || location === "National") return "src/_data/resources/national.json";
  // Region names route to their state file (regions live in the `area` field)
  if (location === "Northern Virginia") return "src/_data/resources/states/VA.json";
  if (location === "Portland" || location === "Portland, OR") return "src/_data/resources/states/OR.json";
  const code = STATE_CODES[location];
  return code ? `src/_data/resources/states/${code}.json` : "src/_data/resources/national.json";
}

// ─── Small utilities ─────────────────────────────────────────────────────────

async function pendingId(prefix, keyString) {
  const today = new Date().toISOString().split("T")[0].replace(/-/g, "");
  const hash = Array.from(new Uint8Array(
    await crypto.subtle.digest("SHA-256", new TextEncoder().encode(keyString))
  )).map(b => b.toString(16).padStart(2, "0")).join("").slice(0, 8);
  return `${prefix}-${today}-${hash}`;
}

function pretty(obj) {
  return JSON.stringify(obj, null, 2);
}

function b64encode(str) {
  const bytes = new TextEncoder().encode(str);
  let binary = "";
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
  }
  return btoa(binary);
}

function b64decode(b64) {
  const bytes = Uint8Array.from(atob(b64.replace(/\n/g, "")), c => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}

function cors(env, response) {
  const origin = env.ALLOWED_ORIGIN || "https://thefullestproject.org";
  const headers = new Headers(response.headers);
  headers.set("Access-Control-Allow-Origin", origin);
  headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Admin-Key");
  return new Response(response.body, { status: response.status, headers });
}
