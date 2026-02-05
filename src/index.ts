// Core audit
export { rules, runAudit, getRuleById, getActiveRules } from "./rules/index";
export type { ChunkedAudit } from "./rules/index";
export { createChunkedAudit } from "./rules/index";

// Configuration
export { configureRules } from "./rules/index";
export type { ConfigureOptions } from "./rules/index";

// Declarative rule engine
export { compileDeclarativeRule, validateDeclarativeRule } from "./rules/engine";

// Types
export type {
  Rule,
  Violation,
  AuditResult,
  DeclarativeRule,
  CheckType,
  RemoteRuleMetadata,
} from "./rules/types";

// Utilities (useful for custom rule authors)
export {
  getAccessibleName,
  getComputedRole,
  getImplicitRole,
  isAriaHidden,
  isValidRole,
  getAccessibleTextContent,
} from "./rules/utils/aria";

export { getSelector, getHtmlSnippet } from "./rules/utils/selector";
