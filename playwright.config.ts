import { defineConfig, devices } from "@playwright/test";

// Dev server port used by the team (see memory: dev server on :3006). Set E2E_BASE_URL to
// point at an already-running or remote deployment; the local dev server is then not started.
const port = 3006;
const baseURL = process.env.E2E_BASE_URL ?? `http://localhost:${port}`;

export default defineConfig({
  testDir: "./e2e",
  // Every test writes to the same Supabase project, so run one at a time.
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 90_000,
  expect: { timeout: 10_000 },
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL,
    // Headless by default. E2E_HEADED=1 opens the browser so the flow can be watched.
    headless: process.env.E2E_HEADED !== "1",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      // Uses the locally installed Chrome (E2E_CHANNEL=chrome by default). Set E2E_CHANNEL= to use
      // Playwright's bundled Chromium after `npx playwright install chromium`.
      use: { ...devices["Desktop Chrome"], channel: process.env.E2E_CHANNEL ?? "chrome" },
    },
  ],
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        // --use-system-ca matches `npm run dev`; the machine sits behind a TLS-inspecting proxy.
        command: `node --use-system-ca node_modules/next/dist/bin/next dev -p ${port}`,
        url: baseURL,
        reuseExistingServer: true,
        timeout: 120_000,
      },
});
