let _computedStyleCache = new WeakMap<Element, CSSStyleDeclaration>();
let _effectiveBgCache = new WeakMap<Element, [number, number, number] | null>();
let _overImageCache = new WeakMap<Element, boolean>();

export function clearColorCaches(): void {
  _computedStyleCache = new WeakMap();
  _effectiveBgCache = new WeakMap();
  _overImageCache = new WeakMap();
}

export function getCachedComputedStyle(el: Element): CSSStyleDeclaration {
  let style = _computedStyleCache.get(el);
  if (style) return style;
  style = getComputedStyle(el);
  _computedStyleCache.set(el, style);
  return style;
}

export function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

export function getContrastRatio(l1: number, l2: number): number {
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

const NAMED_COLORS: Record<string, [number, number, number]> = {
  black: [0, 0, 0], white: [255, 255, 255], red: [255, 0, 0],
  green: [0, 128, 0], blue: [0, 0, 255], yellow: [255, 255, 0],
  orange: [255, 165, 0], purple: [128, 0, 128], gray: [128, 128, 128],
  grey: [128, 128, 128], silver: [192, 192, 192], maroon: [128, 0, 0],
  navy: [0, 0, 128], teal: [0, 128, 128], aqua: [0, 255, 255],
  fuchsia: [255, 0, 255], lime: [0, 255, 0], olive: [128, 128, 0],
};

export function parseColor(color: string): [number, number, number] | null {
  const trimmed = color.trim().toLowerCase();

  // Named colors
  if (NAMED_COLORS[trimmed]) return NAMED_COLORS[trimmed];

  // Hex: #RGB, #RRGGBB
  const hex3 = trimmed.match(/^#([0-9a-f])([0-9a-f])([0-9a-f])$/);
  if (hex3) {
    return [parseInt(hex3[1] + hex3[1], 16), parseInt(hex3[2] + hex3[2], 16), parseInt(hex3[3] + hex3[3], 16)];
  }
  const hex6 = trimmed.match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/);
  if (hex6) {
    return [parseInt(hex6[1], 16), parseInt(hex6[2], 16), parseInt(hex6[3], 16)];
  }

  // Legacy comma-separated: rgb(r, g, b) / rgba(r, g, b, a)
  const comma = color.match(
    /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*[\d.]+)?\s*\)/
  );
  if (comma) {
    return [parseInt(comma[1]), parseInt(comma[2]), parseInt(comma[3])];
  }
  // Modern space-separated (CSS Color Level 4): rgb(r g b) / rgb(r g b / a)
  const space = color.match(
    /rgba?\(\s*(\d+)\s+(\d+)\s+(\d+)\s*(?:\/\s*[\d.]+%?)?\s*\)/
  );
  if (space) {
    return [parseInt(space[1]), parseInt(space[2]), parseInt(space[3])];
  }
  return null;
}

export function getEffectiveBackgroundColor(el: Element): [number, number, number] | null {
  const cached = _effectiveBgCache.get(el);
  if (cached !== undefined) return cached;

  const result = _computeEffectiveBg(el);
  _effectiveBgCache.set(el, result);
  return result;
}

function _computeEffectiveBg(el: Element): [number, number, number] | null {
  let current: Element | null = el;
  while (current) {
    const style = getCachedComputedStyle(current);
    // Has a background image — can't reliably determine color.
    // Must check before transparency so we don't skip past image backgrounds
    // whose backgroundColor resolves to transparent (the default).
    // "initial" is excluded because happy-dom returns it for `background` shorthand without an image.
    const bgImg = style.backgroundImage;
    if (bgImg && bgImg !== "none" && bgImg !== "initial") return null;
    const bg = style.backgroundColor;
    // Skip fully transparent
    if (bg === "transparent" || bg === "rgba(0, 0, 0, 0)" || bg === "rgba(0 0 0 / 0)") {
      current = current.parentElement;
      continue;
    }
    // Extract alpha: legacy rgba(r, g, b, a) or modern rgb(r g b / a)
    const alphaMatch = bg.match(/rgba\(.+?,\s*([\d.]+)\s*\)/) ||
      bg.match(/rgba?\(.+?\/\s*([\d.]+%?)\s*\)/);
    if (alphaMatch) {
      const alpha = alphaMatch[1].endsWith("%")
        ? parseFloat(alphaMatch[1]) / 100
        : parseFloat(alphaMatch[1]);
      if (alpha < 0.1) {
        current = current.parentElement;
        continue;
      }
    }
    return parseColor(bg);
  }
  // Default to white if nothing found — correct for real browsers where the
  // default page background is white. In test environments with limited CSS
  // resolution (happy-dom, jsdom) this fallback can cause false positives when
  // a dark background is applied via stylesheets rather than inline styles.
  return [255, 255, 255];
}

const MEDIA_TAGS = new Set(["IMG", "PICTURE", "VIDEO", "SVG"]);

/**
 * Detects whether text may be visually overlaid on a media element (<img>,
 * <picture>, <video>, <svg>) via CSS positioning. Returns true when either
 * the text or a sibling media element is positioned out of normal flow
 * within a shared positioning context — the common hero/card overlay pattern.
 */
export function mayBeOverImage(el: Element): boolean {
  const cached = _overImageCache.get(el);
  if (cached !== undefined) return cached;
  const result = _checkOverImage(el);
  _overImageCache.set(el, result);
  return result;
}

function _checkOverImage(el: Element): boolean {
  let current: Element | null = el;
  let textIsOutOfFlow = false;

  while (current) {
    const pos = getCachedComputedStyle(current).position;

    if (pos === "absolute" || pos === "fixed") {
      textIsOutOfFlow = true;
    }

    // At a positioning context, check sibling branches for media elements
    if (current !== el && pos !== "static") {
      for (const child of current.children) {
        if (child === el || child.contains(el)) continue;
        if (MEDIA_TAGS.has(child.tagName)) {
          if (textIsOutOfFlow) return true;
          const childPos = getCachedComputedStyle(child).position;
          if (childPos === "absolute" || childPos === "fixed") return true;
        }
      }
      // Only check the nearest positioning context for the text
      if (textIsOutOfFlow) break;
    }

    current = current.parentElement;
  }
  return false;
}

/** Convert a CSS font-size value to pixels. Handles px and pt units. */
function fontSizeToPx(raw: string): number {
  const value = parseFloat(raw);
  if (raw.endsWith("pt")) return value * (4 / 3); // 1pt = 4/3 px
  return value; // px or unitless
}

export function isLargeText(el: Element): boolean {
  const style = getCachedComputedStyle(el);
  const fontSizePx = fontSizeToPx(style.fontSize);
  const fontWeight = parseInt(style.fontWeight) || (style.fontWeight === "bold" ? 700 : 400);
  // Large text: >= 18pt (24px) or >= 14pt (18.66px) bold.
  // Use small tolerance (0.5px) for DOM environments with imprecise pt→px conversion.
  return fontSizePx >= 23.5 || (fontSizePx >= 18.5 && fontWeight >= 700);
}
