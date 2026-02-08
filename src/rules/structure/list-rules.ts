import type { Rule, DeclarativeRule } from "../types";
import { getSelector, getHtmlSnippet } from "../utils/selector";
import { compileDeclarativeRule } from "../engine";
import { isAriaHidden } from "../utils/aria";

const listSpec: DeclarativeRule = {
  id: "list",
  selector: "ul, ol",
  check: { type: "child-invalid", allowedChildren: ["li", "script", "template"], allowedChildRoles: ["listitem"] },
  impact: "serious",
  message: "List contains non-<li> child <{{tag}}>.",
  description: "<ul> and <ol> must only contain <li>, <script>, or <template> as direct children.",
  wcag: ["1.3.1"],
  level: "A",
  guidance: "Screen readers announce list structure ('list with 5 items') based on proper markup. Placing non-<li> elements directly inside <ul> or <ol> breaks this structure. Wrap content in <li> elements, or if you need wrapper divs for styling, restructure your CSS to style the <li> elements directly.",
  prompt: "Explain how to restructure this element within the list properly.",
};

export const list = compileDeclarativeRule(listSpec);

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

const definitionListSpec: DeclarativeRule = {
  id: "definition-list",
  selector: "dl",
  check: { type: "child-invalid", allowedChildren: ["dt", "dd", "div", "script", "template"] },
  impact: "serious",
  message: "<dl> contains invalid child <{{tag}}>.",
  description: "<dl> elements must only contain <dt>, <dd>, <div>, <script>, or <template>.",
  wcag: ["1.3.1"],
  level: "A",
  guidance: "Definition lists have strict content requirements. Only <dt> (terms), <dd> (definitions), and <div> (for grouping dt/dd pairs) are valid children. Other elements break the list structure for screen readers. Move invalid elements outside the <dl>, or restructure using proper definition list markup.",
  prompt: "Explain whether to move this element outside the <dl> or convert it to dt/dd.",
};

export const definitionList = compileDeclarativeRule(definitionListSpec);

export const listitem: Rule = {
  id: "listitem",
  wcag: ["1.3.1"],
  level: "A",
  description: "<li> elements must be contained in a <ul>, <ol>, or <menu>.",
  guidance:
    "List items (<li>) only have semantic meaning inside a list container (<ul>, <ol>, or <menu>). Outside of these containers, assistive technologies cannot convey the list relationship. Wrap <li> elements in the appropriate list container.",
  prompt:
    "Explain that this <li> must be placed inside a <ul>, <ol>, or <menu> element.",
  run(doc) {
    const violations = [];
    for (const el of doc.querySelectorAll("li")) {
      if (isAriaHidden(el)) continue;
      const parent = el.parentElement;
      if (!parent) continue;
      const parentTag = parent.tagName.toLowerCase();
      // Valid parents: ul, ol, menu (native), or any element with role="list"
      if (parentTag === "ul" || parentTag === "ol" || parentTag === "menu") continue;
      const parentRole = parent.getAttribute("role")?.trim().toLowerCase();
      if (parentRole === "list") continue;
      violations.push({
        ruleId: "listitem",
        selector: getSelector(el),
        html: getHtmlSnippet(el),
        impact: "serious" as const,
        message: `<li> is not contained in a <ul>, <ol>, or <menu>.`,
      });
    }
    return violations;
  },
};
