import { describe, it, expect } from "vitest";
import { makeDoc } from "../test-helpers";
import { accesslint052 } from "./accesslint-052";

describe("accesslint-052 (importantWordSpacing)", () => {
  it("passes without inline styles", () => {
    const doc = makeDoc("<html><body><p>Text</p></body></html>");
    expect(accesslint052.run(doc)).toHaveLength(0);
  });

  it("passes word-spacing at threshold (0.16em)", () => {
    const doc = makeDoc('<html><body><p style="word-spacing: 0.16em !important">Text</p></body></html>');
    expect(accesslint052.run(doc)).toHaveLength(0);
  });

  it("reports word-spacing below threshold with !important", () => {
    const doc = makeDoc('<html><body><p style="word-spacing: 0.05em !important">Text</p></body></html>');
    const violations = accesslint052.run(doc);
    expect(violations).toHaveLength(1);
    expect(violations[0].ruleId).toBe("important-word-spacing");
    expect(violations[0].message).toContain("word-spacing");
    expect(violations[0].message).toContain("!important");
  });

  it("passes word-spacing without !important", () => {
    const doc = makeDoc('<html><body><p style="word-spacing: 0.01em">Text</p></body></html>');
    expect(accesslint052.run(doc)).toHaveLength(0);
  });

  it("reports normal with !important (effectively 0)", () => {
    const doc = makeDoc('<html><body><p style="word-spacing: normal !important">Text</p></body></html>');
    const violations = accesslint052.run(doc);
    expect(violations).toHaveLength(1);
  });
});
