import type { Rule } from "../types";
import { getSelector, getHtmlSnippet } from "../utils/selector";
import { isAriaHidden, getAccessibleName } from "../utils/aria";

export const emptyHeading: Rule = {
  id: "empty-heading",
  wcag: [],
  level: "A",
  tags: ["best-practice"],
  description: "Headings must have discernible text.",
  guidance: "Screen reader users navigate pages by headings, so empty headings create confusing navigation points. Ensure all headings contain visible text or accessible names. If a heading is used purely for visual styling, use CSS instead of heading elements.",
  prompt:
    "Suggest appropriate heading text or explain why to use a different element.",
  run(doc) {
    const violations = [];
    const headings = doc.querySelectorAll('h1, h2, h3, h4, h5, h6, [role="heading"]');

    for (const heading of headings) {
      if (isAriaHidden(heading)) continue;

      if (!getAccessibleName(heading)) {
        violations.push({
          ruleId: "empty-heading",
          selector: getSelector(heading),
          html: getHtmlSnippet(heading),
          impact: "minor" as const,
          message: "Heading is empty. Add text content or remove the heading element.",
        });
      }
    }
    return violations;
  },
};
