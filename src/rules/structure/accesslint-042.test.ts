import { describe, it, expect } from "vitest";
import { makeDoc } from "../test-helpers";
import { accesslint042 } from "./accesslint-042";


describe("accesslint-042", () => {
  it("passes for top-level main", () => {
    const doc = makeDoc("<html><body><main>Content</main></body></html>");
    expect(accesslint042.run(doc)).toHaveLength(0);
  });

  it("passes for main inside bare section (no landmark role)", () => {
    const doc = makeDoc('<html><body><section id="primary"><main>Content</main></section></body></html>');
    expect(accesslint042.run(doc)).toHaveLength(0);
  });

  it("reports main nested in named section (region landmark)", () => {
    const doc = makeDoc('<html><body><section aria-label="Region"><main>Nested</main></section></body></html>');
    const violations = accesslint042.run(doc);
    expect(violations).toHaveLength(1);
  });

  it("reports main nested in article", () => {
    const doc = makeDoc("<html><body><article><main>Nested</main></article></body></html>");
    const violations = accesslint042.run(doc);
    expect(violations).toHaveLength(1);
  });
});
