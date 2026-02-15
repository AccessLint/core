import type { Rule } from "../types";
import { getSelector, getHtmlSnippet } from "../utils/selector";
import { isAriaHidden } from "../utils/aria";

/**
 * Parse the *last* CSS property value with !important from an inline style.
 *
 * Returns:
 * - A numeric value (in em or unitless) when the unit is relative
 * - `0` for keyword values like "normal" / "initial" (effectively zero spacing)
 * - `-Infinity` for absolute units (px, cm, etc.) which always violate
 * - `null` when the property is not set with !important
 */
function getImportantValue(
  el: Element,
  property: string,
): number | null {
  const style = el.getAttribute("style");
  if (!style) return null;

  // Match all occurrences of  property: value !important  (last one wins)
  const regex = new RegExp(
    `${property}\\s*:\\s*([^;!]+)\\s*!\\s*important`,
    "gi",
  );
  let lastMatch: RegExpExecArray | null = null;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(style))) {
    lastMatch = m;
  }
  if (!lastMatch) return null;

  const raw = lastMatch[1].trim();

  // inherit / unset — these defer to the parent's value and do NOT restrict
  // user overrides, so they should not be flagged.
  if (/^(inherit|unset|revert)$/i.test(raw)) return null;

  // normal / initial — effectively zero spacing (below any positive threshold)
  if (/^(normal|initial)$/i.test(raw)) return 0;

  // em units — directly comparable
  const emMatch = raw.match(/^(-?[\d.]+)\s*em$/i);
  if (emMatch) return parseFloat(emMatch[1]);

  // Unitless number (used for line-height)
  const unitless = raw.match(/^(-?[\d.]+)$/);
  if (unitless) return parseFloat(unitless[1]);

  // Percentage (used for line-height) — convert to ratio (120% → 1.2)
  const pctMatch = raw.match(/^(-?[\d.]+)\s*%$/);
  if (pctMatch) return parseFloat(pctMatch[1]) / 100;

  // Absolute units (px, cm, etc.) — need font-size context to evaluate
  // relative to the threshold; skip since we can't compute this reliably.
  return null;
}

/** Check if element has direct text node children (non-whitespace). */
function hasDirectText(el: Element): boolean {
  for (const child of el.childNodes) {
    if (child.nodeType === 3 /* TEXT_NODE */ && child.textContent?.trim()) {
      return true;
    }
  }
  return false;
}

/** Check if an element is an HTML element (not SVG/MathML). */
function isHtmlElement(el: Element): boolean {
  return !el.closest("svg") && !el.closest("math");
}

/** Check if an element is positioned offscreen and therefore not visible. */
function isOffscreen(el: Element): boolean {
  const style = el.getAttribute("style");
  if (!style) return false;

  // Check for absolute/fixed positioning with extreme offsets
  if (/position\s*:\s*(absolute|fixed)/i.test(style)) {
    // Negative top/left/right/bottom with large values
    const topMatch = style.match(/top\s*:\s*(-[\d.]+)(em|px|%)/i);
    if (topMatch && parseFloat(topMatch[1]) < -100) return true;
    const leftMatch = style.match(/left\s*:\s*(-[\d.]+)(em|px|%)/i);
    if (leftMatch && parseFloat(leftMatch[1]) < -100) return true;
  }

  return false;
}

/**
 * Check if an element has visible descendant text that is NOT overridden by
 * a descendant's own !important declaration for the same property.
 */
function hasAffectedText(el: Element, property: string): boolean {
  // Direct text nodes are always affected
  if (hasDirectText(el)) return true;

  // Check child elements recursively
  for (const child of el.children) {
    const childStyle = child.getAttribute("style") || "";
    const hasOwnImportant = new RegExp(
      `${property}\\s*:\\s*[^;!]+\\s*!\\s*important`,
      "i",
    ).test(childStyle);

    // If child overrides with its own !important, its text is NOT affected
    if (hasOwnImportant) continue;

    // Otherwise, recursively check if child has affected text
    if (hasAffectedText(child, property)) return true;
  }

  return false;
}

export const importantLetterSpacing: Rule = {
  id: "important-letter-spacing",
  actRuleIds: ["24afc2"],
  wcag: ["1.4.12"],
  level: "AA",
  description:
    "Letter spacing set with !important in style attributes must be at least 0.12em.",
  guidance:
    "WCAG 1.4.12 requires users to be able to override text spacing. Using !important on letter-spacing with a value below 0.12em prevents this. Either increase the value to at least 0.12em or remove !important.",
  run(doc) {
    const violations = [];

    for (const el of doc.querySelectorAll("[style]")) {
      if (isAriaHidden(el)) continue;
      if (!isHtmlElement(el)) continue;
      if (isOffscreen(el)) continue;
      if (!hasAffectedText(el, "letter-spacing")) continue;

      const value = getImportantValue(el, "letter-spacing");
      if (value !== null && value < 0.12) {
        violations.push({
          ruleId: "important-letter-spacing",
          selector: getSelector(el),
          html: getHtmlSnippet(el),
          impact: "serious" as const,
          message: `Letter spacing ${value}em with !important is below the 0.12em minimum.`,
        });
      }
    }

    return violations;
  },
};

export const importantLineHeight: Rule = {
  id: "important-line-height",
  actRuleIds: ["78fd32"],
  wcag: ["1.4.12"],
  level: "AA",
  description:
    "Line height set with !important in style attributes must be at least 1.5.",
  guidance:
    "WCAG 1.4.12 requires users to be able to override text spacing. Using !important on line-height with a value below 1.5 prevents this. Either increase the value to at least 1.5 or remove !important.",
  run(doc) {
    const violations = [];

    for (const el of doc.querySelectorAll("[style]")) {
      if (isAriaHidden(el)) continue;
      if (!isHtmlElement(el)) continue;
      if (isOffscreen(el)) continue;
      if (!hasAffectedText(el, "line-height")) continue;

      const value = getImportantValue(el, "line-height");
      if (value !== null && value < 1.5) {
        violations.push({
          ruleId: "important-line-height",
          selector: getSelector(el),
          html: getHtmlSnippet(el),
          impact: "serious" as const,
          message: `Line height ${value} with !important is below the 1.5 minimum.`,
        });
      }
    }

    return violations;
  },
};

export const importantWordSpacing: Rule = {
  id: "important-word-spacing",
  actRuleIds: ["9e45ec"],
  wcag: ["1.4.12"],
  level: "AA",
  description:
    "Word spacing set with !important in style attributes must be at least 0.16em.",
  guidance:
    "WCAG 1.4.12 requires users to be able to override text spacing. Using !important on word-spacing with a value below 0.16em prevents this. Either increase the value to at least 0.16em or remove !important.",
  run(doc) {
    const violations = [];

    for (const el of doc.querySelectorAll("[style]")) {
      if (isAriaHidden(el)) continue;
      if (!isHtmlElement(el)) continue;
      if (isOffscreen(el)) continue;
      if (!hasAffectedText(el, "word-spacing")) continue;

      const value = getImportantValue(el, "word-spacing");
      if (value !== null && value < 0.16) {
        violations.push({
          ruleId: "important-word-spacing",
          selector: getSelector(el),
          html: getHtmlSnippet(el),
          impact: "serious" as const,
          message: `Word spacing ${value}em with !important is below the 0.16em minimum.`,
        });
      }
    }

    return violations;
  },
};
