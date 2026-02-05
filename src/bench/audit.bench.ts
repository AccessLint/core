import { describe, bench } from "vitest";
import { runAudit, rules } from "../rules/index";
import { clearAriaHiddenCache, clearComputedRoleCache, clearAccessibleNameCache } from "../rules/utils/aria";
import { clearColorCaches } from "../rules/utils/color";
import { clearAriaAttrAuditCache } from "../rules/aria/aria-attr-audit";
import { clearSelectorCache } from "../rules/utils/selector";
import { generateDoc, SMALL_SIZE } from "./fixtures";

const doc = generateDoc(SMALL_SIZE);

function clearCaches() {
  clearAriaHiddenCache();
  clearComputedRoleCache();
  clearColorCaches();
  clearAriaAttrAuditCache();
  clearSelectorCache();
  clearAccessibleNameCache();
}

describe("runAudit", () => {
  bench("100 elements", () => {
    runAudit(doc);
  });
});

describe("per-rule (100 elements)", () => {
  for (const rule of rules) {
    bench(rule.id, () => {
      clearCaches();
      rule.run(doc);
    });
  }
});
