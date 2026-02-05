import type { Rule } from "../types";
import { getSelector, getHtmlSnippet } from "../utils/selector";

const VALID_AUTOCOMPLETE = new Set([
  "off", "on", "name", "honorific-prefix", "given-name", "additional-name",
  "family-name", "honorific-suffix", "nickname", "email", "username",
  "new-password", "current-password", "one-time-code", "organization-title",
  "organization", "street-address", "address-line1", "address-line2",
  "address-line3", "address-level4", "address-level3", "address-level2",
  "address-level1", "country", "country-name", "postal-code", "cc-name",
  "cc-given-name", "cc-additional-name", "cc-family-name", "cc-number",
  "cc-exp", "cc-exp-month", "cc-exp-year", "cc-csc", "cc-type",
  "transaction-currency", "transaction-amount", "language", "bday",
  "bday-day", "bday-month", "bday-year", "sex", "tel", "tel-country-code",
  "tel-national", "tel-area-code", "tel-local", "tel-extension", "impp",
  "url", "photo",
]);

export const autocompleteValid: Rule = {
  id: "autocomplete-valid",
  wcag: ["1.3.5"],
  level: "AA",
  description: "Autocomplete attribute must use valid values from the HTML specification.",
  guidance:
    "The autocomplete attribute helps users fill forms by identifying input purposes. Use standard values like 'name', 'email', 'tel', 'street-address', 'postal-code', 'cc-number'. This benefits users with cognitive disabilities, motor impairments, and anyone using password managers or autofill. Check the HTML specification for the complete list of valid tokens.",
  prompt:
    "Show the invalid autocomplete value and suggest the correct standard value based on the input's apparent purpose.",
  run(doc) {
    const violations = [];
    for (const el of doc.querySelectorAll("[autocomplete]")) {
      const value = el.getAttribute("autocomplete")!.trim();
      if (!value) continue;
      // Parse tokens: optional "section-*", optional "shipping"/"billing", the field name
      const tokens = value.split(/\s+/);
      const fieldToken = tokens[tokens.length - 1];
      if (!VALID_AUTOCOMPLETE.has(fieldToken)) {
        violations.push({
          ruleId: "autocomplete-valid",
          selector: getSelector(el),
          html: getHtmlSnippet(el),
          impact: "serious" as const,
          message: `Invalid autocomplete value "${value}".`,
        });
      }
    }
    return violations;
  },
};
