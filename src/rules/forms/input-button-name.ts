import type { Rule } from "../types";
import { getSelector, getHtmlSnippet } from "../utils/selector";
import { getAccessibleName, isAriaHidden, isComputedHidden } from "../utils/aria";

export const inputButtonName: Rule = {
  id: "accesslint-023",
  wcag: ["4.1.2"],
  level: "A",
  description: "Input buttons must have discernible text via value, aria-label, or aria-labelledby.",
  guidance:
    "Input buttons (<input type='submit'>, type='button', type='reset'>) need accessible names so users know what action the button performs. Add a value attribute with descriptive text (e.g., value='Submit Form'), or use aria-label if the value must differ from the accessible name.",
  prompt:
    "Based on the input type and form context, suggest a value attribute describing the button's action.",
  run(doc) {
    const violations = [];
    for (const input of doc.querySelectorAll(
      'input[type="submit"], input[type="button"], input[type="reset"]'
    )) {
      if (isAriaHidden(input)) continue;
      if (isComputedHidden(input)) continue;
      const value = input.getAttribute("value")?.trim();
      // submit and reset inputs have browser-default labels when value is absent
      const type = input.getAttribute("type")?.toLowerCase();
      const hasDefaultLabel = (type === "submit" || type === "reset") && !input.hasAttribute("value");
      if (!value && !hasDefaultLabel && !getAccessibleName(input)) {
        violations.push({
          ruleId: "accesslint-023",
          selector: getSelector(input),
          html: getHtmlSnippet(input),
          impact: "critical" as const,
          message: "Input button has no discernible text.",
        });
      }
    }
    return violations;
  },
};
