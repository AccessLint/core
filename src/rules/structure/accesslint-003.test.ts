import { describe, it, expect } from "vitest";
import { makeDoc } from "../test-helpers";
import { accesslint003 } from "./accesslint-003";


describe("accesslint-003", () => {
  it("passes with h1 element", () => {
    const doc = makeDoc("<html><body><h1>Page Title</h1></body></html>");
    expect(accesslint003.run(doc)).toHaveLength(0);
  });

  it("passes with role=heading aria-level=1", () => {
    const doc = makeDoc('<html><body><div role="heading" aria-level="1">Page Title</div></body></html>');
    expect(accesslint003.run(doc)).toHaveLength(0);
  });

  it("reports missing h1", () => {
    const doc = makeDoc("<html><body><h2>Section</h2><p>Content</p></body></html>");
    const violations = accesslint003.run(doc);
    expect(violations).toHaveLength(1);
    expect(violations[0].ruleId).toBe("accesslint-003");
  });

  it("reports empty h1", () => {
    const doc = makeDoc("<html><body><h1></h1></body></html>");
    const violations = accesslint003.run(doc);
    expect(violations).toHaveLength(1);
  });

  it("passes with h1 that has aria-label", () => {
    const doc = makeDoc('<html><body><h1 aria-label="Page Title"></h1></body></html>');
    expect(accesslint003.run(doc)).toHaveLength(0);
  });
});
