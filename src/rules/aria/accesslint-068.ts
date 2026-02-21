import type { Rule } from "../types";
import { createNameRule } from "./aria-name-helpers";

export const accesslint068: Rule = createNameRule({
  id: "accesslint-068",
  description: "ARIA progressbar elements must have an accessible name.",
  guidance: "Progress indicators must have accessible names so screen reader users understand what process is being tracked. Use aria-label (e.g., 'File upload progress') or aria-labelledby to reference a visible heading or label.",
  prompt: "Based on the context, suggest an aria-label describing what process this progressbar tracks.",
  selector: '[role="progressbar"], progress',
  message: "Progressbar has no accessible name.",
});
