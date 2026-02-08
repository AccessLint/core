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
  menu: [["menuitem", "menuitemcheckbox", "menuitemradio", "group"]],
  menubar: [["menuitem", "menuitemcheckbox", "menuitemradio", "group"]],
  radiogroup: [["radio"]],
  row: [["cell", "columnheader", "gridcell", "rowheader"]],
  rowgroup: [["row"]],
  table: [["row", "rowgroup"]],
  tablist: [["tab"]],
  tree: [["treeitem", "group"]],
  treegrid: [["row", "rowgroup"]],
};

// Role to required parent role mapping
const REQUIRED_PARENT: Record<string, string[]> = {
  caption: ["figure", "table", "grid", "treegrid"],
  // cell/gridcell/columnheader/rowheader must be in a row
  // but we skip checking native td/th since they're handled by HTML semantics
  listitem: ["list", "group"],
  menuitem: ["menu", "menubar", "group"],
  menuitemcheckbox: ["menu", "menubar", "group"],
  menuitemradio: ["menu", "menubar", "group"],
  option: ["listbox", "group"],
  row: ["table", "grid", "treegrid", "rowgroup"],
  rowgroup: ["table", "grid", "treegrid"],
  tab: ["tablist"],
  treeitem: ["tree", "group"],
};

function hasRequiredChildren(el: Element, requiredGroups: string[][]): boolean {
  // Get all children with roles (including those via aria-owns)
  const ownedIds = el.getAttribute("aria-owns")?.split(/\s+/) || [];
  const doc = el.ownerDocument;

  const childRoles = new Set<string>();

  // Direct children
  for (const child of el.querySelectorAll("*")) {
    const role = getComputedRole(child);
    if (role && !isAriaHidden(child)) {
      childRoles.add(role);
    }
  }

  // aria-owns children
  for (const id of ownedIds) {
    const owned = doc.getElementById(id);
    if (owned) {
      const role = getComputedRole(owned);
      if (role && !isAriaHidden(owned)) {
        childRoles.add(role);
      }
    }
  }

  // Check each required group - must have at least one from each group
  for (const group of requiredGroups) {
    const hasOne = group.some((role) => childRoles.has(role));
    if (!hasOne) return false;
  }

  return true;
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

      const required = REQUIRED_CHILDREN[role];
      if (!hasRequiredChildren(el, required)) {
        const requiredStr = required.map((g) => g.join(" or ")).join(", ");
        violations.push({
          ruleId: "aria-required-children",
          selector: getSelector(el),
          html: getHtmlSnippet(el),
          impact: "critical" as const,
          message: `Role "${role}" requires children with role: ${requiredStr}.`,
        });
      }
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
