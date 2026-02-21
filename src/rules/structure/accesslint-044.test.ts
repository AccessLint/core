import { describe, it, expect } from "vitest";
import { makeDoc } from "../test-helpers";
import { accesslint044 } from "./accesslint-044";


describe("accesslint-044", () => {
  it("passes with uniquely labeled navs", () => {
    const doc = makeDoc(`
      <html><body>
        <nav aria-label="Main">Links</nav>
        <nav aria-label="Footer">More links</nav>
      </body></html>
    `);
    expect(accesslint044.run(doc)).toHaveLength(0);
  });

  it("reports duplicate nav labels", () => {
    const doc = makeDoc(`
      <html><body>
        <nav aria-label="Navigation">Links</nav>
        <nav aria-label="Navigation">More links</nav>
      </body></html>
    `);
    const violations = accesslint044.run(doc);
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
    const violations = accesslint044.run(doc);
    expect(violations).toHaveLength(1);
  });

  it("passes with single nav", () => {
    const doc = makeDoc("<html><body><nav>Links</nav></body></html>");
    expect(accesslint044.run(doc)).toHaveLength(0);
  });
});
