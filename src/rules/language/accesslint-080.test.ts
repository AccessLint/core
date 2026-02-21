import { describe, it, expect } from "vitest";
import { makeDoc } from "../test-helpers";
import { accesslint080 } from "./accesslint-080";


describe("accesslint-080", () => {
  it("reports missing lang", () => {
    const doc = makeDoc("<html><body></body></html>");
    expect(accesslint080.run(doc)).toHaveLength(1);
  });

  it("returns 'html' as the selector", () => {
    const doc = makeDoc("<html><body></body></html>");
    const violations = accesslint080.run(doc);
    expect(violations[0].selector).toBe("html");
  });

  it("passes with lang", () => {
    const doc = makeDoc('<html lang="en"><body></body></html>');
    expect(accesslint080.run(doc)).toHaveLength(0);
  });

  it("reports empty lang", () => {
    const doc = makeDoc('<html lang=""><body></body></html>');
    expect(accesslint080.run(doc)).toHaveLength(1);
  });
});
