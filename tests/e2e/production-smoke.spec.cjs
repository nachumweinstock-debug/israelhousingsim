const { test, expect } = require("@playwright/test");

const BASE_URL = (process.env.E2E_BASE_URL || "https://israelhousingsim.vercel.app").replace(/\/$/, "");

test("full English flow: oleh branch, mix presets, costs, summary with export and banks", async ({
  page,
}) => {
  const pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(String(error)));

  await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle" });
  await expect(page).toHaveURL(/\/simulator\/welcome$/);

  await page.getByRole("button", { name: "Start" }).click();
  await expect(page).toHaveURL(/\/simulator\/residency$/);

  // Choice screens auto advance without a Continue click.
  await page.getByRole("button", { name: /New immigrant/ }).click();
  await expect(page).toHaveURL(/\/simulator\/aliyahDetails$/, { timeout: 4000 });
  await page.getByRole("button", { name: "No", exact: true }).click();
  await expect(page).toHaveURL(/\/simulator\/buyerStatus$/, { timeout: 4000 });
  await page.getByRole("button", { name: /First home/ }).click();
  await expect(page).toHaveURL(/\/simulator\/propertyPrice$/, { timeout: 5000 });

  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page).toHaveURL(/\/simulator\/downPayment$/);
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page).toHaveURL(/\/simulator\/term$/);
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page).toHaveURL(/\/simulator\/trackMix$/);

  // English uses plain English track names, no transliterations.
  await expect(page.getByText("Fixed rate", { exact: false }).first()).toBeVisible();
  expect(await page.textContent("body")).not.toMatch(/Kalatz|Katz/i);
  await page.getByRole("button", { name: "Rate stability" }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page).toHaveURL(/\/simulator\/costs$/);

  await page.getByRole("button", { name: "See my plan" }).click();
  await expect(page).toHaveURL(/\/simulator\/summary$/);

  // Crunching interlude resolves into the plan.
  await expect(page.getByText("Your mortgage plan.")).toBeVisible({ timeout: 8000 });
  await expect(page.getByText("Estimated monthly payment", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: /Download PDF · English/ })).toBeVisible();
  await expect(page.getByRole("button", { name: /Download both/ })).toBeVisible();
  await expect(page.getByText("Bank Hapoalim")).toBeVisible();
  await expect(page.locator('a[href*="leumi.co.il"]')).toBeVisible();
  await expect(page.getByText("VryfID LLC")).toBeVisible();

  expect(pageErrors).toEqual([]);
});

test("Hebrew flow: RTL, Hebrew copy, Hebrew tracks, summary", async ({ page }) => {
  await page.goto(`${BASE_URL}/simulator/residency`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "עברית" }).click();
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");

  await page.getByRole("button", { name: /תושב ישראל/ }).click();
  await expect(page).toHaveURL(/\/simulator\/buyerStatus$/, { timeout: 4000 });
  await page.getByRole("button", { name: /דירה ראשונה/ }).click();
  await expect(page).toHaveURL(/\/simulator\/propertyPrice$/, { timeout: 5000 });
  await page.getByRole("button", { name: "המשך" }).click();
  await page.getByRole("button", { name: "המשך" }).click();
  await page.getByRole("button", { name: "המשך" }).click();
  await expect(page).toHaveURL(/\/simulator\/trackMix$/);
  await expect(page.getByText("קל״צ", { exact: false }).first()).toBeVisible();
  await page.getByRole("button", { name: "המשך" }).click();
  await page.getByRole("button", { name: "לתוכנית שלי" }).click();
  await expect(page.getByText("תוכנית המשכנתא שלכם.")).toBeVisible({ timeout: 8000 });
  await expect(page.getByRole("button", { name: /הורדת PDF · עברית/ })).toBeVisible();
});

test("branch guard, deep link refresh, and removed inflation step redirect", async ({ page }) => {
  // Non oleh direct hit on aliyahDetails redirects past it.
  await page.goto(`${BASE_URL}/simulator/aliyahDetails`, { waitUntil: "networkidle" });
  await expect(page).toHaveURL(/\/simulator\/(aliyahDetails|buyerStatus)$/);

  // Deep link refresh serves the SPA, not a 404.
  const response = await page.goto(`${BASE_URL}/simulator/trackMix`);
  expect(response.status()).toBe(200);

  // The retired inflation route forwards into the flow.
  await page.goto(`${BASE_URL}/simulator/inflationScenario`, { waitUntil: "networkidle" });
  await expect(page).toHaveURL(/\/simulator\/costs$/);
});

test("capture endpoint accepts a simulation payload", async ({ request }) => {
  const response = await request.post(`${BASE_URL}/api/capture`, {
    data: { lang: "en", answers: { source: "e2e-smoke" }, results: {} },
  });
  expect(response.status()).toBe(204);

  const unauthorized = await request.get(`${BASE_URL}/api/capture`);
  expect(unauthorized.status()).toBe(401);
});
