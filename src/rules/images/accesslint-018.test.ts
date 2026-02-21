import { describe, it, expect } from "vitest";
import { accesslint018 } from "./accesslint-018";
import { makeDoc } from "../test-helpers";

describe("accesslint-018", () => {
  it("reports div with role=img without name", () => {
    const doc = makeDoc('<div role="img" style="background: url(icon.png)"></div>');
    const violations = accesslint018.run(doc);
    expect(violations).toHaveLength(1);
    expect(violations[0].ruleId).toBe("accesslint-018");
  });

  it("passes div with role=img and aria-label", () => {
    const doc = makeDoc('<div role="img" aria-label="Warning icon"></div>');
    expect(accesslint018.run(doc)).toHaveLength(0);
  });

  it("passes div with role=img and aria-labelledby", () => {
    const doc = makeDoc('<span id="desc">Warning icon</span><div role="img" aria-labelledby="desc"></div>');
    expect(accesslint018.run(doc)).toHaveLength(0);
  });

  it("passes span with role=img and text content", () => {
    // Icon fonts often use this pattern
    const doc = makeDoc('<span role="img" aria-label="Star rating">&#9733;&#9733;&#9733;</span>');
    expect(accesslint018.run(doc)).toHaveLength(0);
  });

  it("skips native img elements (handled by img-alt)", () => {
    const doc = makeDoc('<img role="img" src="photo.jpg">');
    expect(accesslint018.run(doc)).toHaveLength(0);
  });

  it("skips svg elements (handled by svg-img-alt)", () => {
    const doc = makeDoc('<svg role="img"><circle r="10"></circle></svg>');
    expect(accesslint018.run(doc)).toHaveLength(0);
  });

  it("skips aria-hidden elements", () => {
    const doc = makeDoc('<div role="img" aria-hidden="true"></div>');
    expect(accesslint018.run(doc)).toHaveLength(0);
  });

  it("reports i element used as icon without label", () => {
    const doc = makeDoc('<i role="img" class="icon-home"></i>');
    const violations = accesslint018.run(doc);
    expect(violations).toHaveLength(1);
  });

  it("passes i element with aria-label", () => {
    const doc = makeDoc('<i role="img" class="icon-home" aria-label="Home"></i>');
    expect(accesslint018.run(doc)).toHaveLength(0);
  });
});
