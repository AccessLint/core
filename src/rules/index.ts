import type { Rule, Violation, AuditResult } from "./types";
import { clearAriaHiddenCache, clearComputedRoleCache, clearAccessibleNameCache } from "./utils/aria";
import { clearAriaAttrAuditCache } from "./aria/aria-attr-audit";
import { clearColorCaches } from "./utils/color";
import { clearSelectorCache } from "./utils/selector";
import { applyLocale, translateViolations } from "../i18n/registry";

// Images
import { imgAlt } from "./images/img-alt";
import { svgImgAlt } from "./images/svg-img-alt";
import { inputImageAlt } from "./images/input-image-alt";
import { imageRedundantAlt, imageAltRedundantWords } from "./images/image-redundant-alt";
import { areaAlt } from "./images/area-alt";
import { objectAlt } from "./images/object-alt";
import { roleImgAlt } from "./images/role-img-alt";
import { serverSideImageMap } from "./images/server-side-image-map";

// Forms
import { formLabel, formFieldMultipleLabels } from "./forms/label";
import { selectName } from "./forms/select-name";
import { inputButtonName } from "./forms/input-button-name";
import { autocompleteValid } from "./forms/autocomplete-valid";
import { labelContentNameMismatch } from "./forms/label-content-name-mismatch";
import { labelTitleOnly } from "./forms/label-title-only";

// Keyboard
import { tabindex } from "./keyboard/tabindex";
import { focusOrderSemantics } from "./keyboard/focus-order-semantics";
import { nestedInteractive, scrollableRegionFocusable } from "./keyboard/interactive-rules";
import { accesskeys } from "./keyboard/accesskeys";
import { focusVisible } from "./keyboard/focus-visible";

// Structure
import { headingOrder } from "./structure/heading-order";
import {
  landmarkMain,
  landmarkNoDuplicateBanner,
  landmarkNoDuplicateContentinfo,
  landmarkNoDuplicateMain,
  landmarkBannerIsTopLevel,
  landmarkContentinfoIsTopLevel,
  landmarkMainIsTopLevel,
  landmarkComplementaryIsTopLevel,
  landmarkUnique,
  region,
} from "./structure/landmark-rules";
import { list, listitem, dlitem, definitionList } from "./structure/list-rules";
import { documentTitle, bypass, pageHasHeadingOne } from "./structure/document-rules";
import { frameTitle, frameTitleUnique } from "./structure/frame-rules";
import { emptyHeading } from "./structure/heading-rules";
import { metaViewport, metaRefresh, metaRefreshNoException } from "./structure/meta-rules";
import { importantLetterSpacing, importantLineHeight, importantWordSpacing } from "./structure/text-spacing-rules";
import { cssOrientationLock } from "./structure/orientation-lock";
import { blink, marquee } from "./structure/deprecated-elements";
import { pAsHeading } from "./structure/semantic-rules";

// ARIA
import { ariaRoles } from "./aria/aria-roles";
import { ariaValidAttr } from "./aria/aria-valid-attr";
import { ariaValidAttrValue } from "./aria/aria-valid-attr-value";
import { ariaRequiredAttr } from "./aria/aria-required-attr";
import { buttonName } from "./aria/button-name";
import { ariaAllowedAttr } from "./aria/aria-allowed-attr";
import { ariaAllowedRole } from "./aria/aria-allowed-role";
import { ariaRequiredChildren, ariaRequiredParent } from "./aria/aria-children-parent";
import { ariaHiddenBody, ariaHiddenFocus } from "./aria/aria-hidden-rules";
import {
  ariaCommandName,
  ariaInputFieldName,
  ariaToggleFieldName,
  ariaMeterName,
  ariaProgressbarName,
  ariaDialogName,
  ariaTooltipName,
  ariaTreeitemName,
} from "./aria/aria-name-rules";
import { ariaProhibitedAttr } from "./aria/aria-prohibited-attr";
import { presentationRoleConflict } from "./aria/presentation-role-conflict";
import { presentationalChildrenFocusable } from "./aria/presentational-children-focusable";
import { summaryName } from "./aria/summary-name";

// Links
import { linkName } from "./links/link-name";
import { skipLink, linkInTextBlock } from "./links/link-rules";

// Language
import { htmlHasLang, htmlLangValid, validLang, htmlXmlLangMismatch } from "./language/html-has-lang";

// Tables
import { tdHeadersAttr, thHasDataCells, tdHasHeader, scopeAttrValid, emptyTableHeader } from "./tables/table-headers";

// Parsing
import { duplicateIdAria } from "./parsing/duplicate-id";

// Media
import { videoCaptions, audioCaptions } from "./media/media-captions";

// Color
import { colorContrast, colorContrastEnhanced } from "./color/color-contrast";

