import { describe, it, expect } from "vitest";
import { metaViewport, metaRefresh } from "./meta-rules";

function makeDoc(html: string): Document {
  return new DOMParser().parseFromString(html, "text/html");
}

describe("meta-viewport", () => {
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

describe("meta-refresh", () => {
  it("passes without refresh meta", () => {
    const doc = makeDoc("<html><head></head><body></body></html>");
    expect(metaRefresh.run(doc)).toHaveLength(0);
  });

  it("reports timed redirect", () => {
    const doc = makeDoc('<html><head><meta http-equiv="refresh" content="5;url=/new-page"></head></html>');
    const violations = metaRefresh.run(doc);
    expect(violations).toHaveLength(1);
    expect(violations[0].message).toContain("5 seconds");
  });

  it("reports immediate redirect with warning", () => {
    const doc = makeDoc('<html><head><meta http-equiv="refresh" content="0;url=/new-page"></head></html>');
    const violations = metaRefresh.run(doc);
    expect(violations).toHaveLength(1);
    expect(violations[0].impact).toBe("moderate");
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
