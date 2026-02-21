import type { Rule } from "../types";
import { getSelector, getHtmlSnippet } from "../utils/selector";

const REDUNDANT_WORDS = ["image", "picture", "photo", "graphic", "icon", "img"];

/**
 * Checks if alt text contains self-referential words like "image" or "photo".
 * Screen readers already announce "image"/"graphic" before alt text, so these
 * words are redundant.  Separate from image-redundant-alt because axe-core
 * does not have an equivalent check.
 */
export const imageAltWords: Rule = {
  id: "text-alternatives/image-alt-words",
  category: "text-alternatives",
  wcag: ["1.1.1"],
  level: "A",
  tags: ["best-practice"],
  fixability: "contextual",
  description:
    "Image alt text should not contain words like 'image', 'photo', or 'picture' — screen readers already announce the element type.",
  guidance:
    "Screen readers already announce 'image' or 'graphic' before reading alt text, so phrases like 'image of', 'photo of', or 'picture of' are redundant. Remove these words and describe what the image shows. For example, change 'image of a dog' to 'golden retriever playing fetch'.",
  run(doc) {
    const violations = [];
    for (const img of doc.querySelectorAll("img[alt]")) {
      const alt = img.getAttribute("alt")!.toLowerCase();
      if (!alt) continue;

      const found = REDUNDANT_WORDS.filter((w) => alt.split(/\s+/).includes(w));
      if (found.length > 0) {
        violations.push({
          ruleId: "text-alternatives/image-alt-words",
          selector: getSelector(img),
          html: getHtmlSnippet(img),
          impact: "minor" as const,
          message: `Alt text "${img.getAttribute("alt")}" contains redundant word(s): ${found.join(", ")}.`,
          context: `Current alt: "${img.getAttribute("alt")}", redundant word(s): ${found.join(", ")}`,
          fix: { type: "suggest", suggestion: "Remove the redundant word(s) from the alt text; screen readers already announce the element as an image" } as const,
        });
      }
    }
    return violations;
  },
};
