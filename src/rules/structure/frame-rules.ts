import type { Rule } from "../types";
import { getSelector, getHtmlSnippet } from "../utils/selector";
import { getAccessibleName, isAriaHidden } from "../utils/aria";

export const frameTitle: Rule = {
  id: "frame-title",
  wcag: ["4.1.2"],
  level: "A",
  description: "Frames must have an accessible name.",
  guidance: "Screen readers announce frame titles when users navigate frames. Add a title attribute to <iframe> and <frame> elements that describes the frame's purpose (e.g., <iframe title='Video player'>). Avoid generic titles like 'frame' or 'iframe'. If the frame is decorative, use aria-hidden='true'.",
  prompt:
    "Suggest a descriptive title based on the frame's src URL or visible content.",
  run(doc) {
    const violations = [];
    for (const frame of doc.querySelectorAll("iframe, frame")) {
      if (isAriaHidden(frame)) continue;
      const name = getAccessibleName(frame);
      if (!name) {
        violations.push({
          ruleId: "frame-title",
          selector: getSelector(frame),
          html: getHtmlSnippet(frame),
          impact: "serious" as const,
          message: "Frame is missing an accessible name. Add a title attribute.",
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

      // Skip hidden/tracking iframes (zero dimensions or explicitly hidden)
      const width = frame.getAttribute("width");
      const height = frame.getAttribute("height");
      if (width === "0" || height === "0") continue;
      if (frame instanceof HTMLElement && frame.style.display === "none") continue;
      if (frame instanceof HTMLElement && frame.style.visibility === "hidden") continue;

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
