import type { Rule, Violation } from "../types";
import { getSelector, getHtmlSnippet } from "../utils/selector";
import { isAriaHidden } from "../utils/aria";

// Elements that are natively interactive (for nesting checks).
// Excludes label (wrapping inputs in <label> is standard HTML),
// details (naturally contains interactive children like <summary>),
// iframe/embed (embedded content containers, not interactive controls).
const INTERACTIVE_ELEMENTS = new Set([
  "a", "audio", "button", "img",
  "input", "select", "textarea", "video",
]);

// Roles that are interactive
const INTERACTIVE_ROLES = new Set([
  "button", "checkbox", "combobox", "gridcell", "link", "listbox",
  "menu", "menubar", "menuitem", "menuitemcheckbox", "menuitemradio",
  "option", "progressbar", "radio", "scrollbar", "searchbox",
  "slider", "spinbutton", "switch", "tab", "tabpanel", "textbox",
  "treeitem",
]);

// Composite widgets that are expected to own interactive child roles
const COMPOSITE_OWNED_ROLES: Record<string, Set<string>> = {
  grid: new Set(["gridcell", "row", "columnheader", "rowheader"]),
  listbox: new Set(["option"]),
  menu: new Set(["menuitem", "menuitemcheckbox", "menuitemradio"]),
  menubar: new Set(["menuitem", "menuitemcheckbox", "menuitemradio"]),
  radiogroup: new Set(["radio"]),
  tablist: new Set(["tab"]),
  tree: new Set(["treeitem"]),
  treegrid: new Set(["gridcell", "row", "columnheader", "rowheader", "treeitem"]),
};

/** True when child's explicit role is expected inside parent's composite widget role. */
function isAllowedNesting(parent: Element, child: Element): boolean {
  const parentRole = parent.getAttribute("role")?.toLowerCase();
  const childRole = child.getAttribute("role")?.toLowerCase();
  if (!parentRole || !childRole) return false;
  return COMPOSITE_OWNED_ROLES[parentRole]?.has(childRole) ?? false;
}

function isInteractive(el: Element): boolean {
  const tagName = el.tagName.toLowerCase();

  // Check for interactive elements
  if (INTERACTIVE_ELEMENTS.has(tagName)) {
    // Some elements need href or not disabled
    if (tagName === "a" && !el.hasAttribute("href")) return false;
    if (tagName === "audio" || tagName === "video") {
      return el.hasAttribute("controls");
    }
    if (tagName === "img" && !el.hasAttribute("usemap")) return false;
    if (tagName === "input" && (el as HTMLInputElement).type === "hidden") return false;
    if ((el as HTMLButtonElement | HTMLInputElement).disabled) return false;
    return true;
  }

  // Check for explicit interactive role
  const role = el.getAttribute("role")?.toLowerCase();
  if (role && INTERACTIVE_ROLES.has(role)) return true;

  // Check for tabindex making it focusable
  const tabindex = el.getAttribute("tabindex");
  if (tabindex !== null && tabindex !== "-1") return true;

  // Check for contenteditable
  if (el.getAttribute("contenteditable") === "true") return true;

  return false;
}

/**
 * True when an element is a "container interactive" — an element where
 * nesting another interactive control inside causes a11y problems.
 * Only native <a[href]> and <button> create this issue in practice.
 * Divs/spans with tabindex or ARIA roles are containers, not controls
 * where nesting is problematic.
 */
function isInteractiveContainer(el: Element): boolean {
  const tagName = el.tagName.toLowerCase();
  if (tagName === "a" && el.hasAttribute("href")) return true;
  if (tagName === "button" && !(el as HTMLButtonElement).disabled) return true;
  return false;
}

