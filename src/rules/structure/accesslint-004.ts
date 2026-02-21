import type { Rule } from "../types";
import { getSelector, getHtmlSnippet } from "../utils/selector";
import { getAccessibleName, isAriaHidden } from "../utils/aria";
import { isHiddenFrame } from "./constants";

export const accesslint004: Rule = {
  id: "accesslint-004",
  actRuleIds: ["cae760"],
  wcag: ["4.1.2"],
  level: "A",
  description: "Frames must have an accessible name.",
  guidance: "Screen readers announce frame titles when users navigate frames. Add a title attribute to <iframe> and <frame> elements that describes the frame's purpose (e.g., <iframe title='Video player'>). Avoid generic titles like 'frame' or 'iframe'. If the frame is decorative, use aria-hidden='true'.",
  prompt:
    "This iframe has no accessible name. Based on the src URL in context, suggest a descriptive title attribute that tells screen reader users what the frame contains. For example: 'YouTube video player', 'Google Map', 'Payment form', 'Chat widget'. If the frame appears decorative or non-essential, recommend adding aria-hidden='true' instead.",
  run(doc) {
    const violations = [];
    for (const frame of doc.querySelectorAll("iframe, frame")) {
      if (isAriaHidden(frame)) continue;
      if (isHiddenFrame(frame)) continue;
      const name = getAccessibleName(frame);
      if (!name) {
        const src = frame.getAttribute("src");
        violations.push({
          ruleId: "accesslint-004",
          selector: getSelector(frame),
          html: getHtmlSnippet(frame),
          impact: "serious" as const,
          message: "Frame is missing an accessible name. Add a title attribute.",
          context: src ? `src: "${src}"` : undefined,
        });
      }
    }
    return violations;
  },
};
