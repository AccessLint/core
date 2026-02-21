import { describe, it, expect } from "vitest";
import { makeDoc } from "../test-helpers";
import { accesslint043 } from "./accesslint-043";


describe("accesslint-043", () => {
  it("passes for top-level aside", () => {
    const doc = makeDoc("<html><body><aside>Sidebar</aside></body></html>");
    expect(accesslint043.run(doc)).toHaveLength(0);
  });

  it("passes for aside inside main", () => {
    const doc = makeDoc("<html><body><main><aside>Related</aside></main></body></html>");
    expect(accesslint043.run(doc)).toHaveLength(0);
  });

  it("passes for aside inside bare section (no landmark role)", () => {
    const doc = makeDoc('<html><body><section><aside>Sidebar</aside></section></body></html>');
    expect(accesslint043.run(doc)).toHaveLength(0);
  });

  it("reports aside nested in article", () => {
    const doc = makeDoc("<html><body><article><aside>Nested</aside></article></body></html>");
    const violations = accesslint043.run(doc);
    expect(violations).toHaveLength(1);
  });
});
