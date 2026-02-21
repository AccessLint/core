import { describe, it, expect } from "vitest";
import { accesslint021 } from "./accesslint-021";
import { makeDoc } from "../test-helpers";

describe("accesslint-021", () => {
  it("reports input with multiple label[for] elements", () => {
    const doc = makeDoc(`
      <label for="x">First</label>
      <label for="x">Second</label>
      <input id="x" type="text">
    `);
    const v = accesslint021.run(doc);
    expect(v).toHaveLength(1);
    expect(v[0].ruleId).toBe("accesslint-021");
  });

  it("reports input with label[for] and wrapping label", () => {
    const doc = makeDoc(`
      <label for="x">Explicit</label>
      <label><input id="x" type="text"></label>
    `);
    const v = accesslint021.run(doc);
    expect(v).toHaveLength(1);
  });

  it("passes input with single label", () => {
    const doc = makeDoc(`
      <label for="x">Name</label>
      <input id="x" type="text">
    `);
    expect(accesslint021.run(doc)).toHaveLength(0);
  });

  it("passes input with no label", () => {
    const doc = makeDoc('<input id="x" type="text">');
    expect(accesslint021.run(doc)).toHaveLength(0);
  });

  it("skips input without id", () => {
    const doc = makeDoc('<input type="text">');
    expect(accesslint021.run(doc)).toHaveLength(0);
  });

  it("skips aria-hidden elements", () => {
    const doc = makeDoc(`
      <label for="x">First</label>
      <label for="x">Second</label>
      <input id="x" type="text" aria-hidden="true">
    `);
    expect(accesslint021.run(doc)).toHaveLength(0);
  });
});
