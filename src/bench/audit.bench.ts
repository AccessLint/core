import { describe, bench } from "vitest";
import { runAudit, rules, clearAllCaches } from "../rules/index";
import { generateDoc, SMALL_SIZE, MEDIUM_SIZE, LARGE_SIZE } from "./fixtures";

const smallDoc = generateDoc(SMALL_SIZE);
const mediumDoc = generateDoc(MEDIUM_SIZE);
const largeDoc = generateDoc(LARGE_SIZE);

describe("runAudit", () => {
  bench("500 elements", () => {
    runAudit(smallDoc);
  });

  bench("2k elements", () => {
    runAudit(mediumDoc);
  });

  bench("5k elements", () => {
    runAudit(largeDoc);
  }, { time: 1000 });
});

describe("per-rule (500 elements)", () => {
  for (const rule of rules) {
    bench(rule.id, () => {
      clearAllCaches();
      rule.run(smallDoc);
    });
  }
});
