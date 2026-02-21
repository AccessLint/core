import { describe, it, expect } from "vitest";
import { makeDoc } from "../test-helpers";
import { accesslint010 } from "./accesslint-010";


describe("accesslint-010", () => {
  it("reports marquee element", () => {
    const doc = makeDoc("<html><body><marquee>Scrolling text</marquee></body></html>");
    const violations = accesslint010.run(doc);
    expect(violations).toHaveLength(1);
    expect(violations[0].ruleId).toBe("accesslint-010");
  });

  it("passes without marquee element", () => {
    const doc = makeDoc("<html><body><p>Static text</p></body></html>");
    expect(accesslint010.run(doc)).toHaveLength(0);
  });

  it("skips aria-hidden marquee", () => {
    const doc = makeDoc('<html><body><marquee aria-hidden="true">Hidden</marquee></body></html>');
    expect(accesslint010.run(doc)).toHaveLength(0);
  });

  it("reports multiple marquee elements", () => {
    const doc = makeDoc("<html><body><marquee>One</marquee><marquee>Two</marquee></body></html>");
    const violations = accesslint010.run(doc);
    expect(violations).toHaveLength(2);
  });
});
