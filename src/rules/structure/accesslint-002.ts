import type { Rule } from "../types";

export const accesslint002: Rule = {
  id: "accesslint-002",
  actRuleIds: ["cf77f2"],
  wcag: [],
  level: "A",
  tags: ["best-practice"],
  description: "Page must have a mechanism to bypass repeated blocks of content.",
  guidance: "Keyboard users must be able to skip repetitive content like navigation. Provide a skip link at the top of the page that links to the main content (e.g., <a href=\"#main\">Skip to main content</a>), or use a <main> landmark. Screen readers can jump directly to landmarks, so a properly marked-up <main> element satisfies this requirement.",
  prompt:
    "The page has no mechanism for keyboard users to skip repeated content. The simplest fix is to wrap the primary content area in a <main> element — screen readers can jump directly to it. Alternatively, add a skip link as the first element in <body>: <a href=\"#main\" class=\"skip-link\">Skip to main content</a>, with a matching id on the target element. Use the context to understand what the page is missing.",
  run(doc) {
    // Check for any ARIA landmark (main, nav, aside, header/banner, footer/contentinfo)
    const hasLandmark = doc.querySelector(
      'main, [role="main"], nav, [role="navigation"], aside, [role="complementary"], ' +
      'header, [role="banner"], footer, [role="contentinfo"], [role="search"], [role="region"]'
    );
    if (hasLandmark) return [];

    // Check for skip link (link pointing to same-page anchor near top of body)
    const skipLink = doc.querySelector('a[href^="#"]');
    if (skipLink) {
      const href = skipLink.getAttribute("href");
      if (href && href.length > 1) {
        const targetId = href.slice(1);
        const target = doc.getElementById(targetId);
        if (target) return [];
      }
    }

    // Check for heading structure that allows navigation
    const hasHeadings = doc.querySelector("h1, h2, h3, [role='heading']");
    if (hasHeadings) return [];

    const missing: string[] = [];
    missing.push("no landmarks (<main>, <nav>, <header>, <footer>)");
    missing.push("no skip link");
    missing.push("no headings");

    return [{
      ruleId: "accesslint-002",
      selector: "html",
      html: "<html>",
      impact: "serious" as const,
      message: "Page has no mechanism to bypass repeated content. Add a <main> landmark or skip link.",
      context: `Missing: ${missing.join(", ")}`,
    }];
  },
};
