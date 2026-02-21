import { describe, it, expect } from "vitest";
import { makeDoc } from "../test-helpers";
import { accesslint027 } from "./accesslint-027";


describe("accesslint-027", () => {
  it("reports positive tabindex", () => {
    const doc = makeDoc('<html><body><div tabindex="5">X</div></body></html>');
    expect(accesslint027.run(doc)).toHaveLength(1);
  });

  it("passes tabindex=0", () => {
    const doc = makeDoc('<html><body><div tabindex="0">X</div></body></html>');
    expect(accesslint027.run(doc)).toHaveLength(0);
  });

  it("passes tabindex=-1", () => {
    const doc = makeDoc('<html><body><div tabindex="-1">X</div></body></html>');
    expect(accesslint027.run(doc)).toHaveLength(0);
  });
});
