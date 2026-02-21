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
  prompt: "Explain whether to move this element outside the <dl> or convert it to dt/dd.",
};

export const definitionList = compileDeclarativeRule(definitionListSpec);
