import type { Rule, Violation } from "../types";
import { getSelector, getHtmlSnippet } from "../utils/selector";
import { getAccessibleName, isAriaHidden } from "../utils/aria";

// Selectors for sectioning elements that scope landmarks
const SECTIONING_SELECTOR = 'article, aside, main, nav, section, [role="article"], [role="complementary"], [role="main"], [role="navigation"], [role="region"]';

// Landmark selectors
const LANDMARK_SELECTOR = 'main, [role="main"], header, [role="banner"], footer, [role="contentinfo"], nav, [role="navigation"], aside, [role="complementary"], section[aria-label], section[aria-labelledby], [role="region"][aria-label], [role="region"][aria-labelledby], form[aria-label], form[aria-labelledby], [role="form"][aria-label], [role="form"][aria-labelledby], [role="search"]';

function isTopLevel(el: Element): boolean {
  return !el.closest(SECTIONING_SELECTOR) || el.matches(SECTIONING_SELECTOR);
}

function getTopLevelLandmarks(doc: Document, selector: string): Element[] {
  const els = doc.querySelectorAll(selector);
  return Array.from(els).filter((el) => !el.closest(SECTIONING_SELECTOR));
}

export const landmarkMain: Rule = {
  id: "accesslint-036",
  wcag: [],
  level: "A",
  tags: ["best-practice"],
  description: "Page should have exactly one main landmark.",
  guidance: "The main landmark contains the primary content of the page. Screen readers allow users to jump directly to main content. Use a single <main> element (or role='main') to wrap the central content, excluding headers, footers, and navigation.",
  prompt:
    "Identify the primary content area and explain how to wrap it in a <main> element.",
  run(doc) {
    const mains = doc.querySelectorAll('main, [role="main"]');
    if (mains.length === 0) {
      return [{
        ruleId: "accesslint-036",
        selector: "html",
        html: "<html>",
        impact: "moderate" as const,
        message: "Page has no main landmark.",
      }];
    }
    if (mains.length > 1) {
      return Array.from(mains).slice(1).map((el) => ({
        ruleId: "accesslint-036",
        selector: getSelector(el),
        html: getHtmlSnippet(el),
        impact: "moderate" as const,
        message: "Page has multiple main landmarks.",
      }));
    }
    return [];
  },
};

export const landmarkNoDuplicateBanner: Rule = {
  id: "accesslint-037",
  wcag: [],
  level: "A",
  tags: ["best-practice"],
  description: "Page should not have more than one banner landmark.",
  guidance: "The banner landmark (typically <header>) identifies site-oriented content like logos and search. Only one top-level banner is allowed per page. If you need multiple headers, nest them inside sectioning elements (article, section, aside) where they become scoped headers rather than page-level banners.",
  prompt:
    "Explain whether to remove this duplicate banner or nest it inside a sectioning element.",
  run(doc) {
    const violations: Violation[] = [];
    const els = doc.querySelectorAll('header, [role="banner"]');
    const topLevel = Array.from(els).filter((el) => !el.closest(SECTIONING_SELECTOR));

    if (topLevel.length > 1) {
      topLevel.slice(1).forEach((el) =>
        violations.push({
          ruleId: "accesslint-037",
          selector: getSelector(el),
          html: getHtmlSnippet(el),
          impact: "moderate" as const,
          message: "Page has multiple banner landmarks.",
        })
      );
    }
    return violations;
  },
};

export const landmarkNoDuplicateContentinfo: Rule = {
  id: "accesslint-038",
  wcag: [],
  level: "A",
  tags: ["best-practice"],
  description: "Page should not have more than one contentinfo landmark.",
  guidance: "The contentinfo landmark (typically <footer>) contains information about the page like copyright and contact info. Only one top-level contentinfo is allowed per page. Nest additional footers inside sectioning elements to scope them.",
  prompt:
    "Explain whether to remove this duplicate footer or nest it inside a sectioning element.",
  run(doc) {
    const violations: Violation[] = [];
    const els = doc.querySelectorAll('footer, [role="contentinfo"]');
    const topLevel = Array.from(els).filter((el) => !el.closest(SECTIONING_SELECTOR));

    if (topLevel.length > 1) {
      topLevel.slice(1).forEach((el) =>
        violations.push({
          ruleId: "accesslint-038",
          selector: getSelector(el),
          html: getHtmlSnippet(el),
          impact: "moderate" as const,
          message: "Page has multiple contentinfo landmarks.",
        })
      );
    }
    return violations;
  },
};

