import type { Rule } from "../types";
import { getSelector, getHtmlSnippet } from "../utils/selector";
import { isAriaHidden } from "../utils/aria";
import { NATIVE_LABELABLE_SELECTOR, findAssociatedLabel } from "./form-constants";

export const labelTitleOnly: Rule = {
  id: "labels-and-names/label-title-only",
  category: "labels-and-names",
  wcag: ["4.1.2"],
  level: "A",
  tags: ["best-practice"],
  description: "Form elements should not use title attribute as the only accessible name.",
  guidance: "The title attribute is unreliable as a label because it only appears on hover/focus (not visible to touch users) and is often ignored by assistive technologies. Use a visible <label> element, aria-label, or aria-labelledby instead. Title can supplement a label but should not replace it.",
  prompt:
    "The title attribute text should be moved to a visible <label> element or aria-label. Show what text to use based on the current title.",
  run(doc) {
    const violations = [];
    const inputs = doc.querySelectorAll(NATIVE_LABELABLE_SELECTOR);

    for (const input of inputs) {
      if (isAriaHidden(input)) continue;

      const hasTitle = input.hasAttribute("title") && input.getAttribute("title")?.trim();
      const hasAriaLabel = input.hasAttribute("aria-label") && input.getAttribute("aria-label")?.trim();
      const hasAriaLabelledby = input.hasAttribute("aria-labelledby");

      // Check for associated <label>
      const label = findAssociatedLabel(input);
      const hasLabel = !!label?.textContent?.trim();

      // Violation if only title is used
      if (hasTitle && !hasAriaLabel && !hasAriaLabelledby && !hasLabel) {
        violations.push({
          ruleId: "labels-and-names/label-title-only",
          selector: getSelector(input),
          html: getHtmlSnippet(input),
          impact: "serious" as const,
          message: "Form element uses title attribute as only label. Use <label>, aria-label, or aria-labelledby instead.",
        });
      }
    }

    return violations;
  },
};
