import type { Rule } from "../types";
import { getSelector, getHtmlSnippet } from "../utils/selector";
import { getAccessibleName, isAriaHidden } from "../utils/aria";

export const inputImageAlt: Rule = {
  id: "input-image-alt",
  actRuleIds: ["59796f"],
  wcag: ["1.1.1", "4.1.2"],
  level: "A",
  description: 'Image inputs (<input type="image">) must have alternate text via alt, aria-label, or aria-labelledby. The text should describe the button action, not the image.',
  guidance:
    "Image buttons (<input type='image'>) must have alternate text via alt, aria-label, or aria-labelledby. The text should describe the button action, not the image.",
  prompt:
    "Based on the src attribute or form context, suggest alt text describing the button's action (e.g., 'Submit', 'Search', 'Go').",
  run(doc) {
    const violations = [];
    for (const input of doc.querySelectorAll('input[type="image"]')) {
      if (isAriaHidden(input)) continue;
      if (!getAccessibleName(input)) {
        violations.push({
          ruleId: "input-image-alt",
          selector: getSelector(input),
          html: getHtmlSnippet(input),
          impact: "critical" as const,
          message: "Image input missing alt text.",
        });
      }
    }
    return violations;
  },
};
