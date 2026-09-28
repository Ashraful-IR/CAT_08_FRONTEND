import { defineConfig, devices } from "@playwright/test";

// E2E runs against the Next dev server on port 5002 (CORS allowlist requirement).
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: "http://localhost:5002",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "pnpm dev",
    url: "http://localhost:5002",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
