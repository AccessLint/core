import type { Rule } from "../types";
import { getSelector, getHtmlSnippet } from "../utils/selector";
import { isAriaHidden, isComputedHidden } from "../utils/aria";

export const accesslint090: Rule = {
  id: "accesslint-090",
  actRuleIds: ["eac66b"],
  wcag: ["1.2.2"],
  level: "A",
  description: "Video elements must have captions via <track kind='captions'>.",
  guidance: "Captions provide text alternatives for audio content in videos, benefiting deaf users and those who cannot hear audio. Add a <track> element with kind='captions' pointing to a WebVTT caption file. Captions should include both dialogue and important sound effects.",
  prompt:
    "Explain how to add a captions track element to this video.",
  run(doc) {
    const violations = [];
    for (const video of doc.querySelectorAll("video")) {
      if (isAriaHidden(video)) continue;
      if (isComputedHidden(video)) continue;

      // Skip muted or autoplay videos — typically decorative/background with no audio to caption
      if (video.hasAttribute("muted")) continue;
      if (video.hasAttribute("autoplay")) continue;

      // Accept either captions or subtitles tracks
      const track = video.querySelector('track[kind="captions"], track[kind="subtitles"]');
      if (!track) {
        violations.push({
          ruleId: "accesslint-090",
          selector: getSelector(video),
          html: getHtmlSnippet(video),
          impact: "critical" as const,
          message: "Video element has no captions track.",
        });
      }
    }
    return violations;
  },
};
