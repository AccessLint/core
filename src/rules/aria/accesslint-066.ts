import type { Rule } from "../types";
import { getSelector, getHtmlSnippet } from "../utils/selector";
import { getAccessibleName, isAriaHidden, isComputedHidden, isInShadowDOM } from "../utils/aria";

export const accesslint066: Rule = {
  id: "accesslint-066",
  wcag: ["4.1.2"],
  level: "A",
  description: "ARIA toggle fields must have an accessible name.",
  guidance: "ARIA toggle controls (checkbox, switch, radio, menuitemcheckbox, menuitemradio) must have accessible names so users understand what option they're selecting. Add visible text content, aria-label, or use aria-labelledby to reference a visible label.",
  prompt:
    "Based on the context, suggest an aria-label describing what option this toggle controls.",
  run(doc) {
    const violations = [];
    const selector = '[role="checkbox"], [role="switch"], [role="radio"], [role="menuitemcheckbox"], [role="menuitemradio"]';

    for (const el of doc.querySelectorAll(selector)) {
      if (isAriaHidden(el)) continue;
      if (isComputedHidden(el)) continue;
      // Skip shadow DOM elements — name resolution can't reliably cross shadow boundaries
      if (isInShadowDOM(el)) continue;

      // Skip native inputs handled by other rules
      if (el.matches('input[type="checkbox"], input[type="radio"]')) continue;

      const name = getAccessibleName(el);
      if (!name) {
        violations.push({
          ruleId: "accesslint-066",
          selector: getSelector(el),
          html: getHtmlSnippet(el),
          impact: "serious" as const,
          message: "ARIA toggle field has no accessible name.",
        });
      }
    }

    return violations;
  },
};
