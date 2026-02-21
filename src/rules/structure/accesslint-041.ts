import { makeNestedLandmarkRule } from "./constants";

export const accesslint041 = makeNestedLandmarkRule({
  id: "accesslint-041",
  selector: '[role="contentinfo"]',
  landmarkName: "Contentinfo",
  description: "Contentinfo landmark should not be nested within another landmark.",
  guidance: "The contentinfo landmark should be a top-level landmark. A footer inside article, aside, main, nav, or section becomes a scoped footer, not a contentinfo landmark. Remove explicit role='contentinfo' from nested footers or move the footer outside sectioning elements.",
  prompt: "Explain why this contentinfo is incorrectly nested and how to fix it.",
});
