import { describe, it, expect } from "vitest";
import { makeDoc } from "../test-helpers";
import { accesslint009 } from "./accesslint-009";


describe("accesslint-009", () => {
  it("reports blink element", () => {
    const doc = makeDoc("<html><body><blink>Attention!</blink></body></html>");
    const violations = accesslint009.run(doc);
    expect(violations).toHaveLength(1);
    expect(violations[0].ruleId).toBe("accesslint-009");
  });

  it("passes without blink element", () => {
    const doc = makeDoc("<html><body><p>Normal text</p></body></html>");
    expect(accesslint009.run(doc)).toHaveLength(0);
  });

  it("skips aria-hidden blink", () => {
    const doc = makeDoc('<html><body><blink aria-hidden="true">Hidden</blink></body></html>');
    expect(accesslint009.run(doc)).toHaveLength(0);
  });
});
