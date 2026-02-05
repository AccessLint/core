import { describe, it, expect } from "vitest";
import { runAudit } from "../rules/index";
import { generateDoc, LARGE_SIZE } from "./fixtures";

describe("memory", () => {
  it(
    "heap stays bounded across repeated audits",
    () => {
      const doc = generateDoc(LARGE_SIZE);
      const iterations = 10;
      const maxGrowthBytes = 200 * 1024 * 1024; // 200 MB — generous for happy-dom overhead

      // Force GC if available (run with --expose-gc)
      if (typeof globalThis.gc === "function") {
        globalThis.gc();
      }

      const before = process.memoryUsage().heapUsed;

      for (let i = 0; i < iterations; i++) {
        runAudit(doc);
      }

      if (typeof globalThis.gc === "function") {
        globalThis.gc();
      }

      const after = process.memoryUsage().heapUsed;
      const growth = after - before;

      expect(growth).toBeLessThan(maxGrowthBytes);
    },
    60_000,
  );
});
