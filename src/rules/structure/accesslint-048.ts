import type { Rule } from "../types";
import { getSelector, getHtmlSnippet } from "../utils/selector";

export const accesslint048: Rule = {
  id: "accesslint-048",
  wcag: ["1.3.1"],
  level: "A",
  description: "<dt> and <dd> elements must be contained in a <dl>.",
  guidance:
    "Definition terms (<dt>) and definitions (<dd>) only have semantic meaning inside a definition list (<dl>). Outside of <dl>, they're treated as generic text. Wrap related <dt> and <dd> pairs in a <dl> element to convey the term/definition relationship to assistive technologies.",
  prompt:
    "Explain how to properly structure this term/definition content.",
  run(doc) {
    const violations = [];
    for (const el of doc.querySelectorAll("dt, dd")) {
      const parent = el.parentElement;
      const tag = parent?.tagName.toLowerCase();
      if (!parent || (tag !== "dl" && !(tag === "div" && parent.parentElement?.tagName.toLowerCase() === "dl"))) {
        violations.push({
          ruleId: "accesslint-048",
          selector: getSelector(el),
          html: getHtmlSnippet(el),
          impact: "serious" as const,
          message: `<${el.tagName.toLowerCase()}> is not contained in a <dl>.`,
        });
      }
    }
    return violations;
  },
};
