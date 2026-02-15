import type { Rule } from "../types";
import { getSelector, getHtmlSnippet } from "../utils/selector";
import { isAriaHidden } from "../utils/aria";

/**
 * Get the accessible name of an <object> from naming mechanisms only.
 * Fallback content inside <object> is rendered when the object fails to load
 * and does not constitute an accessible name for the object itself.
 */
function getObjectAccessibleName(el: Element): string {
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

  // title attribute
  const title = el.getAttribute("title")?.trim();
  if (title) return title;

  return "";
}

export const objectAlt: Rule = {
  id: "accesslint-017",
  actRuleIds: ["8fc3b6"],
  wcag: ["1.1.1"],
  level: "A",
  description: "<object> elements must have alternative text.",
  guidance: "Object elements embed external content that may not be accessible to all users. Provide alternative text via aria-label, aria-labelledby, or a title attribute. The fallback content inside <object> is only shown when the object fails to load and does not serve as an accessible name.",
  prompt:
    "Based on the data/type attributes, suggest adding aria-label or a title attribute describing what the embedded content represents.",
  run(doc) {
    const violations = [];

    for (const obj of doc.querySelectorAll("object")) {
      if (isAriaHidden(obj)) continue;

      // Skip elements hidden via visibility
      if (obj instanceof HTMLElement && obj.style.visibility === "hidden") continue;
      let parent: Element | null = obj.parentElement;
      let visHidden = false;
      while (parent) {
        if (parent instanceof HTMLElement && parent.style.visibility === "hidden") {
          visHidden = true;
          break;
        }
        parent = parent.parentElement;
      }
      if (visHidden) continue;

      // Skip objects that are purely decorative
      if (obj.getAttribute("role") === "presentation" || obj.getAttribute("role") === "none") {
        continue;
      }

      if (getObjectAccessibleName(obj)) continue;

      // Skip objects loading HTML documents with accessible fallback content.
      // When a non-image object fails to load, the fallback is shown instead.
      const data = obj.getAttribute("data") || "";
      const type = obj.getAttribute("type") || "";
      const isImage = type.startsWith("image/") || /\.(png|jpg|jpeg|gif|svg|webp|bmp|ico)$/i.test(data);
      if (!isImage) {
        const fallbackImg = obj.querySelector("img[alt]");
        if (fallbackImg && fallbackImg.getAttribute("alt")?.trim()) continue;
      }

      violations.push({
        ruleId: "accesslint-017",
        selector: getSelector(obj),
        html: getHtmlSnippet(obj),
        impact: "serious" as const,
        message: "<object> element is missing alternative text. Add aria-label, aria-labelledby, or a title attribute.",
      });
    }

    return violations;
  },
};
