import type { Rule } from "../types";
import { getSelector, getHtmlSnippet } from "../utils/selector";
import { getAccessibleName, isAriaHidden } from "../utils/aria";

export const formLabel: Rule = {
  id: "label",
  wcag: ["4.1.2"],
  level: "A",
  description: "Form elements must have labels. Use <label>, aria-label, or aria-labelledby.",
  guidance: "Every form input needs an accessible label so users understand what information to enter. Use a <label> element with a for attribute matching the input's id, wrap the input in a <label>, or use aria-label/aria-labelledby for custom components. Placeholders are not sufficient as labels since they disappear when typing.",
  prompt:
    "Based on the input type, name attribute, or placeholder, suggest a label element with appropriate text, or an aria-label.",
  run(doc) {
    const violations = [];
    const inputs = doc.querySelectorAll(
      'input:not([type="hidden"]):not([type="submit"]):not([type="button"]):not([type="reset"]):not([type="image"]), textarea, select'
    );
    for (const input of inputs) {
      if (isAriaHidden(input)) continue;
      const name = getAccessibleName(input);
      if (!name) {
        violations.push({
          ruleId: "label",
          selector: getSelector(input),
          html: getHtmlSnippet(input),
          impact: "critical" as const,
          message: "Form element has no accessible label.",
        });
      }
    }
    return violations;
  },
};

export const formFieldMultipleLabels: Rule = {
  id: "form-field-multiple-labels",
  wcag: [],
  level: "A",
  tags: ["best-practice"],
  description: "Form fields should not have multiple label elements.",
  guidance: "When a form field has multiple <label> elements pointing to it, assistive technologies may announce only one label or behave inconsistently. Use a single <label> and combine any additional text into it, or use aria-describedby for supplementary information.",
  prompt:
    "Identify the multiple labels and recommend consolidating them into a single <label> element or using aria-describedby for supplementary text.",
  run(doc) {
    const violations = [];
    const inputs = doc.querySelectorAll('input:not([type="hidden"]), textarea, select');

    for (const input of inputs) {
      if (isAriaHidden(input)) continue;
      if (!input.id) continue;

      // Count labels pointing to this input
      const labels = doc.querySelectorAll(`label[for="${CSS.escape(input.id)}"]`);

      // Also check for wrapping labels — only count <label> ancestors that
      // have no `for` attribute (a label with `for` is already counted above
      // if it points here, or labels a different element if it points elsewhere).
      let wrappingLabelCount = 0;
      let parent = input.parentElement;
      while (parent) {
        if (parent.tagName.toLowerCase() === "label" && !parent.hasAttribute("for")) {
          wrappingLabelCount++;
          break; // only the closest wrapping label applies per spec
        }
        parent = parent.parentElement;
      }

      const totalLabels = labels.length + wrappingLabelCount;

      if (totalLabels > 1) {
        violations.push({
          ruleId: "form-field-multiple-labels",
          selector: getSelector(input),
          html: getHtmlSnippet(input),
          impact: "moderate" as const,
          message: `Form field has ${totalLabels} labels. Use a single label element.`,
        });
      }
    }

    return violations;
  },
};
