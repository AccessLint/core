import type { Rule } from "../types";
import { getSelector, getHtmlSnippet } from "../utils/selector";
import { getAccessibleName, isAriaHidden } from "../utils/aria";

function getImageContext(img: HTMLImageElement): string | undefined {
  const parts: string[] = [];

  // Check if inside a link
  const link = img.closest("a");
  if (link) {
    const href = link.getAttribute("href");
    if (href) parts.push(`Link href: ${href}`);
  }

  // Check for figcaption
  const figure = img.closest("figure");
  if (figure) {
    const caption = figure.querySelector("figcaption");
    if (caption?.textContent?.trim()) {
      parts.push(`Figcaption: ${caption.textContent.trim().slice(0, 100)}`);
    }
  }

  // Get adjacent text from parent
  const parent = img.parentElement;
  if (parent && parent !== link) {
    const text = parent.textContent?.replace(img.alt || "", "").trim().slice(0, 100);
    if (text) parts.push(`Adjacent text: ${text}`);
  }

  return parts.length > 0 ? parts.join("\n") : undefined;
}

export const imgAlt: Rule = {
  id: "img-alt",
  wcag: ["1.1.1"],
  level: "A",
  description:
    "Images must have alternate text. Add an alt attribute to <img> elements. Decorative images may use an empty alt attribute (alt=\"\"), role='none', or role='presentation'.",
  guidance:
    "Every image needs an alt attribute. For informative images, describe the content or function concisely. For decorative images (backgrounds, spacers, purely visual flourishes), use alt='' to hide them from screen readers. Never omit alt entirely—screen readers may read the filename instead.",
  prompt:
    "Describe what alt text to add. If the image appears decorative based on context (spacer, background, icon next to text that already describes it), recommend alt=''. Otherwise suggest descriptive alt text based on the src or surrounding context.",
  run(doc) {
    const violations = [];
    for (const img of doc.querySelectorAll("img")) {
      if (isAriaHidden(img)) continue;
      if (img.getAttribute("role") === "presentation" || img.getAttribute("role") === "none") continue;
      if (!img.hasAttribute("alt") && !getAccessibleName(img)) {
        violations.push({
          ruleId: "img-alt",
          selector: getSelector(img),
          html: getHtmlSnippet(img),
          impact: "critical" as const,
          message: "Image element missing alt attribute.",
          context: getImageContext(img),
        });
      }
    }
    return violations;
  },
};
