import type { Rule } from "../types";
import { getSelector, getHtmlSnippet } from "../utils/selector";
import { isAriaHidden, getAccessibleTextContent } from "../utils/aria";
import {
  getCachedComputedStyle,
  parseColor,
  getLuminance,
  getContrastRatio,
} from "../utils/color";

export const skipLink: Rule = {
  id: "skip-link",
  wcag: ["2.4.1"],
  level: "A",
  tags: ["best-practice"],
  description: "Skip links must point to a valid target on the page.",
  guidance: "Skip links allow keyboard users to bypass repetitive navigation and jump directly to main content. The skip link should be the first focusable element on the page, link to the main content (e.g., href='#main'), and become visible when focused. It can be visually hidden until focused using CSS.",
  prompt:
    "A skip link is a single <a href='#main'>Skip to main content</a> as the first element in <body>. It can be visually hidden with CSS until focused. Explain this simple pattern.",
  run(doc) {
    const violations = [];

    // Find skip-link candidates: same-page anchor links near the top of the
    // page whose text suggests a "skip to …" purpose.  Only validate that
    // their targets exist — absence of a skip link is covered by the
    // separate "bypass" rule.
    const anchors = doc.querySelectorAll('a[href^="#"]');

    for (const a of anchors) {
      const href = a.getAttribute("href");
      if (!href || href === "#") continue;

      const text = getAccessibleTextContent(a).toLowerCase();
      const isSkipLink =
        text.includes("skip") || text.includes("jump") ||
        text.includes("main content") || text.includes("navigation");
      if (!isSkipLink) continue;

      // Validate the target exists
      const targetId = href.slice(1);
      const target = doc.getElementById(targetId);
      if (!target) {
        violations.push({
          ruleId: "skip-link",
          selector: getSelector(a),
          html: getHtmlSnippet(a),
          impact: "moderate" as const,
          message: `Skip link points to "#${targetId}" which does not exist on the page.`,
        });
      }
    }

    return violations;
  },
};

const BLOCK_DISPLAYS = new Set([
  "block",
  "flex",
  "grid",
  "table",
  "table-cell",
  "list-item",
  "flow-root",
]);

const INLINE_DISPLAYS = new Set([
  "inline",
  "inline-block",
  "inline-flex",
  "inline-grid",
]);

/**
 * Find the nearest block-level ancestor that contains non-link text,
 * indicating the link is embedded in a paragraph of running text.
 * Returns null when the nearest block has no non-link text (link lists,
 * nav menus) — only walks one level up to avoid over-matching.
 */
function findParentTextBlock(link: Element): Element | null {
  let el: Element | null = link.parentElement;
  while (el) {
    const display = getCachedComputedStyle(el).display;
    if (BLOCK_DISPLAYS.has(display)) {
      // Only consider the nearest block; don't walk further.
      return hasNonLinkText(el) ? el : null;
    }
    el = el.parentElement;
  }
  return null;
}

/** Returns true when `block` contains substantive prose text that is NOT
 *  inside an `<a>` element.  Punctuation-only separators between links
 *  (e.g. " | ", " · ") do not count — the text must contain at least one
 *  word (two or more consecutive letters) to qualify as a text block. */
function hasNonLinkText(block: Element): boolean {
  const walker = block.ownerDocument.createTreeWalker(
    block,
    NodeFilter.SHOW_TEXT,
  );
  let nonLinkText = "";
  let node: Text | null;
  while ((node = walker.nextNode() as Text | null)) {
    if (!node.data.trim()) continue;
    // Walk up to see if we're inside a link
    let parent: Element | null = node.parentElement;
    let insideLink = false;
    while (parent && parent !== block) {
      if (parent.tagName === "A") {
        insideLink = true;
        break;
      }
      parent = parent.parentElement;
    }
    if (!insideLink) nonLinkText += node.data;
  }
  // Require at least one word (2+ consecutive letters in any script) to count as prose
  return /\p{L}{2,}/u.test(nonLinkText);
}

/**
 * Get the computed foreground color of the first non-link text node in `block`.
 */
function getSurroundingTextColor(
  block: Element,
  link: Element,
): [number, number, number] | null {
  const walker = block.ownerDocument.createTreeWalker(
    block,
    NodeFilter.SHOW_TEXT,
  );
  let node: Text | null;
  while ((node = walker.nextNode() as Text | null)) {
    if (!node.data.trim()) continue;
    let parent: Element | null = node.parentElement;
    let insideLink = false;
    let cur: Element | null = parent;
    while (cur && cur !== block) {
      if (cur.tagName === "A") {
        insideLink = true;
        break;
      }
      cur = cur.parentElement;
    }
    if (insideLink) continue;
    if (!parent) continue;
    return parseColor(getCachedComputedStyle(parent).color);
  }
  return null;
}

/**
 * Check if the link has a non-color visual distinction from surrounding text.
 */
