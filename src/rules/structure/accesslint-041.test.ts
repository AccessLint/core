import { describe, it, expect } from "vitest";
import { makeDoc } from "../test-helpers";
import { accesslint041 } from "./accesslint-041";


describe("accesslint-041", () => {
  it("passes for top-level contentinfo", () => {
    const doc = makeDoc('<html><body><div role="contentinfo">Footer</div></body></html>');
    expect(accesslint041.run(doc)).toHaveLength(0);
  });

  it("reports nested role=contentinfo", () => {
    const doc = makeDoc('<html><body><article><div role="contentinfo">Nested</div></article></body></html>');
    const violations = accesslint041.run(doc);
    expect(violations).toHaveLength(1);
  });
});
