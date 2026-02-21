import { describe, it, expect } from "vitest";
import { makeDoc } from "../test-helpers";
import { accesslint067 } from "./accesslint-067";


describe("accesslint-067", () => {
  it("passes meter with aria-label", () => {
    const doc = makeDoc('<div role="meter" aria-valuenow="70" aria-label="Battery level"></div>');
    expect(accesslint067.run(doc)).toHaveLength(0);
  });

  it("reports meter without name", () => {
    const doc = makeDoc('<div role="meter" aria-valuenow="70"></div>');
    const violations = accesslint067.run(doc);
    expect(violations).toHaveLength(1);
  });

  it("passes native meter with aria-label", () => {
    const doc = makeDoc('<meter value="0.7" aria-label="Progress"></meter>');
    expect(accesslint067.run(doc)).toHaveLength(0);
  });
});
