import type { Rule, DeclarativeRule } from "../types";
import { getSelector, getHtmlSnippet } from "../utils/selector";
import { compileDeclarativeRule } from "../engine";

// Elements that are natively focusable
const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  'audio[controls]',
  'video[controls]',
  '[contenteditable]:not([contenteditable="false"])',
  'details > summary:first-of-type',
  'iframe',
  'object',
  'embed',
  'area[href]',
].join(", ");

/**
 * Check if an element is actually visible and reachable in the current state.
 * Elements in closed modals/menus often have aria-hidden on the container
 * but are also hidden via display:none or visibility:hidden. These are not
 * truly focusable and should not be flagged.
 */
function isActuallyVisible(el: HTMLElement): boolean {
  let current: HTMLElement | null = el;
  const doc = el.ownerDocument;
  const view = doc.defaultView;
  while (current && current !== doc.body) {
    // Check inline styles first (fast path)
    if (current.style.display === "none") return false;
    if (current.style.visibility === "hidden") return false;
    // Check computed styles if view is available
    if (view) {
      const computed = view.getComputedStyle(current);
      if (computed.display === "none") return false;
      if (computed.visibility === "hidden") return false;
    }
    current = current.parentElement;
  }
  return true;
}

const ariaHiddenBodySpec: DeclarativeRule = {
  id: "aria-hidden-body",
  selector: 'body[aria-hidden="true"]',
  check: { type: "selector-exists" },
  impact: "critical",
  message: "aria-hidden='true' on body hides all content from assistive technologies.",
  description: "aria-hidden='true' must not be present on the document body.",
  wcag: ["4.1.2"],
  level: "A",
  guidance: "Setting aria-hidden='true' on the body element hides all page content from assistive technologies, making the page completely inaccessible to screen reader users. Remove aria-hidden from the body element. If you need to hide content temporarily (e.g., behind a modal), use aria-hidden on specific sections instead.",
  prompt: "Instruct to remove aria-hidden='true' from the body element.",
  skipAriaHidden: false,
};

export const ariaHiddenBody = compileDeclarativeRule(ariaHiddenBodySpec);

export const ariaHiddenFocus: Rule = {
  id: "aria-hidden-focus",
  wcag: ["4.1.2"],
  level: "A",
  description: "Elements with aria-hidden='true' must not contain focusable elements.",
  guidance: "When aria-hidden='true' hides an element from assistive technologies but the element contains focusable children, keyboard users can focus those children but screen reader users won't know they exist. Either remove focusable elements from the hidden region, add tabindex='-1' to them, or remove aria-hidden.",
  prompt:
    "Suggest adding tabindex='-1' to this focusable element, or moving it outside the aria-hidden region, or removing aria-hidden from the ancestor.",
  run(doc) {
    const violations = [];

    for (const hidden of doc.querySelectorAll('[aria-hidden="true"]')) {
      // Skip if it's the body (handled by aria-hidden-body)
      if (hidden === doc.body) continue;

      // Find focusable elements within
      const focusable = hidden.querySelectorAll(FOCUSABLE_SELECTOR);

      for (const el of focusable) {
        // Check if element is actually focusable (not disabled, not hidden)
        if (el instanceof HTMLElement) {
          // Skip elements with tabindex="-1" as they're not in tab order
          const tabindex = el.getAttribute("tabindex");
          if (tabindex === "-1") continue;

          // Skip disabled elements
          if ((el as HTMLButtonElement | HTMLInputElement).disabled) continue;

          // Skip hidden inputs
          if (el instanceof HTMLInputElement && el.type === "hidden") continue;

          // Skip elements that are not actually visible/reachable — common
          // pattern: modals/menus closed with aria-hidden that also hide
          // content via display:none or visibility:hidden.
          if (!isActuallyVisible(el)) continue;

          violations.push({
            ruleId: "aria-hidden-focus",
            selector: getSelector(el),
            html: getHtmlSnippet(el),
            impact: "serious" as const,
            message: "Focusable element is inside an aria-hidden region.",
          });
        }
      }
    }

    return violations;
  },
};
