import type { Rule } from "../types";
import { checkContrast } from "./color-contrast-helpers";

export const accesslint092: Rule = {
  id: "accesslint-092",
  actRuleIds: ["afw4f7"],
  wcag: ["1.4.3"],
  level: "AA",
  description:
    "Text elements must have sufficient color contrast against the background.",
  guidance:
    "WCAG SC 1.4.3 requires a contrast ratio of at least 4.5:1 for normal text and 3:1 for large text (>=24px or >=18.66px bold). Increase the contrast by darkening the text or lightening the background, or vice versa.",
  prompt:
    "Suggest changing the text or background color to meet the minimum contrast ratio.",
  run(doc) {
    return checkContrast(doc, "accesslint-092", "AA");
  },
};
