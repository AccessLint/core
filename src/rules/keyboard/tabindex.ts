import type { Rule } from "../types";
import { getSelector, getHtmlSnippet } from "../utils/selector";

export const tabindex: Rule = {
  id: "tabindex",
  wcag: [],
  tags: ["best-practice"],
  level: "A",
  description: "Elements should not have tabindex greater than 0, which disrupts natural tab order.",
  guidance:
    "Positive tabindex values force elements to the front of the tab order regardless of DOM position, creating unpredictable navigation for keyboard users. Use tabindex='0' to add elements to the natural tab order, or tabindex='-1' to make elements programmatically focusable but not in tab order. Rely on DOM order for tab sequence.",
  prompt:
    "Change the positive tabindex value to tabindex='0' and rely on DOM order for tab sequence instead.",
  run(doc) {
    const violations = [];
    for (const el of doc.querySelectorAll("[tabindex]")) {
      const value = parseInt(el.getAttribute("tabindex")!, 10);
      if (value > 0) {
        violations.push({
          ruleId: "tabindex",
          selector: getSelector(el),
          html: getHtmlSnippet(el),
          impact: "serious" as const,
          message: `Element has tabindex="${value}" which disrupts tab order.`,
        });
      }
    }
    return violations;
  },
};
