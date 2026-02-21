import { describe, it, expect } from "vitest";
import { makeDoc } from "../test-helpers";
import { accesslint038 } from "./accesslint-038";


describe("accesslint-038", () => {
  it("passes with single footer", () => {
    const doc = makeDoc("<html><body><main>Content</main><footer>Site footer</footer></body></html>");
    expect(accesslint038.run(doc)).toHaveLength(0);
  });

  it("reports duplicate top-level footers", () => {
    const doc = makeDoc("<html><body><footer>One</footer><footer>Two</footer></body></html>");
    const violations = accesslint038.run(doc);
    expect(violations).toHaveLength(1);
  });
});
