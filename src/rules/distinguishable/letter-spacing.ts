import type { Rule } from "../types";
import { checkTextSpacing } from "./text-spacing-helpers";

export const letterSpacing: Rule = {
  id: "distinguishable/letter-spacing",
  category: "distinguishable",
  actRuleIds: ["24afc2"],
  wcag: ["1.4.12"],
  level: "AA",
  fixability: "mechanical",
  description:
    "Letter spacing set with !important in style attributes must be at least 0.12em.",
  guidance:
    "WCAG 1.4.12 requires users to be able to override text spacing. Using !important on letter-spacing with a value below 0.12em prevents this. Either increase the value to at least 0.12em or remove !important.",
  prompt:
    "The inline style uses letter-spacing with !important set below 0.12em. Either increase the value to at least 0.12em (e.g. style='letter-spacing: 0.12em !important') or remove !important so users can override it with their own stylesheet.",
  run(doc) {
    return checkTextSpacing(doc, "distinguishable/letter-spacing", "letter-spacing", 0.12);
  },
};
