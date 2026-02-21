import type { Rule } from "../types";
import { getHtmlSnippet } from "../utils/selector";
import { isValidLangTag } from "./constants";

export const htmlLangValid: Rule = {
  id: "accesslint-081",
  actRuleIds: ["bf051a"],
  wcag: ["3.1.1"],
  level: "A",
  description: "The lang attribute on <html> must have a valid value.",
  guidance: "The lang attribute must use a valid BCP 47 language tag. Use a 2 or 3 letter language code (e.g., 'en', 'fr', 'zh'), optionally followed by a region code (e.g., 'en-US', 'pt-BR'). Invalid tags prevent screen readers from correctly pronouncing content.",
  prompt:
    "Suggest the correct BCP 47 language tag based on the invalid value provided.",
  run(doc) {
    const lang = doc.documentElement.getAttribute("lang")?.trim();
    if (lang && !isValidLangTag(lang)) {
      return [{
        ruleId: "accesslint-081",
        selector: "html",
        html: getHtmlSnippet(doc.documentElement),
        impact: "serious" as const,
        message: `Invalid lang attribute value "${lang}".`,
      }];
    }
    return [];
  },
};
