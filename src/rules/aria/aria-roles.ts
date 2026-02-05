import type { Rule } from "../types";
import { getSelector, getHtmlSnippet } from "../utils/selector";
import { isValidRole } from "../utils/aria";

export const ariaRoles: Rule = {
  id: "aria-roles",
  wcag: ["4.1.2"],
  level: "A",
  description: "ARIA role values must be valid.",
  guidance:
    "Invalid role values are ignored by assistive technologies, meaning the element will not have the intended semantics. Check the spelling and use only roles defined in the WAI-ARIA specification. Common roles include: button, link, navigation, main, dialog, alert, tab, tabpanel, menu, menuitem.",
  prompt:
    "Identify the invalid role and suggest the correct spelling or a valid alternative role that matches the intended purpose.",
  run(doc) {
    const violations = [];
    for (const el of doc.querySelectorAll("[role]")) {
      const rawRole = el.getAttribute("role")!;
      // Strip Unicode curly quotes before splitting
      const cleaned = rawRole.replace(/[\u201C\u201D\u2018\u2019\u00AB\u00BB]/g, "");
      const roles = cleaned.split(/\s+/);
      for (const role of roles) {
        if (role && !isValidRole(role)) {
          violations.push({
            ruleId: "aria-roles",
            selector: getSelector(el),
            html: getHtmlSnippet(el),
            impact: "critical" as const,
            message: `Invalid ARIA role "${role}".`,
          });
          break;
        }
      }
    }
    return violations;
  },
};
