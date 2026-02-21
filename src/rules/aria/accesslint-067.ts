import type { Rule } from "../types";
import { createNameRule } from "./aria-name-helpers";

export const accesslint067: Rule = createNameRule({
  id: "accesslint-067",
  description: "ARIA meter elements must have an accessible name.",
  guidance: "Meter elements display a value within a known range (like disk usage or password strength). They must have accessible names so screen reader users understand what is being measured. Use aria-label or aria-labelledby to provide context.",
  prompt: "Based on the context or value attributes, suggest an aria-label describing what this meter measures.",
  selector: '[role="meter"], meter',
  message: "Meter has no accessible name.",
});
