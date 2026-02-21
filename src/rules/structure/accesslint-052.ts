import type { Rule } from "../types";
import { checkTextSpacing } from "./text-spacing-helpers";

export const accesslint052: Rule = {
  id: "accesslint-052",
  actRuleIds: ["9e45ec"],
  wcag: ["1.4.12"],
  level: "AA",
  description:
    "Word spacing set with !important in style attributes must be at least 0.16em.",
  guidance:
    "WCAG 1.4.12 requires users to be able to override text spacing. Using !important on word-spacing with a value below 0.16em prevents this. Either increase the value to at least 0.16em or remove !important.",
  run(doc) {
    return checkTextSpacing(doc, "accesslint-052", "word-spacing", 0.16);
  },
};
