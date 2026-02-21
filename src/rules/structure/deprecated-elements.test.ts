import { describe, it, expect } from "vitest";
import { makeDoc } from "../test-helpers";
import { blink, marquee } from "./deprecated-elements";


describe("accesslint-009", () => {
  it("reports blink element", () => {
    const doc = makeDoc("<html><body><blink>Attention!</blink></body></html>");
    const violations = blink.run(doc);
    expect(violations).toHaveLength(1);
    expect(violations[0].ruleId).toBe("accesslint-009");
  });

  it("passes without blink element", () => {
    const doc = makeDoc("<html><body><p>Normal text</p></body></html>");
    expect(blink.run(doc)).toHaveLength(0);
  });

  it("skips aria-hidden blink", () => {
    const doc = makeDoc('<html><body><blink aria-hidden="true">Hidden</blink></body></html>');
    expect(blink.run(doc)).toHaveLength(0);
  });
});

describe("accesslint-010", () => {
  it("reports marquee element", () => {
    const doc = makeDoc("<html><body><marquee>Scrolling text</marquee></body></html>");
    const violations = marquee.run(doc);
    expect(violations).toHaveLength(1);
    expect(violations[0].ruleId).toBe("accesslint-010");
  });

  it("passes without marquee element", () => {
    const doc = makeDoc("<html><body><p>Static text</p></body></html>");
    expect(marquee.run(doc)).toHaveLength(0);
  });

  it("skips aria-hidden marquee", () => {
    const doc = makeDoc('<html><body><marquee aria-hidden="true">Hidden</marquee></body></html>');
    expect(marquee.run(doc)).toHaveLength(0);
  });

  it("reports multiple marquee elements", () => {
    const doc = makeDoc("<html><body><marquee>One</marquee><marquee>Two</marquee></body></html>");
    const violations = marquee.run(doc);
    expect(violations).toHaveLength(2);
  });
});
