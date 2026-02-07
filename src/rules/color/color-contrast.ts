import type { Rule } from "../types";
import { getSelector, getHtmlSnippet } from "../utils/selector";
import { isAriaHidden } from "../utils/aria";
import {
  getCachedComputedStyle,
  parseColor,
  getEffectiveBackgroundColor,
  getLuminance,
  getContrastRatio,
  isLargeText,
  mayBeOverImage,
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
  return false;
}

function isHidden(el: Element): boolean {
  if (isAriaHidden(el)) return true;
  let current: Element | null = el;
  while (current) {
    const style = getCachedComputedStyle(current);
    if (style.display === "none" || style.visibility === "hidden") return true;
    current = current.parentElement;
  }
  return false;
}

export const colorContrast: Rule = {
  id: "color-contrast",
  wcag: ["1.4.3"],
  level: "AA",
  description:
    "Text elements must have sufficient color contrast against the background.",
  guidance:
    "WCAG SC 1.4.3 requires a contrast ratio of at least 4.5:1 for normal text and 3:1 for large text (>=24px or >=18.66px bold). Increase the contrast by darkening the text or lightening the background, or vice versa.",
  prompt:
    "Suggest changing the text or background color to meet the minimum contrast ratio.",
  run(doc) {
    const violations = [];
    const body = doc.body;
    if (!body) return [];

    const walker = doc.createTreeWalker(body, NodeFilter.SHOW_TEXT);
    const checked = new Set<Element>();

    let node: Text | null;
    while ((node = walker.nextNode() as Text | null)) {
      if (!node.textContent || !node.textContent.trim()) continue;

      const el = node.parentElement;
      if (!el) continue;
      if (checked.has(el)) continue;
      checked.add(el);

      if (NON_TEXT_TAGS.has(el.tagName)) continue;
      if (isDisabledFormElement(el)) continue;
      if (isHidden(el)) continue;

      const style = getCachedComputedStyle(el);

      // Skip transparent/zero-opacity text
      if (parseFloat(style.opacity) === 0) continue;

      const fg = parseColor(style.color);
      if (!fg) continue;

      // Check for transparent foreground via rgba alpha
      const fgAlphaMatch = style.color.match(/rgba\(.+?,\s*([\d.]+)\s*\)/);
      if (fgAlphaMatch && parseFloat(fgAlphaMatch[1]) === 0) continue;

      // Skip text that may be visually overlaid on an image/video element
      if (mayBeOverImage(el)) continue;

      const bg = getEffectiveBackgroundColor(el);
      if (!bg) continue; // background-image or can't determine

      const fgLum = getLuminance(fg[0], fg[1], fg[2]);
      const bgLum = getLuminance(bg[0], bg[1], bg[2]);
      const ratio = getContrastRatio(fgLum, bgLum);
      const threshold = isLargeText(el) ? 3 : 4.5;

      if (ratio < threshold) {
        const roundedRatio = Math.round(ratio * 100) / 100;
        const fgHex = rgbToHex(fg);
        const bgHex = rgbToHex(bg);
        violations.push({
          ruleId: "color-contrast",
          selector: getSelector(el),
          html: getHtmlSnippet(el),
          impact: "serious" as const,
          message: `Insufficient color contrast ratio of ${roundedRatio}:1 (required ${threshold}:1).`,
          context: `foreground: ${fgHex} rgb(${fg.join(", ")}), background: ${bgHex} rgb(${bg.join(", ")}), ratio: ${roundedRatio}:1, required: ${threshold}:1`,
        });
      }
    }

    return violations;
  },
};
