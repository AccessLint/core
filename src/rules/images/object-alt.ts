import type { Rule } from "../types";
import { getSelector, getHtmlSnippet } from "../utils/selector";
import { getAccessibleName, isAriaHidden } from "../utils/aria";

export const objectAlt: Rule = {
  id: "object-alt",
  wcag: ["1.1.1"],
  level: "A",
  description: "<object> elements must have alternative text.",
  guidance: "Object elements embed external content that may not be accessible to all users. Provide alternative text via aria-label, aria-labelledby, or fallback content inside the <object> element. The fallback content displays when the object cannot be rendered and should convey the same information.",
  prompt:
    "Based on the data/type attributes, suggest adding aria-label or fallback text content inside the <object> tag describing what the embedded content represents.",
  run(doc) {
    const violations = [];

    for (const obj of doc.querySelectorAll("object")) {
      if (isAriaHidden(obj)) continue;

      // Skip objects that are purely decorative
      if (obj.getAttribute("role") === "presentation" || obj.getAttribute("role") === "none") {
        continue;
      }

      // Check for accessible name (covers aria-label, aria-labelledby,
      // title, and fallback text content via getAccessibleTextContent)
      if (getAccessibleName(obj)) continue;

      violations.push({
        ruleId: "object-alt",
        selector: getSelector(obj),
        html: getHtmlSnippet(obj),
        impact: "serious" as const,
        message: "<object> element is missing alternative text. Add aria-label, aria-labelledby, or fallback content.",
      });
    }

    return violations;
  },
};
