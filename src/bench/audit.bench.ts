import { describe, bench } from "vitest";
import { runAudit, rules } from "../rules/index";
import { clearAriaHiddenCache, clearComputedRoleCache } from "../rules/utils/aria";
import { clearColorCaches } from "../rules/utils/color";
import { clearAriaAttrAuditCache } from "../rules/aria/aria-attr-audit";
import { generateDoc, SMALL_SIZE, MEDIUM_SIZE, LARGE_SIZE } from "./fixtures";

const smallDoc = generateDoc(SMALL_SIZE);
const mediumDoc = generateDoc(MEDIUM_SIZE);
const largeDoc = generateDoc(LARGE_SIZE);

function clearCaches() {
  clearAriaHiddenCache();
  clearComputedRoleCache();
  clearColorCaches();
  clearAriaAttrAuditCache();
}

describe("runAudit", () => {
  bench("100 elements", () => {
    runAudit(smallDoc);
  });

  bench("1k elements", () => {
    runAudit(mediumDoc);
  });

  bench("2k elements", () => {
    runAudit(largeDoc);
  }, { time: 1000 });
});

describe("per-rule (1k elements)", () => {
  for (const rule of rules) {
    bench(rule.id, () => {
      clearCaches();
      rule.run(mediumDoc);
    });
  }
});
