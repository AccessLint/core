import { describe, it, expect } from "vitest";
import { makeDoc } from "../test-helpers";
import { accesslint002 } from "./accesslint-002";


describe("accesslint-002", () => {
  it("passes with main landmark", () => {
    const doc = makeDoc("<html><body><main>Content</main></body></html>");
    expect(accesslint002.run(doc)).toHaveLength(0);
  });

  it("passes with role=main", () => {
    const doc = makeDoc('<html><body><div role="main">Content</div></body></html>');
    expect(accesslint002.run(doc)).toHaveLength(0);
  });

  it("passes with skip link", () => {
    const doc = makeDoc('<html><body><a href="#main">Skip to content</a><nav>Nav</nav><div id="main">Content</div></body></html>');
    expect(accesslint002.run(doc)).toHaveLength(0);
  });

  it("passes with headings", () => {
    const doc = makeDoc("<html><body><h1>Main content</h1><p>Text</p></body></html>");
    expect(accesslint002.run(doc)).toHaveLength(0);
  });

  it("reports page with no accesslint002 mechanism", () => {
    const doc = makeDoc("<html><body><div>Just content</div></body></html>");
    const violations = accesslint002.run(doc);
    expect(violations).toHaveLength(1);
    expect(violations[0].ruleId).toBe("accesslint-002");
  });
});
