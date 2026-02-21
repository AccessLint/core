import type { Rule, Violation, AuditResult } from "./types";
import { clearAriaHiddenCache, clearComputedRoleCache, clearAccessibleNameCache } from "./utils/aria";
import { clearAriaAttrAuditCache } from "./aria/aria-attr-audit";
import { clearColorCaches } from "./utils/color";
import { clearSelectorCache } from "./utils/selector";
import { applyLocale, translateViolations } from "../i18n/registry";

// Structure
import { accesslint001 } from "./structure/accesslint-001";
import { accesslint002 } from "./structure/accesslint-002";
import { accesslint003 } from "./structure/accesslint-003";
import { accesslint004 } from "./structure/accesslint-004";
import { accesslint005 } from "./structure/accesslint-005";
import { accesslint006 } from "./structure/accesslint-006";
import { accesslint007 } from "./structure/accesslint-007";
import { accesslint008 } from "./structure/accesslint-008";
import { accesslint009 } from "./structure/accesslint-009";
import { accesslint010 } from "./structure/accesslint-010";

// Images
import { accesslint011 } from "./images/accesslint-011";
import { accesslint012 } from "./images/accesslint-012";
import { accesslint013 } from "./images/accesslint-013";
import { accesslint014 } from "./images/accesslint-014";
import { accesslint015 } from "./images/accesslint-015";
import { accesslint016 } from "./images/accesslint-016";
import { accesslint017 } from "./images/accesslint-017";
import { accesslint018 } from "./images/accesslint-018";
import { accesslint019 } from "./images/accesslint-019";

// Forms
import { accesslint020 } from "./forms/accesslint-020";
import { accesslint021 } from "./forms/accesslint-021";
import { accesslint023 } from "./forms/accesslint-023";
import { accesslint024 } from "./forms/accesslint-024";
import { accesslint025 } from "./forms/accesslint-025";
import { accesslint026 } from "./forms/accesslint-026";

// Keyboard
import { accesslint027 } from "./keyboard/accesslint-027";
import { accesslint028 } from "./keyboard/accesslint-028";
import { accesslint029 } from "./keyboard/accesslint-029";
import { accesslint030 } from "./keyboard/accesslint-030";
import { accesslint031 } from "./keyboard/accesslint-031";
import { accesslint032 } from "./keyboard/accesslint-032";

// Structure (continued)
import { accesslint033 } from "./structure/accesslint-033";
import { accesslint034 } from "./structure/accesslint-034";
import { accesslint035 } from "./structure/accesslint-035";
import { accesslint036 } from "./structure/accesslint-036";
import { accesslint037 } from "./structure/accesslint-037";
import { accesslint038 } from "./structure/accesslint-038";
import { accesslint039 } from "./structure/accesslint-039";
import { accesslint040 } from "./structure/accesslint-040";
import { accesslint041 } from "./structure/accesslint-041";
import { accesslint042 } from "./structure/accesslint-042";
import { accesslint043 } from "./structure/accesslint-043";
import { accesslint044 } from "./structure/accesslint-044";
import { accesslint045 } from "./structure/accesslint-045";
import { accesslint046 } from "./structure/accesslint-046";
import { accesslint047 } from "./structure/accesslint-047";
import { accesslint048 } from "./structure/accesslint-048";
import { accesslint049 } from "./structure/accesslint-049";
import { accesslint050 } from "./structure/accesslint-050";
import { accesslint051 } from "./structure/accesslint-051";
import { accesslint052 } from "./structure/accesslint-052";
import { accesslint053 } from "./structure/accesslint-053";

