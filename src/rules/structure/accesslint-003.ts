import type { Rule } from "../types";
import { getAccessibleName } from "../utils/aria";

export const accesslint003: Rule = {
  id: "accesslint-003",
  wcag: [],
  level: "A",
  tags: ["best-practice"],
  description: "Page should contain a level-one heading.",
  guidance: "A level-one heading (<h1> or role='heading' with aria-level='1') helps users understand the page topic and provides a landmark for screen reader navigation. Each page should have exactly one h1 that describes the main content, typically matching or similar to the page title.",
  prompt:
    "The page has no <h1> heading. Suggest appropriate h1 text based on the page title or content sample in context. The h1 should describe the page's main topic and typically be placed at the start of the main content area.",
  run(doc) {
    const h1 = doc.querySelector("h1");
    if (h1 && getAccessibleName(h1)) return [];

    // Check for role="heading" with aria-level="1"
    const roleHeadings = doc.querySelectorAll('[role="heading"][aria-level="1"]');
    for (const heading of roleHeadings) {
      if (getAccessibleName(heading)) return [];
    }

    // Gather context for h1 suggestion
    const parts: string[] = [];
    const title = doc.querySelector("title")?.textContent?.trim();
    if (title) parts.push(`Page title: "${title}"`);
    const main = doc.querySelector("main");
    if (main) {
      const text = main.textContent?.trim().replace(/\s+/g, " ") || "";
      if (text) parts.push(`Main content: "${text.slice(0, 100)}"`);
    }

    return [{
      ruleId: "accesslint-003",
      selector: "html",
      html: "<html>",
      impact: "moderate" as const,
      message: "Page does not contain a level-one heading.",
      context: parts.length > 0 ? parts.join(", ") : undefined,
    }];
  },
};
