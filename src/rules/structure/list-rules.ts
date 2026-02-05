import type { Rule } from "../types";
import { getSelector, getHtmlSnippet } from "../utils/selector";

export const list: Rule = {
  id: "list",
  wcag: ["1.3.1"],
  level: "A",
  description: "<ul> and <ol> must only contain <li>, <script>, or <template> as direct children.",
  guidance:
    "Screen readers announce list structure ('list with 5 items') based on proper markup. Placing non-<li> elements directly inside <ul> or <ol> breaks this structure. Wrap content in <li> elements, or if you need wrapper divs for styling, restructure your CSS to style the <li> elements directly.",
  prompt:
    "Explain how to restructure this element within the list properly.",
  run(doc) {
    const violations = [];
    for (const listEl of doc.querySelectorAll("ul, ol")) {
      for (const child of listEl.children) {
        const tag = child.tagName.toLowerCase();
        if (tag !== "li" && tag !== "script" && tag !== "template") {
          violations.push({
            ruleId: "list",
            selector: getSelector(child),
            html: getHtmlSnippet(child),
            impact: "serious" as const,
            message: `<${listEl.tagName.toLowerCase()}> contains non-<li> child <${tag}>.`,
          });
          break; // one violation per list
        }
      }
    }
    return violations;
  },
};

export const dlitem: Rule = {
  id: "dlitem",
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
      if (!el.parentElement || el.parentElement.tagName.toLowerCase() !== "dl") {
        violations.push({
          ruleId: "dlitem",
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

export const definitionList: Rule = {
  id: "definition-list",
  wcag: ["1.3.1"],
  level: "A",
  description: "<dl> elements must only contain <dt>, <dd>, <div>, <script>, or <template>.",
  guidance:
    "Definition lists have strict content requirements. Only <dt> (terms), <dd> (definitions), and <div> (for grouping dt/dd pairs) are valid children. Other elements break the list structure for screen readers. Move invalid elements outside the <dl>, or restructure using proper definition list markup.",
  prompt:
    "Explain whether to move this element outside the <dl> or convert it to dt/dd.",
  run(doc) {
    const violations = [];
    const allowed = new Set(["dt", "dd", "div", "script", "template"]);
    for (const dl of doc.querySelectorAll("dl")) {
      for (const child of dl.children) {
        if (!allowed.has(child.tagName.toLowerCase())) {
          violations.push({
            ruleId: "definition-list",
            selector: getSelector(child),
            html: getHtmlSnippet(child),
            impact: "serious" as const,
            message: `<dl> contains invalid child <${child.tagName.toLowerCase()}>.`,
          });
          break;
        }
      }
    }
    return violations;
  },
};
