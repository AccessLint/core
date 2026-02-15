import { rules } from "../rules/index";

/**
 * Mapping from W3C ACT rule IDs to @accesslint/core rule IDs.
 * Derived from `actRuleIds` declared on each rule definition.
 */
function buildActToCoreRule(): Record<string, string> {
  const mapping: Record<string, string> = {};
  for (const rule of rules) {
    if (rule.actRuleIds) {
      for (const actId of rule.actRuleIds) {
        mapping[actId] = rule.id;
      }
    }
  }
  return mapping;
}

export const ACT_TO_CORE_RULE: Record<string, string> = buildActToCoreRule();

/**
 * Rules where happy-dom lacks needed capabilities (computed styles, layout,
 * JS execution), causing ACT test failures that are environmental rather
 * than rule logic issues.
 */
export const HAPPY_DOM_LIMITED_RULES = new Set([
  "aria-hidden-focus",
  "color-contrast",
  "color-contrast-enhanced",
  "css-orientation-lock",
  "focus-visible",
  "important-letter-spacing",
  "important-line-height",
  "important-word-spacing",
  "label",
  "link-in-text-block",
  "scrollable-region-focusable",
]);
