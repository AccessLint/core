import type { Rule, Violation, AuditResult } from "./types";
import { clearAriaHiddenCache, clearComputedRoleCache, clearAccessibleNameCache } from "./utils/aria";
import { clearAriaAttrAuditCache } from "./aria/aria-attr-audit";
import { clearColorCaches } from "./utils/color";
import { clearSelectorCache } from "./utils/selector";

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
import { metaViewport, metaRefresh } from "./structure/meta-rules";
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
import { colorContrast } from "./color/color-contrast";

export const rules: Rule[] = [
  // Document Structure
  documentTitle,
  bypass,
  pageHasHeadingOne,
  frameTitle,
  frameTitleUnique,
  metaViewport,
  metaRefresh,
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

export interface ConfigureOptions {
  /** Additional rules to include (e.g. compiled declarative rules) */
  additionalRules?: Rule[];
  /** Rule IDs to disable */
  disabledRules?: string[];
}

export function configureRules(options: ConfigureOptions): void {
  if (options.additionalRules) {
    additionalRules = options.additionalRules;
  }
  if (options.disabledRules) {
    disabledRuleIds = new Set(options.disabledRules);
  }
}

/**
 * Return the full set of active rules: bundled (minus disabled) plus
 * any additional rules added via configureRules().
 */
export function getActiveRules(): Rule[] {
  const active = rules.filter((r) => !disabledRuleIds.has(r.id));
  return active.concat(additionalRules);
}

/**
 * Create a chunked audit that processes rules in time-boxed batches.
 * Call processChunk() repeatedly (e.g. via setTimeout) to avoid long tasks.
 */
export function createChunkedAudit(doc: Document): ChunkedAudit {
  clearAllCaches();

  const activeRules = getActiveRules();
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
      return violations;
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
    violations,
    ruleCount: activeRules.length,
  };
}

const ruleMap = new Map<string, Rule>(rules.map((r) => [r.id, r]));

export function getRuleById(id: string): Rule | undefined {
  const bundled = ruleMap.get(id);
  if (bundled) return bundled;
  return additionalRules.find((r) => r.id === id);
}
