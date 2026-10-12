import { expect, test } from "@playwright/test";

type Account = { identity: string; password: string };
type Accounts = Record<"Admin" | "Pengurus" | "DewanGuru" | "Santri" | "WaliSantri", Account>;

const raw = process.env.KH2_E2E_REAL_ACCOUNTS_JSON;
if (!raw) throw new Error("Provide disposable seeded accounts via KH2_E2E_REAL_ACCOUNTS_JSON; never commit credentials.");
const accounts = JSON.parse(raw) as Accounts;

for (const role of ["Admin", "Pengurus", "DewanGuru", "Santri", "WaliSantri"] as const) {
  test(`${role}: real login and authorized dashboard`, async ({ page }) => {
    const account = accounts[role];
    if (!account?.identity || !account.password) throw new Error(`Missing disposable ${role} account.`);
    const browserRequests: string[] = [];
    page.on("request", (request) => {
      if (request.url().includes("/api/v1/")) browserRequests.push(new URL(request.url()).pathname);
    });
    await page.goto("/login");
    await page.getByLabel("Identitas Akun").fill(account.identity);
    await page.getByLabel("Password", { exact: true }).fill(account.password);
    await page.getByRole("button", { name: "Masuk", exact: true }).click();
    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByText(/Assalamualaikum/i).first()).toBeVisible();
    expect(browserRequests).toContain("/api/v1/auth/login");
    expect(browserRequests).toContain("/api/v1/auth/me");
    if (role === "WaliSantri") {
      expect(browserRequests).toContain("/api/v1/wali/me/children");
      expect(browserRequests).not.toContain("/api/v1/dashboard/santri/me");
    }
  });
}

test("real Wali two-child switch reflects distinct backend data", async ({ page }) => {
  const account = accounts.WaliSantri;
  await page.goto("/login");
  await page.getByLabel("Identitas Akun").fill(account.identity);
  await page.getByLabel("Password", { exact: true }).fill(account.password);
  await page.getByRole("button", { name: "Masuk", exact: true }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  const selector = page.getByLabel("Pilih anak");
  await expect(selector).toBeVisible();
  const options = await selector.locator("option").allTextContents();
  expect(options.length).toBeGreaterThanOrEqual(2);
  await selector.selectOption({ index: 1 });
  await expect(page.getByRole("heading", { name: options[1] }).first()).toBeVisible();
  await page.reload();
  await expect(page.getByRole("heading", { name: options[1] }).first()).toBeVisible();
});
