import { describe, it, expect, beforeEach } from "vitest";
import { rules, configureRules, getActiveRules, getRuleById } from "../rules/index";
import { registerLocale } from "./registry";
import { en } from "./en";

beforeEach(() => {
  // Reset to no locale between tests
  configureRules({ locale: undefined, additionalRules: [], disabledRules: [] });
});

describe("i18n locale support", () => {
  it("returns original descriptions when no locale is set", () => {
    const active = getActiveRules();
    const imgAlt = active.find((r) => r.id === "img-alt")!;
    expect(imgAlt.description).toBe(rules.find((r) => r.id === "img-alt")!.description);
  });

  it("applies registered locale translations", () => {
    registerLocale("test", {
      "img-alt": { description: "Test description", guidance: "Test guidance" },
    });
    configureRules({ locale: "test" });

    const active = getActiveRules();
    const imgAlt = active.find((r) => r.id === "img-alt")!;
    expect(imgAlt.description).toBe("Test description");
    expect(imgAlt.guidance).toBe("Test guidance");
  });

  it("falls back to original for untranslated rules", () => {
    registerLocale("partial", {
      "img-alt": { description: "Translated img-alt" },
    });
    configureRules({ locale: "partial" });

    const active = getActiveRules();
    const linkName = active.find((r) => r.id === "link-name")!;
    const original = rules.find((r) => r.id === "link-name")!;
    expect(linkName.description).toBe(original.description);
    expect(linkName.guidance).toBe(original.guidance);
  });

  it("preserves guidance when translation omits it", () => {
    registerLocale("no-guidance", {
      "img-alt": { description: "Translated description only" },
    });
    configureRules({ locale: "no-guidance" });

    const active = getActiveRules();
    const imgAlt = active.find((r) => r.id === "img-alt")!;
    expect(imgAlt.description).toBe("Translated description only");
    expect(imgAlt.guidance).toBe(rules.find((r) => r.id === "img-alt")!.guidance);
  });

  it("does not mutate original rule objects", () => {
    const originalDesc = rules.find((r) => r.id === "img-alt")!.description;

    registerLocale("mutate-check", {
      "img-alt": { description: "Mutated?" },
    });
    configureRules({ locale: "mutate-check" });
    getActiveRules();

    expect(rules.find((r) => r.id === "img-alt")!.description).toBe(originalDesc);
  });

  it("resets when locale is cleared", () => {
    registerLocale("temp", {
      "img-alt": { description: "Temporary" },
    });
    configureRules({ locale: "temp" });
    expect(getActiveRules().find((r) => r.id === "img-alt")!.description).toBe("Temporary");

    configureRules({ locale: undefined });
    const original = rules.find((r) => r.id === "img-alt")!;
    expect(getActiveRules().find((r) => r.id === "img-alt")!.description).toBe(original.description);
  });

  it("getRuleById respects active locale", () => {
    registerLocale("lookup", {
      "img-alt": { description: "Lookup translation" },
    });
    configureRules({ locale: "lookup" });

    const rule = getRuleById("img-alt")!;
    expect(rule.description).toBe("Lookup translation");
  });

  it("English locale entries match all built-in rules", () => {
    const enIds = new Set(Object.keys(en));
    const ruleIds = new Set(rules.map((r) => r.id));

    for (const id of ruleIds) {
      expect(enIds.has(id), `Missing English translation for rule: ${id}`).toBe(true);
    }
    for (const id of enIds) {
      expect(ruleIds.has(id), `English translation for unknown rule: ${id}`).toBe(true);
    }
    expect(enIds.size).toBe(ruleIds.size);
  });

  it("English locale values stay in sync with rule source", () => {
    for (const rule of rules) {
      const t = en[rule.id];
      expect(t.description, `en.ts description out of sync for ${rule.id}`).toBe(rule.description);
      if (rule.guidance) {
        expect(t.guidance, `en.ts guidance out of sync for ${rule.id}`).toBe(rule.guidance);
      }
    }
  });
});
