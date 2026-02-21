import { describe, it, expect } from "vitest";
import { makeDoc } from "../test-helpers";
import {
  landmarkMain,
  landmarkNoDuplicateBanner,
  landmarkNoDuplicateContentinfo,
  landmarkNoDuplicateMain,
  landmarkBannerIsTopLevel,
  landmarkContentinfoIsTopLevel,
  landmarkMainIsTopLevel,
  landmarkComplementaryIsTopLevel,
  landmarkUnique,
  region,
} from "./landmark-rules";


describe("accesslint-036", () => {
  it("reports missing main landmark", () => {
    const doc = makeDoc("<html><body><div>Content</div></body></html>");
    const violations = landmarkMain.run(doc);
    expect(violations).toHaveLength(1);
    expect(violations[0].message).toContain("no main");
  });

  it("passes with main element", () => {
    const doc = makeDoc("<html><body><main>Content</main></body></html>");
    expect(landmarkMain.run(doc)).toHaveLength(0);
  });

  it("passes with role=main", () => {
    const doc = makeDoc('<html><body><div role="main">Content</div></body></html>');
    expect(landmarkMain.run(doc)).toHaveLength(0);
  });

  it("reports multiple main landmarks", () => {
    const doc = makeDoc("<html><body><main>One</main><main>Two</main></body></html>");
    const violations = landmarkMain.run(doc);
    expect(violations).toHaveLength(1);
    expect(violations[0].message).toContain("multiple");
  });
});

describe("accesslint-037", () => {
  it("passes with single header", () => {
    const doc = makeDoc("<html><body><header>Site header</header><main>Content</main></body></html>");
    expect(landmarkNoDuplicateBanner.run(doc)).toHaveLength(0);
  });

  it("reports duplicate top-level headers", () => {
    const doc = makeDoc("<html><body><header>One</header><header>Two</header></body></html>");
    const violations = landmarkNoDuplicateBanner.run(doc);
    expect(violations).toHaveLength(1);
  });

  it("ignores headers inside sectioning elements", () => {
    const doc = makeDoc("<html><body><header>Site</header><article><header>Article</header></article></body></html>");
    expect(landmarkNoDuplicateBanner.run(doc)).toHaveLength(0);
  });
});

describe("accesslint-038", () => {
  it("passes with single footer", () => {
    const doc = makeDoc("<html><body><main>Content</main><footer>Site footer</footer></body></html>");
    expect(landmarkNoDuplicateContentinfo.run(doc)).toHaveLength(0);
  });

  it("reports duplicate top-level footers", () => {
    const doc = makeDoc("<html><body><footer>One</footer><footer>Two</footer></body></html>");
    const violations = landmarkNoDuplicateContentinfo.run(doc);
    expect(violations).toHaveLength(1);
  });
});

describe("accesslint-039", () => {
  it("passes with single main", () => {
    const doc = makeDoc("<html><body><main>Content</main></body></html>");
    expect(landmarkNoDuplicateMain.run(doc)).toHaveLength(0);
  });

  it("reports duplicate mains", () => {
    const doc = makeDoc("<html><body><main>One</main><main>Two</main></body></html>");
    const violations = landmarkNoDuplicateMain.run(doc);
    expect(violations).toHaveLength(1);
  });
});

describe("accesslint-040", () => {
  it("passes for top-level banner", () => {
    const doc = makeDoc('<html><body><div role="banner">Header</div></body></html>');
    expect(landmarkBannerIsTopLevel.run(doc)).toHaveLength(0);
  });

  it("reports nested role=banner", () => {
    const doc = makeDoc('<html><body><main><div role="banner">Nested</div></main></body></html>');
    const violations = landmarkBannerIsTopLevel.run(doc);
    expect(violations).toHaveLength(1);
  });
});

describe("accesslint-041", () => {
  it("passes for top-level contentinfo", () => {
    const doc = makeDoc('<html><body><div role="contentinfo">Footer</div></body></html>');
    expect(landmarkContentinfoIsTopLevel.run(doc)).toHaveLength(0);
  });

  it("reports nested role=contentinfo", () => {
    const doc = makeDoc('<html><body><article><div role="contentinfo">Nested</div></article></body></html>');
    const violations = landmarkContentinfoIsTopLevel.run(doc);
    expect(violations).toHaveLength(1);
  });
});

