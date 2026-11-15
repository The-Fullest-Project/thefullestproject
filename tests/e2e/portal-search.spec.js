// @ts-check
// Review portal Search tab: counts and the "Try test questions" box, in the
// portal's mock mode (fixtures, no sign-in, no AI calls).
const { test, expect } = require("@playwright/test");

test.use({ serviceWorkers: "block" });

test("test questions show what a visitor would see", async ({ page }) => {
  await page.goto("/admin/review/?mock=1#search");
  const panel = page.locator("#panel-search");
  await expect(panel).toContainText("AI search counts for the last 14 days");
  await panel.getByRole("textbox", { name: "Test questions, one per line" })
    .fill("1. give me a list of safety beds\n2. My son is having seizures right now\n\n3. best pizza near me");
  await panel.getByRole("button", { name: "Run test questions" }).click();
  await expect(panel).toContainText("Done: 3 questions");
  await expect(panel).toContainText("SleepSafe Beds");
  await expect(panel).toContainText("Shows the 911 / 988 box");
  await expect(panel).toContainText("Treated as off-topic");
});
