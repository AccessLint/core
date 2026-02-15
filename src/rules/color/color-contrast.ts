import type { Rule } from "../types";
import { getSelector, getHtmlSnippet } from "../utils/selector";
import { isAriaHidden } from "../utils/aria";
import {
  getCachedComputedStyle,
  parseColor,
  parseColorAlpha,
  compositeColors,
  getEffectiveBackgroundColor,
  getLuminance,
  getContrastRatio,
  isLargeText,
  mayBeOverImage,
  parseGradientStops,
} from "../utils/color";

const NON_TEXT_TAGS = new Set([
  "SCRIPT",
  "STYLE",
  "NOSCRIPT",
  "TEMPLATE",
  "IFRAME",
  "OBJECT",
  "EMBED",
  "SVG",
  "CANVAS",
  "VIDEO",
  "AUDIO",
  "IMG",
  "BR",
  "HR",
]);

function rgbToHex([r, g, b]: [number, number, number]): string {
  return "#" + [r, g, b].map((c) => c.toString(16).padStart(2, "0")).join("");
}

function isDisabledFormElement(el: Element): boolean {
  if (
    el instanceof HTMLInputElement ||
    el instanceof HTMLTextAreaElement ||
    el instanceof HTMLSelectElement ||
    el instanceof HTMLButtonElement
  ) {
    return el.disabled;
  }
  // fieldset[disabled] disables all descendants
  if (el.closest("fieldset[disabled]")) return true;
  // aria-disabled="true" on the element itself or an interactive role ancestor
  if (el.getAttribute("aria-disabled") === "true") return true;
  return false;
}

/** Check if a label's associated control is disabled. */
function isLabelForDisabledControl(el: Element, doc: Document): boolean {
  if (el.tagName !== "LABEL") return false;
  const label = el as HTMLLabelElement;
  // Explicit for= association
  const forId = label.htmlFor;
  if (forId) {
    const target = doc.getElementById(forId);
    if (target && (
      (target as HTMLInputElement).disabled ||
      target.getAttribute("aria-disabled") === "true"
    )) return true;
  }
  // Implicit association (control nested inside label)
  const control = label.querySelector("input, select, textarea, button");
  if (control && (
    (control as HTMLInputElement).disabled ||
    control.getAttribute("aria-disabled") === "true"
  )) return true;
  // Label referencing an aria-disabled widget via for + aria-labelledby
  const id = label.id;
  if (id) {
    const referenced = doc.querySelector(`[aria-labelledby~="${id}"][aria-disabled="true"]`);
    if (referenced) return true;
  }
  return false;
}

function isVisuallyHidden(style: CSSStyleDeclaration): boolean {
  // Classic sr-only / visuallyhidden: clip: rect(0 0 0 0)
  // Computed format varies: "rect(0px, 0px, 0px, 0px)", "rect(0, 0, 0, 0)",
  // "rect(0 0 0 0)" — extract numbers and check all are zero.
  const clip = style.clip;
  if (clip && clip.startsWith("rect(")) {
    const nums = clip.match(/[\d.]+/g);
    if (!nums || nums.every((n) => parseFloat(n) === 0)) return true;
  }
  // Modern equivalent: clip-path: inset(50%) or inset(100%)
  const clipPath = style.clipPath;
  if (clipPath === "inset(50%)" || clipPath === "inset(100%)") return true;
  // Tiny box with overflow hidden (1px × 1px sr-only without clip)
  if (style.overflow === "hidden" && style.position === "absolute") {
    const w = parseFloat(style.width);
    const h = parseFloat(style.height);
    if (w <= 1 && h <= 1) return true;
  }
  return false;
}

function isHidden(el: Element): boolean {
  if (isAriaHidden(el)) return true;
  let current: Element | null = el;
  while (current) {
    const style = getCachedComputedStyle(current);
    if (style.display === "none" || style.visibility === "hidden") return true;
    if (isVisuallyHidden(style)) return true;
    current = current.parentElement;
  }
  return false;
}

