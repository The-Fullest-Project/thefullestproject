// @ts-check
// AI-assisted search on /resources/ and the homepage hand-off. The worker and
// the Turnstile bot check are faked with page.route, so no AI call is made and
// nothing is spent.
const { test, expect } = require("@playwright/test");

// The site's pass-through service worker (/sw.js) would make requests from the
// worker's context, where page.route can't see them.
test.use({ serviceWorkers: "block" });

const FAKE_TURNSTILE = `
  window.turnstile = {
    render: function (el, opts) { window.__ts = opts; return "w1"; },
    execute: function () { setTimeout(function () { window.__ts.callback("fake-token"); }, 10); },
    reset: function () {}
  };
  window.tfpTurnstileReady && window.tfpTurnstileReady();
`;

async function fakeServices(page, reply) {
  const calls = [];
  // URL predicates, not globs: the Turnstile script URL carries a query string
  // that a glob pattern lets slip through to the real Cloudflare script.
  await page.route(url => url.hostname === "challenges.cloudflare.com", route =>
    route.fulfill({ contentType: "application/javascript", body: FAKE_TURNSTILE }));
  const worker = path => url => url.hostname === "tfp-admin-api.thefullestproject.workers.dev" && url.pathname === path;
  await page.route(worker("/search"), async route => {
    calls.push(JSON.parse(route.request().postData() || "{}"));
    await route.fulfill({
      contentType: "application/json",
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify(typeof reply === "function" ? reply() : reply)
    });
  });
  await page.route(worker("/search/outcome"), route =>
    route.fulfill({ status: 204, headers: { "Access-Control-Allow-Origin": "*" } }));
  return calls;
}

test("AI filters show real listings, in-state first, with links to the full pages", async ({ page }) => {
  const calls = await fakeServices(page, {
    mode: "ai", categories: ["respite"], state: "Virginia", place: "Fairfax", crisis: false, offTopic: false, remaining: 14
  });
  await page.goto("/resources/");
  await page.fill("#ai-search-input", "respite care for my son in Fairfax");
  await page.click("#ai-search-btn");

  const results = page.locator("#ai-search-results");
  await expect(results).toBeVisible();
  await expect(results.locator("#ai-search-summary")).toHaveText(/Showing Respite Care in Virginia, near Fairfax\./);
  const more = results.getByRole("link", { name: /See all Respite Care in Virginia/ });
  await expect(more).toHaveAttribute("href", "/resources/respite/?state=Virginia");
  await expect(results.locator("li.card li").first()).toBeVisible();
  await expect(page.locator("#directory-categories")).toBeHidden();

  expect(calls).toHaveLength(1);
  expect(calls[0]).toEqual({ q: "respite care for my son in Fairfax", token: "fake-token" });
  expect(page.url()).not.toContain("Fairfax");

  await page.getByRole("button", { name: /Clear search/ }).click();
  await expect(page.locator("#directory-categories")).toBeVisible();
  await expect(results).toBeHidden();
});

test("crisis wording shows 911 and 988", async ({ page }) => {
  await fakeServices(page, { mode: "ai", categories: [], state: null, place: "", crisis: true, offTopic: false });
  await page.goto("/resources/");
  await page.fill("#ai-search-input", "my daughter is talking about hurting herself");
  await page.click("#ai-search-btn");
  const alert = page.getByRole("alert");
  await expect(alert).toContainText("call 911");
  await expect(alert.getByRole("link", { name: "988" })).toHaveAttribute("href", "tel:988");
});

test("the local word list shows 988 even when AI is unavailable", async ({ page }) => {
  await fakeServices(page, { mode: "fallback", reason: "budget" });
  await page.goto("/resources/");
  await page.fill("#ai-search-input", "thinking about suicide, need help in Oregon");
  await page.click("#ai-search-btn");
  await expect(page.getByRole("alert")).toContainText("988");
});

test("when the daily limit is reached, keyword search takes over", async ({ page }) => {
  await fakeServices(page, { mode: "fallback", reason: "limit", limit: 15 });
  await page.goto("/resources/");
  await page.fill("#ai-search-input", "summer camps in Virginia");
  await page.click("#ai-search-btn");
  const results = page.locator("#ai-search-results");
  await expect(results).toContainText("used today's AI searches");
  await expect(results.locator("#ai-search-summary")).toContainText("in Virginia");
  await expect(results.getByRole("link", { name: /See all .*Camps.* in Virginia/ })).toBeVisible();
});

test("off-topic searches get a gentle nudge, not results", async ({ page }) => {
  await fakeServices(page, { mode: "ai", categories: [], state: null, place: "", crisis: false, offTopic: true });
  await page.goto("/resources/");
  await page.fill("#ai-search-input", "best pizza in town");
  await page.click("#ai-search-btn");
  await expect(page.locator("#ai-search-results")).toContainText("This search finds disability resources");
  await expect(page.locator("#directory-categories")).toBeVisible();
});

test("the homepage box hands its text to the Resources page without putting it in the address", async ({ page }) => {
  const calls = await fakeServices(page, {
    mode: "ai", categories: ["respite"], state: "Oregon", place: "Portland", crisis: false, offTopic: false
  });
  await page.goto("/");
  const box = page.locator("#ai-search-home-input");
  await box.scrollIntoViewIfNeeded();
  await box.fill("respite care for my teenage son in Portland");
  await page.locator("#ai-search-home button[type=submit]").click();
  await page.waitForURL("**/resources/");
  await expect(page.locator("#ai-search-summary")).toContainText("Respite Care in Oregon");
  expect(calls[0].q).toBe("respite care for my teenage son in Portland");
  expect(page.url()).not.toContain("Portland");
  expect(page.url()).not.toContain("#ask");
});
