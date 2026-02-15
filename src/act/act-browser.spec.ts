import { test, expect } from "@playwright/test";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const FIXTURE_PATH = resolve(
  import.meta.dirname,
  "../../act-fixtures/act-testcases.json",
);
const IIFE_PATH = resolve(import.meta.dirname, "../../dist/index.iife.js");

interface FixtureEntry {
  testcaseId: string;
  testcaseTitle: string;
  actRuleId: string;
  actRuleName: string;
  coreRuleId: string;
  expected: "passed" | "failed" | "inapplicable";
  html: string;
}

const fixturesExist = existsSync(FIXTURE_PATH);
const iifeExists = existsSync(IIFE_PATH);

function loadFixtures(): FixtureEntry[] {
  if (!fixturesExist) return [];
  return JSON.parse(readFileSync(FIXTURE_PATH, "utf-8"));
}

test.skip(!fixturesExist, "ACT fixtures not downloaded");
test.skip(!iifeExists, "IIFE bundle not built (run npm run build)");

const fixtures = loadFixtures();

// Deduplicate by testcaseId (multiple ACT rules can map to the same core rule)
const seen = new Set<string>();
const deduped = fixtures.filter((f) => {
  if (seen.has(f.testcaseId)) return false;
  seen.add(f.testcaseId);
  return true;
});

// Group by core rule ID
const byRule = new Map<string, FixtureEntry[]>();
for (const entry of deduped) {
  const list = byRule.get(entry.coreRuleId) ?? [];
  list.push(entry);
  byRule.set(entry.coreRuleId, list);
}

for (const [coreRuleId, entries] of byRule) {
  const actRuleIds = [...new Set(entries.map((e) => e.actRuleId))].join(",");
  test.describe(`${coreRuleId} (ACT ${actRuleIds})`, () => {
    for (const entry of entries) {
      // Encode metadata in test title for the EARL reporter
      const testName = `[${entry.expected}] ${entry.testcaseTitle} (${entry.testcaseId.slice(0, 8)}) |act:${entry.actRuleId}|core:${coreRuleId}|tc:${entry.testcaseId}`;

      test(testName, async ({ page }) => {
        await page.setContent(entry.html, { waitUntil: "load" });
        await page.addScriptTag({ path: IIFE_PATH });

        const violations = await page.evaluate((ruleId) => {
          const { rules, clearAllCaches } = (window as any).AccessLintCore;
          clearAllCaches();
          const rule = rules.find((r: any) => r.id === ruleId);
          if (!rule) return [];
          return rule.run(document);
        }, coreRuleId);

        const hasViolations = (violations as any[]).length > 0;

        if (entry.expected === "failed") {
          expect(
            hasViolations,
            `Expected violations for "${entry.testcaseTitle}" but got none`,
          ).toBe(true);
        } else {
          expect(
            hasViolations,
            `Expected no violations for "${entry.testcaseTitle}" but got ${(violations as any[]).length}`,
          ).toBe(false);
        }
      });
    }
  });
}
