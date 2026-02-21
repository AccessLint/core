import { describe, it, expect } from "vitest";
import { accesslint015 } from "./accesslint-015";
import { makeDoc } from "../test-helpers";

describe("accesslint-015 (image-alt-redundant-words)", () => {
  it("reports alt text containing 'image'", () => {
    const doc = makeDoc('<img src="dog.jpg" alt="image of a dog">');
    const violations = accesslint015.run(doc);
    expect(violations).toHaveLength(1);
    expect(violations[0].ruleId).toBe("accesslint-015");
  });

  it("reports alt text containing 'photo'", () => {
    const doc = makeDoc('<img src="team.jpg" alt="photo of team">');
    expect(accesslint015.run(doc)).toHaveLength(1);
  });

  it("reports alt text containing 'picture'", () => {
    const doc = makeDoc('<img src="sunset.jpg" alt="picture of sunset">');
    expect(accesslint015.run(doc)).toHaveLength(1);
  });

  it("passes alt text without redundant words", () => {
    const doc = makeDoc('<img src="dog.jpg" alt="Golden retriever playing fetch">');
    expect(accesslint015.run(doc)).toHaveLength(0);
  });

  it("passes empty alt", () => {
    const doc = makeDoc('<img src="spacer.gif" alt="">');
    expect(accesslint015.run(doc)).toHaveLength(0);
  });

  it("does not flag partial word matches", () => {
    const doc = makeDoc('<img src="x.jpg" alt="Imagination is key">');
    expect(accesslint015.run(doc)).toHaveLength(0);
  });
});
