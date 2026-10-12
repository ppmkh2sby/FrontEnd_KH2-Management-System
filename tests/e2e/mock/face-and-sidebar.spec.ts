import { expect, test, type Page } from "@playwright/test";
import { mockApi } from "./mock-api";

async function signIn(page: Page, identity = "Santri") {
  await page.goto("/login");
  await page.getByLabel("Identitas Akun").fill(identity);
  await page.getByLabel("Password", { exact: true }).fill("mock-only");
  await page.getByRole("button", { name: /masuk/i }).last().click();
  await expect(page).toHaveURL(/\/dashboard$/);
}

async function syntheticPng(page: Page, color: string) {
  const data = await page.evaluate((fill) => {
    const canvas = document.createElement("canvas");
    canvas.width = 96; canvas.height = 128;
    const context = canvas.getContext("2d")!;
    context.fillStyle = fill; context.fillRect(0, 0, 96, 128);
    return canvas.toDataURL("image/png").split(",")[1];
  }, color);
  return Buffer.from(data, "base64");
}

test("enrollment lima foto tersimpan di backend mock dan status bertahan setelah refresh", async ({ page }) => {
  const api = await mockApi(page);
  await page.addInitScript(() => {
    Object.defineProperty(navigator.mediaDevices, "getUserMedia", { configurable: true, value: async () => { throw new DOMException("Denied", "NotAllowedError"); } });
  });
  await signIn(page);
  await page.goto("/dashboard/daftarkan-wajah");
  await page.getByRole("button", { name: "Mulai ambil foto" }).click();
  await expect(page.getByText(/izin kamera ditolak/i)).toBeVisible();
  const image = await syntheticPng(page, "#157d44");
  for (let index = 0; index < 5; index++) {
    await page.locator('input[type="file"]').setInputFiles({ name: `synthetic-${index}.png`, mimeType: "image/png", buffer: image });
    if (index < 4) {
      await expect(page.getByText(`Foto diambil: ${index + 1}/5`)).toBeVisible();
      await expect(page.getByText(`Foto diambil: ${index + 1}/5`)).toHaveCount(0);
      await expect(page.getByText(`${index + 2} / 5`)).toBeVisible();
    }
  }
  await expect(page.getByRole("heading", { name: "5 foto siap" })).toBeVisible();
  await page.getByRole("button", { name: "Daftarkan wajah", exact: true }).click();
  await expect(page.getByText("Wajah berhasil terdaftar.")).toBeVisible();
  expect(api.state.lastEnrollmentBody?.match(/name="photos"/g)).toHaveLength(5);
  await page.reload();
  await expect(page.getByRole("heading", { name: "Wajah sudah terdaftar" })).toBeVisible();
});

test("self-verification mengirim foto baru, menampilkan similarity, tanpa presensi", async ({ page }) => {
  const api = await mockApi(page);
  await signIn(page);
  await page.goto("/dashboard/uji-wajah-saya");
  const image = await syntheticPng(page, "#cc5511");
  await page.locator('input[type="file"]').setInputFiles({ name: "fresh.png", mimeType: "image/png", buffer: image });
  await expect(page.getByText("Kemiripan: 87.0%")).toBeVisible();
  expect(api.state.verifyCalls).toBe(1);
  expect(api.state.lastVerifyBody).toContain('name="photo"');
  expect(api.state.attendanceWrites).toBe(0);
  expect(api.calls.some((call) => call.path.includes("/v1/analyze") || call.path.includes("trusted-device"))).toBe(false);
});

test("kamera menampilkan permission denied dan fallback dengan constraint portrait/landscape", async ({ page, isMobile }) => {
  await mockApi(page);
  await page.addInitScript(() => {
    Object.defineProperty(navigator.mediaDevices, "getUserMedia", { configurable: true, value: async (constraints: MediaStreamConstraints) => {
      (window as unknown as { cameraConstraints: MediaStreamConstraints }).cameraConstraints = constraints;
      throw new DOMException("Denied", "NotAllowedError");
    } });
  });
  await signIn(page);
  await page.goto("/dashboard/uji-wajah-saya");
  await page.getByRole("button", { name: "Izinkan & aktifkan kamera" }).click();
  await expect(page.getByRole("alert")).toContainText("Izin kamera ditolak");
  await expect(page.getByRole("button", { name: "Ambil foto dengan kamera perangkat" })).toBeVisible();
  const constraints = await page.evaluate(() => (window as unknown as { cameraConstraints: MediaStreamConstraints }).cameraConstraints);
  expect(constraints.audio).toBe(false);
  expect((constraints.video as MediaTrackConstraints).facingMode).toBe("user");
  expect((constraints.video as MediaTrackConstraints).aspectRatio).toEqual({ ideal: isMobile ? 9 / 16 : 16 / 9 });
});

test("kamera live mengirim full-frame landscape tanpa crop pada viewport desktop/mobile", async ({ page }) => {
  const api = await mockApi(page);
  await page.addInitScript(() => {
    Object.defineProperty(navigator.mediaDevices, "getUserMedia", { configurable: true, value: async () => {
      const canvas = document.createElement("canvas");
      canvas.width = 640; canvas.height = 480;
      const context = canvas.getContext("2d")!;
      context.fillStyle = "#e74c3c"; context.fillRect(0, 0, 320, 480);
      context.fillStyle = "#174ea6"; context.fillRect(320, 0, 320, 480);
      return canvas.captureStream(10);
    } });
  });
  await signIn(page);
  await page.goto("/dashboard/uji-wajah-saya");
  await page.getByRole("button", { name: "Izinkan & aktifkan kamera" }).click();
  await expect(page.getByRole("button", { name: "Uji wajah saya", exact: true })).toBeVisible();
  const video = page.locator("video");
  await expect.poll(() => video.evaluate((item) => (item as HTMLVideoElement).videoWidth)).toBe(640);
  expect(await video.evaluate((item) => getComputedStyle(item).objectFit)).toBe("contain");
  await page.getByRole("button", { name: "Uji wajah saya", exact: true }).click();
  await expect(page.getByText("Kemiripan: 87.0%")).toBeVisible();
  expect(api.state.lastVerifyDimensions).toEqual({ width: 640, height: 480 });
});

test("sidebar mempertahankan scroll/submenu saat navigasi dan mobile Escape menutup drawer", async ({ page, isMobile }) => {
  await mockApi(page);
  await signIn(page);
  if (isMobile) await page.getByRole("button", { name: "Buka menu", exact: true }).click();
  await page.getByRole("button", { name: /Fitur Umum/ }).click();
  const nav = page.locator("nav.sidebar-scroll");
  await nav.evaluate((node) => { node.scrollTop = node.scrollHeight; });
  const before = await nav.evaluate((node) => node.scrollTop);
  await page.getByRole("button", { name: /Uji Wajah Saya/ }).click();
  await expect(page).toHaveURL(/\/dashboard\/uji-wajah-saya$/);
  if (isMobile) await page.getByRole("button", { name: "Buka menu", exact: true }).click();
  await expect(page.getByRole("button", { name: /Fitur Umum/ })).toBeVisible();
  const after = await nav.evaluate((node) => node.scrollTop);
  expect(after).toBeGreaterThanOrEqual(Math.max(0, before - 5));
  if (isMobile) {
    await page.keyboard.press("Escape");
    await expect(page.getByRole("button", { name: "Tutup menu" })).toHaveCount(0);
  } else {
    await expect.poll(() => page.locator("aside").first().evaluate((node) => getComputedStyle(node).position)).toBe("fixed");
  }
  await page.goBack();
  await expect(page).toHaveURL(/\/dashboard$/);
});