/**
 * Walk up the tree and multiply opacity values.
 * Returns the accumulated opacity (0–1).
 */
function getAccumulatedOpacity(el: Element): number {
  let opacity = 1;
  let current: Element | null = el;
  while (current) {
    const style = getCachedComputedStyle(current);
    const o = parseFloat(style.opacity);
    if (!isNaN(o)) opacity *= o;
    current = current.parentElement;
  }
  return opacity;
}

/**
 * Filter functions and their identity (no-op) values.  A CSS filter is a
 * no-op when every function evaluates to its identity value.  Dark-mode
 * plugins commonly set `filter: grayscale(0)` on `<html>` as a toggle
 * hook — this must not cause us to skip contrast checking.
 *
 * Identity = 0: grayscale, blur, hue-rotate, invert, sepia
 * Identity = 1: brightness, contrast, saturate, opacity
 */
const FILTER_IDENTITY: Record<string, number> = {
  grayscale: 0, blur: 0, "hue-rotate": 0, invert: 0, sepia: 0,
  brightness: 1, contrast: 1, saturate: 1, opacity: 1,
};

function parseFilterArg(arg: string): number {
  const num = parseFloat(arg);
  if (isNaN(num)) return NaN;
  // Percentage values: 100% → 1, 0% → 0
  return arg.trim().endsWith("%") ? num / 100 : num;
}

const FILTER_FN_RE = /([a-z-]+)\(([^)]*)\)/g;

function isNoopFilter(value: string): boolean {
  let match: RegExpExecArray | null;
  let matched = false;
  FILTER_FN_RE.lastIndex = 0;
  while ((match = FILTER_FN_RE.exec(value))) {
    matched = true;
    const identity = FILTER_IDENTITY[match[1]];
    if (identity === undefined) return false; // unknown function (e.g. url(), drop-shadow())
    if (parseFilterArg(match[2]) !== identity) return false;
  }
  return matched;
}

/**
 * Returns true when any ancestor uses visual effects that make
 * contrast unreliable to compute (filter, mix-blend-mode, backdrop-filter).
 */
function hasUnreliableVisualEffects(el: Element): boolean {
  let current: Element | null = el;
  while (current) {
    const style = getCachedComputedStyle(current);
    const filter = style.filter;
    if (filter && filter !== "none" && filter !== "initial" && !isNoopFilter(filter)) return true;
    const blendMode = style.mixBlendMode;
    if (blendMode && blendMode !== "normal" && blendMode !== "initial") return true;
    const backdrop = style.backdropFilter;
    if (backdrop && backdrop !== "none" && backdrop !== "initial" && !isNoopFilter(backdrop)) return true;
    current = current.parentElement;
  }
  return false;
}

/** Returns true when the element is inside a native <select>. */
function isInsideNativeSelect(el: Element): boolean {
  return el.closest("select") !== null;
}

/** Returns true when text consists entirely of non-letter characters (symbols, punctuation). */
function hasOnlyNonTextCharacters(text: string): boolean {
  // Strip whitespace, then check if any Unicode letter remains
  const stripped = text.replace(/\s/g, "");
  if (!stripped) return true;
  // \p{L} matches any Unicode letter
  return !/\p{L}/u.test(stripped);
}

/** Returns true when the element is inside an aria-disabled container. */
function isInAriaDisabledGroup(el: Element): boolean {
  return el.closest('[aria-disabled="true"]') !== null;
}

export const colorContrast: Rule = {
  id: "color-contrast",
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
    return checkContrast(doc, "color-contrast", "AA");
  },
};

