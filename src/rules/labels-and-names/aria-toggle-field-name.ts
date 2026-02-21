import { createNameRule } from "./aria-name-helpers";

export const ariaToggleFieldName = createNameRule({
  id: "labels-and-names/aria-toggle-field-name",
  selector: '[role="checkbox"], [role="switch"], [role="radio"], [role="menuitemcheckbox"], [role="menuitemradio"]',
  message: "ARIA toggle field has no accessible name.",
  description: "ARIA toggle fields must have an accessible name.",
  guidance: "ARIA toggle controls (checkbox, switch, radio, menuitemcheckbox, menuitemradio) must have accessible names so users understand what option they're selecting. Add visible text content, aria-label, or use aria-labelledby to reference a visible label.",
  prompt: "Based on the context, suggest an aria-label describing what option this toggle controls.",
  checkComputedHidden: true,
  checkShadowDOM: true,
  skipNative: 'input[type="checkbox"], input[type="radio"]',
});
