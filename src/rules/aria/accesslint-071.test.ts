import { describe, it, expect } from "vitest";
import { makeDoc } from "../test-helpers";
import { accesslint071 } from "./accesslint-071";


describe("accesslint-071", () => {
  it("passes treeitem with text", () => {
    const doc = makeDoc('<div role="treeitem">Documents</div>');
    expect(accesslint071.run(doc)).toHaveLength(0);
  });

  it("reports treeitem without name", () => {
    const doc = makeDoc('<div role="treeitem"></div>');
    const violations = accesslint071.run(doc);
    expect(violations).toHaveLength(1);
  });
});
