import { describe, it, expect, afterEach } from "vitest";
import { colorContrast } from "./color-contrast";
import { clearColorCaches } from "../utils/color";

function makeDoc(html: string): Document {
  const doc = new DOMParser().parseFromString(html, "text/html");
  return doc;
}

describe("color-contrast", () => {
  afterEach(() => {
    clearColorCaches();
  });

  it("fails: black text on dark gray background (insufficient contrast)", () => {
    const doc = makeDoc(
      '<body><p style="color: rgb(0, 0, 0); background-color: rgb(50, 50, 50);">Low contrast</p></body>'
    );
    const violations = colorContrast.run(doc);
    expect(violations).toHaveLength(1);
    expect(violations[0].ruleId).toBe("color-contrast");
    expect(violations[0].impact).toBe("serious");
    expect(violations[0].context).toContain("foreground: #000000 rgb(0, 0, 0)");
    expect(violations[0].context).toContain("background: #323232 rgb(50, 50, 50)");
  });

  it("passes: black text on white background", () => {
    const doc = makeDoc(
      '<body><p style="color: rgb(0, 0, 0); background-color: rgb(255, 255, 255);">Good contrast</p></body>'
    );
    expect(colorContrast.run(doc)).toHaveLength(0);
  });

  it("passes: large text with 3:1 ratio threshold", () => {
    // Large text (>=24px) only requires 3:1 ratio
    // rgb(119,119,119) on white gives ~4.17:1 — passes 3:1 for large text
    const doc = makeDoc(
      '<body><p style="color: rgb(119, 119, 119); background-color: rgb(255, 255, 255); font-size: 24px;">Large text</p></body>'
    );
    expect(colorContrast.run(doc)).toHaveLength(0);
  });

  it("passes: bold large text (>=18.66px bold) with 3:1 ratio threshold", () => {
    const doc = makeDoc(
      '<body><p style="color: rgb(119, 119, 119); background-color: rgb(255, 255, 255); font-size: 19px; font-weight: 700;">Bold large text</p></body>'
    );
    expect(colorContrast.run(doc)).toHaveLength(0);
  });

  it("skips: elements with display:none", () => {
    const doc = makeDoc(
      '<body><p style="color: rgb(200, 200, 200); background-color: rgb(200, 200, 200); display: none;">Hidden</p></body>'
    );
    expect(colorContrast.run(doc)).toHaveLength(0);
  });

  it("skips: elements with aria-hidden=true", () => {
    const doc = makeDoc(
      '<body><p aria-hidden="true" style="color: rgb(200, 200, 200); background-color: rgb(200, 200, 200);">Hidden from AT</p></body>'
    );
    expect(colorContrast.run(doc)).toHaveLength(0);
  });

  it("skips: elements with visibility:hidden", () => {
    const doc = makeDoc(
      '<body><p style="color: rgb(200, 200, 200); background-color: rgb(200, 200, 200); visibility: hidden;">Hidden</p></body>'
    );
    expect(colorContrast.run(doc)).toHaveLength(0);
  });

  it("skips: visually hidden elements (clip rect)", () => {
    const doc = makeDoc(
      '<body><label style="position: absolute; width: 1px; height: 1px; clip: rect(0, 0, 0, 0); overflow: hidden; color: rgb(255, 255, 255);">SR only</label></body>'
    );
    expect(colorContrast.run(doc)).toHaveLength(0);
  });

  it("skips: visually hidden elements (clip-path inset)", () => {
    const doc = makeDoc(
      '<body><span style="position: absolute; clip-path: inset(50%); color: rgb(255, 255, 255);">SR only</span></body>'
    );
    expect(colorContrast.run(doc)).toHaveLength(0);
  });

  it("skips: visually hidden elements (1px with overflow hidden)", () => {
    const doc = makeDoc(
      '<body><span style="position: absolute; width: 1px; height: 1px; overflow: hidden; color: rgb(255, 255, 255);">SR only</span></body>'
    );
    expect(colorContrast.run(doc)).toHaveLength(0);
  });

  it("skips: elements with background images (no false positive)", () => {
    const doc = makeDoc(
      '<body><p style="color: rgb(0, 0, 0); background-image: url(bg.png);">Over image</p></body>'
    );
    expect(colorContrast.run(doc)).toHaveLength(0);
  });

  it("skips: text inside ancestor with background image", () => {
    const doc = makeDoc(
      '<body><div style="background-image: url(hero.jpg);"><h1 style="color: rgb(255, 255, 255);">White text over image</h1></div></body>'
    );
    expect(colorContrast.run(doc)).toHaveLength(0);
  });

  it("skips: disabled form elements", () => {
    const doc = makeDoc(
      '<body><input disabled style="color: rgb(200, 200, 200); background-color: rgb(200, 200, 200);" value="Disabled input"></body>'
    );
    expect(colorContrast.run(doc)).toHaveLength(0);
  });

  it("skips: whitespace-only text nodes", () => {
    const doc = makeDoc(
      '<body><div style="color: rgb(200, 200, 200); background-color: rgb(200, 200, 200);">   </div></body>'
    );
    expect(colorContrast.run(doc)).toHaveLength(0);
  });

  it("reports correct ratio and colors in violation context", () => {
    const doc = makeDoc(
      '<body><span style="color: rgb(100, 100, 100); background-color: rgb(120, 120, 120);">Low</span></body>'
    );
    const violations = colorContrast.run(doc);
    expect(violations).toHaveLength(1);
    expect(violations[0].context).toMatch(/ratio: \d+\.\d+:1/);
    expect(violations[0].context).toContain("foreground: #646464 rgb(100, 100, 100)");
    expect(violations[0].context).toContain("background: #787878 rgb(120, 120, 120)");
  });

  it("checks each element only once even with multiple text nodes", () => {
    const doc = makeDoc(
      '<body><p style="color: rgb(100, 100, 100); background-color: rgb(120, 120, 120);">First <em style="color: rgb(100, 100, 100); background-color: rgb(120, 120, 120);">second</em></p></body>'
    );
    const violations = colorContrast.run(doc);
    // p and em are separate elements — each reported at most once
    expect(violations).toHaveLength(2);
  });

  it("skips: script and style tags", () => {
    const doc = makeDoc(
      "<body><script>var x = 1;</script><style>.foo { color: red; }</style></body>"
    );
    expect(colorContrast.run(doc)).toHaveLength(0);
  });

  it("skips: absolutely positioned text over sibling img in positioning context", () => {
    const doc = makeDoc(
      '<body><div style="position: relative;">' +
        '<img src="hero.jpg">' +
        '<h1 style="position: absolute; top: 0; color: rgb(255, 255, 255);">Overlay</h1>' +
        "</div></body>"
    );
    expect(colorContrast.run(doc)).toHaveLength(0);
  });

  it("skips: text over absolutely positioned sibling img", () => {
    const doc = makeDoc(
      '<body><div style="position: relative;">' +
        '<img src="hero.jpg" style="position: absolute; top: 0; left: 0;">' +
        '<p style="color: rgb(255, 255, 255);">Caption</p>' +
        "</div></body>"
    );
    expect(colorContrast.run(doc)).toHaveLength(0);
  });

  it("skips: absolutely positioned text over sibling video", () => {
    const doc = makeDoc(
      '<body><div style="position: relative;">' +
        "<video></video>" +
        '<p style="position: absolute; color: rgb(255, 255, 255);">Over video</p>' +
        "</div></body>"
    );
    expect(colorContrast.run(doc)).toHaveLength(0);
  });

  it("fails: modern space-separated rgb syntax (CSS Color Level 4)", () => {
    const doc = makeDoc(
      '<body><p style="color: rgb(0 0 0); background-color: rgb(50 50 50);">Low contrast</p></body>'
    );
    const violations = colorContrast.run(doc);
    expect(violations).toHaveLength(1);
    expect(violations[0].ruleId).toBe("color-contrast");
  });

  it("passes: modern space-separated rgb syntax with good contrast", () => {
    const doc = makeDoc(
      '<body><p style="color: rgb(0 0 0); background-color: rgb(255 255 255);">Good contrast</p></body>'
    );
    expect(colorContrast.run(doc)).toHaveLength(0);
  });

  it("fails: modern rgb syntax with alpha (CSS Color Level 4)", () => {
    const doc = makeDoc(
      '<body><p style="color: rgb(0 0 0 / 1); background-color: rgb(50 50 50 / 1);">Low contrast</p></body>'
    );
    const violations = colorContrast.run(doc);
    expect(violations).toHaveLength(1);
  });

  it("skips: modern rgb syntax with zero alpha foreground", () => {
    const doc = makeDoc(
      '<body><p style="color: rgb(0 0 0 / 0); background-color: rgb(50 50 50);">Transparent text</p></body>'
    );
    expect(colorContrast.run(doc)).toHaveLength(0);
  });

  it("does not skip: normal-flow text with normal-flow sibling img", () => {
    // Neither the text nor the image is positioned — no overlap possible
    const doc = makeDoc(
      '<body><div style="position: relative;">' +
        '<img src="photo.jpg">' +
        '<p style="color: rgb(200, 200, 200); background-color: rgb(200, 200, 200);">Not overlapping</p>' +
        "</div></body>"
    );
    expect(colorContrast.run(doc)).toHaveLength(1);
  });
});
