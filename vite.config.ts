import codspeedPlugin from "@codspeed/vitest-plugin";
import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  plugins: [codspeedPlugin()],
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
        "src/rules/**/*.bench.ts",
      ],
      thresholds: {
        statements: 80,
        branches: 70,
        functions: 80,
        lines: 80,
      },
    },
  },
  benchmark: {
    include: ["src/**/*.bench.ts"],
    hookTimeout: 120_000,
  },
});
