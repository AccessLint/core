import type { Rule } from "../types";
import { getSelector, getHtmlSnippet } from "../utils/selector";
import { isAriaHidden } from "../utils/aria";

/**
 * Get the accessible name of an SVG from naming mechanisms only
 * (not from text content, which is part of the image, not a label).
 */
function getSvgAccessibleName(el: Element): string {
  // aria-labelledby
  const labelledBy = el.getAttribute("aria-labelledby");
  if (labelledBy) {
    const names = labelledBy
      .split(/\s+/)
      .map((id) => el.ownerDocument.getElementById(id)?.textContent?.trim() ?? "")
      .filter(Boolean);
    if (names.length) return names.join(" ");
  }

  // aria-label
  const ariaLabel = el.getAttribute("aria-label")?.trim();
  if (ariaLabel) return ariaLabel;

  // <title> element (first child)
  const title = el.querySelector("title");
  if (title?.textContent?.trim()) return title.textContent.trim();

  // title attribute
  const titleAttr = el.getAttribute("title")?.trim();
  if (titleAttr) return titleAttr;

  return "";
}

export const svgImgAlt: Rule = {
  id: "svg-img-alt",
  wcag: ["1.1.1"],
  level: "A",
  description:
    "SVG elements with an img, graphics-document, or graphics-symbol role must have an accessible name via a <title> element, aria-label, or aria-labelledby.",
  guidance:
    "Inline SVGs with role='img' need accessible names. Add a <title> element as the first child of the SVG (screen readers will announce it), or use aria-label on the SVG element. For complex SVGs, use aria-labelledby referencing both a <title> and <desc> element. Decorative SVGs should use aria-hidden='true' instead.",
  prompt:
    "Based on the SVG content or context, suggest either adding aria-label with a description, or if decorative, replacing role='img' with aria-hidden='true'.",
  run(doc) {
    const violations = [];

    // Check SVGs with role="img" and child elements with graphics roles
    const selector = 'svg[role="img"], [role="graphics-document"], [role="graphics-symbol"]';
    for (const el of doc.querySelectorAll(selector)) {
      if (isAriaHidden(el)) continue;
      const name = getSvgAccessibleName(el);
      if (!name) {
        const role = el.getAttribute("role");
        violations.push({
          ruleId: "svg-img-alt",
          selector: getSelector(el),
          html: getHtmlSnippet(el),
          impact: "serious" as const,
          message: `${el.tagName.toLowerCase()} with role='${role}' has no accessible name.`,
        });
      }
    }
    return violations;
  },
};
