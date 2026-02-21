import { createNameRule } from "./aria-name-helpers";

export const accesslint065 = createNameRule({
  id: "accesslint-065",
  selector: '[role="combobox"], [role="listbox"], [role="searchbox"], [role="slider"], [role="spinbutton"], [role="textbox"]',
  message: "ARIA input field has no accessible name.",
  description: "ARIA input fields must have an accessible name.",
  guidance: "ARIA input widgets (combobox, listbox, searchbox, slider, spinbutton, textbox) must have accessible names so users understand what data to enter. Add a visible label with aria-labelledby, or use aria-label if a visible label is not possible.",
  prompt: "Based on the context, suggest an aria-label describing what data this input field accepts.",
  checkComputedHidden: true,
  checkShadowDOM: true,
  skipNative: "input, select, textarea",
});
