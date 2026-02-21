import { makeNoDuplicateLandmarkRule } from "./constants";

export const accesslint038 = makeNoDuplicateLandmarkRule({
  id: "accesslint-038",
  selector: 'footer, [role="contentinfo"]',
  landmarkName: "contentinfo",
  description: "Page should not have more than one contentinfo landmark.",
  guidance: "The contentinfo landmark (typically <footer>) contains information about the page like copyright and contact info. Only one top-level contentinfo is allowed per page. Nest additional footers inside sectioning elements to scope them.",
  prompt: "Explain whether to remove this duplicate footer or nest it inside a sectioning element.",
  filterTopLevel: true,
});
