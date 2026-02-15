import type { Rule } from "../types";
import { getSelector, getHtmlSnippet } from "../utils/selector";
import { isAriaHidden } from "../utils/aria";

export const videoCaptions: Rule = {
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

export const audioCaptions: Rule = {
  id: "accesslint-091",
  actRuleIds: ["e7aa44"],
  wcag: ["1.2.1"],
  level: "A",
  description: "Audio elements should have a text alternative or transcript.",
  guidance: "Audio-only content like podcasts or recordings needs a text alternative for deaf users. Provide a transcript either on the same page or linked nearby. The transcript should include all spoken content and descriptions of relevant sounds.",
  prompt:
    "Explain options for providing a text alternative: transcript link or aria-describedby.",
  run(doc) {
    const violations = [];

    for (const audio of doc.querySelectorAll("audio")) {
      if (isAriaHidden(audio)) continue;

      // Check for track element with captions or descriptions
      const track = audio.querySelector('track[kind="captions"], track[kind="descriptions"]');
      if (track) continue;

      // Check for aria-describedby pointing to transcript
      if (audio.hasAttribute("aria-describedby")) continue;

      // Check for nearby transcript link or content
      const parent = audio.parentElement;
      if (parent) {
        const transcriptLink = parent.querySelector('a[href*="transcript"], a[href*="text"]');
        if (transcriptLink) continue;
      }

      violations.push({
        ruleId: "accesslint-091",
        selector: getSelector(audio),
        html: getHtmlSnippet(audio),
        impact: "critical" as const,
        message: "Audio element has no transcript or text alternative. Add a transcript or track element.",
      });
    }

    return violations;
  },
};
