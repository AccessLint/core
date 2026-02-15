import type { Rule } from "../types";
import { getSelector, getHtmlSnippet } from "../utils/selector";
import { getAccessibleName, isAriaHidden } from "../utils/aria";

/** True when an iframe/frame is hidden and not exposed to assistive technology. */
function isHiddenFrame(frame: Element): boolean {
  if (!(frame instanceof HTMLElement)) return false;
  // Inline style checks
  if (frame.style.display === "none") return true;
  if (frame.style.visibility === "hidden") return true;
  // Zero or 1×1 tracking pixel dimensions (attribute or inline style)
  const w = frame.getAttribute("width");
  const h = frame.getAttribute("height");
  if ((w === "0" || w === "1") && (h === "0" || h === "1")) return true;
  return false;
}

export const frameTitle: Rule = {
  id: "frame-title",
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
          ruleId: "frame-title",
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

export const frameTitleUnique: Rule = {
  id: "frame-title-unique",
  wcag: ["4.1.2"],
  level: "A",
  tags: ["best-practice"],
  description: "Frame titles should be unique.",
  guidance: "When multiple frames have identical titles, screen reader users cannot distinguish between them. Give each frame a unique, descriptive title that explains its specific purpose or content.",
  prompt:
    "Suggest a more specific title to distinguish this frame from others.",
  run(doc) {
    const violations = [];
    const frames = Array.from(doc.querySelectorAll("iframe[title], frame[title]"));
    const titleMap = new Map<string, Element[]>();

    for (const frame of frames) {
      if (isAriaHidden(frame)) continue;
      if (isHiddenFrame(frame)) continue;

      const title = frame.getAttribute("title")?.trim().toLowerCase();
      if (title) {
        const existing = titleMap.get(title) || [];
        existing.push(frame);
        titleMap.set(title, existing);
      }
    }

    for (const [, elements] of titleMap) {
      if (elements.length > 1) {
        // Report all but the first as violations
        for (const frame of elements.slice(1)) {
          violations.push({
            ruleId: "frame-title-unique",
            selector: getSelector(frame),
            html: getHtmlSnippet(frame),
            impact: "moderate" as const,
            message: "Frame title is not unique. Use a distinct title for each frame.",
          });
        }
      }
    }
    return violations;
  },
};
