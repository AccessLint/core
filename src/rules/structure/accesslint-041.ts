import type { Rule, Violation } from "../types";
import { getSelector, getHtmlSnippet } from "../utils/selector";
import { SECTIONING_SELECTOR } from "./constants";

export const accesslint041: Rule = {
  id: "accesslint-041",
  wcag: [],
  level: "A",
  tags: ["best-practice"],
  description: "Contentinfo landmark should not be nested within another landmark.",
  guidance: "The contentinfo landmark should be a top-level landmark. A footer inside article, aside, main, nav, or section becomes a scoped footer, not a contentinfo landmark. Remove explicit role='contentinfo' from nested footers or move the footer outside sectioning elements.",
  prompt:
    "Explain why this contentinfo is incorrectly nested and how to fix it.",
  run(doc) {
    const violations: Violation[] = [];
    const contentinfos = doc.querySelectorAll('[role="contentinfo"]');

    for (const el of contentinfos) {
      if (el.closest(SECTIONING_SELECTOR)) {
        violations.push({
          ruleId: "accesslint-041",
          selector: getSelector(el),
          html: getHtmlSnippet(el),
          impact: "moderate" as const,
          message: "Contentinfo landmark is nested within another landmark.",
        });
      }
    }
    return violations;
  },
};
