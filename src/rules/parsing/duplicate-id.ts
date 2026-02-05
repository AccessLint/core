import type { Rule } from "../types";
import { getSelector, getHtmlSnippet } from "../utils/selector";

const ARIA_ID_ATTRS = ["aria-labelledby", "aria-describedby", "aria-controls", "aria-owns", "aria-flowto"];

export const duplicateIdAria: Rule = {
  id: "duplicate-id-aria",
  wcag: ["4.1.2"],
  level: "A",
  description: "IDs used in ARIA and label associations must be unique to avoid broken references.",
  guidance:
    "When aria-labelledby, aria-describedby, aria-controls, or label[for] reference a duplicate ID, only the first matching element is used. This breaks the intended relationship and may leave controls unnamed or descriptions missing. Ensure IDs referenced by ARIA attributes and label associations are unique throughout the document.",
  prompt:
    "Identify which attribute references this ID and suggest a unique replacement.",
  run(doc) {
    const violations = [];

    // Collect IDs referenced by ARIA attributes
    const activeRefs = new Set<string>();
    for (const el of doc.querySelectorAll("[aria-labelledby], [aria-describedby], [aria-controls], [aria-owns], [aria-flowto]")) {
      for (const attr of ARIA_ID_ATTRS) {
        const val = el.getAttribute(attr);
        if (val) val.split(/\s+/).forEach((id) => activeRefs.add(id));
      }
    }

    // Collect IDs referenced by label[for]
    for (const label of doc.querySelectorAll("label[for]")) {
      const forVal = label.getAttribute("for");
      if (forVal) activeRefs.add(forVal);
    }

    // Count visible elements per referenced ID.
    // Skip elements hidden via display:none or visibility:hidden — responsive
    // sites often duplicate components for mobile/desktop with matching IDs,
    // but only one is visible at a time.
    const idCount = new Map<string, number>();
    for (const el of doc.querySelectorAll("[id]")) {
      if (!activeRefs.has(el.id)) continue;
      if (el instanceof HTMLElement) {
        if (el.style.display === "none" || el.style.visibility === "hidden") continue;
        if (el.hidden) continue;
      }
      idCount.set(el.id, (idCount.get(el.id) ?? 0) + 1);
    }

    for (const [id, count] of idCount) {
      if (count <= 1) continue;

      const els = doc.querySelectorAll(`#${CSS.escape(id)}`);

      // Find which element references this ID
      const ariaRef = doc.querySelector(
        ARIA_ID_ATTRS.map((a) => `[${a}~="${CSS.escape(id)}"]`).join(", ")
      );
      const labelRef = doc.querySelector(`label[for="${CSS.escape(id)}"]`);

      let refDesc: string | undefined;
      if (ariaRef) {
        const attr = ARIA_ID_ATTRS.find((a) =>
          ariaRef.getAttribute(a)?.split(/\s+/).includes(id)
        );
        if (attr) refDesc = attr;
      } else if (labelRef) {
        refDesc = "label[for]";
      }

      violations.push({
        ruleId: "duplicate-id-aria",
        selector: getSelector(els[1]),
        html: getHtmlSnippet(els[1]),
        impact: "critical" as const,
        message: `Duplicate ID "${id}" referenced by ${refDesc ?? "an accessibility attribute"}.`,
        context: `First element: ${getHtmlSnippet(els[0])}${refDesc ? `\nReferenced by: ${refDesc}` : ""}`,
      });
    }
    return violations;
  },
};
