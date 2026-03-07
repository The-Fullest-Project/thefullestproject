/**
 * Cloudflare Worker: Gig Auto-Publish Middleware
 *
 * Handles gig submissions (publish) and gig management (close/remove).
 *
 * Environment variables (set in Cloudflare dashboard):
 *   GITHUB_TOKEN       — GitHub Personal Access Token (repo scope)
 *   GITHUB_REPO        — "PMBerrigan/thefullestproject"
 *   FORMSPREE_ID       — Formspree form ID for gig submissions (xojkvvlo)
 *   ALLOWED_ORIGIN     — "https://thefullestproject.org"
 *   ADMIN_KEY          — Secret key for admin actions (close any gig)
 */

const GIGS_PATH = "src/_data/gigs.json";

export default {
  async fetch(request, env) {
    // CORS preflight
    if (request.method === "OPTIONS") {
      return corsResponse(env, new Response(null, { status: 204 }));
    }

    if (request.method !== "POST") {
      return corsResponse(env, jsonResponse({ error: "Method not allowed" }, 405));
    }

    try {
      const formData = await request.formData();
      const data = Object.fromEntries(formData.entries());
      const action = data.action || "publish";

      if (action === "close") {
        return corsResponse(env, await handleClose(data, env));
      }

      return corsResponse(env, await handlePublish(data, env));

    } catch (err) {
      return corsResponse(env, jsonResponse({
        error: "Internal error",
        detail: err.message
      }, 500));
    }
  }
};

async function handlePublish(data, env) {
  // Validate required fields
  const required = ["title", "type", "category", "description", "location",
                    "compensation", "posterFirstName", "posterEmail"];
  const missing = required.filter(f => !data[f]?.trim());
  if (missing.length > 0) {
    return jsonResponse({
      error: `Missing required fields: ${missing.join(", ")}`
    }, 400);
  }

  // Build gig object
  const now = new Date();
  const today = now.toISOString().split("T")[0];
  const expires = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000)
    .toISOString().split("T")[0];
  const hash = Array.from(new Uint8Array(
    await crypto.subtle.digest("SHA-256", new TextEncoder().encode(now.toISOString()))
  )).map(b => b.toString(16).padStart(2, "0")).join("").slice(0, 4);

  const gig = {
    id: `gig-${today.replace(/-/g, "")}-${hash}`,
    title: data.title.trim().slice(0, 120),
    type: data.type,
    category: data.category,
    description: data.description.trim(),
    location: data.location,
    remote: data.remote === "true",
    compensation: data.compensation,
    rate: (data.rate || "").trim(),
    timeline: (data.timeline || "").trim(),
    postedDate: today,
    expiresDate: expires,
    status: "open",
    posterFirstName: data.posterFirstName.trim(),
    posterEmail: data.posterEmail.trim(),
    skills: (data.skills || "").split(",").map(s => s.trim()).filter(Boolean),
    tags: [data.category]
  };

  // Fetch current gigs.json from GitHub
  const { gigs, sha, error } = await fetchGigs(env);
  if (error) return error;

  // Append new gig
  gigs.push(gig);

  // Commit updated gigs.json
  const commitErr = await commitGigs(gigs, sha, `Auto-publish gig: ${gig.title}`, env);
  if (commitErr) return commitErr;

  // Forward to Formspree for email notification (fire and forget)
  const formspreeBody = new FormData();
  for (const [key, value] of Object.entries(data)) {
    formspreeBody.append(key, value);
  }
  formspreeBody.append("_gigId", gig.id);

  fetch(`https://formspree.io/f/${env.FORMSPREE_ID}`, {
    method: "POST",
    body: formspreeBody,
    headers: { Accept: "application/json" }
  }).catch(() => {});

  return jsonResponse({
    success: true,
    gigId: gig.id,
    message: "Your gig has been published! It will be live on the site within a few minutes."
  }, 201);
}

async function handleClose(data, env) {
  const gigId = (data.gigId || "").trim();
  const email = (data.email || "").trim();
  const adminKey = (data.adminKey || "").trim();

  if (!gigId) {
    return jsonResponse({ error: "Gig ID is required" }, 400);
  }

  const isAdmin = adminKey && env.ADMIN_KEY && adminKey === env.ADMIN_KEY;

  if (!isAdmin && !email) {
    return jsonResponse({ error: "Email is required to close your gig" }, 400);
  }

  // Fetch current gigs.json
  const { gigs, sha, error } = await fetchGigs(env);
  if (error) return error;

  const gigIndex = gigs.findIndex(g => g.id === gigId);
  if (gigIndex === -1) {
    return jsonResponse({ error: "Gig not found" }, 404);
  }

  const gig = gigs[gigIndex];

  // Verify ownership: poster email must match (unless admin)
  if (!isAdmin && gig.posterEmail.toLowerCase() !== email.toLowerCase()) {
    return jsonResponse({ error: "Email does not match the gig poster's email" }, 403);
  }

  if (gig.status === "closed") {
    return jsonResponse({ error: "This gig is already closed" }, 400);
  }

  // Close the gig
  gigs[gigIndex].status = "closed";

  const commitErr = await commitGigs(gigs, sha, `Close gig: ${gig.title}`, env);
  if (commitErr) return commitErr;

  return jsonResponse({
    success: true,
    message: "Your gig has been closed and will be removed from the board within a few minutes."
  });
}

async function fetchGigs(env) {
  const fileRes = await fetch(
    `https://api.github.com/repos/${env.GITHUB_REPO}/contents/${GIGS_PATH}`,
    { headers: githubHeaders(env) }
  );

  if (!fileRes.ok) {
    const errText = await fileRes.text();
    return {
      gigs: null, sha: null,
      error: jsonResponse({ error: "Failed to read gigs.json from GitHub", detail: errText }, 502)
    };
  }

  const fileData = await fileRes.json();
  const currentContent = atob(fileData.content.replace(/\n/g, ""));
  return { gigs: JSON.parse(currentContent), sha: fileData.sha, error: null };
}

async function commitGigs(gigs, sha, message, env) {
  const commitRes = await fetch(
    `https://api.github.com/repos/${env.GITHUB_REPO}/contents/${GIGS_PATH}`,
    {
      method: "PUT",
      headers: githubHeaders(env),
      body: JSON.stringify({
        message,
        content: btoa(unescape(encodeURIComponent(JSON.stringify(gigs, null, 2)))),
        sha,
        committer: {
          name: "Cloudflare Worker",
          email: "worker@thefullestproject.org"
        }
      })
    }
  );

  if (!commitRes.ok) {
    const errText = await commitRes.text();
    return jsonResponse({ error: "Failed to commit to GitHub", detail: errText }, 502);
  }

  return null;
}

function githubHeaders(env) {
  return {
    Authorization: `Bearer ${env.GITHUB_TOKEN}`,
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "thefullestproject-worker",
    "Content-Type": "application/json"
  };
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}

function corsResponse(env, response) {
  const origin = env.ALLOWED_ORIGIN || "https://thefullestproject.org";
  const headers = new Headers(response.headers);
  headers.set("Access-Control-Allow-Origin", origin);
  headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type");
  return new Response(response.body, {
    status: response.status,
    headers
  });
}
