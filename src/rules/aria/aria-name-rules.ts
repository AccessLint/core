import type { Rule } from "../types";
import { getSelector, getHtmlSnippet } from "../utils/selector";
import { getAccessibleName, isAriaHidden } from "../utils/aria";

// Command roles that require accessible names
const COMMAND_ROLES = new Set(["button", "link", "menuitem"]);

// Input field roles that require accessible names
const INPUT_ROLES = new Set(["combobox", "listbox", "searchbox", "slider", "spinbutton", "textbox"]);

// Toggle field roles that require accessible names
const TOGGLE_ROLES = new Set(["checkbox", "menuitemcheckbox", "menuitemradio", "radio", "switch"]);

// Widget roles that require accessible names
const WIDGET_NAME_REQUIRED: Record<string, string> = {
  meter: "meter",
  progressbar: "progressbar",
  dialog: "dialog",
  alertdialog: "alertdialog",
  tooltip: "tooltip",
  treeitem: "treeitem",
};

function createNameRule(
  id: string,
  description: string,
  guidance: string,
  selector: string,
  roleSet?: Set<string>
): Rule {
  return {
    id,
    wcag: ["4.1.2"],
    level: "A",
    description,
    guidance,
    run(doc) {
      const violations = [];

      for (const el of doc.querySelectorAll(selector)) {
        if (isAriaHidden(el)) continue;

        // Check if role matches (if roleSet provided)
        if (roleSet) {
          const role = el.getAttribute("role")?.trim().toLowerCase();
          if (!role || !roleSet.has(role)) continue;
        }

        const name = getAccessibleName(el);
        if (!name) {
          violations.push({
            ruleId: id,
            selector: getSelector(el),
            html: getHtmlSnippet(el),
            impact: "serious" as const,
            message: `${description} Element has no accessible name.`,
          });
        }
      }

      return violations;
    },
  };
}

export const ariaCommandName: Rule = {
  id: "aria-command-name",
  wcag: ["4.1.2"],
  level: "A",
  description: "ARIA commands must have an accessible name.",
  guidance: "Interactive ARIA command roles (button, link, menuitem) must have accessible names so users know what action they perform. Add visible text content, aria-label, or aria-labelledby to provide a name.",
  prompt:
    "Based on the element's content or context, suggest an aria-label describing what this command does.",
  run(doc) {
    const violations = [];

    // Check elements with command roles
    for (const el of doc.querySelectorAll('[role="button"], [role="link"], [role="menuitem"]')) {
      if (isAriaHidden(el)) continue;

      // Skip native elements that are handled by other rules
      if (el.tagName.toLowerCase() === "button" || el.tagName.toLowerCase() === "a") continue;

      const name = getAccessibleName(el);
      if (!name) {
        // Check for img alt inside
        const img = el.querySelector("img[alt]");
        if (img?.getAttribute("alt")?.trim()) continue;

        violations.push({
          ruleId: "aria-command-name",
          selector: getSelector(el),
          html: getHtmlSnippet(el),
          impact: "serious" as const,
          message: "ARIA command has no accessible name.",
        });
      }
    }

    return violations;
  },
};

export const ariaInputFieldName: Rule = {
  id: "aria-input-field-name",
  wcag: ["4.1.2"],
  level: "A",
  description: "ARIA input fields must have an accessible name.",
  guidance: "ARIA input widgets (combobox, listbox, searchbox, slider, spinbutton, textbox) must have accessible names so users understand what data to enter. Add a visible label with aria-labelledby, or use aria-label if a visible label is not possible.",
  prompt:
    "Based on the context, suggest an aria-label describing what data this input field accepts.",
  run(doc) {
    const violations = [];
    const selector = '[role="combobox"], [role="listbox"], [role="searchbox"], [role="slider"], [role="spinbutton"], [role="textbox"]';

    for (const el of doc.querySelectorAll(selector)) {
      if (isAriaHidden(el)) continue;

      // Skip native inputs handled by label rule
      if (el.matches("input, select, textarea")) continue;

      const name = getAccessibleName(el);
      if (!name) {
        violations.push({
          ruleId: "aria-input-field-name",
          selector: getSelector(el),
          html: getHtmlSnippet(el),
          impact: "serious" as const,
          message: "ARIA input field has no accessible name.",
        });
      }
    }

    return violations;
  },
};

export const ariaToggleFieldName: Rule = {
  id: "aria-toggle-field-name",
  wcag: ["4.1.2"],
  level: "A",
  description: "ARIA toggle fields must have an accessible name.",
  guidance: "ARIA toggle controls (checkbox, switch, radio, menuitemcheckbox, menuitemradio) must have accessible names so users understand what option they're selecting. Add visible text content, aria-label, or use aria-labelledby to reference a visible label.",
  prompt:
    "Based on the context, suggest an aria-label describing what option this toggle controls.",
  run(doc) {
    const violations = [];
    const selector = '[role="checkbox"], [role="switch"], [role="radio"], [role="menuitemcheckbox"], [role="menuitemradio"]';

    for (const el of doc.querySelectorAll(selector)) {
      if (isAriaHidden(el)) continue;

      // Skip native inputs handled by other rules
      if (el.matches('input[type="checkbox"], input[type="radio"]')) continue;

      const name = getAccessibleName(el);
      if (!name) {
        violations.push({
          ruleId: "aria-toggle-field-name",
          selector: getSelector(el),
          html: getHtmlSnippet(el),
          impact: "serious" as const,
          message: "ARIA toggle field has no accessible name.",
        });
      }
    }

    return violations;
  },
};

