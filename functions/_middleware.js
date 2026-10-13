/**
 * Password gate for the preview site.
 *
 * The preview is a full copy of thefullestproject.org on a public URL, so it
 * needs to be closed to everyone outside the team. Cloudflare Access would be
 * the usual answer, but it can only protect hostnames inside a Cloudflare zone
 * and thefullestproject.org's DNS lives at GoDaddy — so the gate lives here
 * instead, which works on any domain.
 *
 * One shared password, entered once per device, remembered for 30 days. The
 * cookie holds an HMAC of the password rather than the password itself, so a
 * stolen cookie cannot be read back into the password, and changing
 * PREVIEW_PASSWORD invalidates every existing cookie at once.
 *
 * Set the password as a Pages environment variable (encrypted):
 *   Pages -> tfp-preview -> Settings -> Variables -> PREVIEW_PASSWORD
 * With no password set the gate stays OPEN rather than locking everyone out of
 * a site nobody can fix — the banner on the page says so.
 */

const COOKIE = "tfp_preview";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export async function onRequest(context) {
  const { request, env, next } = context;
  const password = env.PREVIEW_PASSWORD;

  // No password configured: serve the site rather than bricking it.
  if (!password) return addNoIndex(await next());

  const url = new URL(request.url);
  const expected = await sign(password);

  if (request.method === "POST" && url.pathname === "/__preview-login") {
    const form = await request.formData();
    const submitted = String(form.get("password") || "");
    const target = safeRedirect(String(form.get("next") || "/"));

    if (submitted !== password) {
      return loginPage(target, true);
    }
    return new Response(null, {
      status: 303,
      headers: {
        Location: target,
        "Set-Cookie": `${COOKIE}=${expected}; Path=/; Max-Age=${MAX_AGE}; HttpOnly; Secure; SameSite=Lax`
      }
    });
  }

  if (cookieValue(request, COOKIE) === expected) {
    return addNoIndex(await next());
  }

  // Let crawlers read robots.txt and get told to go away, rather than 401.
  if (url.pathname === "/robots.txt") return addNoIndex(await next());

  return loginPage(url.pathname + url.search, false);
}

/** HMAC of the password, so the cookie never carries the password itself. */
async function sign(password) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const mac = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(COOKIE));
  return [...new Uint8Array(mac)].map(b => b.toString(16).padStart(2, "0")).join("");
}

function cookieValue(request, name) {
  const header = request.headers.get("Cookie") || "";
  for (const part of header.split(";")) {
    const [k, ...rest] = part.trim().split("=");
    if (k === name) return rest.join("=");
  }
  return "";
}

/** Only ever bounce back to a path on this site, never an external URL. */
function safeRedirect(target) {
  return target.startsWith("/") && !target.startsWith("//") ? target : "/";
}

/** The preview must never be indexed, however someone reaches it. */
async function addNoIndex(response) {
  const out = new Response(response.body, response);
  out.headers.set("X-Robots-Tag", "noindex, nofollow");
  return out;
}

function loginPage(next, failed) {
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>The Fullest Project — Preview</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Nunito:wght@700;800&family=Open+Sans:wght@400;600&display=swap">
<style>
  :root { color-scheme: light; }
  * { box-sizing: border-box; }
  body {
    margin: 0; min-height: 100vh; display: grid; place-items: center;
    padding: 24px; background: #F6EFDC; color: #2A2620;
    font-family: "Open Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  }
  .box {
    width: 100%; max-width: 420px; background: #fff; border-radius: 16px;
    padding: 32px 28px; box-shadow: 0 2px 4px rgba(42,38,32,.06), 0 12px 32px rgba(42,38,32,.1);
  }
  h1 {
    font-family: "Nunito", system-ui, sans-serif; font-size: 1.5rem; font-weight: 800;
    color: #3A668C; margin: 0 0 8px;
  }
  p { margin: 0 0 20px; color: #5C564C; font-size: .95rem; line-height: 1.6; }
  label { display: block; font-weight: 600; font-size: .85rem; margin-bottom: 6px; }
  input {
    width: 100%; padding: 12px 14px; font-size: 1rem; font-family: inherit;
    border: 2px solid #E4DCC9; border-radius: 10px; background: #fff; color: inherit;
  }
  input:focus { outline: 3px solid #FDB92E; outline-offset: 1px; border-color: #3A668C; }
  button {
    margin-top: 16px; width: 100%; padding: 12px 16px; font-size: 1rem;
    font-family: "Nunito", system-ui, sans-serif; font-weight: 700;
    color: #fff; background: #3A668C; border: 0; border-radius: 999px; cursor: pointer;
  }
  button:hover { filter: brightness(1.08); }
  .err {
    margin: 0 0 16px; padding: 10px 12px; border-radius: 8px;
    background: #F7E7E1; color: #A6482B; font-size: .9rem;
  }
  .foot { margin: 20px 0 0; font-size: .8rem; color: #8C8477; }
</style>
</head>
<body>
  <main class="box">
    <h1>The Fullest Project — Preview</h1>
    <p>This is the test copy of the site, where we try changes before they go live. It's not the real site and it isn't public.</p>
    ${failed ? '<p class="err">That password didn\'t match. Try again.</p>' : ""}
    <form method="POST" action="/__preview-login">
      <input type="hidden" name="next" value="${escapeHtml(next)}">
      <label for="password">Team password</label>
      <input id="password" name="password" type="password" autocomplete="current-password"
             autofocus required>
      <button type="submit">Open the preview</button>
    </form>
    <p class="foot">You'll stay signed in on this device for 30 days.</p>
  </main>
</body>
</html>`;

  return new Response(html, {
    status: failed ? 401 : 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex, nofollow"
    }
  });
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );
}
