import type { Rule } from "../types";
import { getSelector, getHtmlSnippet } from "../utils/selector";
import { getAccessibleName, isAriaHidden } from "../utils/aria";

export const selectName: Rule = {
  id: "select-name",
  wcag: ["4.1.2"],
  level: "A",
  description: "Select elements must have a programmatically associated label via <label>, aria-label, or aria-labelledby.",
  guidance:
    "Select dropdowns need labels so users understand what choice they're making. Use a <label> element with a for attribute matching the select's id, or wrap the select in a <label>. For selects without visible labels, use aria-label. The first <option> is not a substitute for a proper label.",
  prompt:
    "Based on the options or context, suggest a label element or aria-label describing what this select controls.",
  run(doc) {
    const violations = [];
    for (const select of doc.querySelectorAll("select")) {
      if (isAriaHidden(select)) continue;
      if (!getAccessibleName(select)) {
        violations.push({
          ruleId: "select-name",
          selector: getSelector(select),
          html: getHtmlSnippet(select),
          impact: "critical" as const,
          message: "Select element has no accessible name.",
        });
      }
    }
    return violations;
  },
};
