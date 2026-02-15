import type { Rule } from "../types";
import { getSelector, getHtmlSnippet } from "../utils/selector";
import { isAriaHidden } from "../utils/aria";
import { getCachedComputedStyle } from "../utils/color";

/**
 * Parsed result from an !important inline style property.
 */
interface ImportantResult {
  /** Value in em or unitless ratio (directly comparable to threshold) */
  em: number | null;
  /** Raw px value (needs per-text-element font-size conversion) */
  px: number | null;
}

/** Escape a string for safe use inside a RegExp pattern. */
function escapeRegExp(s: string): string {
  return s.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
}

/**
 * Parse the *last* CSS property value with !important from an inline style.
 *
 * Returns em/unitless values directly, and px values separately so callers
 * can convert using the affected text element's computed font-size.
 */
function getImportantValue(
  el: Element,
  property: string,
): ImportantResult | null {
  const style = el.getAttribute("style");
  if (!style) return null;

  // Match all occurrences of  property: value !important  (last one wins)
  const regex = new RegExp(
    `${escapeRegExp(property)}\\s*:\\s*([^;!]+)\\s*!\\s*important`,
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
  if (/^(normal|initial)$/i.test(raw)) return { em: 0, px: null };

  // em units — directly comparable
  const emMatch = raw.match(/^(-?[\d.]+)\s*em$/i);
  if (emMatch) return { em: parseFloat(emMatch[1]), px: null };

  // Unitless number (used for line-height)
  const unitless = raw.match(/^(-?[\d.]+)$/);
  if (unitless) return { em: parseFloat(unitless[1]), px: null };

  // Percentage (used for line-height) — convert to ratio (120% → 1.2)
  const pctMatch = raw.match(/^(-?[\d.]+)\s*%$/);
  if (pctMatch) return { em: parseFloat(pctMatch[1]) / 100, px: null };

  // Absolute units (px, pt, cm, mm, in) — return as px for caller to convert
  const pxMatch = raw.match(/^(-?[\d.]+)\s*(px|pt|cm|mm|in)$/i);
  if (pxMatch) {
    const value = parseFloat(pxMatch[1]);
    const unit = pxMatch[2].toLowerCase();
    let px: number;
    switch (unit) {
      case "px": px = value; break;
      case "pt": px = value * (4 / 3); break;
      case "cm": px = value * (96 / 2.54); break;
      case "mm": px = value * (96 / 25.4); break;
      case "in": px = value * 96; break;
      default: return null;
    }
    return { em: null, px };
  }

  return null;
}

/**
 * Check if any text descendant of `el` (affected by the inherited property)
 * has the px spacing value below the threshold relative to its own computed font-size.
 */
function anyTextViolatesPx(
  el: Element,
  property: string,
  pxValue: number,
  threshold: number,
): boolean {
  function walk(node: Element): boolean {
    // If child overrides with its own !important, its text is NOT affected
    if (node !== el) {
      const childStyle = node.getAttribute("style") || "";
      const hasOwn = new RegExp(
        `${escapeRegExp(property)}\\s*:\\s*[^;!]+\\s*!\\s*important`, "i"
      ).test(childStyle);
      if (hasOwn) return false;
    }

    // Check direct text nodes
    for (const child of node.childNodes) {
      if (child.nodeType === 3 && child.textContent?.trim()) {
        const fontSize = parseFloat(getCachedComputedStyle(node).fontSize);
        if (fontSize > 0 && pxValue / fontSize < threshold) return true;
        break; // found text at this level, no need to check more text nodes
      }
    }

    // Recurse into child elements
    for (const child of node.children) {
      if (walk(child)) return true;
    }
    return false;
  }
  return walk(el);
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
      `${escapeRegExp(property)}\\s*:\\s*[^;!]+\\s*!\\s*important`,
      "i",
    ).test(childStyle);

    // If child overrides with its own !important, its text is NOT affected
    if (hasOwnImportant) continue;

    // Otherwise, recursively check if child has affected text
    if (hasAffectedText(child, property)) return true;
  }

  return false;
}

/**
 * Shared logic for all three text-spacing rules.
 */
