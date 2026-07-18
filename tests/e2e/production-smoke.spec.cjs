const { test, expect } = require("@playwright/test");

const BASE_URL = process.env.E2E_BASE_URL || "https://israelhousingsim.vercel.app/";

test("English wizard reaches results with age, PDF choices, and social links", async ({ page }) => {
  await page.goto(BASE_URL, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /First home/ }).click();
  await page.getByRole("button", { name: /₪1.5M/ }).first().click();
  await page.getByRole("button", { name: /Continue/ }).click();
  await page.getByRole("button", { name: /25%.*40%/ }).click();
  await page.getByRole("button", { name: /Continue/ }).click();
  await page.getByRole("button", { name: /₪20k/ }).click();
  await page.getByRole("button", { name: /Continue/ }).click();
  await page.getByRole("button", { name: /None/ }).click();

  await expect(page.getByText("What's the age of the older borrower?")).toBeVisible();
  await page.getByRole("spinbutton").fill("52");
  await page.getByRole("button", { name: /Continue/ }).click();
  await page.getByRole("button", { name: /Use this mix/ }).click();

  await expect(page.getByRole("main").getByText("Term & Age Cap")).toBeVisible({ timeout: 6000 });
  await expect(page.getByRole("button", { name: /Download in Hebrew/ })).toBeVisible();
  await expect(page.getByRole("button", { name: /Download in English/ })).toBeVisible();
  await expect(page.getByRole("button", { name: /Download in both/ })).toBeVisible();
  await expect(page.locator('a[href*="wa.me"]').first()).toBeVisible();
  await expect(page.locator('a[href*="linkedin.com/sharing"]').first()).toBeVisible();
});

test("Hebrew wizard reaches age step with RTL and Hebrew typography", async ({ page }) => {
  await page.goto(BASE_URL, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /עברית/ }).click();
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");

  await page.getByRole("button", { name: /דירה ראשונה/ }).click();
  await page.getByRole("button", { name: /1.5/ }).first().click();
  await page.getByRole("button", { name: /המשך/ }).click();
  await page.getByRole("button", { name: /25%.*40%/ }).click();
  await page.getByRole("button", { name: /המשך/ }).click();
  await page.getByRole("button", { name: /20.*30/ }).click();
  await page.getByRole("button", { name: /המשך/ }).click();
  await page.getByRole("button", { name: /^אין$/ }).click();

  await expect(page.getByText("מה גיל הלווה המבוגר יותר?")).toBeVisible();
  const font = await page.evaluate(() => getComputedStyle(document.body).fontFamily);
  const size = await page.evaluate(() => getComputedStyle(document.body).fontSize);
  expect(font).toContain("Heebo");
  expect(size).toBe("17px");
});
