import { describe, it, expect } from "vitest";
import { makeDoc } from "../test-helpers";
import { importantLetterSpacing, importantLineHeight, importantWordSpacing } from "./text-spacing-rules";

describe("accesslint-050 (importantLetterSpacing)", () => {
  it("passes without inline styles", () => {
    const doc = makeDoc("<html><body><p>Text</p></body></html>");
    expect(importantLetterSpacing.run(doc)).toHaveLength(0);
  });

  it("passes letter-spacing without !important", () => {
    const doc = makeDoc('<html><body><p style="letter-spacing: 0.05em">Text</p></body></html>');
    expect(importantLetterSpacing.run(doc)).toHaveLength(0);
  });

  it("passes letter-spacing at threshold (0.12em)", () => {
    const doc = makeDoc('<html><body><p style="letter-spacing: 0.12em !important">Text</p></body></html>');
    expect(importantLetterSpacing.run(doc)).toHaveLength(0);
  });

  it("reports letter-spacing below threshold with !important", () => {
    const doc = makeDoc('<html><body><p style="letter-spacing: 0.05em !important">Text</p></body></html>');
    const violations = importantLetterSpacing.run(doc);
    expect(violations).toHaveLength(1);
    expect(violations[0].ruleId).toBe("important-letter-spacing");
    expect(violations[0].message).toContain("letter-spacing");
    expect(violations[0].message).toContain("!important");
  });

  it("passes inherit with !important", () => {
    const doc = makeDoc('<html><body><p style="letter-spacing: inherit !important">Text</p></body></html>');
    expect(importantLetterSpacing.run(doc)).toHaveLength(0);
  });

  it("reports normal with !important (effectively 0)", () => {
    const doc = makeDoc('<html><body><p style="letter-spacing: normal !important">Text</p></body></html>');
    const violations = importantLetterSpacing.run(doc);
    expect(violations).toHaveLength(1);
  });

  it("skips aria-hidden elements", () => {
    const doc = makeDoc('<html><body><p aria-hidden="true" style="letter-spacing: 0.01em !important">Text</p></body></html>');
    expect(importantLetterSpacing.run(doc)).toHaveLength(0);
  });
});

describe("accesslint-051 (importantLineHeight)", () => {
  it("passes without inline styles", () => {
    const doc = makeDoc("<html><body><p>Text</p></body></html>");
    expect(importantLineHeight.run(doc)).toHaveLength(0);
  });

  it("passes line-height at threshold (1.5)", () => {
    const doc = makeDoc('<html><body><p style="line-height: 1.5 !important">Text</p></body></html>');
    expect(importantLineHeight.run(doc)).toHaveLength(0);
  });

  it("reports line-height below threshold with !important", () => {
    const doc = makeDoc('<html><body><p style="line-height: 1.1 !important">Text</p></body></html>');
    const violations = importantLineHeight.run(doc);
    expect(violations).toHaveLength(1);
    expect(violations[0].ruleId).toBe("accesslint-051");
    expect(violations[0].message).toContain("Line height");
  });

  it("reports line-height percentage below threshold", () => {
    const doc = makeDoc('<html><body><p style="line-height: 110% !important">Text</p></body></html>');
    const violations = importantLineHeight.run(doc);
    expect(violations).toHaveLength(1);
  });

  it("passes line-height percentage at threshold (150%)", () => {
    const doc = makeDoc('<html><body><p style="line-height: 150% !important">Text</p></body></html>');
    expect(importantLineHeight.run(doc)).toHaveLength(0);
  });
});

describe("accesslint-052 (importantWordSpacing)", () => {
  it("passes without inline styles", () => {
    const doc = makeDoc("<html><body><p>Text</p></body></html>");
    expect(importantWordSpacing.run(doc)).toHaveLength(0);
  });

  it("passes word-spacing at threshold (0.16em)", () => {
    const doc = makeDoc('<html><body><p style="word-spacing: 0.16em !important">Text</p></body></html>');
    expect(importantWordSpacing.run(doc)).toHaveLength(0);
  });

  it("reports word-spacing below threshold with !important", () => {
    const doc = makeDoc('<html><body><p style="word-spacing: 0.05em !important">Text</p></body></html>');
    const violations = importantWordSpacing.run(doc);
    expect(violations).toHaveLength(1);
    expect(violations[0].ruleId).toBe("important-word-spacing");
    expect(violations[0].message).toContain("word-spacing");
    expect(violations[0].message).toContain("!important");
  });

  it("passes word-spacing without !important", () => {
    const doc = makeDoc('<html><body><p style="word-spacing: 0.01em">Text</p></body></html>');
    expect(importantWordSpacing.run(doc)).toHaveLength(0);
  });

  it("reports normal with !important (effectively 0)", () => {
    const doc = makeDoc('<html><body><p style="word-spacing: normal !important">Text</p></body></html>');
    const violations = importantWordSpacing.run(doc);
    expect(violations).toHaveLength(1);
  });
});
