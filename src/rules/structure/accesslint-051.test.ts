import { describe, it, expect } from "vitest";
import { makeDoc } from "../test-helpers";
import { accesslint051 } from "./accesslint-051";

describe("accesslint-051 (importantLineHeight)", () => {
  it("passes without inline styles", () => {
    const doc = makeDoc("<html><body><p>Text</p></body></html>");
    expect(accesslint051.run(doc)).toHaveLength(0);
  });

  it("passes line-height at threshold (1.5)", () => {
    const doc = makeDoc('<html><body><p style="line-height: 1.5 !important">Text</p></body></html>');
    expect(accesslint051.run(doc)).toHaveLength(0);
  });

  it("reports line-height below threshold with !important", () => {
    const doc = makeDoc('<html><body><p style="line-height: 1.1 !important">Text</p></body></html>');
    const violations = accesslint051.run(doc);
    expect(violations).toHaveLength(1);
    expect(violations[0].ruleId).toBe("accesslint-051");
    expect(violations[0].message).toContain("Line height");
  });

  it("reports line-height percentage below threshold", () => {
    const doc = makeDoc('<html><body><p style="line-height: 110% !important">Text</p></body></html>');
    const violations = accesslint051.run(doc);
    expect(violations).toHaveLength(1);
  });

  it("passes line-height percentage at threshold (150%)", () => {
    const doc = makeDoc('<html><body><p style="line-height: 150% !important">Text</p></body></html>');
    expect(accesslint051.run(doc)).toHaveLength(0);
  });
});
