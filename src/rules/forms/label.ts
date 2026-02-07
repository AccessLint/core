import type { Rule } from "../types";
import { getSelector, getHtmlSnippet } from "../utils/selector";
import { getAccessibleName, getAccessibleTextContent, isAriaHidden } from "../utils/aria";

// Widget roles that constitute form fields (per ACT rule e086e5)
const WIDGET_ROLE_SELECTOR = [
  '[role="checkbox"]',
  '[role="combobox"]',
  '[role="listbox"]',
  '[role="menuitemcheckbox"]',
  '[role="menuitemradio"]',
  '[role="radio"]',
  '[role="searchbox"]',
  '[role="slider"]',
  '[role="spinbutton"]',
  '[role="switch"]',
  '[role="textbox"]',
].join(", ");

// Widget roles where text content is a valid accessible name ("name from content")
const NAME_FROM_CONTENT_ROLES = new Set([
  "checkbox", "menuitemcheckbox", "menuitemradio", "radio", "switch",
]);

// Roles where text content is NOT a valid accessible name ("name from author")
const NAME_FROM_AUTHOR_ROLES = new Set([
  "combobox", "listbox", "searchbox", "slider", "spinbutton", "textbox",
]);

/**
 * Get accessible name for form fields, respecting "name from content" vs
 * "name from author" per the ARIA spec.  For "name from author" roles
 * (textbox, combobox, etc.) and native <select>, text content is NOT a
 * valid accessible name source.
 */
function getFormFieldName(el: Element): string {
  const role = el.getAttribute("role")?.trim().toLowerCase();

  // "Name from content" widget roles: full computation is fine
  if (role && NAME_FROM_CONTENT_ROLES.has(role)) {
    return getAccessibleName(el);
  }

  // Native input/textarea without a "name from author" role override:
  // standard computation already excludes text content for inputs
  const isNativeInput = el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement;
  if (isNativeInput && !(role && NAME_FROM_AUTHOR_ROLES.has(role))) {
    return getAccessibleName(el);
  }

  // "Name from author" roles and native <select>: compute without text content
  // 1. aria-labelledby
  const labelledBy = el.getAttribute("aria-labelledby");
  if (labelledBy) {
    const names = labelledBy
      .split(/\s+/)
      .map((id) => {
        const ref = el.ownerDocument.getElementById(id);
        return ref ? getAccessibleTextContent(ref).trim() : "";
      })
      .filter(Boolean);
    if (names.length) return names.join(" ");
  }

  // 2. aria-label
  const ariaLabel = el.getAttribute("aria-label")?.trim();
  if (ariaLabel) return ariaLabel;

  // 3. <label> association (only for native labelable elements)
  if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement) {
    if (el.id) {
      const label = el.ownerDocument.querySelector(`label[for="${CSS.escape(el.id)}"]`);
      if (label) {
        const text = getAccessibleTextContent(label).trim();
        if (text) return text;
      }
    }
    const parentLabel = el.closest("label");
    if (parentLabel) {
      const text = getAccessibleTextContent(parentLabel).trim();
      if (text) return text;
    }
  }

  // 4. title
  const title = el.getAttribute("title")?.trim();
  if (title) return title;

  // 5. placeholder (native input/textarea only)
  if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
    const placeholder = el.getAttribute("placeholder")?.trim();
    if (placeholder) return placeholder;
  }

  return "";
}

export const formLabel: Rule = {
  id: "label",
  wcag: ["4.1.2"],
  level: "A",
  description: "Form elements must have labels. Use <label>, aria-label, or aria-labelledby.",
  guidance: "Every form input needs an accessible label so users understand what information to enter. Use a <label> element with a for attribute matching the input's id, wrap the input in a <label>, or use aria-label/aria-labelledby for custom components. Placeholders are not sufficient as labels since they disappear when typing.",
  prompt:
    "Based on the input type, name attribute, or placeholder, suggest a label element with appropriate text, or an aria-label.",
  run(doc) {
    const violations = [];

    const nativeSelector =
      'input:not([type="hidden"]):not([type="submit"]):not([type="button"]):not([type="reset"]):not([type="image"]), textarea, select';
    const inputs = doc.querySelectorAll(`${nativeSelector}, ${WIDGET_ROLE_SELECTOR}`);

    for (const input of inputs) {
      if (isAriaHidden(input)) continue;
      if (input instanceof HTMLElement && (input.hidden || input.style.display === "none")) continue;

      // Skip elements with presentation/none role
      const role = input.getAttribute("role")?.trim().toLowerCase();
      if (role === "presentation" || role === "none") continue;

      const name = getFormFieldName(input);
      if (!name) {
        violations.push({
          ruleId: "label",
          selector: getSelector(input),
          html: getHtmlSnippet(input),
          impact: "critical" as const,
          message: "Form element has no accessible label.",
        });
      }
    }
    return violations;
  },
};

export const formFieldMultipleLabels: Rule = {
  id: "form-field-multiple-labels",
  wcag: [],
  level: "A",
  tags: ["best-practice"],
  description: "Form fields should not have multiple label elements.",
  guidance: "When a form field has multiple <label> elements pointing to it, assistive technologies may announce only one label or behave inconsistently. Use a single <label> and combine any additional text into it, or use aria-describedby for supplementary information.",
  prompt:
    "Identify the multiple labels and recommend consolidating them into a single <label> element or using aria-describedby for supplementary text.",
  run(doc) {
    const violations = [];
    const inputs = doc.querySelectorAll('input:not([type="hidden"]), textarea, select');

    for (const input of inputs) {
      if (isAriaHidden(input)) continue;
      if (!input.id) continue;

      // Count labels pointing to this input
      const labels = doc.querySelectorAll(`label[for="${CSS.escape(input.id)}"]`);

      // Also check for wrapping labels — only count <label> ancestors that
      // have no `for` attribute (a label with `for` is already counted above
      // if it points here, or labels a different element if it points elsewhere).
      let wrappingLabelCount = 0;
      let parent = input.parentElement;
      while (parent) {
        if (parent.tagName.toLowerCase() === "label" && !parent.hasAttribute("for")) {
          wrappingLabelCount++;
          break; // only the closest wrapping label applies per spec
        }
        parent = parent.parentElement;
      }

      const totalLabels = labels.length + wrappingLabelCount;

      if (totalLabels > 1) {
        violations.push({
          ruleId: "form-field-multiple-labels",
          selector: getSelector(input),
          html: getHtmlSnippet(input),
          impact: "moderate" as const,
          message: `Form field has ${totalLabels} labels. Use a single label element.`,
        });
      }
    }

    return violations;
  },
};