describe("accesslint-042", () => {
  it("passes for top-level main", () => {
    const doc = makeDoc("<html><body><main>Content</main></body></html>");
    expect(landmarkMainIsTopLevel.run(doc)).toHaveLength(0);
  });

  it("passes for main inside bare section (no landmark role)", () => {
    const doc = makeDoc('<html><body><section id="primary"><main>Content</main></section></body></html>');
    expect(landmarkMainIsTopLevel.run(doc)).toHaveLength(0);
  });

  it("reports main nested in named section (region landmark)", () => {
    const doc = makeDoc('<html><body><section aria-label="Region"><main>Nested</main></section></body></html>');
    const violations = landmarkMainIsTopLevel.run(doc);
    expect(violations).toHaveLength(1);
  });

  it("reports main nested in article", () => {
    const doc = makeDoc("<html><body><article><main>Nested</main></article></body></html>");
    const violations = landmarkMainIsTopLevel.run(doc);
    expect(violations).toHaveLength(1);
  });
});

describe("accesslint-043", () => {
  it("passes for top-level aside", () => {
    const doc = makeDoc("<html><body><aside>Sidebar</aside></body></html>");
    expect(landmarkComplementaryIsTopLevel.run(doc)).toHaveLength(0);
  });

  it("passes for aside inside main", () => {
    const doc = makeDoc("<html><body><main><aside>Related</aside></main></body></html>");
    expect(landmarkComplementaryIsTopLevel.run(doc)).toHaveLength(0);
  });

  it("passes for aside inside bare section (no landmark role)", () => {
    const doc = makeDoc('<html><body><section><aside>Sidebar</aside></section></body></html>');
    expect(landmarkComplementaryIsTopLevel.run(doc)).toHaveLength(0);
  });

  it("reports aside nested in article", () => {
    const doc = makeDoc("<html><body><article><aside>Nested</aside></article></body></html>");
    const violations = landmarkComplementaryIsTopLevel.run(doc);
    expect(violations).toHaveLength(1);
  });
});

describe("accesslint-044", () => {
  it("passes with uniquely labeled navs", () => {
    const doc = makeDoc(`
      <html><body>
        <nav aria-label="Main">Links</nav>
        <nav aria-label="Footer">More links</nav>
      </body></html>
    `);
    expect(landmarkUnique.run(doc)).toHaveLength(0);
  });

  it("reports duplicate nav labels", () => {
    const doc = makeDoc(`
      <html><body>
        <nav aria-label="Navigation">Links</nav>
        <nav aria-label="Navigation">More links</nav>
      </body></html>
    `);
    const violations = landmarkUnique.run(doc);
    expect(violations).toHaveLength(1);
  });

  it("reports navs with same text content", () => {
    // Navs with same text content are considered duplicates
    const doc = makeDoc(`
      <html><body>
        <nav>Links</nav>
        <nav>Links</nav>
      </body></html>
    `);
    const violations = landmarkUnique.run(doc);
    expect(violations).toHaveLength(1);
  });

  it("passes with single nav", () => {
    const doc = makeDoc("<html><body><nav>Links</nav></body></html>");
    expect(landmarkUnique.run(doc)).toHaveLength(0);
  });
});

describe("accesslint-045", () => {
  it("passes when all content is in landmarks", () => {
    const doc = makeDoc(`
      <html><body>
        <header>Header</header>
        <main>Content</main>
        <footer>Footer</footer>
      </body></html>
    `);
    expect(region.run(doc)).toHaveLength(0);
  });

  it("reports content outside landmarks", () => {
    const doc = makeDoc(`
      <html><body>
        <div>Orphan content</div>
        <main>Main content</main>
      </body></html>
    `);
    const violations = region.run(doc);
    expect(violations).toHaveLength(1);
    expect(violations[0].ruleId).toBe("accesslint-045");
  });

  it("allows skip links outside landmarks", () => {
    const doc = makeDoc(`
      <html><body>
        <a href="#main">Skip to content</a>
        <main id="main">Content</main>
      </body></html>
    `);
    expect(region.run(doc)).toHaveLength(0);
  });

  it("allows wrapper divs containing landmarks", () => {
    const doc = makeDoc(`
      <html><body>
        <div class="wrapper">
          <main>Content</main>
        </div>
      </body></html>
    `);
    expect(region.run(doc)).toHaveLength(0);
  });
});