function checkTextSpacing(
  doc: Document,
  ruleId: string,
  property: string,
  threshold: number,
): { ruleId: string; selector: string; html: string; impact: "serious"; message: string }[] {
  const violations: { ruleId: string; selector: string; html: string; impact: "serious"; message: string }[] = [];

  for (const el of doc.querySelectorAll("[style]")) {
    if (isAriaHidden(el)) continue;
    if (!isHtmlElement(el)) continue;
    if (isOffscreen(el)) continue;
    if (!hasAffectedText(el, property)) continue;

    const result = getImportantValue(el, property);
    if (!result) continue;

    let violates = false;
    if (result.em !== null) {
      violates = result.em < threshold;
    } else if (result.px !== null) {
      // For px values, check each affected text node using its own computed font-size
      violates = anyTextViolatesPx(el, property, result.px, threshold);
    }

    if (violates) {
      const displayValue = result.em !== null
        ? `${result.em}${property === "line-height" ? "" : "em"}`
        : `${result.px}px`;
      violations.push({
        ruleId,
        selector: getSelector(el),
        html: getHtmlSnippet(el),
        impact: "serious" as const,
        message: `${property} ${displayValue} with !important is below the ${threshold}${property === "line-height" ? "" : "em"} minimum.`,
      });
    }
  }

  return violations;
}

export const importantLetterSpacing: Rule = {
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

/**
 * Check if the element's text doesn't wrap vertically because it's inside
 * a horizontal-only scroll container with wide content.
 */
function hasHorizontalOnlyScroll(el: Element): boolean {
  let current: Element | null = el;
  let wideChild = false;

  while (current) {
    const style = getCachedComputedStyle(current);

    // Check if this element prevents wrapping via width or white-space
    const width = parseFloat(style.width);
    if (width > 500) wideChild = true;
    if (style.whiteSpace === "nowrap" || style.whiteSpace === "pre") wideChild = true;

    const overflowX = style.overflowX;
    const overflowY = style.overflowY;
    // Found a horizontal scroll container
    if (
      (overflowX === "scroll" || overflowX === "auto") &&
      overflowY !== "scroll" && overflowY !== "auto"
    ) {
      return wideChild;
    }

    current = current.parentElement;
  }
  return false;
}

export const importantLineHeight: Rule = {
  id: "accesslint-051",
  actRuleIds: ["78fd32"],
  wcag: ["1.4.12"],
  level: "AA",
  description:
    "Line height set with !important in style attributes must be at least 1.5.",
  guidance:
    "WCAG 1.4.12 requires users to be able to override text spacing. Using !important on line-height with a value below 1.5 prevents this. Either increase the value to at least 1.5 or remove !important.",
  run(doc) {
    const violations: { ruleId: string; selector: string; html: string; impact: "serious"; message: string }[] = [];

    for (const el of doc.querySelectorAll("[style]")) {
      if (isAriaHidden(el)) continue;
      if (!isHtmlElement(el)) continue;
      if (isOffscreen(el)) continue;
      if (!hasAffectedText(el, "line-height")) continue;
      // Line-height is only relevant when text wraps vertically
      if (hasHorizontalOnlyScroll(el)) continue;
      // Line-height only matters for multi-line text — skip single-line elements.
      // In happy-dom, scrollHeight is 0 (no layout engine) so this guard is
      // effectively a no-op there; the check only activates in browser contexts.
      if (el instanceof HTMLElement && el.scrollHeight > 0) {
        const lh = parseFloat(getCachedComputedStyle(el).lineHeight);
        if (lh > 0 && el.scrollHeight <= lh * 1.5) continue;
      }

      const result = getImportantValue(el, "line-height");
      if (!result) continue;

      let violates = false;
      if (result.em !== null) {
        violates = result.em < 1.5;
      } else if (result.px !== null) {
        violates = anyTextViolatesPx(el, "line-height", result.px, 1.5);
      }

      if (violates) {
        const displayValue = result.em !== null ? `${result.em}` : `${result.px}px`;
        violations.push({
          ruleId: "accesslint-051",
          selector: getSelector(el),
          html: getHtmlSnippet(el),
          impact: "serious" as const,
          message: `Line height ${displayValue} with !important is below the 1.5 minimum.`,
        });
      }
    }

    return violations;
  },
};

export const importantWordSpacing: Rule = {
  id: "accesslint-052",
  actRuleIds: ["9e45ec"],
  wcag: ["1.4.12"],
  level: "AA",
  description:
    "Word spacing set with !important in style attributes must be at least 0.16em.",
  guidance:
    "WCAG 1.4.12 requires users to be able to override text spacing. Using !important on word-spacing with a value below 0.16em prevents this. Either increase the value to at least 0.16em or remove !important.",
  run(doc) {
    return checkTextSpacing(doc, "important-word-spacing", "word-spacing", 0.16);
  },
};
