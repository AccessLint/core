import type { Rule } from "../types";
import { getSelector, getHtmlSnippet } from "../utils/selector";
import { getAccessibleName, isAriaHidden, isComputedHidden, isInShadowDOM } from "../utils/aria";

export const accesslint065: Rule = {
  id: "accesslint-065",
  wcag: ["4.1.2"],
  level: "A",
  description: "ARIA input fields must have an accessible name.",
  guidance: "ARIA input widgets (combobox, listbox, searchbox, slider, spinbutton, textbox) must have accessible names so users understand what data to enter. Add a visible label with aria-labelledby, or use aria-label if a visible label is not possible.",
  prompt:
    "Based on the context, suggest an aria-label describing what data this input field accepts.",
  run(doc) {
    const violations = [];
    const selector = '[role="combobox"], [role="listbox"], [role="searchbox"], [role="slider"], [role="spinbutton"], [role="textbox"]';

    for (const el of doc.querySelectorAll(selector)) {
      if (isAriaHidden(el)) continue;
      if (isComputedHidden(el)) continue;
      // Skip shadow DOM elements — name resolution can't reliably cross shadow boundaries
      if (isInShadowDOM(el)) continue;

      // Skip native inputs handled by label rule
      if (el.matches("input, select, textarea")) continue;

      const name = getAccessibleName(el);
      if (!name) {
        violations.push({
          ruleId: "accesslint-065",
          selector: getSelector(el),
          html: getHtmlSnippet(el),
          impact: "serious" as const,
          message: "ARIA input field has no accessible name.",
        });
      }
    }

    return violations;
  },
};