export const colorContrastEnhanced: Rule = {
  id: "color-contrast-enhanced",
  actRuleIds: ["09o5cg"],
  wcag: ["1.4.6"],
  level: "AAA",
  description:
    "Text elements must have enhanced color contrast against the background (WCAG AAA).",
  guidance:
    "WCAG SC 1.4.6 (AAA) requires a contrast ratio of at least 7:1 for normal text and 4.5:1 for large text (>=24px or >=18.66px bold).",
  run(doc) {
    return checkContrast(doc, "color-contrast-enhanced", "AAA");
  },
};

/** Find the nearest ancestor (or self) with a CSS gradient background. */
function findAncestorGradient(el: Element): { bgImage: string; gradientEl: Element } | null {
  let current: Element | null = el;
  while (current) {
    const style = getCachedComputedStyle(current);
    const bgImg = style.backgroundImage;
    if (bgImg && bgImg !== "none" && bgImg !== "initial") {
      return bgImg.includes("gradient(") ? { bgImage: bgImg, gradientEl: current } : null;
    }
    const bg = style.backgroundColor;
    if (!bg || bg === "transparent" || bg === "rgba(0, 0, 0, 0)" || bg === "rgba(0 0 0 / 0)") {
      current = current.parentElement;
      continue;
    }
    // Nearly transparent — keep looking
    if (parseColorAlpha(bg) < 0.1) {
      current = current.parentElement;
      continue;
    }
    // Solid background found — no gradient shows through
    return null;
  }
  return null;
}

/** Check gradient background contrast and return a violation if insufficient. */
function checkGradientContrast(
  el: Element,
  fg: [number, number, number],
  fgAlpha: number,
  accumulatedOpacity: number,
  threshold: number,
  ruleId: string,
  level: "AA" | "AAA",
  gradientBg: string,
  transparentFallback: [number, number, number],
) {
  const stops = parseGradientStops(gradientBg, transparentFallback);
  if (stops.length === 0) return null;

  // Use the gradient stop that gives the BEST contrast with fg.
  // ACT rule afw4f7: if the highest possible contrast of any text
  // character meets the threshold, the element passes. Only flag
  // when even the best stop fails.
  let bestRatio = 0;
  let bestBg = stops[0];
  for (const stop of stops) {
    let testFg = fg;
    if (fgAlpha < 1) testFg = compositeColors(fg, stop, fgAlpha);
    if (accumulatedOpacity < 1) testFg = compositeColors(testFg, stop, accumulatedOpacity);
    const r = getContrastRatio(
      getLuminance(testFg[0], testFg[1], testFg[2]),
      getLuminance(stop[0], stop[1], stop[2]),
    );
    if (r > bestRatio) {
      bestRatio = r;
      bestBg = stop;
    }
  }

  if (bestRatio >= threshold) return null;

  let effectiveFg = fg;
  if (fgAlpha < 1) effectiveFg = compositeColors(fg, bestBg, fgAlpha);
  if (accumulatedOpacity < 1) effectiveFg = compositeColors(effectiveFg, bestBg, accumulatedOpacity);
  const roundedRatio = Math.round(bestRatio * 100) / 100;
  return {
    ruleId,
    selector: getSelector(el),
    html: getHtmlSnippet(el),
    impact: "serious" as const,
    message: `Insufficient${level === "AAA" ? " enhanced" : ""} color contrast ratio of ${roundedRatio}:1 (required ${threshold}:1).`,
    context: `foreground: ${rgbToHex(effectiveFg)} rgb(${effectiveFg.join(", ")}), background: gradient, ratio: ${roundedRatio}:1, required: ${threshold}:1`,
  };
}

