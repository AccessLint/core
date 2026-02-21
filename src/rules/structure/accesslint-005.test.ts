import { describe, it, expect } from "vitest";
import { makeDoc } from "../test-helpers";
import { accesslint005 } from "./accesslint-005";


describe("accesslint-005", () => {
  it("passes when frame titles are unique", () => {
    const doc = makeDoc(`
      <html><body>
        <iframe src="a.html" title="Video player"></iframe>
        <iframe src="b.html" title="Chat widget"></iframe>
      </body></html>
    `);
    expect(accesslint005.run(doc)).toHaveLength(0);
  });

  it("reports duplicate frame titles", () => {
    const doc = makeDoc(`
      <html><body>
        <iframe src="a.html" title="Content"></iframe>
        <iframe src="b.html" title="Content"></iframe>
      </body></html>
    `);
    const violations = accesslint005.run(doc);
    expect(violations).toHaveLength(1);
    expect(violations[0].ruleId).toBe("accesslint-005");
  });

  it("reports multiple duplicates", () => {
    const doc = makeDoc(`
      <html><body>
        <iframe src="a.html" title="Frame"></iframe>
        <iframe src="b.html" title="Frame"></iframe>
        <iframe src="c.html" title="Frame"></iframe>
      </body></html>
    `);
    const violations = accesslint005.run(doc);
    expect(violations).toHaveLength(2);
  });

  it("is case-insensitive", () => {
    const doc = makeDoc(`
      <html><body>
        <iframe src="a.html" title="Video"></iframe>
        <iframe src="b.html" title="VIDEO"></iframe>
      </body></html>
    `);
    const violations = accesslint005.run(doc);
    expect(violations).toHaveLength(1);
  });

  it("passes with single frame", () => {
    const doc = makeDoc('<html><body><iframe src="page.html" title="Content"></iframe></body></html>');
    expect(accesslint005.run(doc)).toHaveLength(0);
  });
});
