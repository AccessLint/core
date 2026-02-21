import { describe, it, expect } from "vitest";
import { makeDoc } from "../test-helpers";
import { accesslint062 } from "./accesslint-062";


describe("accesslint-062", () => {
  it("passes when body has no aria-hidden", () => {
    const doc = makeDoc("<html><body><main>Content</main></body></html>");
    expect(accesslint062.run(doc)).toHaveLength(0);
  });

  it("passes when body has aria-hidden=false", () => {
    const doc = makeDoc('<html><body aria-hidden="false"><main>Content</main></body></html>');
    expect(accesslint062.run(doc)).toHaveLength(0);
  });

  it("reports aria-hidden=true on body", () => {
    const doc = makeDoc('<html><body aria-hidden="true"><main>Content</main></body></html>');
    const violations = accesslint062.run(doc);
    expect(violations).toHaveLength(1);
    expect(violations[0].ruleId).toBe("accesslint-062");
    expect(violations[0].impact).toBe("critical");
  });
});
