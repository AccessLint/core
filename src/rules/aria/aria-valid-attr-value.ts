import type { Rule } from "../types";
import { runAriaAttrAudit } from "./aria-attr-audit";

export const ariaValidAttrValue: Rule = {
  id: "aria-valid-attr-value",
  actRuleIds: ["6a7281"],
  wcag: ["4.1.2"],
  level: "A",
  description: "ARIA attributes must have valid values.",
  guidance:
    "Each ARIA attribute accepts specific value types. Boolean attributes (aria-hidden, aria-disabled) accept only 'true' or 'false'. Tristate attributes (aria-checked, aria-pressed) also accept 'mixed'. Token attributes (aria-live, aria-autocomplete) accept predefined values. ID reference attributes (aria-labelledby, aria-describedby) must reference existing element IDs.",
  prompt:
    "Show the invalid value and list the valid values for this specific attribute.",
  run(doc) {
    return runAriaAttrAudit(doc).validAttrValue;
  },
};
