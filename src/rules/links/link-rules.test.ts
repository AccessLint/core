import { describe, it, expect, afterEach } from "vitest";
import { linkInTextBlock } from "./link-rules";
import { clearColorCaches } from "../utils/color";

function makeDoc(html: string): Document {
  return new DOMParser().parseFromString(html, "text/html");
}

describe("link-in-text-block", () => {
  afterEach(() => {
    clearColorCaches();
  });

  // --- Pass cases ---

  it("passes: link with underline", () => {
    const doc = makeDoc(
      '<body><p style="color: rgb(0,0,0);">Some text <a href="/page" style="color: rgb(0,0,0); text-decoration: underline;">link</a> more text</p></body>'
    );
    expect(linkInTextBlock.run(doc)).toHaveLength(0);
  });

  it("passes: link with border-bottom", () => {
    const doc = makeDoc(
      '<body><p style="color: rgb(0,0,0);">Some text <a href="/page" style="color: rgb(0,0,0); text-decoration: none; border-bottom: 1px solid black;">link</a> more text</p></body>'
    );
    expect(linkInTextBlock.run(doc)).toHaveLength(0);
  });

  it("passes: link with bold (font-weight difference >= 300)", () => {
    const doc = makeDoc(
      '<body><p style="color: rgb(0,0,0); font-weight: 400;">Some text <a href="/page" style="color: rgb(0,0,0); text-decoration: none; font-weight: 700;">link</a> more text</p></body>'
    );
    expect(linkInTextBlock.run(doc)).toHaveLength(0);
  });

  it("passes: link with italic font-style", () => {
    const doc = makeDoc(
      '<body><p style="color: rgb(0,0,0); font-style: normal;">Some text <a href="/page" style="color: rgb(0,0,0); text-decoration: none; font-style: italic;">link</a> more text</p></body>'
    );
    expect(linkInTextBlock.run(doc)).toHaveLength(0);
  });

  it("passes: link with sufficient 3:1 contrast with surrounding text", () => {
    // Blue (#0000ff) on black (#000000): blue luminance ~0.0722, black ~0
    // ratio = (0.0722 + 0.05) / (0 + 0.05) = 2.44 — not enough
    // Use a brighter contrast: #0066cc on #000000
    // Let's use red (#ff0000) on black — red luminance = 0.2126, ratio = (0.2126+0.05)/(0+0.05) = 5.25
    const doc = makeDoc(
      '<body><p style="color: rgb(0,0,0);">Some text <a href="/page" style="color: rgb(255,0,0); text-decoration: none;">link</a> more text</p></body>'
    );
    expect(linkInTextBlock.run(doc)).toHaveLength(0);
  });

  it("passes: link is the sole content in block (no surrounding text)", () => {
    const doc = makeDoc(
      '<body><p><a href="/page" style="color: rgb(0,0,0); text-decoration: none;">link only</a></p></body>'
    );
    expect(linkInTextBlock.run(doc)).toHaveLength(0);
  });

  it("passes: block-level link (display: block)", () => {
    const doc = makeDoc(
      '<body><p style="color: rgb(0,0,0);">Some text</p><a href="/page" style="display: block; color: rgb(0,0,0); text-decoration: none;">block link</a></body>'
    );
    expect(linkInTextBlock.run(doc)).toHaveLength(0);
  });

  it("passes: aria-hidden link", () => {
    const doc = makeDoc(
      '<body><p style="color: rgb(0,0,0);">Some text <a href="/page" aria-hidden="true" style="color: rgb(0,0,0); text-decoration: none;">hidden</a> more text</p></body>'
    );
    expect(linkInTextBlock.run(doc)).toHaveLength(0);
  });

  it("passes: image-only link (no text content)", () => {
    const doc = makeDoc(
      '<body><p style="color: rgb(0,0,0);">Some text <a href="/page" style="text-decoration: none;"><img src="icon.png" alt=""></a> more text</p></body>'
    );
    expect(linkInTextBlock.run(doc)).toHaveLength(0);
  });

  it("passes: link with larger font size (1.2x ratio)", () => {
    const doc = makeDoc(
      '<body><p style="color: rgb(0,0,0); font-size: 16px;">Some text <a href="/page" style="color: rgb(0,0,0); text-decoration: none; font-size: 20px;">link</a> more text</p></body>'
    );
    expect(linkInTextBlock.run(doc)).toHaveLength(0);
  });

  // --- Fail cases ---

  it("fails: no underline, same color as surrounding text", () => {
    const doc = makeDoc(
      '<body><p style="color: rgb(0,0,0);">Some text <a href="/page" style="color: rgb(0,0,0); text-decoration-line: none;">link</a> more text</p></body>'
    );
    const violations = linkInTextBlock.run(doc);
    expect(violations).toHaveLength(1);
    expect(violations[0].ruleId).toBe("link-in-text-block");
    expect(violations[0].impact).toBe("serious");
  });

  it("fails: no visual distinction with less than 3:1 contrast", () => {
    // rgb(0,0,0) vs rgb(30,30,30): both very dark, ratio close to 1:1
    const doc = makeDoc(
      '<body><p style="color: rgb(0,0,0);">Some text <a href="/page" style="color: rgb(30,30,30); text-decoration-line: none;">link</a> more text</p></body>'
    );
    const violations = linkInTextBlock.run(doc);
    expect(violations).toHaveLength(1);
    expect(violations[0].context).toContain("ratio:");
    expect(violations[0].context).toContain("link color:");
    expect(violations[0].context).toContain("surrounding text:");
  });

  it("fails: text-decoration: none with no other visual cue", () => {
    const doc = makeDoc(
      '<body><p style="color: rgb(100,100,100);">Paragraph text <a href="/page" style="color: rgb(100,100,100); text-decoration: none;">link text</a> and more</p></body>'
    );
    const violations = linkInTextBlock.run(doc);
    expect(violations).toHaveLength(1);
  });
});
