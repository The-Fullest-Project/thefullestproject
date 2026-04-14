/**
 * Cloudflare Worker: Decap CMS OAuth Proxy for GitHub
 *
 * Implements the server-side half of the Decap CMS GitHub OAuth flow so the
 * CMS at https://thefullestproject.org/admin/ can authenticate users against
 * GitHub without exposing the OAuth App client secret to the browser.
 *
 * Flow:
 *   1. Decap opens popup at {WORKER_URL}/auth?provider=github&scope=repo
 *   2. Worker redirects to github.com/login/oauth/authorize with state
 *   3. User authorizes on GitHub
 *   4. GitHub redirects to {WORKER_URL}/callback?code=...&state=...
 *   5. Worker exchanges code for access token server-side (client_secret stays here)
 *   6. Worker returns HTML that posts the token to window.opener and closes
 *
 * Environment variables (set via `wrangler secret put` or dashboard):
 *   GITHUB_CLIENT_ID     — OAuth App client id (public)
 *   GITHUB_CLIENT_SECRET — OAuth App client secret (SECRET)
 *   ALLOWED_ORIGIN       — "https://thefullestproject.org" (CMS origin)
 */

const AUTHORIZE_URL = "https://github.com/login/oauth/authorize";
const TOKEN_URL = "https://github.com/login/oauth/access_token";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/auth" || url.pathname === "/auth/") {
      return handleAuth(url, env);
    }
    if (url.pathname === "/callback" || url.pathname === "/callback/") {
      return handleCallback(request, url, env);
    }
    return new Response("Decap OAuth proxy. Endpoints: /auth, /callback", {
      status: 200,
      headers: { "content-type": "text/plain" },
    });
  },
};

function handleAuth(url, env) {
  const scope = url.searchParams.get("scope") || "repo";
  const state = crypto.randomUUID();

  const redirect = new URL(AUTHORIZE_URL);
  redirect.searchParams.set("client_id", env.GITHUB_CLIENT_ID);
  redirect.searchParams.set("scope", scope);
  redirect.searchParams.set("state", state);

  return new Response(null, {
    status: 302,
    headers: {
      location: redirect.toString(),
      "set-cookie": `decap_oauth_state=${state}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`,
    },
  });
}

async function handleCallback(request, url, env) {
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const cookieState = getCookie(request, "decap_oauth_state");

  if (!code || !state || state !== cookieState) {
    return renderResult(env, { error: "Invalid OAuth state or missing code" });
  }

  let tokenData;
  try {
    const resp = await fetch(TOKEN_URL, {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        client_id: env.GITHUB_CLIENT_ID,
        client_secret: env.GITHUB_CLIENT_SECRET,
        code,
      }),
    });
    tokenData = await resp.json();
  } catch (err) {
    return renderResult(env, { error: `Token exchange failed: ${err.message}` });
  }

  if (tokenData.error || !tokenData.access_token) {
    return renderResult(env, {
      error: tokenData.error_description || tokenData.error || "No access_token in response",
    });
  }

  return renderResult(env, {
    token: tokenData.access_token,
    provider: "github",
  });
}

function getCookie(request, name) {
  const header = request.headers.get("cookie") || "";
  const match = header.match(new RegExp("(?:^|; )" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[1]) : null;
}

function renderResult(env, payload) {
  const isSuccess = !!payload.token;
  const message = isSuccess
    ? `authorization:github:success:${JSON.stringify({ token: payload.token, provider: payload.provider })}`
    : `authorization:github:error:${JSON.stringify({ message: payload.error })}`;

  const allowedOrigin = env.ALLOWED_ORIGIN || "*";

  const html = `<!doctype html>
<html>
<head><meta charset="utf-8"><title>Authorizing…</title></head>
<body>
<p>${isSuccess ? "Authorizing…" : "Authorization failed: " + escapeHtml(payload.error || "")}</p>
<script>
(function() {
  var message = ${JSON.stringify(message)};
  var allowed = ${JSON.stringify(allowedOrigin)};
  if (!window.opener) return;
  function sendToken() {
    window.opener.postMessage(message, allowed);
  }
  window.addEventListener("message", function(e) {
    if (e.data === "authorizing:github") {
      sendToken();
    }
  });
  // Step 1: announce readiness to the opener
  window.opener.postMessage("authorizing:github", allowed);
  // Fallback: if the opener ack never arrives, send anyway after a short delay
  setTimeout(sendToken, 1500);
  setTimeout(function(){ window.close(); }, 3000);
})();
</script>
</body>
</html>`;

  return new Response(html, {
    status: isSuccess ? 200 : 400,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
