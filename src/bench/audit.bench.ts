import { describe, bench } from "vitest";
import { runAudit, rules, clearAllCaches } from "../rules/index";
import { generateDoc, TINY_SIZE, SMALL_SIZE, MEDIUM_SIZE, LARGE_SIZE } from "./fixtures";

const tinyDoc = generateDoc(TINY_SIZE);
const smallDoc = generateDoc(SMALL_SIZE);
const mediumDoc = generateDoc(MEDIUM_SIZE);
const largeDoc = generateDoc(LARGE_SIZE);

describe("runAudit", () => {
  bench("100 elements", () => {
    runAudit(tinyDoc);
  }, { time: 1000, warmupIterations: 1 });

  bench("500 elements", () => {
    runAudit(smallDoc);
  }, { time: 1000, warmupIterations: 1 });

  bench("2k elements", () => {
    runAudit(mediumDoc);
  }, { time: 1000, iterations: 3, warmupIterations: 1 });

  bench("5k elements", () => {
    runAudit(largeDoc);
  }, { time: 2000, iterations: 3, warmupIterations: 1 });
});

describe("per-rule (500 elements)", () => {
  for (const rule of rules) {
    bench(rule.id, () => {
      clearAllCaches();
      rule.run(smallDoc);
    });
  }
});
