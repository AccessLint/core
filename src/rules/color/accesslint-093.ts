import type { Rule } from "../types";
import { checkContrast } from "./color-contrast-helpers";

export const accesslint093: Rule = {
  id: "accesslint-093",
  actRuleIds: ["09o5cg"],
  wcag: ["1.4.6"],
  level: "AAA",
  description:
    "Text elements must have enhanced color contrast against the background (WCAG AAA).",
  guidance:
    "WCAG SC 1.4.6 (AAA) requires a contrast ratio of at least 7:1 for normal text and 4.5:1 for large text (>=24px or >=18.66px bold).",
  run(doc) {
    return checkContrast(doc, "accesslint-093", "AAA");
  },
};
