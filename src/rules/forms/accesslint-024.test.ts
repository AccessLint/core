import { describe, it, expect } from "vitest";
import { accesslint024 } from "./accesslint-024";
import { makeDoc } from "../test-helpers";

describe("accesslint-024", () => {
  // --- Valid values ---
  it("passes standard autocomplete values", () => {
    for (const value of ["name", "email", "tel", "street-address", "postal-code", "cc-number"]) {
      const doc = makeDoc(`<input type="text" autocomplete="${value}">`);
      expect(accesslint024.run(doc), `expected "${value}" to pass`).toHaveLength(0);
    }
  });

  it("passes compound value (shipping street-address)", () => {
    const doc = makeDoc('<input type="text" autocomplete="shipping street-address">');
    expect(accesslint024.run(doc)).toHaveLength(0);
  });

  it("passes section-* token", () => {
    const doc = makeDoc('<input type="text" autocomplete="section-blue shipping street-address">');
    expect(accesslint024.run(doc)).toHaveLength(0);
  });

  it("passes contact type on contact field (home tel)", () => {
    const doc = makeDoc('<input type="tel" autocomplete="home tel">');
    expect(accesslint024.run(doc)).toHaveLength(0);
  });

  it("passes webauthn suffix", () => {
    const doc = makeDoc('<input type="text" autocomplete="username webauthn">');
    expect(accesslint024.run(doc)).toHaveLength(0);
  });

  it("passes off value", () => {
    const doc = makeDoc('<input type="text" autocomplete="off">');
    expect(accesslint024.run(doc)).toHaveLength(0);
  });

  it("passes on value", () => {
    const doc = makeDoc('<input type="text" autocomplete="on">');
    expect(accesslint024.run(doc)).toHaveLength(0);
  });

  // --- Invalid values ---
  it("reports unknown autocomplete value", () => {
    const doc = makeDoc('<input type="text" autocomplete="nope">');
    const v = accesslint024.run(doc);
    expect(v).toHaveLength(1);
    expect(v[0].ruleId).toBe("accesslint-024");
  });

  it("reports contact type on non-contact field", () => {
    const doc = makeDoc('<input type="text" autocomplete="home name">');
    const v = accesslint024.run(doc);
    expect(v).toHaveLength(1);
  });

  it("reports extra tokens", () => {
    const doc = makeDoc('<input type="text" autocomplete="name extra">');
    const v = accesslint024.run(doc);
    expect(v).toHaveLength(1);
  });

  // --- Skipped elements ---
  it("skips element without autocomplete attribute", () => {
    const doc = makeDoc('<input type="text">');
    expect(accesslint024.run(doc)).toHaveLength(0);
  });

  it("skips empty autocomplete value", () => {
    const doc = makeDoc('<input type="text" autocomplete="">');
    expect(accesslint024.run(doc)).toHaveLength(0);
  });

  it("skips aria-hidden elements", () => {
    const doc = makeDoc('<input type="text" autocomplete="nope" aria-hidden="true">');
    expect(accesslint024.run(doc)).toHaveLength(0);
  });

  it("skips disabled elements", () => {
    const doc = makeDoc('<input type="text" autocomplete="nope" disabled>');
    expect(accesslint024.run(doc)).toHaveLength(0);
  });

  it("skips aria-disabled elements", () => {
    const doc = makeDoc('<input type="text" autocomplete="nope" aria-disabled="true">');
    expect(accesslint024.run(doc)).toHaveLength(0);
  });

  it("skips computed-hidden elements", () => {
    const doc = makeDoc('<input type="text" autocomplete="nope" style="display:none">');
    expect(accesslint024.run(doc)).toHaveLength(0);
  });
});
