import { describe, it, expect } from "vitest";
import { makeDoc } from "../test-helpers";
import { accesslint039 } from "./accesslint-039";


describe("accesslint-039", () => {
  it("passes with single main", () => {
    const doc = makeDoc("<html><body><main>Content</main></body></html>");
    expect(accesslint039.run(doc)).toHaveLength(0);
  });

  it("reports duplicate mains", () => {
    const doc = makeDoc("<html><body><main>One</main><main>Two</main></body></html>");
    const violations = accesslint039.run(doc);
    expect(violations).toHaveLength(1);
  });
});