function isVisuallyDistinct(
  linkStyle: CSSStyleDeclaration,
  parentStyle: CSSStyleDeclaration,
): boolean {
  // Underline or line-through that differs from parent
  const linkDecoration = linkStyle.textDecorationLine || linkStyle.textDecoration || "";
  const parentDecoration = parentStyle.textDecorationLine || parentStyle.textDecoration || "";
  if (
    (linkDecoration.includes("underline") || linkDecoration.includes("line-through")) &&
    linkDecoration !== parentDecoration
  ) {
    return true;
  }

  // Border-bottom
  const borderWidth = parseFloat(linkStyle.borderBottomWidth) || 0;
  const borderStyle = linkStyle.borderBottomStyle || "";
  if (borderWidth > 0 && borderStyle !== "none" && borderStyle !== "hidden") {
    return true;
  }

  // Outline
  const outlineWidth = parseFloat(linkStyle.outlineWidth) || 0;
  const outlineStyle = linkStyle.outlineStyle || "";
  if (outlineWidth > 0 && outlineStyle !== "none") {
    return true;
  }

  // Background image on the link itself
  const bgImage = linkStyle.backgroundImage || "";
  if (bgImage && bgImage !== "none" && bgImage !== "initial") {
    return true;
  }

  // Font-weight difference >= 300
  const linkWeight = parseFontWeight(linkStyle.fontWeight);
  const parentWeight = parseFontWeight(parentStyle.fontWeight);
  if (Math.abs(linkWeight - parentWeight) >= 300) {
    return true;
  }

  // Font-style differs (italic vs normal)
  if (linkStyle.fontStyle !== parentStyle.fontStyle) {
    return true;
  }

  // Font-size ratio >= 1.2
  const linkSize = parseFloat(linkStyle.fontSize) || 16;
  const parentSize = parseFloat(parentStyle.fontSize) || 16;
  if (parentSize > 0 && linkSize / parentSize >= 1.2) {
    return true;
  }

  return false;
}

function parseFontWeight(w: string): number {
  if (w === "bold") return 700;
  if (w === "normal") return 400;
  return parseInt(w) || 400;
}

function toHex(r: number, g: number, b: number): string {
  return (
    "#" +
    [r, g, b].map((c) => c.toString(16).padStart(2, "0")).join("")
  );
}

export const linkInTextBlock: Rule = {
  id: "link-in-text-block",
  wcag: ["1.4.1"],
  level: "A",
  description: "Links within text blocks must be distinguishable by more than color alone.",
  guidance: "Users who cannot perceive color differences need other visual cues to identify links. Links in text should have underlines or other non-color indicators. If using color alone, ensure 3:1 contrast with surrounding text AND provide additional indication on focus/hover.",
  prompt:
    "Explain how to make this link visually distinguishable without relying on color alone.",
  run(doc) {
    const violations = [];

    for (const link of doc.querySelectorAll("a[href]")) {
      if (isAriaHidden(link)) continue;

      // Skip links with no text content (e.g. image-only links)
      if (!getAccessibleTextContent(link).trim()) continue;

      // Skip links in navigation/footer landmarks — these are expected
      // to be all-link regions and don't need prose-level distinction.
      if (link.closest('nav, header, footer, [role="navigation"], [role="banner"], [role="contentinfo"]')) continue;

      // Skip non-inline links (block-level links are visually distinct)
      const linkStyle = getCachedComputedStyle(link);
      const linkDisplay = linkStyle.display || "inline"; // default for <a>
      if (!INLINE_DISPLAYS.has(linkDisplay)) continue;

      // Find the parent text block
      const block = findParentTextBlock(link);
      if (!block) continue;

      const blockStyle = getCachedComputedStyle(block);

      // Check 1: non-color visual distinction
      if (isVisuallyDistinct(linkStyle, blockStyle)) continue;

      // Check 2: 3:1 color contrast with surrounding text
      const linkColor = parseColor(linkStyle.color);
      const textColor = getSurroundingTextColor(block, link);

      // Conservative: skip when colors can't be determined
      if (!linkColor || !textColor) continue;

      const linkLum = getLuminance(...linkColor);
      const textLum = getLuminance(...textColor);
      const ratio = getContrastRatio(linkLum, textLum);

      if (ratio >= 3) continue;

      const linkHex = toHex(...linkColor);
      const textHex = toHex(...textColor);
      const context =
        `link color: ${linkHex} rgb(${linkColor.join(", ")}), ` +
        `surrounding text: ${textHex} rgb(${textColor.join(", ")}), ` +
        `ratio: ${ratio.toFixed(2)}:1`;

      violations.push({
        ruleId: "link-in-text-block",
        selector: getSelector(link),
        html: getHtmlSnippet(link),
        impact: "serious" as const,
        message:
          "Link in text block is not visually distinguishable from surrounding text. Add an underline, border, or ensure 3:1 color contrast with surrounding text.",
        context,
      });
    }

    return violations;
  },
};
