import { describe, it, expect } from "vitest";
import { ariaHiddenBody, ariaHiddenFocus } from "./aria-hidden-rules";

function makeDoc(html: string): Document {
  return new DOMParser().parseFromString(html, "text/html");
}

describe("accesslint-062", () => {
  it("passes when body has no aria-hidden", () => {
    const doc = makeDoc("<html><body><main>Content</main></body></html>");
    expect(ariaHiddenBody.run(doc)).toHaveLength(0);
  });

  it("passes when body has aria-hidden=false", () => {
    const doc = makeDoc('<html><body aria-hidden="false"><main>Content</main></body></html>');
    expect(ariaHiddenBody.run(doc)).toHaveLength(0);
  });

  it("reports aria-hidden=true on body", () => {
    const doc = makeDoc('<html><body aria-hidden="true"><main>Content</main></body></html>');
    const violations = ariaHiddenBody.run(doc);
    expect(violations).toHaveLength(1);
    expect(violations[0].ruleId).toBe("accesslint-062");
    expect(violations[0].impact).toBe("critical");
  });
});

describe("accesslint-063", () => {
  it("passes when aria-hidden region has no focusable elements", () => {
    const doc = makeDoc('<div aria-hidden="true"><p>Just text</p></div>');
    expect(ariaHiddenFocus.run(doc)).toHaveLength(0);
  });

  it("reports focusable button in aria-hidden region", () => {
    const doc = makeDoc('<div aria-hidden="true"><button>Click</button></div>');
    const violations = ariaHiddenFocus.run(doc);
    expect(violations).toHaveLength(1);
    expect(violations[0].ruleId).toBe("accesslint-063");
  });

  it("reports focusable link in aria-hidden region", () => {
    const doc = makeDoc('<div aria-hidden="true"><a href="/page">Link</a></div>');
    const violations = ariaHiddenFocus.run(doc);
    expect(violations).toHaveLength(1);
  });

  it("reports focusable input in aria-hidden region", () => {
    const doc = makeDoc('<div aria-hidden="true"><input type="text"></div>');
    const violations = ariaHiddenFocus.run(doc);
    expect(violations).toHaveLength(1);
  });

  it("passes when focusable elements have tabindex=-1", () => {
    const doc = makeDoc('<div aria-hidden="true"><button tabindex="-1">Hidden</button></div>');
    expect(ariaHiddenFocus.run(doc)).toHaveLength(0);
  });

  it("passes when button is disabled", () => {
    const doc = makeDoc('<div aria-hidden="true"><button disabled>Disabled</button></div>');
    expect(ariaHiddenFocus.run(doc)).toHaveLength(0);
  });

  it("passes for hidden input type", () => {
    const doc = makeDoc('<div aria-hidden="true"><input type="hidden" name="token"></div>');
    expect(ariaHiddenFocus.run(doc)).toHaveLength(0);
  });

  it("reports element with positive tabindex", () => {
    const doc = makeDoc('<div aria-hidden="true"><span tabindex="0">Focusable</span></div>');
    const violations = ariaHiddenFocus.run(doc);
    expect(violations).toHaveLength(1);
  });

  it("reports multiple focusable elements", () => {
    const doc = makeDoc('<div aria-hidden="true"><button>One</button><button>Two</button></div>');
    const violations = ariaHiddenFocus.run(doc);
    expect(violations).toHaveLength(2);
  });

  it("checks nested aria-hidden regions", () => {
    const doc = makeDoc('<div aria-hidden="true"><div><button>Nested</button></div></div>');
    const violations = ariaHiddenFocus.run(doc);
    expect(violations).toHaveLength(1);
  });
});
