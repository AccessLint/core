import { describe, it, expect } from "vitest";
import { runAudit } from "./index";
import { generateDoc, SMALL_SIZE } from "../bench/fixtures";

function makeDoc(html: string): Document {
  return new DOMParser().parseFromString(html, "text/html");
}

describe("runAudit integration", () => {
  it(
    "returns violations on a realistic document",
    () => {
      const doc = generateDoc(SMALL_SIZE);
      const result = runAudit(doc);

      expect(result.violations.length).toBeGreaterThan(0);
      expect(result.ruleCount).toBeGreaterThan(20);
      expect(result.timestamp).toBeGreaterThan(0);

      // Every violation should have required fields
      for (const v of result.violations) {
        expect(v.ruleId).toBeTruthy();
        expect(v.selector).toBeTruthy();
        expect(v.message).toBeTruthy();
        expect(["critical", "serious", "moderate", "minor"]).toContain(
          v.impact,
        );
      }

      // Should find violations from multiple rule categories
      const ruleIds = new Set(result.violations.map((v) => v.ruleId));
      expect(ruleIds.has("img-alt")).toBe(true);
      expect(ruleIds.has("link-name")).toBe(true);
      expect(ruleIds.has("empty-heading")).toBe(true);
    },
    15_000,
  );

  it("returns no violations on a clean document", () => {
    const doc = makeDoc(
      '<html lang="en"><head><title>Clean</title></head><body><main><h1>Hello</h1><p>World</p></main></body></html>',
    );
    const result = runAudit(doc);
    expect(result.violations).toHaveLength(0);
  });

  it(
    "is deterministic across runs",
    () => {
      const doc = generateDoc(SMALL_SIZE);
      const a = runAudit(doc);
      const b = runAudit(doc);

      expect(a.violations.length).toBe(b.violations.length);
      expect(a.violations.map((v) => v.ruleId)).toEqual(
        b.violations.map((v) => v.ruleId),
      );
    },
    15_000,
  );
});
