import { describe, it, expect } from "vitest";
import { htmlLangValid } from "./html-lang-valid";

function makeDoc(html: string): Document {
  return new DOMParser().parseFromString(html, "text/html");
}

describe("accesslint-081", () => {
  it("passes valid lang", () => {
    const doc = makeDoc('<html lang="en"><body></body></html>');
    expect(htmlLangValid.run(doc)).toHaveLength(0);
  });

  it("passes valid lang with region", () => {
    const doc = makeDoc('<html lang="en-US"><body></body></html>');
    expect(htmlLangValid.run(doc)).toHaveLength(0);
  });

  it("reports invalid lang", () => {
    const doc = makeDoc('<html lang="xyz123"><body></body></html>');
    expect(htmlLangValid.run(doc)).toHaveLength(1);
  });
});
