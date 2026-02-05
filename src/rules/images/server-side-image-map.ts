import type { Rule } from "../types";
import { getSelector, getHtmlSnippet } from "../utils/selector";
import { isAriaHidden } from "../utils/aria";

export const serverSideImageMap: Rule = {
  id: "server-side-image-map",
  wcag: ["2.1.1"],
  level: "A",
  description: "Server-side image maps must not be used.",
  guidance: "Server-side image maps (using ismap attribute) send click coordinates to the server, which is inaccessible to keyboard users and screen readers who can't precisely click specific regions. Replace with client-side image maps (<map> with <area> elements) that provide keyboard access and accessible names, or use linked images/buttons instead.",
  prompt:
    "Explain that the ismap attribute should be removed and the functionality replaced with a client-side <map> element with <area> children, or separate linked images/buttons.",
  run(doc) {
    const violations = [];

    for (const img of doc.querySelectorAll("img[ismap], input[type='image'][ismap]")) {
      if (isAriaHidden(img)) continue;

      violations.push({
        ruleId: "server-side-image-map",
        selector: getSelector(img),
        html: getHtmlSnippet(img),
        impact: "minor" as const,
        message: "Server-side image map detected. Use client-side image map with <map> and <area> elements instead.",
      });
    }

    return violations;
  },
};