export const ariaMeterName: Rule = {
  id: "aria-meter-name",
  wcag: ["4.1.2"],
  level: "A",
  description: "ARIA meter elements must have an accessible name.",
  guidance: "Meter elements display a value within a known range (like disk usage or password strength). They must have accessible names so screen reader users understand what is being measured. Use aria-label or aria-labelledby to provide context.",
  prompt:
    "Based on the context or value attributes, suggest an aria-label describing what this meter measures.",
  run(doc) {
    const violations = [];

    for (const el of doc.querySelectorAll('[role="meter"], meter')) {
      if (isAriaHidden(el)) continue;

      const name = getAccessibleName(el);
      if (!name) {
        violations.push({
          ruleId: "aria-meter-name",
          selector: getSelector(el),
          html: getHtmlSnippet(el),
          impact: "serious" as const,
          message: "Meter has no accessible name.",
        });
      }
    }

    return violations;
  },
};

export const ariaProgressbarName: Rule = {
  id: "aria-progressbar-name",
  wcag: ["4.1.2"],
  level: "A",
  description: "ARIA progressbar elements must have an accessible name.",
  guidance: "Progress indicators must have accessible names so screen reader users understand what process is being tracked. Use aria-label (e.g., 'File upload progress') or aria-labelledby to reference a visible heading or label.",
  prompt:
    "Based on the context, suggest an aria-label describing what process this progressbar tracks.",
  run(doc) {
    const violations = [];

    for (const el of doc.querySelectorAll('[role="progressbar"], progress')) {
      if (isAriaHidden(el)) continue;

      const name = getAccessibleName(el);
      if (!name) {
        violations.push({
          ruleId: "aria-progressbar-name",
          selector: getSelector(el),
          html: getHtmlSnippet(el),
          impact: "serious" as const,
          message: "Progressbar has no accessible name.",
        });
      }
    }

    return violations;
  },
};

export const ariaDialogName: Rule = {
  id: "aria-dialog-name",
  wcag: ["4.1.2"],
  level: "A",
  description: "ARIA dialogs must have an accessible name.",
  guidance: "Dialog and alertdialog elements must have accessible names so screen reader users understand the dialog's purpose when it opens. Use aria-label or aria-labelledby pointing to the dialog's heading. Native <dialog> elements should also have an accessible name.",
  prompt:
    "Suggest adding aria-labelledby pointing to the dialog's heading element, or an aria-label describing the dialog's purpose.",
  run(doc) {
    const violations = [];

    for (const el of doc.querySelectorAll('[role="dialog"], [role="alertdialog"], dialog')) {
      if (isAriaHidden(el)) continue;

      const name = getAccessibleName(el);
      if (!name) {
        violations.push({
          ruleId: "aria-dialog-name",
          selector: getSelector(el),
          html: getHtmlSnippet(el),
          impact: "serious" as const,
          message: "Dialog has no accessible name.",
        });
      }
    }

    return violations;
  },
};

export const ariaTooltipName: Rule = {
  id: "aria-tooltip-name",
  wcag: ["4.1.2"],
  level: "A",
  description: "ARIA tooltips must have an accessible name.",
  guidance: "Tooltip elements must have accessible names (usually their text content). The tooltip content itself typically serves as the accessible name. Ensure the tooltip contains descriptive text content or has aria-label.",
  prompt:
    "Add text content to the tooltip describing the information it provides, or add aria-label.",
  run(doc) {
    const violations = [];

    for (const el of doc.querySelectorAll('[role="tooltip"]')) {
      if (isAriaHidden(el)) continue;

      const name = getAccessibleName(el);
      if (!name) {
        violations.push({
          ruleId: "aria-tooltip-name",
          selector: getSelector(el),
          html: getHtmlSnippet(el),
          impact: "serious" as const,
          message: "Tooltip has no accessible name.",
        });
      }
    }

    return violations;
  },
};

export const ariaTreeitemName: Rule = {
  id: "aria-treeitem-name",
  wcag: ["4.1.2"],
  level: "A",
  description: "ARIA treeitem elements must have an accessible name.",
  guidance: "Tree items must have accessible names so screen reader users can understand the tree structure and navigate it effectively. Provide text content, aria-label, or aria-labelledby for each treeitem.",
  prompt:
    "Add text content describing this tree item, or add aria-label.",
  run(doc) {
    const violations = [];

    for (const el of doc.querySelectorAll('[role="treeitem"]')) {
      if (isAriaHidden(el)) continue;

      const name = getAccessibleName(el);
      if (!name) {
        violations.push({
          ruleId: "aria-treeitem-name",
          selector: getSelector(el),
          html: getHtmlSnippet(el),
          impact: "serious" as const,
          message: "Treeitem has no accessible name.",
        });
      }
    }

    return violations;
  },
};
