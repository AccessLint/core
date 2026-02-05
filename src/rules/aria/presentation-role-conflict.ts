import type { Rule } from "../types";
import { getSelector, getHtmlSnippet } from "../utils/selector";
import { isAriaHidden } from "../utils/aria";

// Focusable elements selector
const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(", ");

// Elements that have global ARIA attributes requiring accessible semantics
const GLOBAL_ARIA_ATTRS = [
  "aria-atomic",
  "aria-busy",
  "aria-controls",
  "aria-describedby",
  "aria-details",
  "aria-dropeffect",
  "aria-flowto",
  "aria-grabbed",
  "aria-haspopup",
  "aria-keyshortcuts",
  "aria-live",
  "aria-owns",
  "aria-relevant",
];

export const presentationRoleConflict: Rule = {
  id: "presentation-role-conflict",
  wcag: ["4.1.2"],
  level: "A",
  description: "Elements with role='presentation' or role='none' must not be focusable or have global ARIA attributes.",
  guidance: "When an element has role='presentation' or role='none', it's marked as decorative and removed from the accessibility tree. However, if the element is focusable or has certain ARIA attributes, the presentation role is ignored and the element remains accessible. This creates confusion. Either remove the presentation role, or remove the focusability/ARIA attributes.",
  prompt:
    "Identify the conflict (focusable or ARIA attribute) and suggest either removing the presentation role or removing the conflicting attribute/focusability.",
  run(doc) {
    const violations = [];

    for (const el of doc.querySelectorAll('[role="presentation"], [role="none"]')) {
      if (isAriaHidden(el)) continue;

      const issues: string[] = [];

      // Check if element is focusable
      if (el.matches(FOCUSABLE_SELECTOR)) {
        issues.push("element is focusable");
      }

      // Check for global ARIA attributes that conflict
      for (const attr of GLOBAL_ARIA_ATTRS) {
        if (el.hasAttribute(attr)) {
          issues.push(`has ${attr}`);
          break; // Report only first conflicting attr
        }
      }

      // Check for aria-label or aria-labelledby (name establishing)
      if (el.hasAttribute("aria-label") || el.hasAttribute("aria-labelledby")) {
        issues.push("has accessible name");
      }

      if (issues.length > 0) {
        violations.push({
          ruleId: "presentation-role-conflict",
          selector: getSelector(el),
          html: getHtmlSnippet(el),
          impact: "serious" as const,
          message: `Presentation role conflicts with: ${issues.join(", ")}. The role will be ignored.`,
        });
      }
    }

    return violations;
  },
};