// ARIA
import { accesslint054 } from "./aria/accesslint-054";
import { accesslint055 } from "./aria/accesslint-055";
import { accesslint056 } from "./aria/accesslint-056";
import { accesslint057 } from "./aria/accesslint-057";
import { accesslint058 } from "./aria/accesslint-058";
import { accesslint059 } from "./aria/accesslint-059";
import { accesslint060 } from "./aria/accesslint-060";
import { accesslint061 } from "./aria/accesslint-061";
import { accesslint062 } from "./aria/accesslint-062";
import { accesslint063 } from "./aria/accesslint-063";
import { accesslint064 } from "./aria/accesslint-064";
import { accesslint065 } from "./aria/accesslint-065";
import { accesslint066 } from "./aria/accesslint-066";
import { accesslint067 } from "./aria/accesslint-067";
import { accesslint068 } from "./aria/accesslint-068";
import { accesslint069 } from "./aria/accesslint-069";
import { accesslint070 } from "./aria/accesslint-070";
import { accesslint071 } from "./aria/accesslint-071";
import { accesslint072 } from "./aria/accesslint-072";
import { accesslint073 } from "./aria/accesslint-073";
import { accesslint074 } from "./aria/accesslint-074";
import { accesslint075 } from "./aria/accesslint-075";
import { accesslint076 } from "./aria/accesslint-076";

// Links
import { accesslint077 } from "./links/accesslint-077";
import { accesslint078 } from "./links/accesslint-078";
import { accesslint079 } from "./links/accesslint-079";

// Language
import { accesslint080 } from "./language/accesslint-080";
import { accesslint081 } from "./language/accesslint-081";
import { accesslint082 } from "./language/accesslint-082";
import { accesslint083 } from "./language/accesslint-083";

// Tables
import { accesslint084 } from "./tables/accesslint-084";
import { accesslint085 } from "./tables/accesslint-085";
import { accesslint086 } from "./tables/accesslint-086";
import { accesslint087 } from "./tables/accesslint-087";
import { accesslint088 } from "./tables/accesslint-088";

// Parsing
import { accesslint089 } from "./parsing/accesslint-089";

// Media
import { accesslint090 } from "./media/accesslint-090";
import { accesslint091 } from "./media/accesslint-091";

// Color
import { accesslint092 } from "./color/accesslint-092";
import { accesslint093 } from "./color/accesslint-093";

export const rules: Rule[] = [
  // Document Structure
  accesslint001,
  accesslint002,
  accesslint003,
  accesslint004,
  accesslint005,
  accesslint006,
  accesslint007,
  accesslint008,
  accesslint009,
  accesslint010,

  // Images
  accesslint011,
  accesslint012,
  accesslint013,
  accesslint014,
  accesslint015,
  accesslint016,
  accesslint017,
  accesslint018,
  accesslint019,

  // Forms
  accesslint020,
  accesslint021,
  accesslint023,
  accesslint024,
  accesslint025,
  accesslint026,

  // Keyboard
  accesslint027,
  accesslint028,
  accesslint029,
  accesslint030,
  accesslint031,
  accesslint032,

  // Structure
  accesslint033,
  accesslint034,
  accesslint035,
  accesslint036,
  accesslint037,
  accesslint038,
  accesslint039,
  accesslint040,
  accesslint041,
  accesslint042,
  accesslint043,
  accesslint044,
  accesslint045,
  accesslint046,
  accesslint047,
  accesslint048,
  accesslint049,
  accesslint050,
  accesslint051,
  accesslint052,
  accesslint053,

  // ARIA
  accesslint054,
  accesslint055,
  accesslint056,
  accesslint057,
  accesslint058,
  accesslint059,
  accesslint060,
  accesslint061,
  accesslint062,
  accesslint063,
  accesslint064,
  accesslint065,
  accesslint066,
  accesslint067,
  accesslint068,
  accesslint069,
  accesslint070,
  accesslint071,
  accesslint072,
  accesslint073,
  accesslint074,
  accesslint075,
  accesslint076,

  // Links
  accesslint077,
  accesslint078,
  accesslint079,

  // Language
  accesslint080,
  accesslint081,
  accesslint082,
  accesslint083,

  // Tables
  accesslint084,
  accesslint085,
  accesslint086,
  accesslint087,
  accesslint088,

  // Parsing
  accesslint089,

  // Media
  accesslint090,
  accesslint091,

  // Color
  accesslint092,
  accesslint093,
];


