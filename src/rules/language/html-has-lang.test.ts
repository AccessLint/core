import { describe, it, expect } from "vitest";
import { htmlHasLang, htmlLangValid } from "./html-has-lang";

function makeDoc(html: string): Document {
  return new DOMParser().parseFromString(html, "text/html");
}

describe("accesslint-080", () => {
  it("reports missing lang", () => {
    const doc = makeDoc("<html><body></body></html>");
    expect(htmlHasLang.run(doc)).toHaveLength(1);
  });

  it("returns 'html' as the selector", () => {
    const doc = makeDoc("<html><body></body></html>");
    const violations = htmlHasLang.run(doc);
    expect(violations[0].selector).toBe("html");
  });

  it("passes with lang", () => {
    const doc = makeDoc('<html lang="en"><body></body></html>');
    expect(htmlHasLang.run(doc)).toHaveLength(0);
  });

  it("reports empty lang", () => {
    const doc = makeDoc('<html lang=""><body></body></html>');
    expect(htmlHasLang.run(doc)).toHaveLength(1);
  });
});

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
