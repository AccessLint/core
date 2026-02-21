import { describe, it, expect } from "vitest";
import { makeDoc } from "../test-helpers";
import { accesslint046 } from "./accesslint-046";


describe("accesslint-046", () => {
  it("passes valid ul", () => {
    const doc = makeDoc("<html><body><ul><li>A</li><li>B</li></ul></body></html>");
    expect(accesslint046.run(doc)).toHaveLength(0);
  });

  it("reports non-li child in ul", () => {
    const doc = makeDoc("<html><body><ul><div>Bad</div></ul></body></html>");
    expect(accesslint046.run(doc)).toHaveLength(1);
  });

  it("reports bare text node in ul", () => {
    const doc = makeDoc("<html><body><ul>Bare text<li>Item</li></ul></body></html>");
    const violations = accesslint046.run(doc);
    expect(violations).toHaveLength(1);
    expect(violations[0].message).toContain("text");
    expect(violations[0].message).toContain("<li>");
  });

  it("passes ul with only whitespace text nodes", () => {
    const doc = makeDoc("<html><body><ul> <li>A</li> <li>B</li> </ul></body></html>");
    expect(accesslint046.run(doc)).toHaveLength(0);
  });
});
