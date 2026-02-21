import { describe, it, expect } from "vitest";
import { makeDoc } from "../test-helpers";
import { accesslint065 } from "./accesslint-065";


describe("accesslint-065", () => {
  it("passes textbox with aria-label", () => {
    const doc = makeDoc('<div role="textbox" aria-label="Username"></div>');
    expect(accesslint065.run(doc)).toHaveLength(0);
  });

  it("reports textbox without name", () => {
    const doc = makeDoc('<div role="textbox"></div>');
    const violations = accesslint065.run(doc);
    expect(violations).toHaveLength(1);
  });

  it("passes combobox with name", () => {
    const doc = makeDoc('<div role="combobox" aria-label="Country"></div>');
    expect(accesslint065.run(doc)).toHaveLength(0);
  });

  it("reports slider without name", () => {
    const doc = makeDoc('<div role="slider" aria-valuenow="50"></div>');
    const violations = accesslint065.run(doc);
    expect(violations).toHaveLength(1);
  });

  it("skips native inputs (handled by label rule)", () => {
    const doc = makeDoc('<input type="text">');
    expect(accesslint065.run(doc)).toHaveLength(0);
  });
});
