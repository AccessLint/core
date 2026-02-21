import type { DeclarativeRule } from "../types";
import { compileDeclarativeRule } from "../engine";

const definitionListSpec: DeclarativeRule = {
  id: "adaptable/definition-list",
  selector: "dl",
  check: { type: "child-invalid", allowedChildren: ["dt", "dd", "div", "script", "template"] },
  impact: "serious",
  message: "<dl> contains invalid child <{{tag}}>.",
  description: "<dl> elements must only contain <dt>, <dd>, <div>, <script>, or <template>.",
  wcag: ["1.3.1"],
  level: "A",
  guidance: "Definition lists have strict content requirements. Only <dt> (terms), <dd> (definitions), and <div> (for grouping dt/dd pairs) are valid children. Other elements break the list structure for screen readers. Move invalid elements outside the <dl>, or restructure using proper definition list markup.",
  prompt: "The <dl> contains an invalid child element. Move it outside the <dl>, or if it represents a term, change it to <dt>; if it represents a definition, change it to <dd>. If it is a wrapper for styling, replace it with a <div> containing <dt>/<dd> pairs, which is valid inside <dl>.",
};

export const definitionList = compileDeclarativeRule(definitionListSpec);
