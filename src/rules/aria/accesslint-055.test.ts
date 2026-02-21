import { describe, it, expect } from "vitest";
import { makeDoc } from "../test-helpers";
import { accesslint055 } from "./accesslint-055";


describe("accesslint-055", () => {
  it("passes valid aria attributes", () => {
    const doc = makeDoc('<html><body><div aria-label="test"></div></body></html>');
    expect(accesslint055.run(doc)).toHaveLength(0);
  });

  it("reports invalid aria attributes", () => {
    const doc = makeDoc('<html><body><div aria-foo="bar"></div></body></html>');
    expect(accesslint055.run(doc)).toHaveLength(1);
    expect(accesslint055.run(doc)[0].message).toContain("aria-foo");
  });
});