function checkContrast(doc: Document, ruleId: string, level: "AA" | "AAA") {
    const violations = [];
    const body = doc.body;
    if (!body) return [];

    const walker = doc.createTreeWalker(body, NodeFilter.SHOW_TEXT);
    const checked = new Set<Element>();

    let node: Text | null;
    while ((node = walker.nextNode() as Text | null)) {
      if (!node.textContent || !node.textContent.trim()) continue;

      // Skip non-text characters (symbols, punctuation, math operators)
      if (hasOnlyNonTextCharacters(node.textContent)) continue;

      const el = node.parentElement;
      if (!el) continue;
      if (checked.has(el)) continue;
      checked.add(el);

      if (NON_TEXT_TAGS.has(el.tagName)) continue;

      // Skip <body> and <html> text nodes
      const tag = el.tagName;
      if (tag === "BODY" || tag === "HTML") continue;

      // Skip elements inside native <select> — browser-controlled rendering
      if (isInsideNativeSelect(el)) continue;

      if (isDisabledFormElement(el)) continue;
      if (isLabelForDisabledControl(el, doc)) continue;
      // Skip elements inside aria-disabled containers
      if (isInAriaDisabledGroup(el)) continue;
      if (isHidden(el)) continue;

      const style = getCachedComputedStyle(el);

      // Skip transparent/zero-opacity text
      if (parseFloat(style.opacity) === 0) continue;

      const accumulatedOpacity = getAccumulatedOpacity(el);
      // Skip effectively invisible elements
      if (accumulatedOpacity < 0.1) continue;

      // Skip elements with text-shadow — shadow alters effective contrast
      const textShadow = style.textShadow;
      if (textShadow && textShadow !== "none" && textShadow !== "initial") continue;

      // Bail out on visual effects that make contrast unreliable
      if (hasUnreliableVisualEffects(el)) continue;

      const fg = parseColor(style.color);
      if (!fg) continue;

      // Extract foreground alpha
      const fgAlpha = parseColorAlpha(style.color);
      if (fgAlpha === 0) continue;

      // Skip text that may be visually overlaid on an image/video element
      if (mayBeOverImage(el)) continue;

      const threshold = level === "AAA"
        ? (isLargeText(el) ? 4.5 : 7)
        : (isLargeText(el) ? 3 : 4.5);

      let bg = getEffectiveBackgroundColor(el);

      // If no solid background found, check ancestor chain for gradient backgrounds
      if (!bg) {
        const gradientInfo = findAncestorGradient(el);
        if (gradientInfo) {
          const parentBg = gradientInfo.gradientEl.parentElement
            ? getEffectiveBackgroundColor(gradientInfo.gradientEl.parentElement)
            : null;
          const violation = checkGradientContrast(
            el, fg, fgAlpha, accumulatedOpacity, threshold, ruleId, level,
            gradientInfo.bgImage, parentBg ?? [255, 255, 255],
          );
          if (violation) violations.push(violation);
        }
        continue;
      }

      // Composite semi-transparent foreground over background
      let effectiveFg = fg;
      if (fgAlpha < 1) {
        effectiveFg = compositeColors(fg, bg, fgAlpha);
      }

      // Factor in element opacity: composite effective fg over bg at given opacity
      if (accumulatedOpacity < 1) {
        effectiveFg = compositeColors(effectiveFg, bg, accumulatedOpacity);
      }

      const fgLum = getLuminance(effectiveFg[0], effectiveFg[1], effectiveFg[2]);
      const bgLum = getLuminance(bg[0], bg[1], bg[2]);
      const ratio = getContrastRatio(fgLum, bgLum);

      if (ratio < threshold) {
        const roundedRatio = Math.round(ratio * 100) / 100;
        const fgHex = rgbToHex(effectiveFg);
        const bgHex = rgbToHex(bg);
        violations.push({
          ruleId,
          selector: getSelector(el),
          html: getHtmlSnippet(el),
          impact: "serious" as const,
          message: `Insufficient${level === "AAA" ? " enhanced" : ""} color contrast ratio of ${roundedRatio}:1 (required ${threshold}:1).`,
          context: `foreground: ${fgHex} rgb(${effectiveFg.join(", ")}), background: ${bgHex} rgb(${bg.join(", ")}), ratio: ${roundedRatio}:1, required: ${threshold}:1`,
        });
      }
    }

    return violations;
}
