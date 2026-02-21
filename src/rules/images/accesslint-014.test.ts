import { describe, it, expect } from "vitest";
import { accesslint014 } from "./accesslint-014";
import { makeDoc } from "../test-helpers";

describe("accesslint-014 (image-redundant-alt)", () => {
  it("reports img alt duplicating parent link text", () => {
    const doc = makeDoc('<a href="/home">Home<img src="home.png" alt="Home"></a>');
    const violations = accesslint014.run(doc);
    expect(violations).toHaveLength(1);
    expect(violations[0].ruleId).toBe("accesslint-014");
  });

  it("reports img alt duplicating parent button text", () => {
    const doc = makeDoc('<button>Submit<img src="arrow.png" alt="Submit"></button>');
    const violations = accesslint014.run(doc);
    expect(violations).toHaveLength(1);
  });

  it("passes when alt differs from link text", () => {
    const doc = makeDoc('<a href="/home">Go home<img src="home.png" alt="House icon"></a>');
    expect(accesslint014.run(doc)).toHaveLength(0);
  });

  it("passes img with empty alt inside link", () => {
    const doc = makeDoc('<a href="/home">Home<img src="icon.png" alt=""></a>');
    expect(accesslint014.run(doc)).toHaveLength(0);
  });

  it("passes img not inside link or button", () => {
    const doc = makeDoc('<div>Hello<img src="photo.jpg" alt="Hello"></div>');
    expect(accesslint014.run(doc)).toHaveLength(0);
  });

  it("comparison is case-insensitive", () => {
    const doc = makeDoc('<a href="/home">HOME<img src="icon.png" alt="home"></a>');
    const violations = accesslint014.run(doc);
    expect(violations).toHaveLength(1);
  });
});
