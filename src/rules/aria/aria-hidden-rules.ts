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
  id: "accesslint-062",
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
  id: "accesslint-063",
  actRuleIds: ["6cfa84"],
  wcag: ["4.1.2"],
  level: "A",
  description: "Elements with aria-hidden='true' must not contain focusable elements.",
  guidance: "When aria-hidden='true' hides an element from assistive technologies but the element contains focusable children, keyboard users can focus those children but screen reader users won't know they exist. Either remove focusable elements from the hidden region, add tabindex='-1' to them, or remove aria-hidden.",
  prompt:
    "This element can receive keyboard focus but is inside an aria-hidden region, making it invisible to screen readers. The context explains why it's focusable. Fix by either: (1) adding tabindex='-1' to remove it from tab order, (2) moving it outside the aria-hidden region, or (3) removing aria-hidden='true' from the ancestor if the content should be accessible.",
  run(doc) {
    const violations = [];

    for (const hidden of doc.querySelectorAll('[aria-hidden="true"]')) {
      // Skip if it's the body (handled by aria-hidden-body)
      if (hidden === doc.body) continue;

      // Collect focusable elements: both descendants and the element itself
      const candidates: Element[] = [...hidden.querySelectorAll(FOCUSABLE_SELECTOR)];
      if (hidden.matches(FOCUSABLE_SELECTOR)) candidates.push(hidden);

      for (const el of candidates) {
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

          // ACT 6cfa84 Passed Example 4: focus sentinel pattern — if
          // the element has an onfocus handler that redirects focus,
          // it's not a real focus trap and should not be flagged.
          // We check the attribute rather than calling el.focus() to
          // avoid side effects (scroll, event dispatch, async triggers).
          const onfocus = el.getAttribute("onfocus") || "";
          if (/\.focus\s*\(/.test(onfocus)) continue;

          // Determine why this element is focusable
          const tag = el.tagName.toLowerCase();
          let reason: string;
          if (tabindex !== null) reason = `has tabindex="${tabindex}"`;
          else if (tag === "a" && el.hasAttribute("href")) reason = "is a link with href";
          else if (tag === "button") reason = "is a <button>";
          else if (tag === "input") reason = `is an <input type="${(el as HTMLInputElement).type}">`;
          else if (tag === "select") reason = "is a <select>";
          else if (tag === "textarea") reason = "is a <textarea>";
          else if (tag === "iframe") reason = "is an <iframe>";
          else reason = `is a natively focusable <${tag}>`;

          // Find the aria-hidden ancestor
          const hiddenAncestor = el === hidden ? el : el.closest('[aria-hidden="true"]');

          violations.push({
            ruleId: "accesslint-063",
            selector: getSelector(el),
            html: getHtmlSnippet(el),
            impact: "serious" as const,
            message: "Focusable element is inside an aria-hidden region.",
            context: `Focusable because: ${reason}. aria-hidden ancestor: ${hiddenAncestor ? getHtmlSnippet(hiddenAncestor) : "unknown"}`,
          });
        }
      }
    }

    return violations;
  },
};
