import { describe, it, expect, afterEach } from "vitest";
import { makeDoc } from "../test-helpers";
import { accesslint093 } from "./accesslint-093";
import { clearColorCaches } from "../utils/color";

describe("accesslint-093", () => {
  afterEach(() => {
    clearColorCaches();
  });

  it("fails: text with contrast below AAA threshold (7:1 for normal text)", () => {
    // rgb(100,100,100) on white ≈ 5.32:1 — passes AA (4.5:1) but fails AAA (7:1)
    const doc = makeDoc(
      '<body><p style="color: rgb(100, 100, 100); background-color: rgb(255, 255, 255);">Low enhanced contrast</p></body>'
    );
    const violations = accesslint093.run(doc);
    expect(violations).toHaveLength(1);
    expect(violations[0].ruleId).toBe("accesslint-093");
    expect(violations[0].message).toContain("enhanced");
  });

  it("passes: black text on white background (21:1 meets AAA)", () => {
    const doc = makeDoc(
      '<body><p style="color: rgb(0, 0, 0); background-color: rgb(255, 255, 255);">High contrast</p></body>'
    );
    expect(accesslint093.run(doc)).toHaveLength(0);
  });

  it("passes: large text with 4.5:1 AAA threshold", () => {
    // Large text (>=24px) requires 4.5:1 at AAA
    // rgb(100,100,100) on white ≈ 5.32:1 — passes 4.5:1 for large text at AAA
    const doc = makeDoc(
      '<body><p style="color: rgb(100, 100, 100); background-color: rgb(255, 255, 255); font-size: 24px;">Large text</p></body>'
    );
    expect(accesslint093.run(doc)).toHaveLength(0);
  });

  it("skips: hidden elements", () => {
    const doc = makeDoc(
      '<body><p style="color: rgb(200, 200, 200); background-color: rgb(200, 200, 200); display: none;">Hidden</p></body>'
    );
    expect(accesslint093.run(doc)).toHaveLength(0);
  });
});
