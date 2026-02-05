import { describe, it, expect } from "vitest";
import { linkName } from "./link-name";

function makeDoc(html: string): Document {
  return new DOMParser().parseFromString(html, "text/html");
}

describe("link-name", () => {
  it("reports empty links", () => {
    const doc = makeDoc('<html><body><a href="/page"></a></body></html>');
    expect(linkName.run(doc)).toHaveLength(1);
  });

  it("passes links with text", () => {
    const doc = makeDoc('<html><body><a href="/page">About</a></body></html>');
    expect(linkName.run(doc)).toHaveLength(0);
  });

  it("passes links with aria-label", () => {
    const doc = makeDoc('<html><body><a href="/page" aria-label="About us"></a></body></html>');
    expect(linkName.run(doc)).toHaveLength(0);
  });

  it("passes links with img alt inside", () => {
    const doc = makeDoc('<html><body><a href="/page"><img src="x.png" alt="Logo"></a></body></html>');
    expect(linkName.run(doc)).toHaveLength(0);
  });
});
