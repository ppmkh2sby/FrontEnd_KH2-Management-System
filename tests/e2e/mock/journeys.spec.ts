import { expect, test, type Page } from "@playwright/test";
import { mockApi, roles } from "./mock-api";

async function login(page: Page, identity: string) {
  await page.goto("/login");
  await page.getByLabel("Identitas Akun").fill(identity);
  await page.getByLabel("Password", { exact: true }).fill("mock-only");
  await page.getByRole("button", { name: /masuk/i }).last().click();
  await expect(page).toHaveURL(identity === "forced" ? /\/change-password$/ : /\/dashboard$/);
}

for (const role of roles) {
  test(`${role}: login tanpa verifikasi email menuju dashboard`, async ({ page }) => {
    const api = await mockApi(page);
    await login(page, role);
    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByText(`Akun ${role}`).first()).toBeVisible();
    expect(api.calls.some((call) => call.path === "/api/v1/auth/me" && call.token === `mock-token-${role}`)).toBe(true);
    expect(page.url()).not.toContain("verify-email");
  });
}

test("password wajib ganti tidak dapat membuka dashboard, lalu login ulang", async ({ page }) => {
  const api = await mockApi(page);
  await login(page, "forced");
  await expect(page).toHaveURL(/\/change-password$/);
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/change-password$/);
  await page.getByLabel("Password saat ini").fill("mock-only");
  await page.getByLabel("Password baru", { exact: true }).fill("new-mock-only");
  await page.getByLabel("Konfirmasi password baru").fill("new-mock-only");
  await page.getByRole("button", { name: "Ganti password" }).click();
  await expect(page).toHaveURL(/\/login$/);
  expect(api.calls.some((call) => call.path === "/api/v1/auth/change-password" && call.method === "POST")).toBe(true);
});

test("token tidak valid dan 401 saat sesi aktif kembali ke login", async ({ page }) => {
  const api = await mockApi(page);
  await page.goto("/");
  await page.evaluate(() => localStorage.setItem("kh2_access_token", "invalid"));
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login$/);
  expect(await page.evaluate(() => localStorage.getItem("kh2_access_token"))).toBeNull();
  await login(page, "Admin");
  await expect(page).toHaveURL(/\/dashboard$/);
  api.state.failPath = "/api/v1/santri";
  api.state.failStatus = 401;
  await page.reload();
  await expect(page).toHaveURL(/\/login$/);
});

