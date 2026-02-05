export interface Rule {
  id: string;
  wcag: string[];
  level: "A" | "AA";
  tags?: string[];
  description: string;
  /** Generic remediation guidance for the AI to contextualize */
  guidance?: string;
  /** Tailored prompt for AI explanation of this specific rule violation */
  prompt?: string;
  run(doc: Document): Violation[];
}

export interface Violation {
  ruleId: string;
  selector: string;
  html: string;
  impact: "critical" | "serious" | "moderate" | "minor";
  message: string;
  /** Rule-specific surrounding context to help AI understand the issue */
  context?: string;
  element?: Element;
}

export interface AuditResult {
  url: string;
  timestamp: number;
  violations: Violation[];
  ruleCount: number;
}

// --- Declarative rule engine types ---

export interface SelectorExistsCheck {
  type: "selector-exists";
}

export interface AttributeValueCheck {
  type: "attribute-value";
  attribute: string;
  operator: ">" | "<" | "=" | "!=" | "in" | "not-in";
  value: number | string | string[];
}

export interface AttributeMissingCheck {
  type: "attribute-missing";
  attribute: string;
}

export interface AttributeRegexCheck {
  type: "attribute-regex";
  attribute: string;
  pattern: string;
  flags?: string;
  shouldMatch: boolean;
}

export interface ChildRequiredCheck {
  type: "child-required";
  childSelector: string;
}

export interface ChildInvalidCheck {
  type: "child-invalid";
  allowedChildren: string[];
}

export type CheckType =
  | SelectorExistsCheck
  | AttributeValueCheck
  | AttributeMissingCheck
  | AttributeRegexCheck
  | ChildRequiredCheck
  | ChildInvalidCheck;

export interface DeclarativeRule {
  id: string;
  selector: string;
  check: CheckType;
  impact: "critical" | "serious" | "moderate" | "minor";
  message: string;
  description: string;
  wcag: string[];
  level: "A" | "AA";
  tags?: string[];
  guidance?: string;
  prompt?: string;
  skipAriaHidden?: boolean;
  documentOnly?: boolean;
}

export interface RemoteRuleMetadata {
  description?: string;
  guidance?: string;
  prompt?: string;
  wcag?: string[];
  level?: "A" | "AA";
  tags?: string[];
}

export interface RemoteRuleData {
  version: number;
  metadata?: Record<string, RemoteRuleMetadata>;
  rules?: DeclarativeRule[];
  disabled?: string[];
}
