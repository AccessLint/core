import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { rules, clearAllCaches } from "../rules/index";
import { ACT_TO_CORE_RULE, HAPPY_DOM_LIMITED_RULES } from "./act-mapping";
import { generateEarlReport, type FixtureOutcome } from "./earl-report";

const FIXTURE_PATH = resolve(
  import.meta.dirname,
  "../../act-fixtures/act-testcases.json",
);
const EARL_OUTPUT_PATH = resolve(
  import.meta.dirname,
  "../../act-fixtures/earl-report.json",
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
const allFixtureOutcomes: FixtureOutcome[] = [];

describe.skipIf(!fixturesExist)("ACT Conformance", () => {
  const fixtures = loadFixtures();

  // Group by core rule ID
  const byRule = new Map<string, FixtureEntry[]>();
  for (const entry of fixtures) {
    const list = byRule.get(entry.coreRuleId) ?? [];
    list.push(entry);
    byRule.set(entry.coreRuleId, list);
  }

  // Use the full rules array directly to ensure all rules are testable,
  // including default-disabled ones.
  const ruleMap = new Map(rules.map((r) => [r.id, r]));

  for (const [coreRuleId, entries] of byRule) {
    const rule = ruleMap.get(coreRuleId);
    if (!rule) {
      it(`${coreRuleId}: rule not found`, () => {
        expect.fail(`Rule "${coreRuleId}" not found in rules array`);
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

          const correct =
            entry.expected === "failed" ? hasViolations : !hasViolations;

          const actual: "passed" | "failed" | "inapplicable" = hasViolations
            ? "failed"
            : entry.expected === "inapplicable"
              ? "inapplicable"
              : "passed";

          allFixtureOutcomes.push({
            testcaseId: entry.testcaseId,
            testcaseTitle: entry.testcaseTitle,
            actRuleId: entry.actRuleId,
            coreRuleId,
            expected: entry.expected,
            actual,
            correct,
            limited: isLimited,
          });

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

    // Generate EARL report
    if (allFixtureOutcomes.length > 0) {
      const report = generateEarlReport(allFixtureOutcomes);
      const outputDir = dirname(EARL_OUTPUT_PATH);
      mkdirSync(outputDir, { recursive: true });
      writeFileSync(EARL_OUTPUT_PATH, JSON.stringify(report, null, 2) + "\n");
      console.log(`EARL report written to ${EARL_OUTPUT_PATH}\n`);
    }
  });
});
