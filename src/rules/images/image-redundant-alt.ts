import type { Rule } from "../types";
import { getSelector, getHtmlSnippet } from "../utils/selector";

/**
 * Checks if alt text duplicates adjacent link or button text.
 * Maps to axe-core's image-redundant-alt rule.
 */
export const imageRedundantAlt: Rule = {
  id: "image-redundant-alt",
  wcag: [],
  level: "A",
  tags: ["best-practice"],
  description:
    "Image alt text should not duplicate adjacent link or button text. When alt text repeats surrounding text, screen reader users hear the same information twice.",
  guidance:
    "When an image is inside a link or button that also has text, make the alt text complementary rather than identical. If the image is purely decorative in that context, use alt='' to avoid repetition.",
  prompt:
    "Show the duplicated text and suggest either an empty alt or a complementary description.",
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
          violations.push({
            ruleId: "image-redundant-alt",
            selector: getSelector(img),
            html: getHtmlSnippet(img),
            impact: "minor" as const,
            message: `Alt text "${img.getAttribute("alt")}" duplicates surrounding ${parentInteractive.tagName.toLowerCase()} text.`,
          });
        }
      }
    }
    return violations;
  },
};

const REDUNDANT_WORDS = ["image", "picture", "photo", "graphic", "icon", "img"];

/**
 * Checks if alt text contains self-referential words like "image" or "photo".
 * Screen readers already announce "image"/"graphic" before alt text, so these
 * words are redundant.  Separate from image-redundant-alt because axe-core
 * does not have an equivalent check.
 */
export const imageAltRedundantWords: Rule = {
  id: "image-alt-redundant-words",
  wcag: [],
  level: "A",
  tags: ["best-practice"],
  description:
    "Image alt text should not contain words like 'image', 'photo', or 'picture' — screen readers already announce the element type.",
  guidance:
    "Screen readers already announce 'image' or 'graphic' before reading alt text, so phrases like 'image of', 'photo of', or 'picture of' are redundant. Remove these words and describe what the image shows. For example, change 'image of a dog' to 'golden retriever playing fetch'.",
  prompt:
    "Identify the redundant word(s) in the alt text and show the corrected version with those words removed.",
  run(doc) {
    const violations = [];
    for (const img of doc.querySelectorAll("img[alt]")) {
      const alt = img.getAttribute("alt")!.toLowerCase();
      if (!alt) continue;

      if (REDUNDANT_WORDS.some((w) => alt.split(/\s+/).includes(w))) {
        violations.push({
          ruleId: "image-alt-redundant-words",
          selector: getSelector(img),
          html: getHtmlSnippet(img),
          impact: "minor" as const,
          message: `Alt text "${img.getAttribute("alt")}" contains redundant word(s).`,
        });
      }
    }
    return violations;
  },
};
