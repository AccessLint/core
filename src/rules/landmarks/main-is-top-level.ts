import type { Rule, Violation } from "../types";
import { getSelector, getHtmlSnippet } from "../utils/selector";

export const mainIsTopLevel: Rule = {
  id: "landmarks/main-is-top-level",
  category: "landmarks",
  wcag: [],
  level: "A",
  tags: ["best-practice"],
  description: "Main landmark should not be nested within another landmark.",
  guidance: "The main landmark must be a top-level landmark since it represents the primary content of the page. Do not nest <main> or role='main' inside article, aside, nav, or section elements.",
  prompt:
    "Explain why the main landmark must be top-level and where to move it.",
  run(doc) {
    const violations: Violation[] = [];
    const mains = doc.querySelectorAll('main, [role="main"]');

    for (const main of mains) {
      // Check if nested in other landmarks (not just sectioning elements, but other landmarks)
      const parent = main.parentElement;
      if (parent?.closest('article, aside, nav, section[aria-label], section[aria-labelledby], [role="article"], [role="complementary"], [role="navigation"], [role="region"]')) {
        violations.push({
          ruleId: "landmarks/main-is-top-level",
          selector: getSelector(main),
          html: getHtmlSnippet(main),
          impact: "moderate" as const,
          message: "Main landmark is nested within another landmark.",
        });
      }
    }
    return violations;
  },
};
