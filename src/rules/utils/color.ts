let _computedStyleCache = new WeakMap<Element, CSSStyleDeclaration>();
let _effectiveBgCache = new WeakMap<Element, [number, number, number] | null>();

export function clearColorCaches(): void {
  _computedStyleCache = new WeakMap();
  _effectiveBgCache = new WeakMap();
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
    // Has a background image — can't reliably determine color
    if (style.backgroundImage && style.backgroundImage !== "none") return null;
    return parseColor(bg);
  }
  // Default to white if nothing found
  return [255, 255, 255];
}

export function isLargeText(el: Element): boolean {
  const style = getCachedComputedStyle(el);
  const fontSize = parseFloat(style.fontSize);
  const fontWeight = parseInt(style.fontWeight) || (style.fontWeight === "bold" ? 700 : 400);
  // Large text: >= 18pt (24px) or >= 14pt (18.66px) bold
  return fontSize >= 24 || (fontSize >= 18.66 && fontWeight >= 700);
}
