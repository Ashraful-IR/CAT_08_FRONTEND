import { defineConfig, devices } from "@playwright/test";

// E2E runs against the Next dev server on port 5002 (CORS allowlist requirement).
export default defineConfig({
  testDir: "./e2e",
  // The booking-journey spec is a serial story (register → sign-in → book →
  // manage) sharing one worker + cookie jar and one generated account; other
  // specs still parallelise across workers.
  fullyParallel: false,
  workers: process.env.CI ? 1 : 2,
  forbidOnly: !!process.env.CI,
  // Real deployed backend: serverless cold starts regularly exceed the 5s
  // default assertion window, so allow a retry locally too.
  retries: process.env.CI ? 2 : 1,
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
