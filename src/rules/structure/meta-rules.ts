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

    // Check for maximum-scale < 2
    const maxScaleMatch = content.match(/maximum-scale\s*=\s*([\d.]+)/i);
    if (maxScaleMatch) {
      const maxScale = parseFloat(maxScaleMatch[1]);
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
    const violations = [];

    const refresh = doc.querySelector('meta[http-equiv="refresh"]');
    if (!refresh) return [];

    const content = refresh.getAttribute("content") || "";

    // Parse the refresh time
    const match = content.match(/^(\d+)/);
    if (match) {
      const seconds = parseInt(match[1], 10);

      // Any redirect (URL in content) is problematic
      if (content.includes("url=")) {
        if (seconds <= 0) {
          // Immediate redirect - less harmful but still an issue
          violations.push({
            ruleId: "meta-refresh",
            selector: getSelector(refresh),
            html: getHtmlSnippet(refresh),
            impact: "moderate" as const,
            message: "Page uses meta refresh for redirect. Use server-side redirect instead.",
          });
        } else {
          violations.push({
            ruleId: "meta-refresh",
            selector: getSelector(refresh),
            html: getHtmlSnippet(refresh),
            impact: "critical" as const,
            message: `Page redirects after ${seconds} seconds without warning. Use server-side redirect.`,
          });
        }
      } else if (seconds > 0 && seconds <= 72000) {
        // Auto-refresh without redirect
        violations.push({
          ruleId: "meta-refresh",
          selector: getSelector(refresh),
          html: getHtmlSnippet(refresh),
          impact: "critical" as const,
          message: `Page auto-refreshes after ${seconds} seconds. Provide user control over refresh.`,
        });
      }
    }

    return violations;
  },
};
