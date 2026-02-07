/**
 * Mapping from W3C ACT rule IDs to @accesslint/core rule IDs.
 * Covers 35 ACT rules (~541 test cases).
 */
export const ACT_TO_CORE_RULE: Record<string, string> = {
  "674b10": "aria-roles",
  "6a7281": "aria-valid-attr-value",
  "5f99a7": "aria-valid-attr",
  de46e4: "valid-lang",
  "73f2c2": "autocomplete-valid",
  "97a4e1": "button-name",
  e086e5: "label",
  bf051a: "html-lang-valid",
  "2779a5": "document-title",
  "59796f": "input-image-alt",
  "23a2a8": "img-alt",
  c487ae: "link-name",
  "7d6734": "svg-img-alt",
  a25f45: "td-headers-attr",
  "6cfa84": "aria-hidden-focus",
  bc659a: "meta-refresh",
  b4f0c3: "meta-viewport",
  "8fc3b6": "object-alt",
  b5c3f8: "html-has-lang",
  "0ssw9k": "scrollable-region-focusable",
  afw4f7: "color-contrast",
  "4e8ab6": "aria-required-attr",
  "2t702h": "summary-name",
  "5c01ea": "aria-allowed-attr",
  ff89c9: "aria-required-parent",
  bc4a75: "aria-required-children",
  e7aa44: "audio-caption",
  cf77f2: "bypass",
  ffd0e9: "empty-heading",
  cae760: "frame-title",
  d0f69e: "th-has-data-cells",
  eac66b: "video-caption",
  "2ee8b8": "label-content-name-mismatch",
  "46ca7f": "presentation-role-conflict",
  kb1m8s: "aria-prohibited-attr",
};

/** Rules where happy-dom lacks needed capabilities (computed styles, layout, JS execution). */
export const HAPPY_DOM_LIMITED_RULES = new Set([
  "aria-hidden-focus",
  "color-contrast",
  "link-in-text-block",
  "scrollable-region-focusable",
]);
