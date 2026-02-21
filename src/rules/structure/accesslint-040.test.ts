import { describe, it, expect } from "vitest";
import { makeDoc } from "../test-helpers";
import { accesslint040 } from "./accesslint-040";


describe("accesslint-040", () => {
  it("passes for top-level banner", () => {
    const doc = makeDoc('<html><body><div role="banner">Header</div></body></html>');
    expect(accesslint040.run(doc)).toHaveLength(0);
  });

  it("reports nested role=banner", () => {
    const doc = makeDoc('<html><body><main><div role="banner">Nested</div></main></body></html>');
    const violations = accesslint040.run(doc);
    expect(violations).toHaveLength(1);
  });
});
