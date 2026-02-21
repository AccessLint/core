import type { Rule } from "../types";
import { getSelector, getHtmlSnippet } from "../utils/selector";
import { isAriaHidden } from "../utils/aria";
import { isValidLangTag, hasVisibleLangText } from "./constants";

export const accesslint082: Rule = {
  id: "accesslint-082",
  actRuleIds: ["de46e4"],
  wcag: ["3.1.2"],
  level: "AA",
  description: "The lang attribute must have a valid value on all elements.",
  guidance: "When content in a different language appears within a page (e.g., a French quote in an English document), wrap it with a lang attribute to ensure correct pronunciation. The lang value must be a valid BCP 47 tag. Common codes: en, es, fr, de, zh, ja, pt, ar, ru.",
  prompt:
    "Identify the content's language and suggest the correct BCP 47 tag.",
  run(doc) {
    const violations = [];

    for (const el of doc.querySelectorAll("[lang]")) {
      if (isAriaHidden(el)) continue;
      if (el === doc.documentElement) continue; // Handled by html-lang-valid

      const rawLang = el.getAttribute("lang");
      const lang = rawLang?.trim();

      // Whitespace-only lang is invalid
      if (rawLang && !lang) {
        if (hasVisibleLangText(el)) {
          violations.push({
            ruleId: "accesslint-082",
            selector: getSelector(el),
            html: getHtmlSnippet(el),
            impact: "serious" as const,
            message: "Empty lang attribute value.",
          });
        }
        continue;
      }

      if (!lang) continue;

      // Skip elements with no visible text content governed by this lang
      if (!hasVisibleLangText(el)) continue;

      if (!isValidLangTag(lang)) {
        violations.push({
          ruleId: "accesslint-082",
          selector: getSelector(el),
          html: getHtmlSnippet(el),
          impact: "serious" as const,
          message: `Invalid lang attribute value "${lang}".`,
        });
      }
    }

    return violations;
  },
};
