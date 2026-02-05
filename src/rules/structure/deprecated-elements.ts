import type { Rule } from "../types";
import { getSelector, getHtmlSnippet } from "../utils/selector";
import { isAriaHidden } from "../utils/aria";

export const blink: Rule = {
  id: "blink",
  wcag: ["2.2.2"],
  level: "A",
  description: "The <blink> element must not be used.",
  guidance: "Blinking content can cause seizures in users with photosensitive epilepsy and is distracting for users with attention disorders. The <blink> element is deprecated and should never be used. If you need to draw attention to content, use less intrusive methods like color, borders, or icons.",
  prompt:
    "Suggest static alternatives to the blinking effect.",
  run(doc) {
    const violations = [];

    for (const blink of doc.querySelectorAll("blink")) {
      if (isAriaHidden(blink)) continue;

      violations.push({
        ruleId: "blink",
        selector: getSelector(blink),
        html: getHtmlSnippet(blink),
        impact: "serious" as const,
        message: "The <blink> element causes accessibility issues. Remove it entirely.",
      });
    }

    return violations;
  },
};

export const marquee: Rule = {
  id: "marquee",
  wcag: ["2.2.2"],
  level: "A",
  description: "The <marquee> element must not be used.",
  guidance: "Scrolling or moving content is difficult for many users to read, especially those with cognitive or visual disabilities. The <marquee> element is deprecated. Replace scrolling text with static content. If content must scroll, provide pause/stop controls and ensure it stops after 5 seconds.",
  prompt:
    "Suggest static alternatives or accessible carousel patterns.",
  run(doc) {
    const violations = [];

    for (const marquee of doc.querySelectorAll("marquee")) {
      if (isAriaHidden(marquee)) continue;

      violations.push({
        ruleId: "marquee",
        selector: getSelector(marquee),
        html: getHtmlSnippet(marquee),
        impact: "serious" as const,
        message: "The <marquee> element causes accessibility issues. Replace with static content.",
      });
    }

    return violations;
  },
};
