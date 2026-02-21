import type { Rule, Violation } from "../types";
import { getSelector, getHtmlSnippet } from "../utils/selector";

// Selectors for sectioning elements that scope landmarks
export const SECTIONING_SELECTOR = 'article, aside, main, nav, section, [role="article"], [role="complementary"], [role="main"], [role="navigation"], [role="region"]';

// Landmark selectors
export const LANDMARK_SELECTOR = 'main, [role="main"], header, [role="banner"], footer, [role="contentinfo"], nav, [role="navigation"], aside, [role="complementary"], section[aria-label], section[aria-labelledby], [role="region"][aria-label], [role="region"][aria-labelledby], form[aria-label], form[aria-labelledby], [role="form"][aria-label], [role="form"][aria-labelledby], [role="search"]';

/**
 * Factory for "no duplicate landmark" rules. These rules check that at most
 * one top-level element matches a given selector.
 */
export function makeNoDuplicateLandmarkRule(opts: {
  id: string;
  selector: string;
  landmarkName: string;
  description: string;
  guidance: string;
  prompt: string;
  filterTopLevel: boolean;
}): Rule {
  return {
    id: opts.id,
    wcag: [],
    level: "A",
    tags: ["best-practice"],
    description: opts.description,
    guidance: opts.guidance,
    prompt: opts.prompt,
    run(doc) {
      const violations: Violation[] = [];
      const els = doc.querySelectorAll(opts.selector);
      const candidates = opts.filterTopLevel
        ? Array.from(els).filter((el) => !el.closest(SECTIONING_SELECTOR))
        : Array.from(els);

      if (candidates.length > 1) {
        candidates.slice(1).forEach((el) =>
          violations.push({
            ruleId: opts.id,
            selector: getSelector(el),
            html: getHtmlSnippet(el),
            impact: "moderate" as const,
            message: `Page has multiple ${opts.landmarkName} landmarks.`,
          })
        );
      }
      return violations;
    },
  };
}
