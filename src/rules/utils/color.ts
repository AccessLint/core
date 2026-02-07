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

export function parseColor(color: string): [number, number, number] | null {
  const match = color.match(
    /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*[\d.]+)?\s*\)/
  );
  if (match) {
    return [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])];
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
    if (bg === "transparent" || bg === "rgba(0, 0, 0, 0)") {
      current = current.parentElement;
      continue;
    }
    const alphaMatch = bg.match(/rgba\(.+?,\s*([\d.]+)\s*\)/);
    if (alphaMatch && parseFloat(alphaMatch[1]) < 0.1) {
      current = current.parentElement;
      continue;
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

export function isLargeText(el: Element): boolean {
  const style = getCachedComputedStyle(el);
  const fontSize = parseFloat(style.fontSize);
  const fontWeight = parseInt(style.fontWeight) || (style.fontWeight === "bold" ? 700 : 400);
  // Large text: >= 18pt (24px) or >= 14pt (18.66px) bold
  return fontSize >= 24 || (fontSize >= 18.66 && fontWeight >= 700);
}
