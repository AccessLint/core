import type { Rule, Violation } from "../types";
import { getSelector, getHtmlSnippet } from "../utils/selector";
import { isAriaHidden, getComputedRole } from "../utils/aria";

// Role to required children roles mapping
const REQUIRED_CHILDREN: Record<string, string[][]> = {
  // Each array is an OR group - at least one of each inner array must be present
  combobox: [["listbox", "tree", "grid", "dialog", "textbox"]], // Must own/contain one of these
  feed: [["article"]],
  grid: [["row", "rowgroup"]],
  list: [["listitem", "group"]],
  listbox: [["option", "group"]],
  menu: [["menuitem", "menuitemcheckbox", "menuitemradio", "group", "menu", "separator"]],
  menubar: [["menuitem", "menuitemcheckbox", "menuitemradio", "group", "menu", "separator"]],
  radiogroup: [["radio"]],
  row: [["cell", "columnheader", "gridcell", "rowheader"]],
  rowgroup: [["row"]],
  table: [["row", "rowgroup"]],
  tablist: [["tab"]],
  tree: [["treeitem", "group"]],
  treegrid: [["row", "rowgroup"]],
};

// Roles where an empty container is "needs review" rather than a violation.
// axe-core skips these when the element has no children at all — common in
// dynamically rendered pages captured before content loads.
const REVIEW_EMPTY_ROLES = new Set([
  "doc-bibliography", "doc-endnotes",
  "grid", "group", "list", "listbox",
  "rowgroup", "table", "tablist", "tree", "treegrid",
]);

// Role to required parent role mapping
const REQUIRED_PARENT: Record<string, string[]> = {
  caption: ["figure", "table", "grid", "treegrid"],
  cell: ["row"],
  columnheader: ["row"],
  gridcell: ["row"],
  listitem: ["list", "group"],
  menuitem: ["menu", "menubar", "group"],
  menuitemcheckbox: ["menu", "menubar", "group"],
  menuitemradio: ["menu", "menubar", "group"],
  option: ["listbox", "group"],
  row: ["table", "grid", "treegrid", "rowgroup"],
  rowgroup: ["table", "grid", "treegrid"],
  rowheader: ["row"],
  tab: ["tablist"],
  treeitem: ["tree", "group"],
};

/** "pass" = has required children, "fail" = has children but missing required, "empty" = no children at all */
function checkRequiredChildren(el: Element, requiredGroups: string[][]): "pass" | "fail" | "empty" {
  const ownedIds = el.getAttribute("aria-owns")?.split(/\s+/) || [];
  const doc = el.ownerDocument;

  const childRoles = new Set<string>();
  let hasAnyChild = false;

  // Direct children
  for (const child of el.querySelectorAll("*")) {
    if (isAriaHidden(child)) continue;
    hasAnyChild = true;
    const role = getComputedRole(child);
    if (role) childRoles.add(role);
  }

  // aria-owns children
  for (const id of ownedIds) {
    const owned = doc.getElementById(id);
    if (owned && !isAriaHidden(owned)) {
      hasAnyChild = true;
      const role = getComputedRole(owned);
      if (role) childRoles.add(role);
    }
  }

  if (!hasAnyChild) return "empty";

  // Check each required group - must have at least one from each group
  for (const group of requiredGroups) {
    if (!group.some((role) => childRoles.has(role))) return "fail";
  }

  return "pass";
}

export const ariaRequiredChildren: Rule = {
  id: "aria-required-children",
  wcag: ["1.3.1"],
  level: "A",
  description: "Certain ARIA roles require specific child roles to be present.",
  guidance: "Some ARIA roles represent containers that must contain specific child roles for proper semantics. For example, a list must contain listitems, a menu must contain menuitems. Add the required child elements with appropriate roles, or use native HTML elements that provide these semantics implicitly (e.g., <ul> with <li>).",
  prompt:
    "State which child role(s) are required and suggest adding elements with those roles, or using equivalent native HTML elements.",
  run(doc) {
    const violations: Violation[] = [];

    for (const el of doc.querySelectorAll("[role]")) {
      if (isAriaHidden(el)) continue;

      const role = el.getAttribute("role")?.trim().toLowerCase();
      if (!role || !(role in REQUIRED_CHILDREN)) continue;

      // aria-busy="true" — children may be temporarily missing (ARIA 1.2)
      if (el.getAttribute("aria-busy") === "true") continue;

      // Combobox exceptions
      if (role === "combobox") {
        // Collapsed combobox doesn't need a visible popup child
        if (el.getAttribute("aria-expanded") !== "true") continue;
        // <input role="combobox"> implicitly satisfies the textbox requirement
        const tag = el.tagName.toLowerCase();
        if (tag === "input" || tag === "textarea") continue;
      }

      const required = REQUIRED_CHILDREN[role];
      const result = checkRequiredChildren(el, required);

      if (result === "pass") continue;

      // Empty containers for reviewEmpty roles are "needs review", not violations
      if (result === "empty" && REVIEW_EMPTY_ROLES.has(role)) continue;

      const requiredStr = required.map((g) => g.join(" or ")).join(", ");
      violations.push({
        ruleId: "aria-required-children",
        selector: getSelector(el),
        html: getHtmlSnippet(el),
        impact: "critical" as const,
        message: `Role "${role}" requires children with role: ${requiredStr}.`,
      });
    }

    return violations;
  },
};

export const ariaRequiredParent: Rule = {
  id: "aria-required-parent",
  wcag: ["1.3.1"],
  level: "A",
  description: "Certain ARIA roles must be contained within specific parent roles.",
  guidance: "Some ARIA roles represent items that must exist within specific container roles. For example, a listitem must be within a list, a tab must be within a tablist. Wrap the element in the appropriate parent, or use native HTML elements that provide this structure (e.g., <li> inside <ul>).",
  prompt:
    "State which parent role is required and suggest wrapping in an element with that role, or using equivalent native HTML structure.",
  run(doc) {
    const violations: Violation[] = [];

    for (const el of doc.querySelectorAll("[role]")) {
      if (isAriaHidden(el)) continue;

      const role = el.getAttribute("role")?.trim().toLowerCase();
      if (!role || !(role in REQUIRED_PARENT)) continue;

      const required = REQUIRED_PARENT[role];

      // Walk up the DOM to find a required parent
      let current = el.parentElement;
      let found = false;

      while (current && current !== doc.documentElement) {
        const parentRole = getComputedRole(current);

        if (parentRole && required.includes(parentRole)) {
          found = true;
          break;
        }
        current = current.parentElement;
      }

      if (!found) {
        violations.push({
          ruleId: "aria-required-parent",
          selector: getSelector(el),
          html: getHtmlSnippet(el),
          impact: "critical" as const,
          message: `Role "${role}" must be contained within: ${required.join(", ")}.`,
        });
      }
    }

    return violations;
  },
};