export const landmarkNoDuplicateMain: Rule = {
  id: "accesslint-039",
  wcag: [],
  level: "A",
  tags: ["best-practice"],
  description: "Page should not have more than one main landmark.",
  guidance: "Only one main landmark should exist per page. The main landmark identifies the primary content area. If you have multiple content sections, use <section> with appropriate headings instead of multiple main elements.",
  prompt:
    "Explain which main landmark to keep and how to restructure the duplicate.",
  run(doc) {
    const violations: Violation[] = [];
    const mains = doc.querySelectorAll('main, [role="main"]');

    if (mains.length > 1) {
      Array.from(mains).slice(1).forEach((el) =>
        violations.push({
          ruleId: "accesslint-039",
          selector: getSelector(el),
          html: getHtmlSnippet(el),
          impact: "moderate" as const,
          message: "Page has multiple main landmarks.",
        })
      );
    }
    return violations;
  },
};

export const landmarkBannerIsTopLevel: Rule = {
  id: "accesslint-040",
  wcag: [],
  level: "A",
  tags: ["best-practice"],
  description: "Banner landmark should not be nested within another landmark.",
  guidance: "The banner landmark should be a top-level landmark, not nested inside article, aside, main, nav, or section. If a header is inside these elements, it automatically becomes a generic header rather than a banner. Remove explicit role='banner' from nested headers or restructure the page.",
  prompt:
    "Explain why this banner is incorrectly nested and how to fix it.",
  run(doc) {
    const violations: Violation[] = [];
    const banners = doc.querySelectorAll('[role="banner"]');

    for (const banner of banners) {
      if (banner.closest(SECTIONING_SELECTOR)) {
        violations.push({
          ruleId: "accesslint-040",
          selector: getSelector(banner),
          html: getHtmlSnippet(banner),
          impact: "moderate" as const,
          message: "Banner landmark is nested within another landmark.",
        });
      }
    }
    return violations;
  },
};

export const landmarkContentinfoIsTopLevel: Rule = {
  id: "accesslint-041",
  wcag: [],
  level: "A",
  tags: ["best-practice"],
  description: "Contentinfo landmark should not be nested within another landmark.",
  guidance: "The contentinfo landmark should be a top-level landmark. A footer inside article, aside, main, nav, or section becomes a scoped footer, not a contentinfo landmark. Remove explicit role='contentinfo' from nested footers or move the footer outside sectioning elements.",
  prompt:
    "Explain why this contentinfo is incorrectly nested and how to fix it.",
  run(doc) {
    const violations: Violation[] = [];
    const contentinfos = doc.querySelectorAll('[role="contentinfo"]');

    for (const el of contentinfos) {
      if (el.closest(SECTIONING_SELECTOR)) {
        violations.push({
          ruleId: "accesslint-041",
          selector: getSelector(el),
          html: getHtmlSnippet(el),
          impact: "moderate" as const,
          message: "Contentinfo landmark is nested within another landmark.",
        });
      }
    }
    return violations;
  },
};

export const landmarkMainIsTopLevel: Rule = {
  id: "accesslint-042",
  wcag: [],
  level: "A",
  tags: ["best-practice"],
  description: "Main landmark should not be nested within another landmark.",
  guidance: "The main landmark must be a top-level landmark since it represents the primary content of the page. Do not nest <main> or role='main' inside article, aside, nav, or section elements.",
  prompt:
    "Explain why the main landmark must be top-level and where to move it.",
  run(doc) {
    const violations: Violation[] = [];
    const mains = doc.querySelectorAll('main, [role="main"]');

    for (const main of mains) {
      // Check if nested in other landmarks (not just sectioning elements, but other landmarks)
      const parent = main.parentElement;
      if (parent?.closest('article, aside, nav, section[aria-label], section[aria-labelledby], [role="article"], [role="complementary"], [role="navigation"], [role="region"]')) {
        violations.push({
          ruleId: "accesslint-042",
          selector: getSelector(main),
          html: getHtmlSnippet(main),
          impact: "moderate" as const,
          message: "Main landmark is nested within another landmark.",
        });
      }
    }
    return violations;
  },
};

