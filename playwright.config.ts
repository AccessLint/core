import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "src/act",
  testMatch: "act-browser.spec.ts",
  timeout: 30_000,
  reporter: [
    ["list"],
    ["./src/act/browser-earl-reporter.ts"],
  ],
  projects: [
    {
      name: "browser",
      use: { browserName: "chromium" },
    },
  ],
});
