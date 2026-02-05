import type { Rule } from "../types";
import { getSelector, getHtmlSnippet } from "../utils/selector";
import { isAriaHidden, getAccessibleTextContent } from "../utils/aria";

export const skipLink: Rule = {
  id: "skip-link",
  wcag: ["2.4.1"],
  level: "A",
  tags: ["best-practice"],
  description: "Skip links must point to a valid target on the page.",
  guidance: "Skip links allow keyboard users to bypass repetitive navigation and jump directly to main content. The skip link should be the first focusable element on the page, link to the main content (e.g., href='#main'), and become visible when focused. It can be visually hidden until focused using CSS.",
  prompt:
    "A skip link is a single <a href='#main'>Skip to main content</a> as the first element in <body>. It can be visually hidden with CSS until focused. Explain this simple pattern.",
  run(doc) {
    const violations = [];

    // Find skip-link candidates: same-page anchor links near the top of the
    // page whose text suggests a "skip to …" purpose.  Only validate that
    // their targets exist — absence of a skip link is covered by the
    // separate "bypass" rule.
    const anchors = doc.querySelectorAll('a[href^="#"]');

    for (const a of anchors) {
      const href = a.getAttribute("href");
      if (!href || href === "#") continue;

      const text = getAccessibleTextContent(a).toLowerCase();
      const isSkipLink =
        text.includes("skip") || text.includes("jump") ||
        text.includes("main content") || text.includes("navigation");
      if (!isSkipLink) continue;

      // Validate the target exists
      const targetId = href.slice(1);
      const target = doc.getElementById(targetId);
      if (!target) {
        violations.push({
          ruleId: "skip-link",
          selector: getSelector(a),
          html: getHtmlSnippet(a),
          impact: "moderate" as const,
          message: `Skip link points to "#${targetId}" which does not exist on the page.`,
        });
      }
    }

    return violations;
  },
};

export const linkInTextBlock: Rule = {
  id: "link-in-text-block",
  wcag: ["1.4.1"],
  level: "A",
  description: "Links within text blocks must be distinguishable by more than color alone.",
  guidance: "Users who cannot perceive color differences need other visual cues to identify links. Links in text should have underlines or other non-color indicators. If using color alone, ensure 3:1 contrast with surrounding text AND provide additional indication on focus/hover.",
  prompt:
    "Explain how to make this link visually distinguishable without relying on color alone.",
  run(doc) {
    const violations = [];

    for (const link of doc.querySelectorAll("a[href]")) {
      if (isAriaHidden(link)) continue;

      // Check if link is in a text block (has text siblings)
      const parent = link.parentElement;
      if (!parent) continue;

      // Check if parent has substantial text content beyond the link
      const parentText = parent.textContent || "";
      const linkText = link.textContent || "";

      // If parent text is much longer than link text, link is in a text block
      if (parentText.length > linkText.length + 20) {
        // Check if link has text-decoration (underline) via computed style
        // In testing environment, we can't reliably check computed styles
        // So we check for explicit styling attributes that remove underlines

        // Check for explicit style removing underline
        const style = link.getAttribute("style") || "";
        if (style.includes("text-decoration") && style.includes("none")) {
          violations.push({
            ruleId: "link-in-text-block",
            selector: getSelector(link),
            html: getHtmlSnippet(link),
            impact: "serious" as const,
            message: "Link in text block has no underline. Add text-decoration or other non-color indicator.",
          });
        }
      }
    }

    return violations;
  },
};
