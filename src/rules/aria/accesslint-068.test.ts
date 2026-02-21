import { describe, it, expect } from "vitest";
import { makeDoc } from "../test-helpers";
import { accesslint068 } from "./accesslint-068";


describe("accesslint-068", () => {
  it("passes progressbar with aria-label", () => {
    const doc = makeDoc('<div role="progressbar" aria-valuenow="50" aria-label="Upload progress"></div>');
    expect(accesslint068.run(doc)).toHaveLength(0);
  });

  it("reports progressbar without name", () => {
    const doc = makeDoc('<div role="progressbar" aria-valuenow="50"></div>');
    const violations = accesslint068.run(doc);
    expect(violations).toHaveLength(1);
  });
});
