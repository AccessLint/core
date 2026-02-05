import { describe, it, expect } from "vitest";
import { nestedInteractive, scrollableRegionFocusable } from "./interactive-rules";

function makeDoc(html: string): Document {
  return new DOMParser().parseFromString(html, "text/html");
}

describe("nested-interactive", () => {
  it("reports button inside link", () => {
    const doc = makeDoc('<a href="/page"><button>Click</button></a>');
    const violations = nestedInteractive.run(doc);
    expect(violations).toHaveLength(1);
    expect(violations[0].message).toContain("button");
    expect(violations[0].message).toContain("inside");
  });

  it("reports link inside button", () => {
    const doc = makeDoc('<button><a href="/page">Link</a></button>');
    const violations = nestedInteractive.run(doc);
    expect(violations).toHaveLength(1);
  });

  it("reports input inside link", () => {
    const doc = makeDoc('<a href="/page"><input type="text"></a>');
    const violations = nestedInteractive.run(doc);
    expect(violations).toHaveLength(1);
  });

  it("passes non-nested interactive elements", () => {
    const doc = makeDoc('<button>One</button><a href="/">Two</a>');
    expect(nestedInteractive.run(doc)).toHaveLength(0);
  });

  it("passes link without href (not interactive)", () => {
    const doc = makeDoc("<button><a>Not a link</a></button>");
    expect(nestedInteractive.run(doc)).toHaveLength(0);
  });

  it("reports elements with interactive roles", () => {
    const doc = makeDoc('<a href="/"><span role="button">Nested</span></a>');
    const violations = nestedInteractive.run(doc);
    expect(violations).toHaveLength(1);
  });

  it("reports elements with tabindex", () => {
    const doc = makeDoc('<button><span tabindex="0">Focusable</span></button>');
    const violations = nestedInteractive.run(doc);
    expect(violations).toHaveLength(1);
  });

  it("passes tabindex=-1 (not in tab order)", () => {
    const doc = makeDoc('<button><span tabindex="-1">Not in tab order</span></button>');
    expect(nestedInteractive.run(doc)).toHaveLength(0);
  });

  it("skips disabled elements", () => {
    const doc = makeDoc('<a href="/"><button disabled>Disabled</button></a>');
    expect(nestedInteractive.run(doc)).toHaveLength(0);
  });

  it("skips aria-hidden elements", () => {
    const doc = makeDoc('<a href="/"><button aria-hidden="true">Hidden</button></a>');
    expect(nestedInteractive.run(doc)).toHaveLength(0);
  });

  // --- Native composite widgets: child elements belong inside their parent ---

  it("passes option inside select", () => {
    const doc = makeDoc('<select><option>A</option><option>B</option></select>');
    expect(nestedInteractive.run(doc)).toHaveLength(0);
  });

  it("passes optgroup with options inside select", () => {
    const doc = makeDoc('<select><optgroup label="Group"><option>A</option></optgroup></select>');
    expect(nestedInteractive.run(doc)).toHaveLength(0);
  });

  it("passes summary inside details", () => {
    const doc = makeDoc("<details><summary>Toggle</summary><p>Content</p></details>");
    expect(nestedInteractive.run(doc)).toHaveLength(0);
  });

  // --- ARIA composite widgets: child roles belong inside their parent ---

  it("passes role=option inside role=listbox", () => {
    const doc = makeDoc(
      '<div role="listbox"><div role="option">A</div><div role="option">B</div></div>'
    );
    expect(nestedInteractive.run(doc)).toHaveLength(0);
  });

  it("passes role=menuitem inside role=menu", () => {
    const doc = makeDoc(
      '<div role="menu"><div role="menuitem">Cut</div><div role="menuitem">Copy</div></div>'
    );
    expect(nestedInteractive.run(doc)).toHaveLength(0);
  });

  it("passes role=tab inside role=tablist", () => {
    const doc = makeDoc(
      '<div role="tablist"><button role="tab">Tab 1</button><button role="tab">Tab 2</button></div>'
    );
    expect(nestedInteractive.run(doc)).toHaveLength(0);
  });

  it("passes role=treeitem inside role=tree", () => {
    const doc = makeDoc(
      '<div role="tree"><div role="treeitem" tabindex="0">Node</div></div>'
    );
    expect(nestedInteractive.run(doc)).toHaveLength(0);
  });

  // --- True violations: interactive controls wrongly nested ---

  it("reports button inside another button", () => {
    const doc = makeDoc("<button>Outer<button>Inner</button></button>");
    const violations = nestedInteractive.run(doc);
    expect(violations.length).toBeGreaterThanOrEqual(1);
  });

  it("reports select inside a link", () => {
    const doc = makeDoc('<a href="/"><select><option>A</option></select></a>');
    const violations = nestedInteractive.run(doc);
    expect(violations).toHaveLength(1);
    expect(violations[0].message).toContain("select");
  });

  it("reports contenteditable inside button", () => {
    const doc = makeDoc('<button><span contenteditable="true">Edit</span></button>');
    const violations = nestedInteractive.run(doc);
    expect(violations).toHaveLength(1);
  });
});

describe("scrollable-region-focusable", () => {
  it("passes scrollable region with tabindex", () => {
    const doc = makeDoc(`
      <div style="overflow: auto; height: 100px;" tabindex="0">
        <div style="height: 200px;">Tall content</div>
      </div>
    `);
    // Note: In JSDOM/happy-dom, computed styles may not work as expected
    // This test verifies the rule logic
    expect(scrollableRegionFocusable.run(doc)).toHaveLength(0);
  });

  it("passes scrollable region with focusable child", () => {
    const doc = makeDoc(`
      <div style="overflow: auto; height: 100px;">
        <button>Focusable child</button>
      </div>
    `);
    expect(scrollableRegionFocusable.run(doc)).toHaveLength(0);
  });

  it("passes non-scrollable region", () => {
    const doc = makeDoc('<div style="overflow: hidden;">Content</div>');
    expect(scrollableRegionFocusable.run(doc)).toHaveLength(0);
  });

  it("skips aria-hidden regions", () => {
    const doc = makeDoc('<div style="overflow: scroll;" aria-hidden="true">Hidden</div>');
    expect(scrollableRegionFocusable.run(doc)).toHaveLength(0);
  });
});
