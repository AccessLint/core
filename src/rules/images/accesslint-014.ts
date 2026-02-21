import type { Rule } from "../types";
import { getSelector, getHtmlSnippet } from "../utils/selector";

/**
 * Checks if alt text duplicates adjacent link or button text.
 * Maps to axe-core's image-redundant-alt rule.
 */
export const accesslint014: Rule = {
  id: "accesslint-014",
  wcag: [],
  level: "A",
  tags: ["best-practice"],
  description:
    "Image alt text should not duplicate adjacent link or button text. When alt text repeats surrounding text, screen reader users hear the same information twice.",
  guidance:
    "When an image is inside a link or button that also has text, make the alt text complementary rather than identical. If the image is purely decorative in that context, use alt='' to avoid repetition.",
  prompt:
    "The image alt text is identical to the text already visible in the parent link or button. Screen reader users hear the same words twice. If the image is decorative in this context (e.g. an icon next to a label), recommend alt=''. Otherwise suggest brief complementary alt text that adds information the visible text doesn't convey — for example what the image depicts, not what the link says.",
  run(doc) {
    const violations = [];
    for (const img of doc.querySelectorAll("img[alt]")) {
      const alt = img.getAttribute("alt")!.trim().toLowerCase();
      if (!alt) continue;

      // Check if alt duplicates surrounding link/button text
      const parentInteractive = img.closest("a, button");
      if (parentInteractive) {
        const parentText = parentInteractive.textContent?.trim().toLowerCase() || "";
        if (parentText && parentText === alt) {
          const parentTag = parentInteractive.tagName.toLowerCase();
          const href = parentInteractive.getAttribute("href");
          violations.push({
            ruleId: "accesslint-014",
            selector: getSelector(img),
            html: getHtmlSnippet(img),
            impact: "minor" as const,
            message: `Alt text "${img.getAttribute("alt")}" duplicates surrounding ${parentTag} text.`,
            context: `Duplicated text: "${img.getAttribute("alt")}", parent element: <${parentTag}>${href ? ` href="${href}"` : ""}`,
          });
        }
      }
    }
    return violations;
  },
};
