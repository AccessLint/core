import { describe, it, expect, beforeEach } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { rules, clearAllCaches } from "../rules/index";

const FIXTURE_PATH = resolve(
  import.meta.dirname,
  "../../act-fixtures/act-testcases.json",
);
const fixturesExist = existsSync(FIXTURE_PATH);

interface FixtureEntry {
  testcaseId: string;
  testcaseTitle: string;
  actRuleId: string;
  actRuleName: string;
  coreRuleId: string;
  expected: "passed" | "failed" | "inapplicable";
  html: string;
}

function loadFixtures(): FixtureEntry[] {
  if (!fixturesExist) return [];
  return JSON.parse(readFileSync(FIXTURE_PATH, "utf-8"));
}

function makeDoc(html: string): Document {
  return new DOMParser().parseFromString(html, "text/html");
}

/**
 * Performance smoke test: runs all ACT fixtures through their corresponding
 * rules in happy-dom. This validates that rules don't crash on real-world HTML
 * and provides a performance baseline. Conformance assertions live in the
 * browser tests (Playwright) which have full CSS/layout fidelity.
 */
describe.skipIf(!fixturesExist)("ACT Performance", () => {
  const fixtures = loadFixtures();

  // Group by core rule ID
  const byRule = new Map<string, FixtureEntry[]>();
  for (const entry of fixtures) {
    const list = byRule.get(entry.coreRuleId) ?? [];
    list.push(entry);
    byRule.set(entry.coreRuleId, list);
  }

  const ruleMap = new Map(rules.map((r) => [r.id, r]));

  for (const [coreRuleId, entries] of byRule) {
    const rule = ruleMap.get(coreRuleId);
    if (!rule) {
      it(`${coreRuleId}: rule not found`, () => {
        expect.fail(`Rule "${coreRuleId}" not found in rules array`);
      });
      continue;
    }

    const actRuleId = entries[0].actRuleId;

    describe(`${coreRuleId} (ACT ${actRuleId})`, () => {
      beforeEach(() => {
        clearAllCaches();
      });

      for (const entry of entries) {
        it(`[${entry.expected}] ${entry.testcaseTitle}`, () => {
          const doc = makeDoc(entry.html);
          // Run the rule — we only care that it doesn't throw
          rule.run(doc);
        });
      }
    });
  }
});
