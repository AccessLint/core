import { describe, it, expect } from "vitest";
import { makeDoc } from "../test-helpers";
import { metaViewport, metaRefresh, metaRefreshNoException } from "./meta-rules";


describe("accesslint-006", () => {
  it("passes without viewport meta", () => {
    const doc = makeDoc("<html><head></head><body></body></html>");
    expect(metaViewport.run(doc)).toHaveLength(0);
  });

  it("passes viewport without zoom restrictions", () => {
    const doc = makeDoc('<html><head><meta name="viewport" content="width=device-width, initial-scale=1"></head></html>');
    expect(metaViewport.run(doc)).toHaveLength(0);
  });

  it("reports user-scalable=no", () => {
    const doc = makeDoc('<html><head><meta name="viewport" content="user-scalable=no"></head></html>');
    const violations = metaViewport.run(doc);
    expect(violations).toHaveLength(1);
    expect(violations[0].message).toContain("user-scalable");
  });

  it("reports user-scalable=0", () => {
    const doc = makeDoc('<html><head><meta name="viewport" content="user-scalable=0"></head></html>');
    const violations = metaViewport.run(doc);
    expect(violations).toHaveLength(1);
  });

  it("reports user-scalable=0.5 (fractional value disables zoom)", () => {
    const doc = makeDoc('<html><head><meta name="viewport" content="width=device-width, user-scalable=0.5"></head></html>');
    const violations = metaViewport.run(doc);
    expect(violations).toHaveLength(1);
    expect(violations[0].message).toContain("user-scalable=0.5");
  });

  it("passes user-scalable=1 (zoom enabled)", () => {
    const doc = makeDoc('<html><head><meta name="viewport" content="width=device-width, user-scalable=1"></head></html>');
    expect(metaViewport.run(doc)).toHaveLength(0);
  });

  it("passes user-scalable=yes", () => {
    const doc = makeDoc('<html><head><meta name="viewport" content="width=device-width, user-scalable=yes"></head></html>');
    expect(metaViewport.run(doc)).toHaveLength(0);
  });

  it("reports maximum-scale=1", () => {
    const doc = makeDoc('<html><head><meta name="viewport" content="maximum-scale=1"></head></html>');
    const violations = metaViewport.run(doc);
    expect(violations).toHaveLength(1);
    expect(violations[0].message).toContain("maximum-scale");
  });

  it("reports maximum-scale=1.5", () => {
    const doc = makeDoc('<html><head><meta name="viewport" content="maximum-scale=1.5"></head></html>');
    const violations = metaViewport.run(doc);
    expect(violations).toHaveLength(1);
  });

  it("passes maximum-scale=2", () => {
    const doc = makeDoc('<html><head><meta name="viewport" content="maximum-scale=2"></head></html>');
    expect(metaViewport.run(doc)).toHaveLength(0);
  });

  it("passes maximum-scale=5", () => {
    const doc = makeDoc('<html><head><meta name="viewport" content="maximum-scale=5"></head></html>');
    expect(metaViewport.run(doc)).toHaveLength(0);
  });
});

describe("accesslint-007", () => {
  it("passes without refresh meta", () => {
    const doc = makeDoc("<html><head></head><body></body></html>");
    expect(metaRefresh.run(doc)).toHaveLength(0);
  });

  it("reports timed redirect", () => {
    const doc = makeDoc('<html><head><meta http-equiv="refresh" content="5;url=/new-page"></head></html>');
    const violations = metaRefresh.run(doc);
    expect(violations).toHaveLength(1);
    expect(violations[0].message).toContain("redirects");
    expect(violations[0].message).toContain("5 seconds");
  });

  it("allows immediate redirect (delay 0)", () => {
    const doc = makeDoc('<html><head><meta http-equiv="refresh" content="0;url=/new-page"></head></html>');
    const violations = metaRefresh.run(doc);
    expect(violations).toHaveLength(0);
  });

  it("reports auto-refresh", () => {
    const doc = makeDoc('<html><head><meta http-equiv="refresh" content="30"></head></html>');
    const violations = metaRefresh.run(doc);
    expect(violations).toHaveLength(1);
    expect(violations[0].message).toContain("30 seconds");
  });

  it("passes very long refresh interval", () => {
    const doc = makeDoc('<html><head><meta http-equiv="refresh" content="100000"></head></html>');
    expect(metaRefresh.run(doc)).toHaveLength(0);
  });
});

describe("accesslint-008", () => {
  it("passes without refresh meta", () => {
    const doc = makeDoc("<html><head></head><body></body></html>");
    expect(metaRefreshNoException.run(doc)).toHaveLength(0);
  });

  it("allows immediate redirect (delay 0)", () => {
    const doc = makeDoc('<html><head><meta http-equiv="refresh" content="0;url=/new-page"></head></html>');
    expect(metaRefreshNoException.run(doc)).toHaveLength(0);
  });

  it("reports timed redirect", () => {
    const doc = makeDoc('<html><head><meta http-equiv="refresh" content="5;url=/new-page"></head></html>');
    const violations = metaRefreshNoException.run(doc);
    expect(violations).toHaveLength(1);
    expect(violations[0].ruleId).toBe("accesslint-008");
    expect(violations[0].message).toContain("5-second");
  });

  it("reports same-page refresh with positive delay", () => {
    const doc = makeDoc('<html><head><meta http-equiv="refresh" content="30"></head></html>');
    const violations = metaRefreshNoException.run(doc);
    expect(violations).toHaveLength(1);
    expect(violations[0].message).toContain("30-second");
  });

  it("reports very long redirect (no 72000 exception)", () => {
    const doc = makeDoc('<html><head><meta http-equiv="refresh" content="100000;url=/new-page"></head></html>');
    const violations = metaRefreshNoException.run(doc);
    expect(violations).toHaveLength(1);
    expect(violations[0].message).toContain("100000-second");
  });

  it("passes delay 0 with no URL", () => {
    const doc = makeDoc('<html><head><meta http-equiv="refresh" content="0"></head></html>');
    expect(metaRefreshNoException.run(doc)).toHaveLength(0);
  });

  it("ignores malformed content attribute", () => {
    const doc = makeDoc('<html><head><meta http-equiv="refresh" content="abc"></head></html>');
    expect(metaRefreshNoException.run(doc)).toHaveLength(0);
  });
});
