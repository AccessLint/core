import type { DeclarativeRule } from "../types";
import { compileDeclarativeRule } from "../engine";

const serverSideImageMapSpec: DeclarativeRule = {
  id: "keyboard-accessible/server-image-map",
  selector: "img[ismap], input[type='image'][ismap]",
  check: { type: "selector-exists" },
  impact: "minor",
  message: "Server-side image map detected. Use client-side image map with <map> and <area> elements instead.",
  description: "Server-side image maps must not be used.",
  wcag: ["2.1.1"],
  level: "A",
  guidance: "Server-side image maps (using ismap attribute) send click coordinates to the server, which is inaccessible to keyboard users and screen readers who can't precisely click specific regions. Replace with client-side image maps (<map> with <area> elements) that provide keyboard access and accessible names, or use linked images/buttons instead.",
  prompt: "Explain that the ismap attribute should be removed and the functionality replaced with a client-side <map> element with <area> children, or separate linked images/buttons.",
};

export const serverImageMap = compileDeclarativeRule(serverSideImageMapSpec);
