import { describe, it, expect } from "vitest";
import { makeDoc } from "../test-helpers";
import { accesslint064 } from "./accesslint-064";


describe("accesslint-064", () => {
  it("passes command with text", () => {
    const doc = makeDoc('<div role="button">Click me</div>');
    expect(accesslint064.run(doc)).toHaveLength(0);
  });

  it("passes command with aria-label", () => {
    const doc = makeDoc('<div role="button" aria-label="Close"></div>');
    expect(accesslint064.run(doc)).toHaveLength(0);
  });

  it("reports command without name", () => {
    const doc = makeDoc('<div role="button"></div>');
    const violations = accesslint064.run(doc);
    expect(violations).toHaveLength(1);
  });

  it("skips native buttons (handled by button-name)", () => {
    const doc = makeDoc("<button></button>");
    expect(accesslint064.run(doc)).toHaveLength(0);
  });

  it("passes menuitem with name", () => {
    const doc = makeDoc('<div role="menuitem">Edit</div>');
    expect(accesslint064.run(doc)).toHaveLength(0);
  });

  it("passes command with img alt inside", () => {
    const doc = makeDoc('<div role="button"><img src="x.png" alt="Icon"></div>');
    expect(accesslint064.run(doc)).toHaveLength(0);
  });
});
