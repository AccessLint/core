import { describe, it, expect } from "vitest";
import { tabindex } from "./tabindex";

function makeDoc(html: string): Document {
  return new DOMParser().parseFromString(html, "text/html");
}

describe("accesslint-027", () => {
  it("reports positive tabindex", () => {
    const doc = makeDoc('<html><body><div tabindex="5">X</div></body></html>');
    expect(tabindex.run(doc)).toHaveLength(1);
  });

  it("passes tabindex=0", () => {
    const doc = makeDoc('<html><body><div tabindex="0">X</div></body></html>');
    expect(tabindex.run(doc)).toHaveLength(0);
  });

  it("passes tabindex=-1", () => {
    const doc = makeDoc('<html><body><div tabindex="-1">X</div></body></html>');
    expect(tabindex.run(doc)).toHaveLength(0);
  });
});
