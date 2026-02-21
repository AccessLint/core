import type { Rule } from "../types";
import { getSelector, getHtmlSnippet } from "../utils/selector";
import { isAriaHidden } from "../utils/aria";

export const accesslint021: Rule = {
  id: "accesslint-021",
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
          ruleId: "accesslint-021",
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
