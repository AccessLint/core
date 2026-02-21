import type { Rule } from "../types";
import { getSelector, getHtmlSnippet } from "../utils/selector";
import { isAriaHidden, getAccessibleName } from "../utils/aria";

export const emptyTableHeader: Rule = {
  id: "adaptable/empty-table-header",
  category: "adaptable",
  wcag: ["1.3.1"],
  level: "A",
  tags: ["best-practice"],
  description: "Table header cells should have visible text.",
  guidance: "Empty table headers provide no information to screen reader users. Either add descriptive text to the header, or if the header is intentionally empty (like a corner cell), consider using a td element instead or adding a visually hidden label.",
  prompt:
    "Suggest header text based on the column/row content, or explain if this should be a td instead.",
  run(doc) {
    const violations = [];

    for (const th of doc.querySelectorAll("th")) {
      if (isAriaHidden(th)) continue;

      // Skip if table is presentational
      const table = th.closest("table");
      if (table?.getAttribute("role") === "presentation" || table?.getAttribute("role") === "none") continue;

      // Check for accessible name
      if (!getAccessibleName(th)) {
        violations.push({
          ruleId: "adaptable/empty-table-header",
          selector: getSelector(th),
          html: getHtmlSnippet(th),
          impact: "minor" as const,
          message: "Table header cell is empty. Add text or use aria-label.",
        });
      }
    }

    return violations;
  },
};
