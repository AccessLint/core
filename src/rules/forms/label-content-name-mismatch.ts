import type { Rule } from "../types";
import { getSelector, getHtmlSnippet } from "../utils/selector";
import { getAccessibleName, isAriaHidden } from "../utils/aria";

function normalizeText(text: string): string {
  return text.toLowerCase().replace(/\s+/g, " ").trim();
}

function visibleTextMatches(accessibleName: string, visibleText: string): boolean {
  const normAccessible = normalizeText(accessibleName);
  const normVisible = normalizeText(visibleText);

  if (!normAccessible || !normVisible) return true;

  // Per WCAG 2.5.3, the visible label text should be included in the accessible name.
  // Check if accessible name contains the visible text (primary check).
  if (normAccessible.includes(normVisible)) return true;

  // Also accept: visible text contains the accessible name (e.g. button
  // shows "Submit Order" but aria-label is "Submit").
  if (normVisible.includes(normAccessible)) return true;

  // Accept if most significant words of the visible text appear in the
  // accessible name.  This handles cases like "Parks By State" (aria-label)
  // vs "By State..." (visible text after icons/prefixes are stripped).
  // Strip trailing punctuation from words before comparing.
  const visibleWords = normVisible.split(/\s+/)
    .map(w => w.replace(/[.,;:!?\u2026]+$/g, ""))
    .filter(w => w.length > 2);
  if (visibleWords.length >= 2) {
    const matchingWords = visibleWords.filter(w => normAccessible.includes(w));
    if (matchingWords.length / visibleWords.length > 0.5) return true;
  }

  return false;
}

/**
 * Extract truly visible text from an element, excluding:
 * - Non-rendered elements (style, script, SVG)
 * - Elements with role="img" or role="presentation"
 * - aria-hidden subtrees
 * - Elements hidden via inline display:none
 */
function getVisibleText(el: Element): string {
  let text = "";
  for (const node of el.childNodes) {
    if (node.nodeType === 3 /* TEXT_NODE */) {
      text += node.textContent ?? "";
    } else if (node.nodeType === 1 /* ELEMENT_NODE */) {
      const child = node as Element;
      const tag = child.tagName.toLowerCase();
      // Skip non-rendered elements — their content is not visible text
      if (tag === "style" || tag === "script" || tag === "svg") continue;
      // Skip elements removed from the accessibility tree
      if (child.getAttribute("aria-hidden") === "true") continue;
      if (child instanceof HTMLElement && child.style.display === "none") continue;
      // Skip role=img and role=presentation (icon wrappers)
      const role = child.getAttribute("role");
      if (role === "img" || role === "presentation" || role === "none") continue;
      text += getVisibleText(child);
    }
  }
  return text;
}

export const labelContentNameMismatch: Rule = {
  id: "label-content-name-mismatch",
  wcag: ["2.5.3"],
  level: "A",
  description: "Interactive elements with visible text must have accessible names that contain that text.",
  guidance: "For voice control users who activate controls by speaking their visible label, the accessible name must include the visible text. If aria-label is 'Submit form' but the button shows 'Send', voice users saying 'click Send' won't activate it. Ensure aria-label/aria-labelledby contains or matches the visible text.",
  prompt:
    "Show the mismatch between the visible text and accessible name, and suggest updating aria-label to include the visible text.",
  run(doc) {
    const violations = [];

    // Check buttons
    for (const el of doc.querySelectorAll('button, [role="button"], a[href], input[type="submit"], input[type="button"]')) {
      if (isAriaHidden(el)) continue;

      const accessibleName = getAccessibleName(el);
      if (!accessibleName) continue; // No name - different violation

      // Get visible text (excludes SVG icons, aria-hidden, role=img)
      let visibleText = "";
      if (el instanceof HTMLInputElement) {
        visibleText = el.value || "";
      } else {
        visibleText = getVisibleText(el);
      }

      const trimmedVisible = visibleText.trim();
      if (!trimmedVisible) continue; // No visible text to compare
      // Skip very short visible text (1-2 chars) — likely icons/symbols (×, ✓, ☰)
      if (trimmedVisible.length <= 2) continue;

      // Only check if there's an explicit aria-label or aria-labelledby
      // that might differ from the visible text
      const hasAriaLabel = el.hasAttribute("aria-label");
      const hasAriaLabelledby = el.hasAttribute("aria-labelledby");

      if (!hasAriaLabel && !hasAriaLabelledby) continue;

      if (!visibleTextMatches(accessibleName, visibleText)) {
        violations.push({
          ruleId: "label-content-name-mismatch",
          selector: getSelector(el),
          html: getHtmlSnippet(el),
          impact: "serious" as const,
          message: `Accessible name "${accessibleName}" does not contain visible text "${visibleText.trim()}".`,
        });
      }
    }

    // Check labeled form fields
    for (const el of doc.querySelectorAll("input, select, textarea")) {
      if (isAriaHidden(el)) continue;
      if (el instanceof HTMLInputElement && ["hidden", "submit", "button", "image"].includes(el.type)) continue;

      const accessibleName = getAccessibleName(el);
      if (!accessibleName) continue;

      // Check for aria-label overriding visible label
      const hasAriaLabel = el.hasAttribute("aria-label");
      if (!hasAriaLabel) continue;

      // Find visible label text
      const id = el.id;
      let visibleLabel = "";
      if (id) {
        const label = doc.querySelector(`label[for="${CSS.escape(id)}"]`);
        if (label) {
          visibleLabel = getVisibleText(label);
        }
      }

      if (!visibleLabel.trim()) continue;

      if (!visibleTextMatches(accessibleName, visibleLabel)) {
        violations.push({
          ruleId: "label-content-name-mismatch",
          selector: getSelector(el),
          html: getHtmlSnippet(el),
          impact: "serious" as const,
          message: `Accessible name "${accessibleName}" does not contain visible label "${visibleLabel.trim()}".`,
        });
      }
    }

    return violations;
  },
};
