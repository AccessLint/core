import type { Rule } from "../types";
import { getSelector, getHtmlSnippet } from "../utils/selector";
import { getAccessibleName } from "../utils/aria";

export const documentTitle: Rule = {
  id: "document-title",
  wcag: ["2.4.2"],
  level: "A",
  description: "Documents must have a <title> element to provide users with an overview of content.",
  guidance: "Screen reader users rely on page titles to identify and navigate between tabs/windows. Add a descriptive <title> element in <head> that summarizes the page purpose. Keep titles unique across the site, placing specific content before the site name (e.g., 'Contact Us - Acme Corp').",
  prompt:
    "The page has no title or an empty title. Suggest a concise, descriptive <title> based on the page content sample in context. Good titles are specific and front-load the unique part: 'Product Details - Store Name' rather than 'Store Name - Product Details'.",
  run(doc) {
    const title = doc.querySelector("title");
    if (!title || !title.textContent?.trim()) {
      // Sample visible content for title suggestion
      let textSample: string | undefined;
      const h1 = doc.querySelector("h1");
      if (h1?.textContent?.trim()) {
        textSample = `h1: "${h1.textContent.trim().slice(0, 100)}"`;
      } else if (doc.body) {
        const text = doc.body.textContent?.trim().replace(/\s+/g, " ") || "";
        if (text) textSample = `Page text: "${text.slice(0, 150)}"`;
      }
      return [{
        ruleId: "document-title",
        selector: "html",
        html: "<html>",
        impact: "serious" as const,
        message: title ? "Document <title> element is empty." : "Document is missing a <title> element.",
        context: textSample,
      }];
    }
    return [];
  },
};

export const bypass: Rule = {
  id: "bypass",
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
      ruleId: "bypass",
      selector: "html",
      html: "<html>",
      impact: "serious" as const,
      message: "Page has no mechanism to bypass repeated content. Add a <main> landmark or skip link.",
      context: `Missing: ${missing.join(", ")}`,
    }];
  },
};

export const pageHasHeadingOne: Rule = {
  id: "page-has-heading-one",
  wcag: [],
  level: "A",
  tags: ["best-practice"],
  description: "Page should contain a level-one heading.",
  guidance: "A level-one heading (<h1> or role='heading' with aria-level='1') helps users understand the page topic and provides a landmark for screen reader navigation. Each page should have exactly one h1 that describes the main content, typically matching or similar to the page title.",
  prompt:
    "The page has no <h1> heading. Suggest appropriate h1 text based on the page title or content sample in context. The h1 should describe the page's main topic and typically be placed at the start of the main content area.",
  run(doc) {
    const h1 = doc.querySelector("h1");
    if (h1 && getAccessibleName(h1)) return [];

    // Check for role="heading" with aria-level="1"
    const roleHeadings = doc.querySelectorAll('[role="heading"][aria-level="1"]');
    for (const heading of roleHeadings) {
      if (getAccessibleName(heading)) return [];
    }

    // Gather context for h1 suggestion
    const parts: string[] = [];
    const title = doc.querySelector("title")?.textContent?.trim();
    if (title) parts.push(`Page title: "${title}"`);
    const main = doc.querySelector("main");
    if (main) {
      const text = main.textContent?.trim().replace(/\s+/g, " ") || "";
      if (text) parts.push(`Main content: "${text.slice(0, 100)}"`);
    }

    return [{
      ruleId: "page-has-heading-one",
      selector: "html",
      html: "<html>",
      impact: "moderate" as const,
      message: "Page does not contain a level-one heading.",
      context: parts.length > 0 ? parts.join(", ") : undefined,
    }];
  },
};
