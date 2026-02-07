import type { Rule } from "../types";
import { getSelector, getHtmlSnippet } from "../utils/selector";

export const metaViewport: Rule = {
  id: "meta-viewport",
  wcag: ["1.4.4"],
  level: "AA",
  description: "Viewport meta tag must not disable user scaling.",
  guidance: "Users with low vision need to zoom content up to 200% or more. Setting user-scalable=no or maximum-scale=1 prevents zooming and fails WCAG. Remove these restrictions. If your layout breaks at high zoom, fix the responsive design rather than preventing zoom.",
  prompt:
    "Explain which viewport restrictions to remove and show the corrected meta tag.",
  run(doc) {
    const violations = [];

    const viewport = doc.querySelector('meta[name="viewport"]');
    if (!viewport) return [];

    const content = viewport.getAttribute("content")?.toLowerCase() || "";

    // Check for user-scalable=no
    if (/user-scalable\s*=\s*no/i.test(content) || /user-scalable\s*=\s*0/i.test(content)) {
      violations.push({
        ruleId: "meta-viewport",
        selector: getSelector(viewport),
        html: getHtmlSnippet(viewport),
        impact: "critical" as const,
        message: "Viewport disables user scaling. Remove user-scalable=no.",
      });
    }

    // Check for maximum-scale < 2 (including "yes" which browsers treat as 1)
    const maxScaleMatch = content.match(/maximum-scale\s*=\s*([\d.]+|yes)/i);
    if (maxScaleMatch) {
      const rawValue = maxScaleMatch[1];
      const maxScale = rawValue.toLowerCase() === "yes" ? 1 : parseFloat(rawValue);
      if (maxScale < 2) {
        violations.push({
          ruleId: "meta-viewport",
          selector: getSelector(viewport),
          html: getHtmlSnippet(viewport),
          impact: "critical" as const,
          message: `Viewport maximum-scale=${maxScale} restricts zooming. Set to at least 2 or remove.`,
        });
      }
    }

    return violations;
  },
};

export const metaRefresh: Rule = {
  id: "meta-refresh",
  wcag: ["2.2.1", "2.2.4", "3.2.5"],
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
            ruleId: "meta-refresh",
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
          ruleId: "meta-refresh",
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
