import { describe, it, expect, beforeEach } from "vitest";
import { rules, configureRules, getActiveRules, getRuleById, runAudit } from "../rules/index";
import { registerLocale, translateViolations } from "./registry";
import { en } from "./en";
import { es } from "./es";

beforeEach(() => {
  // Reset to no locale between tests
  configureRules({ locale: undefined, additionalRules: [], disabledRules: [], includeAAA: false });
});

describe("i18n locale support", () => {
  it("returns original descriptions when no locale is set", () => {
    const active = getActiveRules();
    const imgAlt = active.find((r) => r.id === "accesslint-011")!;
    expect(imgAlt.description).toBe(rules.find((r) => r.id === "accesslint-011")!.description);
  });

  it("applies registered locale translations", () => {
    registerLocale("test", {
      "accesslint-011": { description: "Test description", guidance: "Test guidance" },
    });
    configureRules({ locale: "test" });

    const active = getActiveRules();
    const imgAlt = active.find((r) => r.id === "accesslint-011")!;
    expect(imgAlt.description).toBe("Test description");
    expect(imgAlt.guidance).toBe("Test guidance");
  });

  it("falls back to original for untranslated rules", () => {
    registerLocale("partial", {
      "accesslint-011": { description: "Translated img-alt" },
    });
    configureRules({ locale: "partial" });

    const active = getActiveRules();
    const linkName = active.find((r) => r.id === "accesslint-077")!;
    const original = rules.find((r) => r.id === "accesslint-077")!;
    expect(linkName.description).toBe(original.description);
    expect(linkName.guidance).toBe(original.guidance);
  });

  it("preserves guidance when translation omits it", () => {
    registerLocale("no-guidance", {
      "accesslint-011": { description: "Translated description only" },
    });
    configureRules({ locale: "no-guidance" });

    const active = getActiveRules();
    const imgAlt = active.find((r) => r.id === "accesslint-011")!;
    expect(imgAlt.description).toBe("Translated description only");
    expect(imgAlt.guidance).toBe(rules.find((r) => r.id === "accesslint-011")!.guidance);
  });

  it("does not mutate original rule objects", () => {
    const originalDesc = rules.find((r) => r.id === "accesslint-011")!.description;

    registerLocale("mutate-check", {
      "accesslint-011": { description: "Mutated?" },
    });
    configureRules({ locale: "mutate-check" });
    getActiveRules();

    expect(rules.find((r) => r.id === "accesslint-011")!.description).toBe(originalDesc);
  });

  it("resets when locale is cleared", () => {
    registerLocale("temp", {
      "accesslint-011": { description: "Temporary" },
    });
    configureRules({ locale: "temp" });
    expect(getActiveRules().find((r) => r.id === "accesslint-011")!.description).toBe("Temporary");

    configureRules({ locale: undefined });
    const original = rules.find((r) => r.id === "accesslint-011")!;
    expect(getActiveRules().find((r) => r.id === "accesslint-011")!.description).toBe(original.description);
  });

  it("getRuleById respects active locale", () => {
    registerLocale("lookup", {
      "accesslint-011": { description: "Lookup translation" },
    });
    configureRules({ locale: "lookup" });

    const rule = getRuleById("accesslint-011")!;
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

describe("i18n message translation", () => {
  it("translates static violation messages", () => {
    registerLocale("es", es);
    const violations = [
      { ruleId: "accesslint-075", message: "Button has no discernible text.", element: "<button></button>", selector: "button" },
    ];
    const translated = translateViolations(violations, "es");
    expect(translated[0].message).toBe("El botón no tiene texto discernible.");
  });

  it("translates dynamic messages with single placeholder", () => {
    registerLocale("es", es);
    const violations = [
      { ruleId: "accesslint-054", message: 'Invalid ARIA role "banana".', element: "<div>", selector: "div" },
    ];
    const translated = translateViolations(violations, "es");
    expect(translated[0].message).toBe('Rol ARIA inválido "banana".');
  });

  it("translates dynamic messages with multiple placeholders", () => {
    registerLocale("es", es);
    const violations = [
      { ruleId: "accesslint-033", message: "Heading level 4 skipped from level 2.", element: "<h4>", selector: "h4" },
    ];
    const translated = translateViolations(violations, "es");
    expect(translated[0].message).toBe("Nivel de encabezado 4 saltado desde el nivel 2.");
  });

  it("returns original message when no matching template exists", () => {
    registerLocale("es", es);
    const violations = [
      { ruleId: "accesslint-075", message: "Some unexpected message format.", element: "<button>", selector: "button" },
    ];
    const translated = translateViolations(violations, "es");
    expect(translated[0].message).toBe("Some unexpected message format.");
  });

  it("returns original violations when locale is not registered", () => {
    const violations = [
      { ruleId: "accesslint-075", message: "Button has no discernible text.", element: "<button>", selector: "button" },
    ];
    const translated = translateViolations(violations, "unknown");
    expect(translated).toBe(violations);
  });

  it("does not mutate original violation objects", () => {
    registerLocale("es", es);
    const original = { ruleId: "accesslint-075", message: "Button has no discernible text.", element: "<button>", selector: "button" };
    const violations = [original];
    const translated = translateViolations(violations, "es");
    expect(original.message).toBe("Button has no discernible text.");
    expect(translated[0].message).toBe("El botón no tiene texto discernible.");
  });

  it("handles placeholders that contain placeholder-like text", () => {
    registerLocale("es", es);
    // Captured value contains literal text that looks like a placeholder reference
    const violations = [
      { ruleId: "accesslint-056", message: 'aria-checked must be "true" or "false", got "{1} weird".', element: "<div>", selector: "div" },
    ];
    const translated = translateViolations(violations, "es");
    expect(translated[0].message).toBe('aria-checked debe ser "true" o "false", se obtuvo "{1} weird".');
  });

  it("Spanish locale has messages for all rules with English messages", () => {
    for (const [ruleId, enEntry] of Object.entries(en)) {
      if (enEntry.messages) {
        const esEntry = es[ruleId];
        expect(esEntry?.messages, `Missing Spanish messages for rule: ${ruleId}`).toBeDefined();
        for (const key of Object.keys(enEntry.messages)) {
          expect(
            esEntry.messages![key],
            `Missing Spanish message translation for ${ruleId}: "${key}"`,
          ).toBeDefined();
        }
      }
    }
  });
});
