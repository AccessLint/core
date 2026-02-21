import { describe, it, expect } from "vitest";
import { makeDoc } from "../test-helpers";
import { accesslint070 } from "./accesslint-070";


describe("accesslint-070", () => {
  it("passes tooltip with text content", () => {
    const doc = makeDoc('<div role="tooltip">Helpful hint</div>');
    expect(accesslint070.run(doc)).toHaveLength(0);
  });

  it("reports empty tooltip", () => {
    const doc = makeDoc('<div role="tooltip"></div>');
    const violations = accesslint070.run(doc);
    expect(violations).toHaveLength(1);
  });
});
