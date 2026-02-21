import type { Rule } from "../types";
import { checkTextSpacing } from "./text-spacing-helpers";

export const accesslint050: Rule = {
  id: "accesslint-050",
  actRuleIds: ["24afc2"],
  wcag: ["1.4.12"],
  level: "AA",
  description:
    "Letter spacing set with !important in style attributes must be at least 0.12em.",
  guidance:
    "WCAG 1.4.12 requires users to be able to override text spacing. Using !important on letter-spacing with a value below 0.12em prevents this. Either increase the value to at least 0.12em or remove !important.",
  run(doc) {
    return checkTextSpacing(doc, "important-letter-spacing", "letter-spacing", 0.12);
  },
};
