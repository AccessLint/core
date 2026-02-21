import { describe, it, expect } from "vitest";
import { imageRedundantAlt, imageAltRedundantWords } from "./image-redundant-alt";
import { makeDoc } from "../test-helpers";

describe("accesslint-014 (image-redundant-alt)", () => {
  it("reports img alt duplicating parent link text", () => {
    const doc = makeDoc('<a href="/home">Home<img src="home.png" alt="Home"></a>');
    const violations = imageRedundantAlt.run(doc);
    expect(violations).toHaveLength(1);
    expect(violations[0].ruleId).toBe("accesslint-014");
  });

  it("reports img alt duplicating parent button text", () => {
    const doc = makeDoc('<button>Submit<img src="arrow.png" alt="Submit"></button>');
    const violations = imageRedundantAlt.run(doc);
    expect(violations).toHaveLength(1);
  });

  it("passes when alt differs from link text", () => {
    const doc = makeDoc('<a href="/home">Go home<img src="home.png" alt="House icon"></a>');
    expect(imageRedundantAlt.run(doc)).toHaveLength(0);
  });

  it("passes img with empty alt inside link", () => {
    const doc = makeDoc('<a href="/home">Home<img src="icon.png" alt=""></a>');
    expect(imageRedundantAlt.run(doc)).toHaveLength(0);
  });

  it("passes img not inside link or button", () => {
    const doc = makeDoc('<div>Hello<img src="photo.jpg" alt="Hello"></div>');
    expect(imageRedundantAlt.run(doc)).toHaveLength(0);
  });

  it("comparison is case-insensitive", () => {
    const doc = makeDoc('<a href="/home">HOME<img src="icon.png" alt="home"></a>');
    const violations = imageRedundantAlt.run(doc);
    expect(violations).toHaveLength(1);
  });
});

describe("accesslint-015 (image-alt-redundant-words)", () => {
  it("reports alt text containing 'image'", () => {
    const doc = makeDoc('<img src="dog.jpg" alt="image of a dog">');
    const violations = imageAltRedundantWords.run(doc);
    expect(violations).toHaveLength(1);
    expect(violations[0].ruleId).toBe("accesslint-015");
  });

  it("reports alt text containing 'photo'", () => {
    const doc = makeDoc('<img src="team.jpg" alt="photo of team">');
    expect(imageAltRedundantWords.run(doc)).toHaveLength(1);
  });

  it("reports alt text containing 'picture'", () => {
    const doc = makeDoc('<img src="sunset.jpg" alt="picture of sunset">');
    expect(imageAltRedundantWords.run(doc)).toHaveLength(1);
  });

  it("passes alt text without redundant words", () => {
    const doc = makeDoc('<img src="dog.jpg" alt="Golden retriever playing fetch">');
    expect(imageAltRedundantWords.run(doc)).toHaveLength(0);
  });

  it("passes empty alt", () => {
    const doc = makeDoc('<img src="spacer.gif" alt="">');
    expect(imageAltRedundantWords.run(doc)).toHaveLength(0);
  });

  it("does not flag partial word matches", () => {
    const doc = makeDoc('<img src="x.jpg" alt="Imagination is key">');
    expect(imageAltRedundantWords.run(doc)).toHaveLength(0);
  });
});
