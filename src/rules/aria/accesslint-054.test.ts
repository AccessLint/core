import { describe, it, expect } from "vitest";
import { makeDoc } from "../test-helpers";
import { accesslint054 } from "./accesslint-054";


describe("accesslint-054", () => {
  it("passes valid roles", () => {
    const doc = makeDoc('<html><body><div role="button">Click</div></body></html>');
    expect(accesslint054.run(doc)).toHaveLength(0);
  });

  it("reports invalid roles", () => {
    const doc = makeDoc('<html><body><div role="foobar">X</div></body></html>');
    const v = accesslint054.run(doc);
    expect(v).toHaveLength(1);
    expect(v[0].message).toContain("foobar");
  });

  it("passes multiple valid roles", () => {
    const doc = makeDoc('<html><body><nav role="navigation">Nav</nav></body></html>');
    expect(accesslint054.run(doc)).toHaveLength(0);
  });
});
