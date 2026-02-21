import type { Rule } from "../types";
import { getSelector, getHtmlSnippet } from "../utils/selector";
import { isAriaHidden } from "../utils/aria";

export const thHasDataCells: Rule = {
  id: "accesslint-085",
  actRuleIds: ["d0f69e"],
  wcag: ["1.3.1"],
  level: "A",
  description: "Table headers should be associated with data cells.",
  guidance: "A table with header cells (th) but no data cells (td) is likely a misuse of table markup for layout or has missing content. Either add data cells that the headers describe, or use appropriate non-table markup if this is not tabular data.",
  prompt:
    "Explain whether this table needs data cells or if non-table layout would be more appropriate.",
  run(doc) {
    const violations = [];
    for (const table of doc.querySelectorAll("table")) {
      if (isAriaHidden(table)) continue;
      // Skip tables marked as presentational
      if (table.getAttribute("role") === "presentation" || table.getAttribute("role") === "none") continue;

      const ths = table.querySelectorAll("th");
      const tds = table.querySelectorAll("td");
      if (ths.length > 0 && tds.length === 0) {
        violations.push({
          ruleId: "accesslint-085",
          selector: getSelector(table),
          html: getHtmlSnippet(table),
          impact: "serious" as const,
          message: "Table has header cells but no data cells.",
        });
      }
    }
    return violations;
  },
};
