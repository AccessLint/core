import type { Rule } from "../types";
import { getSelector, getHtmlSnippet } from "../utils/selector";

export const metaViewport: Rule = {
  id: "accesslint-006",
  actRuleIds: ["b4f0c3"],
  wcag: ["1.4.4"],
  level: "AA",
  description: "Viewport meta tag must not disable user scaling.",
  guidance: "Users with low vision need to zoom content up to 200% or more. Setting user-scalable=no or maximum-scale=1 prevents zooming and fails WCAG. Remove these restrictions. If your layout breaks at high zoom, fix the responsive design rather than preventing zoom.",
  prompt:
    "The viewport meta tag restricts zooming, which prevents low-vision users from enlarging content. Show the current content attribute and a corrected version with the problematic properties removed. Keep other viewport properties (like width=device-width, initial-scale=1) intact — only remove user-scalable=no and maximum-scale restrictions.",
  run(doc) {
    const violations = [];

    const viewport = doc.querySelector('meta[name="viewport"]');
    if (!viewport) return [];

    const content = viewport.getAttribute("content") || "";
    const contentLower = content.toLowerCase();

    // Check for user-scalable=no or numeric values that disable scaling.
    // Browsers treat values between -1 and 1 (exclusive) as disabling zoom.
    const userScalableMatch = contentLower.match(/user-scalable\s*=\s*([^\s,;]+)/i);
    if (userScalableMatch) {
      const raw = userScalableMatch[1];
      const num = parseFloat(raw);
      const isDisabled = raw === "no" || (!isNaN(num) && num > -1 && num < 1);
      if (isDisabled) {
        violations.push({
          ruleId: "accesslint-006",
          selector: getSelector(viewport),
          html: getHtmlSnippet(viewport),
          impact: "critical" as const,
          message: `Viewport disables user scaling (user-scalable=${raw}). Remove this restriction.`,
          context: `content: "${content}"`,
        });
      }
    }

    // Check for maximum-scale < 2 (including "yes" which browsers treat as 1)
    const maxScaleMatch = contentLower.match(/maximum-scale\s*=\s*([\d.]+|yes)/i);
    if (maxScaleMatch) {
      const rawValue = maxScaleMatch[1];
      const maxScale = rawValue.toLowerCase() === "yes" ? 1 : parseFloat(rawValue);
      if (maxScale < 2) {
        violations.push({
          ruleId: "accesslint-006",
          selector: getSelector(viewport),
          html: getHtmlSnippet(viewport),
          impact: "critical" as const,
          message: `Viewport maximum-scale=${maxScale} restricts zooming. Set to at least 2 or remove.`,
          context: `content: "${content}"`,
        });
      }
    }

    return violations;
  },
};

export const metaRefreshNoException: Rule = {
  id: "accesslint-008",
  actRuleIds: ["bisz58"],
  wcag: ["2.2.1"],
  level: "A",
  description: "Meta refresh must not be used with a delay (no exceptions).",
  guidance:
    "Automatic page refreshes and delayed redirects disorient users. Instant redirects (delay=0) are acceptable, but any positive delay is not. Use server-side redirects instead.",
  run(doc) {
    for (const refresh of doc.querySelectorAll('meta[http-equiv="refresh"]')) {
      const content = refresh.getAttribute("content") || "";
      const match = content.match(/^(\d+)/);
      if (!match) continue;
      const seconds = parseInt(match[1], 10);

      // Check for valid URL redirect (browser processes the first one)
      const hasValidUrl = /^\d+\s*[;,]\s*url\s*=/i.test(content) ||
        /^\d+\s*[;,]\s*['""]?\s*https?:/i.test(content);

      if (hasValidUrl) {
        if (seconds > 0) {
          return [{
            ruleId: "accesslint-008",
            selector: getSelector(refresh),
            html: getHtmlSnippet(refresh),
            impact: "critical" as const,
            message: `Page has a ${seconds}-second meta refresh delay.`,
          }];
        }
        // Delay 0 with valid URL is OK; this redirect wins, stop checking
        return [];
      }

      // Same-page refresh (no URL)
      if (seconds > 0) {
        return [{
          ruleId: "accesslint-008",
          selector: getSelector(refresh),
          html: getHtmlSnippet(refresh),
          impact: "critical" as const,
          message: `Page has a ${seconds}-second meta refresh delay.`,
        }];
      }
    }
    return [];
  },
};

export const metaRefresh: Rule = {
  id: "accesslint-007",
  actRuleIds: ["bc659a"],
  wcag: ["2.2.1"],
  level: "A",
  description: "Meta refresh must not redirect or refresh automatically.",
  guidance: "Automatic page refreshes or redirects can disorient users, especially those using screen readers or with cognitive disabilities. They may lose their place or not have time to read content. If a redirect is needed, use a server-side redirect (HTTP 301/302) instead. For timed refreshes, provide user controls.",
  prompt:
    "Explain why meta refresh is problematic and suggest server-side alternatives.",
  run(doc) {
    // Iterate through all meta refresh tags.  For URL redirects, the first
    // one with a validly-formed URL wins (the browser acts on it).
    for (const refresh of doc.querySelectorAll('meta[http-equiv="refresh"]')) {
      const content = refresh.getAttribute("content") || "";

      const match = content.match(/^(\d+)/);
      if (!match) continue;
      const seconds = parseInt(match[1], 10);

      // Valid URL redirect: number followed by ; or , then either:
      //   - url= prefix (with any URL, including relative), or
      //   - an absolute http(s) URL
      const hasValidUrl = /^\d+\s*[;,]\s*url\s*=/i.test(content) ||
        /^\d+\s*[;,]\s*['"]?\s*https?:/i.test(content);

      if (hasValidUrl) {
        // This is the effective redirect
        if (seconds > 0 && seconds <= 72000) {
          return [{
            ruleId: "accesslint-007",
            selector: getSelector(refresh),
            html: getHtmlSnippet(refresh),
            impact: "critical" as const,
            message: `Page redirects after ${seconds} seconds without warning. Use server-side redirect.`,
          }];
        }
        // Delay 0 or > 72000 is OK; this redirect wins so stop checking
        return [];
      }

      // No valid URL = same-page refresh
      if (seconds > 0 && seconds <= 72000) {
        return [{
          ruleId: "accesslint-007",
          selector: getSelector(refresh),
          html: getHtmlSnippet(refresh),
          impact: "critical" as const,
          message: `Page auto-refreshes after ${seconds} seconds. Provide user control over refresh.`,
        }];
      }
      // seconds == 0 or > 72000 with no URL: skip, check next meta
    }

    return [];
  },
};
