import type { Rule } from "../types";
import { getSelector, getHtmlSnippet } from "../utils/selector";
import { isAriaHidden, getAccessibleName } from "../utils/aria";

export const emptyHeading: Rule = {
  id: "navigable/empty-heading",
  category: "navigable",
  actRuleIds: ["ffd0e9"],
  wcag: ["2.4.6"],
  level: "A",
  tags: ["best-practice"],
  description: "Headings must have discernible text.",
  guidance: "Screen reader users navigate pages by headings, so empty headings create confusing navigation points. Ensure all headings contain visible text or accessible names. If a heading is used purely for visual styling, use CSS instead of heading elements.",
  prompt:
    "This heading element has no text content, so screen reader users encounter a blank heading when navigating. Either add descriptive text that summarizes the following section, or if this element is used only for visual styling, replace it with a styled <p> or <div> and use CSS for appearance. The context includes nearby content to help suggest appropriate heading text.",
  run(doc) {
    const violations = [];
    const headings = doc.querySelectorAll('h1, h2, h3, h4, h5, h6, [role="heading"]');

    for (const heading of headings) {
      if (isAriaHidden(heading)) continue;

      if (!getAccessibleName(heading)) {
        // Sample nearby content for heading text suggestion
        let nearby: string | undefined;
        const next = heading.nextElementSibling;
        if (next) {
          const text = next.textContent?.trim().replace(/\s+/g, " ") || "";
          if (text) nearby = text.slice(0, 100);
        }

        violations.push({
          ruleId: "navigable/empty-heading",
          selector: getSelector(heading),
          html: getHtmlSnippet(heading),
          impact: "minor" as const,
          message: "Heading is empty. Add text content or remove the heading element.",
          context: nearby ? `Following content: "${nearby}"` : undefined,
        });
      }
    }
    return violations;
  },
};
