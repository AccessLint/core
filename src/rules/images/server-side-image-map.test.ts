import { describe, it, expect } from "vitest";
import { serverSideImageMap } from "./server-side-image-map";
import { makeDoc } from "../test-helpers";

describe("accesslint-019", () => {
  it("reports img with ismap attribute", () => {
    const doc = makeDoc('<a href="/map"><img src="map.png" alt="Map" ismap></a>');
    const violations = serverSideImageMap.run(doc);
    expect(violations).toHaveLength(1);
    expect(violations[0].ruleId).toBe("accesslint-019");
  });

  it("reports input[type=image] with ismap attribute", () => {
    const doc = makeDoc('<input type="image" src="map.png" ismap>');
    const violations = serverSideImageMap.run(doc);
    expect(violations).toHaveLength(1);
  });

  it("passes img without ismap", () => {
    const doc = makeDoc('<img src="photo.jpg" alt="Photo">');
    expect(serverSideImageMap.run(doc)).toHaveLength(0);
  });

  it("passes img with client-side usemap", () => {
    const doc = makeDoc('<img src="nav.png" alt="Navigation" usemap="#navmap">');
    expect(serverSideImageMap.run(doc)).toHaveLength(0);
  });

  it("skips aria-hidden img with ismap", () => {
    const doc = makeDoc('<img src="map.png" alt="Map" ismap aria-hidden="true">');
    expect(serverSideImageMap.run(doc)).toHaveLength(0);
  });

  it("reports multiple server-side image maps", () => {
    const doc = makeDoc('<a href="/a"><img src="a.png" alt="A" ismap></a><a href="/b"><img src="b.png" alt="B" ismap></a>');
    expect(serverSideImageMap.run(doc)).toHaveLength(2);
  });
});
