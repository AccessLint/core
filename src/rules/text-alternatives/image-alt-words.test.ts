import { describe, it, expect } from "vitest";
import { imageAltWords } from "./image-alt-words";
import { makeDoc } from "../../test-helpers";

describe("text-alternatives/image-alt-words", () => {
  it("reports alt text containing 'image'", () => {
    const doc = makeDoc('<img src="dog.jpg" alt="image of a dog">');
    const violations = imageAltWords.run(doc);
    expect(violations).toHaveLength(1);
    expect(violations[0].ruleId).toBe("text-alternatives/image-alt-words");
  });

  it("reports alt text containing 'photo'", () => {
    const doc = makeDoc('<img src="team.jpg" alt="photo of team">');
    expect(imageAltWords.run(doc)).toHaveLength(1);
  });

  it("reports alt text containing 'picture'", () => {
    const doc = makeDoc('<img src="sunset.jpg" alt="picture of sunset">');
    expect(imageAltWords.run(doc)).toHaveLength(1);
  });

  it("passes alt text without redundant words", () => {
    const doc = makeDoc('<img src="dog.jpg" alt="Golden retriever playing fetch">');
    expect(imageAltWords.run(doc)).toHaveLength(0);
  });

  it("passes empty alt", () => {
    const doc = makeDoc('<img src="spacer.gif" alt="">');
    expect(imageAltWords.run(doc)).toHaveLength(0);
  });

  it("does not flag partial word matches", () => {
    const doc = makeDoc('<img src="x.jpg" alt="Imagination is key">');
    expect(imageAltWords.run(doc)).toHaveLength(0);
  });
});
