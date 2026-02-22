import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  test: {
    environment: "happy-dom",
    environmentOptions: {
      happyDOM: {
        settings: {
          disableCSSFileLoading: true,
          navigation: {
            disableMainFrameNavigation: true,
            disableChildFrameNavigation: true,
            disableChildPageNavigation: true,
          },
        },
      },
    },
    onConsoleLog(log) {
      if (log.includes("CSS file loading is disabled")) return false;
    },
    include: ["src/**/*.test.ts"],
    exclude: ["src/bench/memory.test.ts"],
    hookTimeout: 60_000,
    coverage: {
      provider: "v8",
      include: ["src/rules/**/*.ts"],
      exclude: [
        "src/rules/**/*.test.ts",
      ],
      thresholds: {
        statements: 80,
        branches: 70,
        functions: 80,
        lines: 80,
      },
    },
  },
});
