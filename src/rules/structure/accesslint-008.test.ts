import { describe, it, expect } from "vitest";
import { makeDoc } from "../test-helpers";
import { accesslint008 } from "./accesslint-008";


describe("accesslint-008", () => {
  it("passes without refresh meta", () => {
    const doc = makeDoc("<html><head></head><body></body></html>");
    expect(accesslint008.run(doc)).toHaveLength(0);
  });

  it("allows immediate redirect (delay 0)", () => {
    const doc = makeDoc('<html><head><meta http-equiv="refresh" content="0;url=/new-page"></head></html>');
    expect(accesslint008.run(doc)).toHaveLength(0);
  });

  it("reports timed redirect", () => {
    const doc = makeDoc('<html><head><meta http-equiv="refresh" content="5;url=/new-page"></head></html>');
    const violations = accesslint008.run(doc);
    expect(violations).toHaveLength(1);
    expect(violations[0].ruleId).toBe("accesslint-008");
    expect(violations[0].message).toContain("5-second");
  });

  it("reports same-page refresh with positive delay", () => {
    const doc = makeDoc('<html><head><meta http-equiv="refresh" content="30"></head></html>');
    const violations = accesslint008.run(doc);
    expect(violations).toHaveLength(1);
    expect(violations[0].message).toContain("30-second");
  });

  it("reports very long redirect (no 72000 exception)", () => {
    const doc = makeDoc('<html><head><meta http-equiv="refresh" content="100000;url=/new-page"></head></html>');
    const violations = accesslint008.run(doc);
    expect(violations).toHaveLength(1);
    expect(violations[0].message).toContain("100000-second");
  });

  it("passes delay 0 with no URL", () => {
    const doc = makeDoc('<html><head><meta http-equiv="refresh" content="0"></head></html>');
    expect(accesslint008.run(doc)).toHaveLength(0);
  });

  it("ignores malformed content attribute", () => {
    const doc = makeDoc('<html><head><meta http-equiv="refresh" content="abc"></head></html>');
    expect(accesslint008.run(doc)).toHaveLength(0);
  });
});
