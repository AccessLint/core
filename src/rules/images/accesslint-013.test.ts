import { describe, it, expect } from "vitest";
import { accesslint013 } from "./accesslint-013";
import { makeDoc } from "../test-helpers";

describe("accesslint-013", () => {
  it("reports input[type=image] without alt", () => {
    const doc = makeDoc('<input type="image" src="submit.png">');
    const violations = accesslint013.run(doc);
    expect(violations).toHaveLength(1);
    expect(violations[0].ruleId).toBe("accesslint-013");
  });

  it("passes input[type=image] with alt", () => {
    const doc = makeDoc('<input type="image" src="submit.png" alt="Submit">');
    expect(accesslint013.run(doc)).toHaveLength(0);
  });

  it("passes input[type=image] with aria-label", () => {
    const doc = makeDoc('<input type="image" src="go.png" aria-label="Go">');
    expect(accesslint013.run(doc)).toHaveLength(0);
  });

  it("passes input[type=image] with aria-labelledby", () => {
    const doc = makeDoc('<span id="lbl">Search</span><input type="image" src="search.png" aria-labelledby="lbl">');
    expect(accesslint013.run(doc)).toHaveLength(0);
  });

  it("passes input[type=image] with title", () => {
    const doc = makeDoc('<input type="image" src="go.png" title="Submit form">');
    expect(accesslint013.run(doc)).toHaveLength(0);
  });

  it("skips aria-hidden input[type=image]", () => {
    const doc = makeDoc('<input type="image" src="x.png" aria-hidden="true">');
    expect(accesslint013.run(doc)).toHaveLength(0);
  });

  it("does not flag other input types", () => {
    const doc = makeDoc('<input type="text"><input type="submit">');
    expect(accesslint013.run(doc)).toHaveLength(0);
  });

  it("reports multiple violations", () => {
    const doc = makeDoc('<input type="image" src="a.png"><input type="image" src="b.png">');
    expect(accesslint013.run(doc)).toHaveLength(2);
  });
});
