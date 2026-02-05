import type { DeclarativeRule } from "../types";
import { compileDeclarativeRule } from "../engine";

const blinkSpec: DeclarativeRule = {
  id: "blink",
  selector: "blink",
  check: { type: "selector-exists" },
  impact: "serious",
  message: "The <blink> element causes accessibility issues. Remove it entirely.",
  description: "The <blink> element must not be used.",
  wcag: ["2.2.2"],
  level: "A",
  guidance: "Blinking content can cause seizures in users with photosensitive epilepsy and is distracting for users with attention disorders. The <blink> element is deprecated and should never be used. If you need to draw attention to content, use less intrusive methods like color, borders, or icons.",
  prompt: "Suggest static alternatives to the blinking effect.",
};

export const blink = compileDeclarativeRule(blinkSpec);

const marqueeSpec: DeclarativeRule = {
  id: "marquee",
  selector: "marquee",
  check: { type: "selector-exists" },
  impact: "serious",
  message: "The <marquee> element causes accessibility issues. Replace with static content.",
  description: "The <marquee> element must not be used.",
  wcag: ["2.2.2"],
  level: "A",
  guidance: "Scrolling or moving content is difficult for many users to read, especially those with cognitive or visual disabilities. The <marquee> element is deprecated. Replace scrolling text with static content. If content must scroll, provide pause/stop controls and ensure it stops after 5 seconds.",
  prompt: "Suggest static alternatives or accessible carousel patterns.",
};

export const marquee = compileDeclarativeRule(marqueeSpec);
