import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { getRuleById, clearAllCaches } from "../rules/index";
import { ACT_TO_CORE_RULE, HAPPY_DOM_LIMITED_RULES } from "./act-mapping";

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

interface RuleResult {
  coreRuleId: string;
  actRuleId: string;
  total: number;
  pass: number;
  fail: number;
  limited: boolean;
}

const ruleResults: RuleResult[] = [];

describe.skipIf(!fixturesExist)("ACT Conformance", () => {
  const fixtures = loadFixtures();

  // Group by core rule ID
  const byRule = new Map<string, FixtureEntry[]>();
  for (const entry of fixtures) {
    const list = byRule.get(entry.coreRuleId) ?? [];
    list.push(entry);
    byRule.set(entry.coreRuleId, list);
  }

  for (const [coreRuleId, entries] of byRule) {
    const rule = getRuleById(coreRuleId);
    if (!rule) {
      it(`${coreRuleId}: rule not found`, () => {
        expect.fail(`getRuleById("${coreRuleId}") returned undefined`);
      });
      continue;
    }

    const isLimited = HAPPY_DOM_LIMITED_RULES.has(coreRuleId);
    const actRuleId = entries[0].actRuleId;

    describe(`${coreRuleId} (ACT ${actRuleId})`, () => {
      let pass = 0;
      let fail = 0;

      beforeEach(() => {
        clearAllCaches();
      });

      for (const entry of entries) {
        const testName = `[${entry.expected}] ${entry.testcaseTitle}`;
        it(testName, () => {
          const doc = makeDoc(entry.html);
          let violations: { ruleId: string }[] = [];
          try {
            violations = rule.run(doc);
          } catch {
            // Treat errors as zero violations (matches runAudit behavior)
          }
          const hasViolations = violations.length > 0;
          const assert = isLimited ? expect.soft : expect;

          if (entry.expected === "failed") {
            try {
              assert(
                hasViolations,
                `Expected violations for "${entry.testcaseTitle}" but got none`,
              ).toBe(true);
              pass++;
            } catch (e) {
              fail++;
              throw e;
            }
          } else {
            try {
              assert(
                hasViolations,
                `Expected no violations for "${entry.testcaseTitle}" but got ${violations.length}`,
              ).toBe(false);
              pass++;
            } catch (e) {
              fail++;
              throw e;
            }
          }
        });
      }

      afterAll(() => {
        ruleResults.push({
          coreRuleId,
          actRuleId,
          total: entries.length,
          pass,
          fail,
          limited: isLimited,
        });
      });
    });
  }

  afterAll(() => {
    if (ruleResults.length === 0) return;

    console.log("\n\n=== ACT Conformance Summary ===\n");
    console.log(
      "Rule".padEnd(35) +
        "ACT ID".padEnd(10) +
        "Total".padEnd(8) +
        "Pass".padEnd(8) +
        "Fail".padEnd(8) +
        "Rate",
    );
    console.log("-".repeat(75));

    let totalAll = 0;
    let passAll = 0;

    for (const r of ruleResults.sort((a, b) =>
      a.coreRuleId.localeCompare(b.coreRuleId),
    )) {
      const rate =
        r.total > 0 ? ((r.pass / r.total) * 100).toFixed(1) + "%" : "N/A";
      const marker = r.limited ? " *" : "";
      console.log(
        (r.coreRuleId + marker).padEnd(35) +
          r.actRuleId.padEnd(10) +
          String(r.total).padEnd(8) +
          String(r.pass).padEnd(8) +
          String(r.fail).padEnd(8) +
          rate,
      );
      totalAll += r.total;
      passAll += r.pass;
    }

    console.log("-".repeat(75));
    const overallRate =
      totalAll > 0 ? ((passAll / totalAll) * 100).toFixed(1) + "%" : "N/A";
    console.log(
      "TOTAL".padEnd(35) +
        "".padEnd(10) +
        String(totalAll).padEnd(8) +
        String(passAll).padEnd(8) +
        String(totalAll - passAll).padEnd(8) +
        overallRate,
    );
    console.log("\n* = happy-dom limited (soft failures)\n");
  });
});
