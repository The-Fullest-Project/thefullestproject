// @ts-check
// Review portal Search tab: counts and the "Try test questions" box, in the
// portal's mock mode (fixtures, no sign-in, no AI calls).
const { test, expect } = require("@playwright/test");

test.use({ serviceWorkers: "block" });

test("test questions show what a visitor would see", async ({ page }) => {
  await page.goto("/admin/review/?mock=1#search");
  const panel = page.locator("#panel-search");
  await expect(panel).toContainText("AI search counts for the last 14 days");
  await expect(panel).toContainText("Gaps: what people looked for and didn't find");
  await expect(panel).toContainText("adaptive strollers for older children (Virginia)");
  await panel.getByRole("textbox", { name: "Test questions, one per line" })
    .fill("1. give me a list of safety beds\n2. My son is having seizures right now\n\n3. best pizza near me");
  await panel.getByRole("button", { name: "Run test questions" }).click();
  // The mock answers with four fixed results whatever is pasted.
  await expect(panel).toContainText("Done: 4 questions");
  await expect(panel).toContainText("Suggested starting points");
  await expect(panel).toContainText("SleepSafe Beds");
  await expect(panel).toContainText("Guide links: Adaptive Equipment Guide");
  await expect(panel).toContainText("Shows the 911 / 988 box");
  await expect(panel).toContainText('would be added to Gaps as "young adult books with disabled main characters (anywhere)"');
  await expect(panel).toContainText("Treated as off-topic");
});
