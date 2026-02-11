import type { Rule } from "../rules/types";
import type { LocaleMap } from "./types";

const locales = new Map<string, LocaleMap>();

export function registerLocale(locale: string, translations: LocaleMap): void {
  locales.set(locale, translations);
}

export function applyLocale(rules: Rule[], locale: string): Rule[] {
  const translations = locales.get(locale);
  if (!translations) return rules;

  return rules.map((rule) => {
    const t = translations[rule.id];
    if (!t) return rule;
    return {
      ...rule,
      description: t.description,
      guidance: t.guidance !== undefined ? t.guidance : rule.guidance,
    };
  });
}
