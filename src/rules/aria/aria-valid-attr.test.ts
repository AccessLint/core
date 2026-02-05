import { describe, it, expect } from "vitest";
import { ariaValidAttr } from "./aria-valid-attr";

function makeDoc(html: string): Document {
  return new DOMParser().parseFromString(html, "text/html");
}

describe("aria-valid-attr", () => {
  it("passes valid aria attributes", () => {
    const doc = makeDoc('<html><body><div aria-label="test"></div></body></html>');
    expect(ariaValidAttr.run(doc)).toHaveLength(0);
  });

  it("reports invalid aria attributes", () => {
    const doc = makeDoc('<html><body><div aria-foo="bar"></div></body></html>');
    expect(ariaValidAttr.run(doc)).toHaveLength(1);
    expect(ariaValidAttr.run(doc)[0].message).toContain("aria-foo");
  });
});
