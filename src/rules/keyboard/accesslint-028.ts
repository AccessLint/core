import type { Rule } from "../types";
import { getSelector, getHtmlSnippet } from "../utils/selector";

const NON_INTERACTIVE_TAGS = new Set([
  "div", "span", "p", "section", "article", "header", "footer", "main",
  "nav", "aside", "h1", "h2", "h3", "h4", "h5", "h6", "ul", "ol", "li",
  "dl", "dt", "dd", "table", "tr", "td", "th",
]);

export const accesslint028: Rule = {
  id: "accesslint-028",
  wcag: [],
  tags: ["best-practice"],
  level: "A",
  description:
    "Elements that receive keyboard focus must have an appropriate role so assistive technologies can convey their purpose. Non-interactive elements with tabindex='0' need a valid interactive ARIA role.",
  guidance:
    "When adding tabindex='0' to non-interactive elements like <div> or <span>, screen readers announce them generically. Add an appropriate role (button, link, tab, etc.) so users understand the element's purpose. Also add keyboard event handlers (Enter/Space for buttons, Enter for links). Consider using native interactive elements instead.",
  prompt:
    "Based on the element's apparent purpose, suggest adding an appropriate role attribute (button, link, etc.) or converting to a native interactive element.",
  run(doc) {
    const violations = [];
    for (const el of doc.querySelectorAll('[tabindex="0"]')) {
      const tag = el.tagName.toLowerCase();
      if (!NON_INTERACTIVE_TAGS.has(tag)) continue;
      const role = el.getAttribute("role");
      if (!role) {
        violations.push({
          ruleId: "accesslint-028",
          selector: getSelector(el),
          html: getHtmlSnippet(el),
          impact: "moderate" as const,
          message: `Non-interactive <${tag}> with tabindex="0" has no interactive role.`,
        });
      }
    }
    return violations;
  },
};
