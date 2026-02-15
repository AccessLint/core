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
          navigation: {
            disableMainFrameNavigation: true,
            disableChildFrameNavigation: true,
            disableChildPageNavigation: true,
          },
        },
      },
    },
    include: ["src/**/*.test.ts"],
    exclude: ["src/bench/memory.test.ts"],
    hookTimeout: 60_000,
  },
  benchmark: {
    include: ["src/**/*.bench.ts"],
    hookTimeout: 120_000,
  },
});
