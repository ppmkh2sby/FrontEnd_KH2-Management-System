import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("login only blocks forced password changes", () => {
  const source = read("src/shared/lib/auth.ts");
  assert.match(source, /mustChangePassword/);
  assert.match(source, /return "\/dashboard"/);
  assert.doesNotMatch(source, /return "\/set-email"/);
  assert.doesNotMatch(source, /return "\/verify-email"/);
});

test("canonical face client uses only backend enrollment and self-verify routes", () => {
  const source = read("src/shared/lib/face-attendance.ts");
  assert.match(source, /\/api\/v1\/face-profiles\/me\/enrollment/);
  assert.match(source, /\/api\/v1\/face-profiles\/me\/verify/);
  assert.match(source, /body\.append\("photos", photo\)/);
  assert.match(source, /body\.append\("photo", photo\)/);
  assert.doesNotMatch(source, /FACE_SERVICE_API_KEY|trusted-device/i);
});

test("critical public brand and landing assets exist", () => {
  for (const asset of [
    "public/assets/images/logo_ppm.webp",
    "public/assets/images/landing/hero.webp",
    "public/assets/images/landing/gallery-belajar.webp",
  ]) {
    assert.equal(existsSync(new URL(`../${asset}`, import.meta.url)), true, `${asset} is missing`);
  }
});

test("Wali detail reads include the backend-authorized selected-child parameters", () => {
  const source = read("src/shared/lib/santri-data.ts");
  assert.match(source, /params\.set\("santriId", santriId\)/);
  assert.match(source, /params\.set\("santriCode", santriCode\)/);
  assert.match(source, /params\.set\("santriId", query\.santriId\)/);
});
