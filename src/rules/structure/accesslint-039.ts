import { makeNoDuplicateLandmarkRule } from "./constants";

export const accesslint039 = makeNoDuplicateLandmarkRule({
  id: "accesslint-039",
  selector: 'main, [role="main"]',
  landmarkName: "main",
  description: "Page should not have more than one main landmark.",
  guidance: "Only one main landmark should exist per page. The main landmark identifies the primary content area. If you have multiple content sections, use <section> with appropriate headings instead of multiple main elements.",
  prompt: "Explain which main landmark to keep and how to restructure the duplicate.",
  filterTopLevel: false,
});
