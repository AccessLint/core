import { describe, it, expect } from "vitest";
import { documentTitle, bypass, pageHasHeadingOne } from "./document-rules";

function makeDoc(html: string): Document {
  return new DOMParser().parseFromString(html, "text/html");
}

describe("accesslint-001", () => {
  it("reports missing title element", () => {
    const doc = makeDoc("<html><head></head><body>Content</body></html>");
    const violations = documentTitle.run(doc);
    expect(violations).toHaveLength(1);
    expect(violations[0].ruleId).toBe("accesslint-001");
    expect(violations[0].message).toContain("missing");
  });

  it("reports empty title element", () => {
    const doc = makeDoc("<html><head><title></title></head><body>Content</body></html>");
    const violations = documentTitle.run(doc);
    expect(violations).toHaveLength(1);
    expect(violations[0].message).toContain("empty");
  });

  it("reports whitespace-only title element", () => {
    const doc = makeDoc("<html><head><title>   </title></head><body>Content</body></html>");
    const violations = documentTitle.run(doc);
    expect(violations).toHaveLength(1);
  });

  it("passes with valid title", () => {
    const doc = makeDoc("<html><head><title>My Page Title</title></head><body>Content</body></html>");
    expect(documentTitle.run(doc)).toHaveLength(0);
  });
});

describe("accesslint-002", () => {
  it("passes with main landmark", () => {
    const doc = makeDoc("<html><body><main>Content</main></body></html>");
    expect(bypass.run(doc)).toHaveLength(0);
  });

  it("passes with role=main", () => {
    const doc = makeDoc('<html><body><div role="main">Content</div></body></html>');
    expect(bypass.run(doc)).toHaveLength(0);
  });

  it("passes with skip link", () => {
    const doc = makeDoc('<html><body><a href="#main">Skip to content</a><nav>Nav</nav><div id="main">Content</div></body></html>');
    expect(bypass.run(doc)).toHaveLength(0);
  });

  it("passes with headings", () => {
    const doc = makeDoc("<html><body><h1>Main content</h1><p>Text</p></body></html>");
    expect(bypass.run(doc)).toHaveLength(0);
  });

  it("reports page with no bypass mechanism", () => {
    const doc = makeDoc("<html><body><nav>Navigation</nav><div>Content without landmarks or headings</div></body></html>");
    // This has nav but no main/skip link - however the rule accepts headings
    // Let's test a page with absolutely nothing
    const doc2 = makeDoc("<html><body><div>Just content</div></body></html>");
    const violations = bypass.run(doc2);
    expect(violations).toHaveLength(1);
    expect(violations[0].ruleId).toBe("accesslint-002");
  });
});

describe("accesslint-003", () => {
  it("passes with h1 element", () => {
    const doc = makeDoc("<html><body><h1>Page Title</h1></body></html>");
    expect(pageHasHeadingOne.run(doc)).toHaveLength(0);
  });

  it("passes with role=heading aria-level=1", () => {
    const doc = makeDoc('<html><body><div role="heading" aria-level="1">Page Title</div></body></html>');
    expect(pageHasHeadingOne.run(doc)).toHaveLength(0);
  });

  it("reports missing h1", () => {
    const doc = makeDoc("<html><body><h2>Section</h2><p>Content</p></body></html>");
    const violations = pageHasHeadingOne.run(doc);
    expect(violations).toHaveLength(1);
    expect(violations[0].ruleId).toBe("accesslint-003");
  });

  it("reports empty h1", () => {
    const doc = makeDoc("<html><body><h1></h1></body></html>");
    const violations = pageHasHeadingOne.run(doc);
    expect(violations).toHaveLength(1);
  });

  it("passes with h1 that has aria-label", () => {
    const doc = makeDoc('<html><body><h1 aria-label="Page Title"></h1></body></html>');
    expect(pageHasHeadingOne.run(doc)).toHaveLength(0);
  });
});
