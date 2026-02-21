import type { Rule, Violation } from "../types";
import { getSelector, getHtmlSnippet } from "../utils/selector";
import { SECTIONING_SELECTOR } from "./constants";

export const accesslint040: Rule = {
  id: "accesslint-040",
  wcag: [],
  level: "A",
  tags: ["best-practice"],
  description: "Banner landmark should not be nested within another landmark.",
  guidance: "The banner landmark should be a top-level landmark, not nested inside article, aside, main, nav, or section. If a header is inside these elements, it automatically becomes a generic header rather than a banner. Remove explicit role='banner' from nested headers or restructure the page.",
  prompt:
    "Explain why this banner is incorrectly nested and how to fix it.",
  run(doc) {
    const violations: Violation[] = [];
    const banners = doc.querySelectorAll('[role="banner"]');

    for (const banner of banners) {
      if (banner.closest(SECTIONING_SELECTOR)) {
        violations.push({
          ruleId: "accesslint-040",
          selector: getSelector(banner),
          html: getHtmlSnippet(banner),
          impact: "moderate" as const,
          message: "Banner landmark is nested within another landmark.",
        });
      }
    }
    return violations;
  },
};
