import type { Rule } from "../types";
import { getSelector, getHtmlSnippet } from "../utils/selector";
import { getAccessibleName, isAriaHidden } from "../utils/aria";

export const roleImgAlt: Rule = {
  id: "text-alternatives/role-img-alt",
  category: "text-alternatives",
  wcag: ["1.1.1"],
  level: "A",
  description: "Elements with role='img' must have an accessible name.",
  guidance: "When you assign role='img' to an element (like a div containing icon fonts or CSS backgrounds), you must provide an accessible name via aria-label or aria-labelledby. Without this, screen reader users have no way to understand what the image represents. If the image is decorative, use role='presentation' or role='none' instead.",
  prompt:
    "Based on the element's content or class names, suggest either an aria-label describing the image, or if decorative, recommend removing role='img' or adding aria-hidden='true'.",
  run(doc) {
    const violations = [];

    for (const el of doc.querySelectorAll('[role="img"]')) {
      if (isAriaHidden(el)) continue;

      // SVG with role="img" is handled by svg-img-alt rule
      if (el.tagName.toLowerCase() === "svg") continue;

      // Native img elements don't need this check (handled by img-alt)
      if (el.tagName.toLowerCase() === "img") continue;

      const name = getAccessibleName(el);
      if (!name) {
        violations.push({
          ruleId: "text-alternatives/role-img-alt",
          selector: getSelector(el),
          html: getHtmlSnippet(el),
          impact: "serious" as const,
          message: "Element with role='img' has no accessible name. Add aria-label or aria-labelledby.",
        });
      }
    }

    return violations;
  },
};