export interface ChunkedAudit {
  /** Process rules for up to budgetMs. Returns true if more rules remain. */
  processChunk(budgetMs: number): boolean;
  /** Return all violations collected so far. */
  getViolations(): Violation[];
}

// --- Configuration state ---

let additionalRules: Rule[] = [];
let disabledRuleIds = new Set<string>();
let includeAAA = false;
let activeLocale: string | undefined;
let localizedRulesCache: Rule[] | undefined;

export interface ConfigureOptions {
  /** Additional rules to include (e.g. compiled declarative rules) */
  additionalRules?: Rule[];
  /** Rule IDs to disable */
  disabledRules?: string[];
  /** Include AAA-level rules (excluded by default) */
  includeAAA?: boolean;
  /** Locale for translated rule descriptions/guidance (e.g. 'en', 'es') */
  locale?: string;
}

export function configureRules(options: ConfigureOptions): void {
  if (options.additionalRules) {
    additionalRules = options.additionalRules;
  }
  if (options.disabledRules) {
    disabledRuleIds = new Set(options.disabledRules);
  }
  if ("includeAAA" in options) {
    includeAAA = !!options.includeAAA;
  }
  if ("locale" in options) {
    activeLocale = options.locale || undefined;
  }
  localizedRulesCache = undefined;
}

/**
 * Return the full set of active rules: bundled (minus user-disabled, minus
 * AAA unless includeAAA is set) plus any additional rules via configureRules().
 * When a locale is active, returns shallow-cloned rules with translated fields.
 */
export function getActiveRules(): Rule[] {
  if (localizedRulesCache) return localizedRulesCache;

  const active = rules.filter((r) => {
    if (disabledRuleIds.has(r.id)) return false;
    if (r.level === "AAA" && !includeAAA) return false;
    return true;
  });
  const combined = active.concat(additionalRules);

  if (activeLocale) {
    localizedRulesCache = applyLocale(combined, activeLocale);
    return localizedRulesCache;
  }

  return combined;
}

/**
 * Create a chunked audit that processes rules in time-boxed batches.
 * Call processChunk() repeatedly (e.g. via setTimeout) to avoid long tasks.
 */
export function createChunkedAudit(doc: Document): ChunkedAudit {
  clearAllCaches();

  const activeRules = getActiveRules();
  const locale = activeLocale;
  const violations: Violation[] = [];
  let index = 0;

  return {
    processChunk(budgetMs: number) {
      const start = performance.now();
      while (index < activeRules.length) {
        try {
          violations.push(...activeRules[index].run(doc));
        } catch {}
        index++;
        if (performance.now() - start >= budgetMs) break;
      }
      return index < activeRules.length;
    },
    getViolations() {
      return locale ? translateViolations(violations, locale) : violations;
    },
  };
}

export function clearAllCaches(): void {
  clearAriaHiddenCache();
  clearComputedRoleCache();
  clearAccessibleNameCache();
  clearColorCaches();
  clearAriaAttrAuditCache();
  clearSelectorCache();
}

export function runAudit(doc: Document): AuditResult {
  clearAllCaches();

  const activeRules = getActiveRules();
  const violations: Violation[] = [];
  for (const rule of activeRules) {
    try {
      violations.push(...rule.run(doc));
    } catch {
      // Skip rules that error
    }
  }
  return {
    url: doc.location?.href ?? "",
    timestamp: Date.now(),
    violations: activeLocale ? translateViolations(violations, activeLocale) : violations,
    ruleCount: activeRules.length,
  };
}

const ruleMap = new Map<string, Rule>(rules.map((r) => [r.id, r]));

export function getRuleById(id: string): Rule | undefined {
  if (activeLocale) {
    const active = getActiveRules();
    return active.find((r) => r.id === id);
  }
  const bundled = ruleMap.get(id);
  if (bundled) return bundled;
  return additionalRules.find((r) => r.id === id);
}
