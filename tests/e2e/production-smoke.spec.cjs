const { test, expect } = require("@playwright/test");

const BASE_URL = (process.env.E2E_BASE_URL || "https://israelhousingsim.vercel.app").replace(/\/$/, "");
const VALID_TEUDAT_ZEHUT = "203458468";

async function verifyIdentity(page) {
  await expect(page).toHaveURL(/\/simulator\/identityVerification$/);
  await page.getByPlaceholder(/As it appears on your teudat zehut|כפי שמופיע בתעודת הזהות/).fill("Test Applicant");
  await page.getByPlaceholder(/9 digits|9 ספרות/).fill(VALID_TEUDAT_ZEHUT);
  await page.getByRole("button", { name: /Verify identity|אימות זהות/ }).click();
  await expect(page.getByText(/Identity verified via VryfID on|הזהות אומתה דרך VryfID בתאריך/)).toBeVisible({
    timeout: 3000,
  });
}

test("full English flow: identity, income, down payment source, credit standing, oleh branch, summary", async ({
  page,
}) => {
  const pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(String(error)));

  await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle" });
  await expect(page).toHaveURL(/\/simulator\/welcome$/);

  await page.getByRole("button", { name: "Start" }).click();
  await verifyIdentity(page);
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page).toHaveURL(/\/simulator\/residency$/);

  await page.getByRole("button", { name: /New immigrant/ }).click();
  await expect(page).toHaveURL(/\/simulator\/aliyahDetails$/, { timeout: 4000 });
  await page.getByRole("button", { name: "No", exact: true }).click();
  await expect(page).toHaveURL(/\/simulator\/buyerStatus$/, { timeout: 4000 });
  await page.getByRole("button", { name: /First home/ }).click();
  await expect(page).toHaveURL(/\/simulator\/incomeDebt$/, { timeout: 5000 });

  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page).toHaveURL(/\/simulator\/propertyPrice$/);
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page).toHaveURL(/\/simulator\/downPayment$/);
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page).toHaveURL(/\/simulator\/downPaymentSource$/);

  await page.getByRole("button", { name: "Savings" }).click();
  await expect(page).toHaveURL(/\/simulator\/term$/, { timeout: 3000 });

  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page).toHaveURL(/\/simulator\/trackMix$/);
  await expect(page.getByText("Fixed rate", { exact: false }).first()).toBeVisible();
  expect(await page.textContent("body")).not.toMatch(/Kalatz|Katz/i);
  await expect(page.getByText("Payment to income with this mix")).toBeVisible();
  await page.getByRole("button", { name: "Rate stability" }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page).toHaveURL(/\/simulator\/costs$/);

  await page.getByRole("button", { name: "See my report" }).click();
  await expect(page).toHaveURL(/\/simulator\/creditStanding$/);
  await page.getByRole("button", { name: "No", exact: true }).first().click();
  await page.getByRole("button", { name: "No", exact: true }).nth(1).click();
  await page.getByRole("button", { name: "No", exact: true }).nth(2).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page).toHaveURL(/\/simulator\/summary$/);

  await expect(page.getByText("Your mortgage readiness report.")).toBeVisible({ timeout: 8000 });
  await expect(page.getByText(/Identity verified via VryfID on/).first()).toBeVisible();
  await expect(page.locator("#root").getByText("What this confirms")).toBeVisible();
  await expect(page.locator("#root").getByText("What the bank will still need")).toBeVisible();
  await expect(page.getByRole("button", { name: /Download PDF · English/ })).toBeVisible();
  await expect(page.getByRole("button", { name: /Download both/ })).toBeVisible();
  await expect(page.getByText("Bank Hapoalim")).toBeVisible();
  await expect(page.locator('a[href*="leumi.co.il"]')).toBeVisible();
  await expect(page.getByText("VryfID LLC")).toBeVisible();
  await expect(page.getByText(/approved|preapproved|qualified/i)).toHaveCount(0);

  expect(pageErrors).toEqual([]);
});

test("Hebrew flow: RTL, Hebrew copy, Hebrew tracks, replacing home bridge caution, summary", async ({
  page,
}) => {
  await page.goto(`${BASE_URL}/simulator/welcome`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "עברית" }).click();
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");

  await page.getByRole("button", { name: "מתחילים" }).click();
  await expect(page).toHaveURL(/\/simulator\/identityVerification$/);
  await page.getByPlaceholder("כפי שמופיע בתעודת הזהות").fill("בודק בדיקה");
  await page.getByPlaceholder("9 ספרות").fill(VALID_TEUDAT_ZEHUT);
  await page.getByRole("button", { name: "אימות זהות" }).click();
  await expect(page.getByText(/הזהות אומתה דרך VryfID בתאריך/)).toBeVisible({ timeout: 3000 });
  await page.getByRole("button", { name: "המשך" }).click();

  await page.getByRole("button", { name: /תושב ישראל/ }).click();
  await expect(page).toHaveURL(/\/simulator\/buyerStatus$/, { timeout: 4000 });
  await page.getByRole("button", { name: /משפרי דיור/ }).click();
  await expect(page).toHaveURL(/\/simulator\/existingHomeStatus$/, { timeout: 5000 });
  await page.getByRole("button", { name: /עדיין לא נמכרה או פורסמה/ }).click();
  await expect(page).toHaveURL(/\/simulator\/incomeDebt$/, { timeout: 5000 });

  await page.getByRole("button", { name: "המשך" }).click();
  await expect(page).toHaveURL(/\/simulator\/propertyPrice$/);
  await page.getByRole("button", { name: "המשך" }).click();
  await expect(page).toHaveURL(/\/simulator\/downPayment$/);
  await page.getByRole("button", { name: "המשך" }).click();
  await expect(page).toHaveURL(/\/simulator\/downPaymentSource$/);
  await page.getByRole("button", { name: "חיסכון" }).click();
  await expect(page).toHaveURL(/\/simulator\/term$/, { timeout: 3000 });

  await page.getByRole("button", { name: "המשך" }).click();
  await expect(page).toHaveURL(/\/simulator\/trackMix$/);
  await expect(page.getByText("קל״צ", { exact: false }).first()).toBeVisible();
  await page.getByRole("button", { name: "המשך" }).click();
  await expect(page).toHaveURL(/\/simulator\/costs$/);
  await page.getByRole("button", { name: "לדוח שלי" }).click();
  await expect(page).toHaveURL(/\/simulator\/creditStanding$/);
  await page.getByRole("button", { name: "לא", exact: true }).first().click();
  await page.getByRole("button", { name: "לא", exact: true }).nth(1).click();
  await page.getByRole("button", { name: "לא", exact: true }).nth(2).click();
  await page.getByRole("button", { name: "המשך" }).click();

  await expect(page.getByText("דוח המוכנות למשכנתא שלכם.")).toBeVisible({ timeout: 8000 });
  await expect(page.getByRole("button", { name: /הורדת PDF · עברית/ })).toBeVisible();
});

test("branch guards, deep link refresh, and removed inflation step redirect", async ({ page }) => {
  // Non replacingHome direct hit on existingHomeStatus redirects past it.
  await page.goto(`${BASE_URL}/simulator/existingHomeStatus`, { waitUntil: "networkidle" });
  await expect(page).toHaveURL(/\/simulator\/(existingHomeStatus|incomeDebt)$/);

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
