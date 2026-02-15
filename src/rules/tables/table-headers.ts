import type { Rule } from "../types";
import { getSelector, getHtmlSnippet } from "../utils/selector";
import { isAriaHidden, getAccessibleName } from "../utils/aria";

export const tdHeadersAttr: Rule = {
  id: "accesslint-084",
  actRuleIds: ["a25f45"],
  wcag: ["1.3.1"],
  level: "A",
  description: "All cells in a table using headers attribute must reference valid header IDs.",
  guidance: "The headers attribute on table cells must reference IDs of header cells (th or td) within the same table. This creates explicit associations for screen readers. Verify all referenced IDs exist and spell them correctly. For simple tables, consider using scope on th elements instead.",
  prompt:
    "Identify the invalid header ID reference and suggest the correct ID or how to fix it.",
  run(doc) {
    const violations = [];
    for (const td of doc.querySelectorAll("td[headers]")) {
      if (isAriaHidden(td)) continue;
      const table = td.closest("table");
      if (!table) continue;
      const tdId = td.getAttribute("id");
      const ids = td.getAttribute("headers")!.split(/\s+/);
      for (const id of ids) {
        // Self-referencing headers are invalid
        if (id === tdId) {
          violations.push({
            ruleId: "accesslint-084",
            selector: getSelector(td),
            html: getHtmlSnippet(td),
            impact: "serious" as const,
            message: `Headers attribute references the cell itself ("${id}").`,
          });
          break;
        }
        if (!table.querySelector(`th#${CSS.escape(id)}, td#${CSS.escape(id)}`)) {
          violations.push({
            ruleId: "accesslint-084",
            selector: getSelector(td),
            html: getHtmlSnippet(td),
            impact: "serious" as const,
            message: `Headers attribute references non-existent ID "${id}".`,
          });
          break;
        }
      }
    }
    return violations;
  },
};

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

/**
 * Determine whether a <table> is a data table (as opposed to a layout table).
 * Layout tables should not be checked for header associations.
 */
function isDataTable(table: Element): boolean {
  const role = table.getAttribute("role");
  if (role === "presentation" || role === "none") return false;
  if (role === "table" || role === "grid" || role === "treegrid") return true;

  // Strong data-table signals
  if (table.querySelector("caption") || table.getAttribute("summary")) return true;
  if (table.querySelector("thead, tfoot, colgroup")) return true;
  if (table.querySelector("th[scope]")) return true;
  if (table.querySelector("td[headers]")) return true;

  // Has th elements with meaningful text content
  const ths = table.querySelectorAll("th");
  if (ths.length === 0) return false;
  for (const th of ths) {
    if (th.textContent?.trim()) return true;
  }

  return false;
}

/**
 * Compute the column index of a cell accounting for preceding colspan values.
 */
function getColIndex(cell: Element): number {
  let idx = 0;
  let prev = cell.previousElementSibling;
  while (prev) {
    idx += parseInt(prev.getAttribute("colspan") || "1", 10);
    prev = prev.previousElementSibling;
  }
  return idx;
}

export const tdHasHeader: Rule = {
  id: "accesslint-086",
  wcag: ["1.3.1"],
  level: "A",
  description: "Data cells in tables larger than 3x3 should have associated headers.",
  guidance: "In complex tables, screen reader users need header associations to understand data cells. Use th elements with scope attribute, or the headers attribute on td elements. For simple tables (≤3x3), this is less critical as context is usually clear.",
  prompt:
    "Explain whether to use scope attributes on headers or headers attribute on this cell.",
  run(doc) {
    const violations = [];

    for (const table of doc.querySelectorAll("table")) {
      if (isAriaHidden(table)) continue;
      if (!isDataTable(table)) continue;

      // Count rows and columns
      const rows = table.querySelectorAll("tr");
      const rowCount = rows.length;
      let maxCols = 0;
      for (const row of rows) {
        const cells = row.querySelectorAll("td, th");
        let colCount = 0;
        for (const cell of cells) {
          colCount += parseInt(cell.getAttribute("colspan") || "1", 10);
        }
        maxCols = Math.max(maxCols, colCount);
      }

      // Skip small tables (3x3 or smaller)
      if (rowCount <= 3 && maxCols <= 3) continue;

      const hasScope = table.querySelector("th[scope]") !== null;
      const hasHeadersAttr = table.querySelector("td[headers]") !== null;

      // Check each data cell
      for (const td of table.querySelectorAll("td")) {
        if (isAriaHidden(td)) continue;

        // Skip empty cells — no content to associate
        if (!td.textContent?.trim() && !td.querySelector("img, svg, input, select, textarea")) continue;

        // Skip cells with their own accessible name
        if (td.hasAttribute("aria-label") || td.hasAttribute("aria-labelledby")) continue;

        // If cell has headers attribute, it's associated
        if (td.hasAttribute("headers")) continue;

        // Check if there's a th in same row or column
        const row = td.closest("tr");
        if (!row) continue;

        // Check for row header in same row
        const rowHasHeader = row.querySelector("th") !== null;

        // Check for column header (colspan-aware)
        const colIdx = getColIndex(td);
        let colHasHeader = false;

        // Look for th in thead or first row at the same column position
        const thead = table.querySelector("thead");
        const headerRow = thead?.querySelector("tr") ?? table.querySelector("tbody > tr, tr");
        if (headerRow) {
          for (const cell of headerRow.querySelectorAll("th, td")) {
            const ci = getColIndex(cell);
            const span = parseInt(cell.getAttribute("colspan") || "1", 10);
            if (cell.tagName.toLowerCase() === "th" && colIdx >= ci && colIdx < ci + span) {
              colHasHeader = true;
              break;
            }
          }
        }

        if (!rowHasHeader && !colHasHeader && !hasScope && !hasHeadersAttr) {
          violations.push({
            ruleId: "accesslint-086",
            selector: getSelector(td),
            html: getHtmlSnippet(td),
            impact: "serious" as const,
            message: "Data cell has no associated header. Add th elements with scope, or headers attribute.",
          });
          // Only report first cell per table to avoid noise
          break;
        }
      }
    }

    return violations;
  },
};

export const scopeAttrValid: Rule = {
  id: "accesslint-087",
  wcag: ["1.3.1"],
  level: "A",
  description: "The scope attribute on table headers must have a valid value.",
  guidance: "The scope attribute tells screen readers which cells a header applies to. Valid values are: row, col, rowgroup, colgroup. Using invalid values breaks the association between headers and cells.",
  prompt:
    "Explain which scope value (row, col, rowgroup, colgroup) is appropriate for this header.",
  run(doc) {
    const violations = [];
    const validScopes = new Set(["row", "col", "rowgroup", "colgroup"]);

    for (const th of doc.querySelectorAll("th[scope]")) {
      if (isAriaHidden(th)) continue;

      const scope = th.getAttribute("scope")?.toLowerCase();
      if (scope && !validScopes.has(scope)) {
        violations.push({
          ruleId: "accesslint-087",
          selector: getSelector(th),
          html: getHtmlSnippet(th),
          impact: "moderate" as const,
          message: `Invalid scope value "${scope}". Use row, col, rowgroup, or colgroup.`,
        });
      }
    }

    return violations;
  },
};

export const emptyTableHeader: Rule = {
  id: "accesslint-088",
  wcag: [],
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
          ruleId: "accesslint-088",
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
