import type { Rule } from "../types";
import { getSelector, getHtmlSnippet } from "../utils/selector";

export const dlChildren: Rule = {
  id: "adaptable/dl-children",
  category: "adaptable",
  wcag: ["1.3.1"],
  level: "A",
  description: "<dt> and <dd> elements must be contained in a <dl>.",
  guidance:
    "Definition terms (<dt>) and definitions (<dd>) only have semantic meaning inside a definition list (<dl>). Outside of <dl>, they're treated as generic text. Wrap related <dt> and <dd> pairs in a <dl> element to convey the term/definition relationship to assistive technologies.",
  prompt:
    "This <dt> or <dd> is outside a <dl>. Wrap it and its related term/definition siblings in a <dl> element. For example: <dl><dt>Term</dt><dd>Definition</dd></dl>. If this content is not a term/definition pair, use a different element like <p> or <div> instead.",
  run(doc) {
    const violations = [];
    for (const el of doc.querySelectorAll("dt, dd")) {
      const parent = el.parentElement;
      const tag = parent?.tagName.toLowerCase();
      if (!parent || (tag !== "dl" && !(tag === "div" && parent.parentElement?.tagName.toLowerCase() === "dl"))) {
        violations.push({
          ruleId: "adaptable/dl-children",
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
