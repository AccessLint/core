import type { Rule } from "../types";
import { getSelector, getHtmlSnippet } from "../utils/selector";

export const accesslint036: Rule = {
  id: "accesslint-036",
  wcag: [],
  level: "A",
  tags: ["best-practice"],
  description: "Page should have exactly one main landmark.",
  guidance: "The main landmark contains the primary content of the page. Screen readers allow users to jump directly to main content. Use a single <main> element (or role='main') to wrap the central content, excluding headers, footers, and navigation.",
  prompt:
    "Identify the primary content area and explain how to wrap it in a <main> element.",
  run(doc) {
    const mains = doc.querySelectorAll('main, [role="main"]');
    if (mains.length === 0) {
      return [{
        ruleId: "accesslint-036",
        selector: "html",
        html: "<html>",
        impact: "moderate" as const,
        message: "Page has no main landmark.",
      }];
    }
    if (mains.length > 1) {
      return Array.from(mains).slice(1).map((el) => ({
        ruleId: "accesslint-036",
        selector: getSelector(el),
        html: getHtmlSnippet(el),
        impact: "moderate" as const,
        message: "Page has multiple main landmarks.",
      }));
    }
    return [];
  },
};
