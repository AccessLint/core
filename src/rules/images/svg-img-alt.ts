import type { Rule } from "../types";
import { getSelector, getHtmlSnippet } from "../utils/selector";
import { isAriaHidden, getAccessibleName } from "../utils/aria";

export const svgImgAlt: Rule = {
  id: "svg-img-alt",
  wcag: ["1.1.1"],
  level: "A",
  description:
    "SVG elements with an img, graphics-document, or graphics-symbol role must have an accessible name via a <title> element, aria-label, or aria-labelledby.",
  guidance:
    "Inline SVGs with role='img' need accessible names. Add a <title> element as the first child of the SVG (screen readers will announce it), or use aria-label on the SVG element. For complex SVGs, use aria-labelledby referencing both a <title> and <desc> element. Decorative SVGs should use aria-hidden='true' instead.",
  prompt:
    "Based on the SVG content or context, suggest either adding aria-label with a description, or if decorative, replacing role='img' with aria-hidden='true'.",
  run(doc) {
    const violations = [];
    for (const svg of doc.querySelectorAll('svg[role="img"]')) {
      if (isAriaHidden(svg)) continue;
      const name = getAccessibleName(svg);
      if (!name) {
        violations.push({
          ruleId: "svg-img-alt",
          selector: getSelector(svg),
          html: getHtmlSnippet(svg),
          impact: "serious" as const,
          message: "SVG with role='img' has no accessible name.",
        });
      }
    }
    return violations;
  },
};
