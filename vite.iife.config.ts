import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "src/standalone.ts"),
      formats: ["iife"],
      name: "AccessLintCore",
      fileName: () => "index.iife.js",
    },
    outDir: "dist",
    emptyOutDir: false,
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
});
