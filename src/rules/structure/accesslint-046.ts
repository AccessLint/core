import type { DeclarativeRule } from "../types";
import { compileDeclarativeRule } from "../engine";

const listSpec: DeclarativeRule = {
  id: "accesslint-046",
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

export const accesslint046 = compileDeclarativeRule(listSpec);
