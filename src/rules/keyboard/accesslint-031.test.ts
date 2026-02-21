import { describe, it, expect } from "vitest";
import { makeDoc } from "../test-helpers";
import { accesslint031 } from "./accesslint-031";


describe("accesslint-031", () => {
  it("reports duplicate accesskeys", () => {
    const doc = makeDoc(`
      <button accesskey="s">Save</button>
      <button accesskey="s">Submit</button>
    `);
    const violations = accesslint031.run(doc);
    expect(violations).toHaveLength(1);
    expect(violations[0].message).toContain("s");
  });

  it("passes unique accesskeys", () => {
    const doc = makeDoc(`
      <button accesskey="s">Save</button>
      <button accesskey="d">Delete</button>
    `);
    expect(accesslint031.run(doc)).toHaveLength(0);
  });

  it("skips aria-hidden elements", () => {
    const doc = makeDoc(`
      <button accesskey="s">Save</button>
      <button accesskey="s" aria-hidden="true">Hidden</button>
    `);
    expect(accesslint031.run(doc)).toHaveLength(0);
  });

  it("matches accesskeys case-insensitively", () => {
    const doc = makeDoc(`
      <button accesskey="S">Save</button>
      <button accesskey="s">Submit</button>
    `);
    const violations = accesslint031.run(doc);
    expect(violations).toHaveLength(1);
  });
});
