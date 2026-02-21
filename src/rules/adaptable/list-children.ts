import type { DeclarativeRule } from "../types";
import { compileDeclarativeRule } from "../engine";

const listSpec: DeclarativeRule = {
  id: "adaptable/list-children",
  selector: "ul, ol",
  check: { type: "child-invalid", allowedChildren: ["li", "script", "template"], allowedChildRoles: ["listitem"] },
  impact: "serious",
  message: "List contains non-<li> child <{{tag}}>.",
  description: "<ul> and <ol> must only contain <li>, <script>, or <template> as direct children.",
  wcag: ["1.3.1"],
  level: "A",
  guidance: "Screen readers announce list structure ('list with 5 items') based on proper markup. Placing non-<li> elements directly inside <ul> or <ol> breaks this structure. Wrap content in <li> elements, or if you need wrapper divs for styling, restructure your CSS to style the <li> elements directly.",
  prompt: "This non-<li> element is a direct child of <ul> or <ol>. Wrap it in an <li> element, or if it is a wrapper div used for styling, apply the styles to the <li> elements directly and remove the wrapper. For example: change <ul><div>item</div></ul> to <ul><li>item</li></ul>.",
};

export const listChildren = compileDeclarativeRule(listSpec);