export const landmarkComplementaryIsTopLevel: Rule = {
  id: "accesslint-043",
  wcag: [],
  level: "A",
  tags: ["best-practice"],
  description: "Aside (complementary) landmark should be top-level or directly inside main.",
  guidance: "The complementary landmark (aside) should be top-level or a direct child of main. Nesting aside deep within other landmarks reduces its discoverability for screen reader users navigating by landmarks.",
  prompt:
    "Explain why this aside should be repositioned and suggest where to move it.",
  run(doc) {
    const violations: Violation[] = [];
    const asides = doc.querySelectorAll('aside, [role="complementary"]');

    for (const aside of asides) {
      // Allowed: top-level or direct child of main
      const parent = aside.parentElement;
      if (parent && !parent.matches('body, main, [role="main"]')) {
        // Check if nested in other sectioning elements
        if (aside.closest('article, nav, section[aria-label], section[aria-labelledby], [role="article"], [role="navigation"], [role="region"]')) {
          violations.push({
            ruleId: "accesslint-043",
            selector: getSelector(aside),
            html: getHtmlSnippet(aside),
            impact: "moderate" as const,
            message: "Complementary landmark should be top-level.",
          });
        }
      }
    }
    return violations;
  },
};

export const landmarkUnique: Rule = {
  id: "accesslint-044",
  wcag: [],
  level: "A",
  tags: ["best-practice"],
  description: "Landmarks should have unique labels when there are multiple of the same type.",
  guidance: "When a page has multiple landmarks of the same type (e.g., multiple nav elements), each should have a unique accessible name via aria-label or aria-labelledby. This helps screen reader users distinguish between them (e.g., 'Main navigation' vs 'Footer navigation').",
  prompt:
    "Suggest a unique aria-label that distinguishes this landmark based on its purpose.",
  run(doc) {
    const violations: Violation[] = [];
    const landmarkTypes = [
      { selector: 'nav, [role="navigation"]', type: "navigation" },
      { selector: 'aside, [role="complementary"]', type: "complementary" },
      { selector: 'section[aria-label], section[aria-labelledby], [role="region"]', type: "region" },
      { selector: 'form[aria-label], form[aria-labelledby], [role="form"], [role="search"]', type: "form" },
    ];

    for (const { selector, type } of landmarkTypes) {
      const landmarks = Array.from(doc.querySelectorAll(selector)).filter((el) => !isAriaHidden(el));
      if (landmarks.length <= 1) continue;

      const names = new Map<string, Element[]>();
      for (const landmark of landmarks) {
        const name = getAccessibleName(landmark).toLowerCase() || "";
        const existing = names.get(name) || [];
        existing.push(landmark);
        names.set(name, existing);
      }

      for (const [name, elements] of names) {
        if (elements.length > 1) {
          // All elements with duplicate (or empty) names are violations
          for (const el of elements.slice(1)) {
            violations.push({
              ruleId: "accesslint-044",
              selector: getSelector(el),
              html: getHtmlSnippet(el),
              impact: "moderate" as const,
              message: name
                ? `Multiple ${type} landmarks have the same label "${name}".`
                : `Multiple ${type} landmarks have no label. Add unique aria-label attributes.`,
            });
          }
        }
      }
    }
    return violations;
  },
};

export const region: Rule = {
  id: "accesslint-045",
  wcag: [],
  level: "A",
  tags: ["best-practice"],
  description: "All page content should be contained within landmarks.",
  guidance: "Screen reader users navigate pages by landmarks. Content outside landmarks is harder to find and understand. Wrap all visible content in appropriate landmarks: <header>, <nav>, <main>, <aside>, <footer>, or <section> with a label. Skip links may exist outside landmarks.",
  prompt:
    "Based on the content, suggest which landmark element would be most appropriate.",
  run(doc) {
    const violations: Violation[] = [];
    const body = doc.body;
    if (!body) return [];

    // Walk through direct children of body
    for (const child of body.children) {
      if (isAriaHidden(child)) continue;
      if (child instanceof HTMLScriptElement || child instanceof HTMLStyleElement) continue;
      if (child.tagName === "NOSCRIPT") continue;
      if (child instanceof HTMLElement && child.hidden) continue;

      // Skip links are allowed outside landmarks
      if (child.matches('a[href^="#"]')) continue;

      // Check if it's a landmark or inside one
      const isLandmark = child.matches(LANDMARK_SELECTOR);
      const containsContent = child.textContent?.trim();

      if (!isLandmark && containsContent) {
        // Check if this element contains landmarks (wrapper divs are ok)
        const hasLandmarkChild = child.querySelector(LANDMARK_SELECTOR);
        if (!hasLandmarkChild) {
          violations.push({
            ruleId: "accesslint-045",
            selector: getSelector(child),
            html: getHtmlSnippet(child),
            impact: "moderate" as const,
            message: "Content is not contained within a landmark region.",
          });
        }
      }
    }
    return violations;
  },
};

// Keep backward compatibility - export old name pointing to new rule
export const landmarkNoDuplicate = landmarkNoDuplicateBanner;
