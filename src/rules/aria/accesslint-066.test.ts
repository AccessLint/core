import { describe, it, expect } from "vitest";
import { makeDoc } from "../test-helpers";
import { accesslint066 } from "./accesslint-066";


describe("accesslint-066", () => {
  it("passes checkbox with name", () => {
    const doc = makeDoc('<div role="checkbox" aria-checked="false">Subscribe</div>');
    expect(accesslint066.run(doc)).toHaveLength(0);
  });

  it("reports checkbox without name", () => {
    const doc = makeDoc('<div role="checkbox" aria-checked="false"></div>');
    const violations = accesslint066.run(doc);
    expect(violations).toHaveLength(1);
  });

  it("passes switch with aria-label", () => {
    const doc = makeDoc('<div role="switch" aria-checked="true" aria-label="Dark mode"></div>');
    expect(accesslint066.run(doc)).toHaveLength(0);
  });

  it("skips native checkboxes", () => {
    const doc = makeDoc('<input type="checkbox">');
    expect(accesslint066.run(doc)).toHaveLength(0);
  });
});
