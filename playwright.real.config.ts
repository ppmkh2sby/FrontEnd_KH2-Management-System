import { defineConfig, devices } from "@playwright/test";

const url = process.env.KH2_E2E_REAL_BASE_URL;
if (process.env.KH2_E2E_DISPOSABLE !== "1" || !url || !/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\/?$/.test(url)) {
  throw new Error("Real E2E requires KH2_E2E_DISPOSABLE=1 and a localhost disposable-stack URL.");
}

export default defineConfig({
  testDir: "tests/e2e/real",
  reporter: "list",
  use: { ...devices["Desktop Chrome"], baseURL: url, trace: "retain-on-failure" },
});
