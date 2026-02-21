import { describe, it, expect } from "vitest";
import { accesslint026 } from "./accesslint-026";
import { makeDoc } from "../test-helpers";

describe("accesslint-026", () => {
  it("reports input with only title attribute", () => {
    const doc = makeDoc('<input type="text" title="Search">');
    const violations = accesslint026.run(doc);
    expect(violations).toHaveLength(1);
    expect(violations[0].ruleId).toBe("accesslint-026");
  });

  it("passes input with label element", () => {
    const doc = makeDoc('<label for="search">Search</label><input id="search" type="text" title="Enter keywords">');
    expect(accesslint026.run(doc)).toHaveLength(0);
  });

  it("passes input with aria-label", () => {
    const doc = makeDoc('<input type="text" title="Search" aria-label="Search">');
    expect(accesslint026.run(doc)).toHaveLength(0);
  });

  it("passes input with aria-labelledby", () => {
    const doc = makeDoc('<span id="lbl">Search</span><input type="text" title="Search" aria-labelledby="lbl">');
    expect(accesslint026.run(doc)).toHaveLength(0);
  });

  it("passes input wrapped in label", () => {
    const doc = makeDoc('<label>Search <input type="text" title="Enter keywords"></label>');
    expect(accesslint026.run(doc)).toHaveLength(0);
  });

  it("passes input without title", () => {
    const doc = makeDoc('<input type="text">');
    expect(accesslint026.run(doc)).toHaveLength(0);
  });

  it("passes input with empty title", () => {
    const doc = makeDoc('<input type="text" title="">');
    expect(accesslint026.run(doc)).toHaveLength(0);
  });

  it("reports select with only title", () => {
    const doc = makeDoc('<select title="Choose option"><option>A</option></select>');
    const violations = accesslint026.run(doc);
    expect(violations).toHaveLength(1);
  });

  it("reports textarea with only title", () => {
    const doc = makeDoc('<textarea title="Enter message"></textarea>');
    const violations = accesslint026.run(doc);
    expect(violations).toHaveLength(1);
  });

  it("skips hidden inputs", () => {
    const doc = makeDoc('<input type="hidden" title="Token" value="abc">');
    expect(accesslint026.run(doc)).toHaveLength(0);
  });

  it("skips submit buttons", () => {
    const doc = makeDoc('<input type="submit" title="Submit form">');
    expect(accesslint026.run(doc)).toHaveLength(0);
  });

  it("skips aria-hidden elements", () => {
    const doc = makeDoc('<input type="text" title="Search" aria-hidden="true">');
    expect(accesslint026.run(doc)).toHaveLength(0);
  });

  it("passes label with empty text but whitespace", () => {
    const doc = makeDoc('<label for="x">   </label><input id="x" type="text" title="Search">');
    const violations = accesslint026.run(doc);
    expect(violations).toHaveLength(1); // Empty label doesn't count
  });
});
