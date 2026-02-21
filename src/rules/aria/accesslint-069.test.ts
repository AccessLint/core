import { describe, it, expect } from "vitest";
import { makeDoc } from "../test-helpers";
import { accesslint069 } from "./accesslint-069";


describe("accesslint-069", () => {
  it("passes dialog with aria-label", () => {
    const doc = makeDoc('<div role="dialog" aria-label="Confirm action"></div>');
    expect(accesslint069.run(doc)).toHaveLength(0);
  });

  it("passes dialog with aria-labelledby", () => {
    const doc = makeDoc('<div role="dialog" aria-labelledby="title"><h2 id="title">Settings</h2></div>');
    expect(accesslint069.run(doc)).toHaveLength(0);
  });

  it("reports empty dialog without name", () => {
    const doc = makeDoc('<div role="dialog"></div>');
    const violations = accesslint069.run(doc);
    expect(violations).toHaveLength(1);
  });

  it("checks alertdialog", () => {
    const doc = makeDoc('<div role="alertdialog"></div>');
    const violations = accesslint069.run(doc);
    expect(violations).toHaveLength(1);
  });

  it("passes native dialog with aria-label", () => {
    const doc = makeDoc('<dialog aria-label="Settings"><p>Content</p></dialog>');
    expect(accesslint069.run(doc)).toHaveLength(0);
  });
});
