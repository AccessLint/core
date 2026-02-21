import type { Rule } from "../types";
import { getSelector, getHtmlSnippet } from "../utils/selector";
import { getAccessibleName, isAriaHidden } from "../utils/aria";

export function createNameRule(opts: {
  id: string;
  description: string;
  guidance: string;
  selector: string;
  message: string;
  actRuleIds?: string[];
  prompt?: string;
  roleSet?: Set<string>;
}): Rule {
  return {
    id: opts.id,
    ...(opts.actRuleIds ? { actRuleIds: opts.actRuleIds } : {}),
    wcag: ["4.1.2"],
    level: "A",
    description: opts.description,
    guidance: opts.guidance,
    ...(opts.prompt ? { prompt: opts.prompt } : {}),
    run(doc) {
      const violations = [];

      for (const el of doc.querySelectorAll(opts.selector)) {
        if (isAriaHidden(el)) continue;

        // Check if role matches (if roleSet provided)
        if (opts.roleSet) {
          const role = el.getAttribute("role")?.trim().toLowerCase();
          if (!role || !opts.roleSet.has(role)) continue;
        }

        const name = getAccessibleName(el);
        if (!name) {
          violations.push({
            ruleId: opts.id,
            selector: getSelector(el),
            html: getHtmlSnippet(el),
            impact: "serious" as const,
            message: opts.message,
          });
        }
      }

      return violations;
    },
  };
}