test("staff dashboard menampilkan angka API, bukan preset", async ({ page }) => {
  const api = await mockApi(page);
  await login(page, "Admin");
  await expect(page.getByText("Total Santri").first()).toBeVisible();
  await expect(page.getByText("12", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("Anak Alfa").first()).toBeVisible();
  expect(api.calls.some((call) => call.path.includes("/progress-keilmuan/staff"))).toBe(true);
  expect(api.calls.some((call) => call.path.includes("/log-keluar-masuk") && call.path.includes("scope=team"))).toBe(true);
  if (page.viewportSize()!.width < 1024) await page.getByRole("button", { name: "Buka menu", exact: true }).click();
  await page.getByRole("button", { name: /Progress Keilmuan/ }).click();
  await expect(page).toHaveURL(/\/dashboard\/staff\/progress-keilmuan$/);
  await expect(page.getByText("Anak Alfa").first()).toBeVisible();
});

test("Wali dua anak: semua fitur berubah tanpa tercampur, refresh dan back/forward", async ({ page }) => {
  const api = await mockApi(page);
  await login(page, "WaliSantri");
  await expect(page.getByText("Anak Alfa").first()).toBeVisible();
  const selector = page.getByLabel("Pilih anak");
  await selector.selectOption(api.childB.santriId);
  await expect(page.getByText("Anak Beta").first()).toBeVisible();
  await expect(page.getByText(/Kegiatan BETA/).first()).toBeVisible();
  await expect(page.getByText(/Tujuan BETA/).first()).toBeVisible();
  await expect(page.getByText(/ALFA/)).toHaveCount(0);
  for (const [tab, expected] of [["Presensi", "Kegiatan BETA"], ["Progress", "Modul BETA"], ["Kafarah", "Kafarah BETA"], ["Log Keluar/Masuk", "Tujuan BETA"]] as const) {
    await page.getByRole("link", { name: tab, exact: true }).last().click();
    await expect(page.getByText(expected, { exact: false }).first()).toBeVisible();
    await expect(page.getByText(/ALFA/)).toHaveCount(0);
  }
  await page.reload();
  await expect(page.getByText("Anak Beta").first()).toBeVisible();
  await page.goBack();
  await expect(page.getByText("Anak Beta").first()).toBeVisible();
  await page.goForward();
  await expect(page.getByText("Anak Beta").first()).toBeVisible();
  expect(api.calls.filter((call) => call.path.includes("santriId=") && call.path.includes(api.childB.santriId)).length).toBeGreaterThan(0);
  expect(api.calls.filter((call) => call.path.includes("santriCode=B-202")).length).toBeGreaterThan(0);
  expect(api.calls.some((call) => call.path === "/api/v1/dashboard/santri/me")).toBe(false);
});

test("Wali lain hanya melihat relasi sendiri; 403/404/500 tampil sebagai error atau kosong", async ({ page }) => {
  const api = await mockApi(page);
  await login(page, "wali-b");
  await expect(page.getByText("Anak Wali Lain").first()).toBeVisible();
  expect(api.calls.some((call) => call.path.includes(api.childA.santriId))).toBe(false);
  api.state.failPath = "/api/v1/presensi";
  api.state.failStatus = 403;
  await page.goto("/dashboard/wali/presensi");
  await expect(page.getByText(/akses ditolak/i).first()).toBeVisible();
  api.state.failStatus = 404;
  await page.reload();
  await expect(page.getByText(/akses ditolak/i).first()).toBeVisible();
  api.state.failStatus = 500;
  await page.reload();
  await expect(page.getByText(/belum dapat dimuat/i).first()).toBeVisible();
});

test("Wali pagination memakai halaman dan total dari API", async ({ page }) => {
  const api = await mockApi(page);
  await login(page, "WaliSantri");
  await page.goto("/dashboard/wali/presensi");
  await expect(page.getByText("23", { exact: true }).first()).toBeVisible();
  await page.getByRole("button", { name: "Berikutnya" }).click();
  await expect(page.getByText("Riwayat Presensi · Halaman 2")).toBeVisible();
  expect(api.calls.some((call) => call.path.includes("page=2") && call.path.includes("perPage=20"))).toBe(true);
});

test("Wali tanpa relasi menampilkan empty state, loading terpisah dari data anak", async ({ page }) => {
  const api = await mockApi(page);
  api.state.emptyChildren = true;
  api.state.delayPath = "/api/v1/wali/me/children";
  await login(page, "WaliSantri");
  await expect(page.getByText("Memuat data anak...").first()).toBeVisible();
  await expect(page.getByText("Belum ada anak terhubung").first()).toBeVisible();
  expect(api.calls.some((call) => call.path.includes("santriId="))).toBe(false);
});

test("perubahan token pada refresh mengganti identitas dan tidak mewarisi pilihan anak", async ({ page }) => {
  await mockApi(page);
  await login(page, "WaliSantri");
  await expect(page.getByText("Anak Alfa").first()).toBeVisible();
  await page.evaluate(() => localStorage.setItem("kh2_access_token", "mock-token-wali-b"));
  await page.reload();
  await expect(page.getByText("Anak Wali Lain").first()).toBeVisible();
  await expect(page.getByText("Anak Alfa")).toHaveCount(0);
});

test("asset gambar publik dimuat sebagai image dan tidak rusak", async ({ page, request }) => {
  await mockApi(page);
  await page.goto("/");
  const sources = await page.locator("img").evaluateAll((images) => images.map((image) => (image as HTMLImageElement).getAttribute("src")).filter(Boolean) as string[]);
  expect(sources.length).toBeGreaterThan(0);
  for (const source of sources) {
    const response = await request.get(source);
    expect(response.status(), source).toBe(200);
    expect(response.headers()["content-type"], source).toMatch(/^image\//);
  }
  const decoded = await page.locator("img").evaluateAll(async (images) => Promise.all(images.map(async (image) => {
    const item = image as HTMLImageElement;
    item.loading = "eager";
    try { await item.decode(); } catch { return false; }
    return item.naturalWidth > 0;
  })));
  expect(decoded.every(Boolean)).toBe(true);
});