export const rules: Rule[] = [
  // Document Structure
  documentTitle,
  bypass,
  pageHasHeadingOne,
  frameTitle,
  frameTitleUnique,
  metaViewport,
  metaRefresh,
  metaRefreshNoException,
  blink,
  marquee,

  // Images
  imgAlt,
  svgImgAlt,
  inputImageAlt,
  imageRedundantAlt,
  imageAltRedundantWords,
  areaAlt,
  objectAlt,
  roleImgAlt,
  serverSideImageMap,

  // Forms
  formLabel,
  formFieldMultipleLabels,
  selectName,
  inputButtonName,
  autocompleteValid,
  labelContentNameMismatch,
  labelTitleOnly,

  // Keyboard
  tabindex,
  focusOrderSemantics,
  nestedInteractive,
  scrollableRegionFocusable,
  accesskeys,
  focusVisible,

  // Structure
  headingOrder,
  emptyHeading,
  pAsHeading,
  landmarkMain,
  landmarkNoDuplicateBanner,
  landmarkNoDuplicateContentinfo,
  landmarkNoDuplicateMain,
  landmarkBannerIsTopLevel,
  landmarkContentinfoIsTopLevel,
  landmarkMainIsTopLevel,
  landmarkComplementaryIsTopLevel,
  landmarkUnique,
  region,
  list,
  listitem,
  dlitem,
  definitionList,
  importantLetterSpacing,
  importantLineHeight,
  importantWordSpacing,
  cssOrientationLock,

  // ARIA
  ariaRoles,
  ariaValidAttr,
  ariaValidAttrValue,
  ariaRequiredAttr,
  ariaAllowedAttr,
  ariaAllowedRole,
  ariaRequiredChildren,
  ariaRequiredParent,
  ariaHiddenBody,
  ariaHiddenFocus,
  ariaCommandName,
  ariaInputFieldName,
  ariaToggleFieldName,
  ariaMeterName,
  ariaProgressbarName,
  ariaDialogName,
  ariaTooltipName,
  ariaTreeitemName,
  ariaProhibitedAttr,
  presentationRoleConflict,
  presentationalChildrenFocusable,
  buttonName,
  summaryName,

  // Links
  linkName,
  skipLink,
  linkInTextBlock,

  // Language
  htmlHasLang,
  htmlLangValid,
  validLang,
  htmlXmlLangMismatch,

  // Tables
  tdHeadersAttr,
  thHasDataCells,
  tdHasHeader,
  scopeAttrValid,
  emptyTableHeader,

  // Parsing
  duplicateIdAria,

  // Media
  videoCaptions,
  audioCaptions,

  // Color
  colorContrast,
  colorContrastEnhanced,
];


export interface ChunkedAudit {
  /** Process rules for up to budgetMs. Returns true if more rules remain. */
  processChunk(budgetMs: number): boolean;
  /** Return all violations collected so far. */
  getViolations(): Violation[];
}

// --- Default-disabled rules ---
// Rules with ACT mapping: disabled if < 80% ACT conformance (excluding
// happy-dom-limited rules, which get a pass since failures are environmental).
// Rules without ACT mapping: disabled due to known precision issues.

export const defaultDisabledRuleIds = new Set([
  // No ACT mapping; disabled due to known precision issues
  "accesslint-059",
  "accesslint-068",
  "accesslint-070",
  "accesslint-086",
]);

// --- Configuration state ---

let additionalRules: Rule[] = [];
let disabledRuleIds = new Set<string>();
let enabledRuleIds = new Set<string>();
let activeLocale: string | undefined;
let localizedRulesCache: Rule[] | undefined;

export interface ConfigureOptions {
  /** Additional rules to include (e.g. compiled declarative rules) */
  additionalRules?: Rule[];
  /** Rule IDs to disable (in addition to default-disabled rules) */
  disabledRules?: string[];
  /** Rule IDs to re-enable from the default-disabled set */
  enabledRules?: string[];
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
  if (options.enabledRules) {
    enabledRuleIds = new Set(options.enabledRules);
  }
  if ("locale" in options) {
    activeLocale = options.locale || undefined;
  }
  localizedRulesCache = undefined;
}

/**
 * Return the full set of active rules: bundled (minus default-disabled and
 * user-disabled, plus re-enabled) plus any additional rules via configureRules().
 * When a locale is active, returns shallow-cloned rules with translated fields.
 */
export function getActiveRules(): Rule[] {
  if (localizedRulesCache) return localizedRulesCache;

  const active = rules.filter((r) => {
    if (disabledRuleIds.has(r.id)) return false;
    if (enabledRuleIds.has(r.id)) return true;
    if (defaultDisabledRuleIds.has(r.id)) return false;
    if (r.level === "AAA") return false;
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
