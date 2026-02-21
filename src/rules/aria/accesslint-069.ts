import type { Rule } from "../types";
import { createNameRule } from "./aria-name-helpers";

export const accesslint069: Rule = createNameRule({
  id: "accesslint-069",
  description: "ARIA dialogs must have an accessible name.",
  guidance: "Dialog and alertdialog elements must have accessible names so screen reader users understand the dialog's purpose when it opens. Use aria-label or aria-labelledby pointing to the dialog's heading. Native <dialog> elements should also have an accessible name.",
  prompt: "Suggest adding aria-labelledby pointing to the dialog's heading element, or an aria-label describing the dialog's purpose.",
  selector: '[role="dialog"], [role="alertdialog"], dialog',
  message: "Dialog has no accessible name.",
});
