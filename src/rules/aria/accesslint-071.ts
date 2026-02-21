import type { Rule } from "../types";
import { createNameRule } from "./aria-name-helpers";

export const accesslint071: Rule = createNameRule({
  id: "accesslint-071",
  description: "ARIA treeitem elements must have an accessible name.",
  guidance: "Tree items must have accessible names so screen reader users can understand the tree structure and navigate it effectively. Provide text content, aria-label, or aria-labelledby for each treeitem.",
  prompt: "Add text content describing this tree item, or add aria-label.",
  selector: '[role="treeitem"]',
  message: "Treeitem has no accessible name.",
});