export const nestedInteractive: Rule = {
  id: "nested-interactive",
  wcag: ["4.1.2"],
  level: "A",
  description: "Interactive controls must not be nested inside each other.",
  guidance: "Nesting interactive elements (like a button inside a link, or a link inside a button) creates unpredictable behavior and confuses assistive technologies. The browser may remove the inner element from the accessibility tree. Restructure the HTML so interactive elements are siblings, not nested. If you need a clickable card, use CSS and JavaScript rather than nesting.",
  prompt:
    "Identify which elements are nested and suggest restructuring them as siblings instead.",
  run(doc) {
    const violations: Violation[] = [];
    const root = doc.body ?? (doc as unknown as ShadowRoot);
    if (!root) return violations;

    const ownerDoc = doc.body ? doc : (doc as unknown as ShadowRoot).ownerDocument;
    const walker = ownerDoc.createTreeWalker(root, NodeFilter.SHOW_ELEMENT);
    const interactiveAncestors: Element[] = [];

    let node: Element | null = walker.currentNode as Element;
    // Process body itself, then walk
    while (node) {
      // Pop ancestors that no longer contain the current node
      while (interactiveAncestors.length > 0 &&
             !interactiveAncestors[interactiveAncestors.length - 1].contains(node)) {
        interactiveAncestors.pop();
      }

      if (!isAriaHidden(node) && isInteractive(node)) {
        if (interactiveAncestors.length > 0) {
          const parent = interactiveAncestors[interactiveAncestors.length - 1];
          if (!isAllowedNesting(parent, node)) {
            violations.push({
              ruleId: "nested-interactive",
              selector: getSelector(node),
              html: getHtmlSnippet(node),
              impact: "serious" as const,
              message: `Interactive element <${node.tagName.toLowerCase()}> is nested inside <${parent.tagName.toLowerCase()}>.`,
            });
          }
        }
        // Only push as ancestor if it's a container where nesting is problematic
        if (isInteractiveContainer(node)) {
          interactiveAncestors.push(node);
        }
      }

      node = walker.nextNode() as Element | null;
    }

    return violations;
  },
};

export const scrollableRegionFocusable: Rule = {
  id: "scrollable-region-focusable",
  wcag: ["2.1.1"],
  level: "A",
  description: "Scrollable regions must be keyboard accessible.",
  guidance: "Content that scrolls must be accessible to keyboard users. If a region has overflow:scroll or overflow:auto and contains scrollable content, it needs either tabindex='0' to be focusable, or it must contain focusable elements. Without this, keyboard users cannot scroll the content.",
  prompt:
    "Explain how to make this scrollable region keyboard accessible.",
  run(doc) {
    const violations = [];

    for (const el of doc.querySelectorAll("*")) {
      if (isAriaHidden(el)) continue;
      if (!(el instanceof HTMLElement)) continue;

      // Check if element is scrollable
      const view = doc.defaultView ?? (doc as unknown as ShadowRoot).ownerDocument.defaultView;
      const style = view?.getComputedStyle(el);
      if (!style) continue;

      const overflowX = style.overflowX;
      const overflowY = style.overflowY;
      const isScrollable = (overflowX === "scroll" || overflowX === "auto" ||
                           overflowY === "scroll" || overflowY === "auto");

      if (!isScrollable) continue;

      // Check if it actually has scrollable content
      const hasScrollableContent = el.scrollHeight > el.clientHeight || el.scrollWidth > el.clientWidth;
      if (!hasScrollableContent) continue;

      // Check if it's focusable
      const tabindex = el.getAttribute("tabindex");
      if (tabindex !== null && tabindex !== "-1") continue;

      // Check if it contains focusable elements
      const focusableChild = el.querySelector(
        'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), ' +
        'select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (focusableChild) continue;

      violations.push({
        ruleId: "scrollable-region-focusable",
        selector: getSelector(el),
        html: getHtmlSnippet(el),
        impact: "serious" as const,
        message: "Scrollable region is not keyboard accessible. Add tabindex='0' or include focusable elements.",
      });
    }

    return violations;
  },
};
