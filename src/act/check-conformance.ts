/**
 * CI conformance gate: reads the browser EARL report and fails if any
 * enabled rule drops below 80% ACT conformance.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { ACT_TO_CORE_RULE } from "./act-mapping";
import type { EarlGraphReport, EarlTestSubject, EarlAssertion } from "./earl-report";

const EARL_PATH = resolve(
  import.meta.dirname,
  "../../act-fixtures/earl-report-browser.json",
);
const FIXTURES_PATH = resolve(
  import.meta.dirname,
  "../../act-fixtures/act-testcases.json",
);
const THRESHOLD = 0.8;

interface RuleStats {
  total: number;
  passed: number;
  failed: number;
  cantTell: number;
}

interface Fixture {
  testcaseId: string;
  expected: "passed" | "failed" | "inapplicable";
}

function main() {
  let report: EarlGraphReport;
  try {
    report = JSON.parse(readFileSync(EARL_PATH, "utf-8"));
  } catch {
    console.error(`Failed to read EARL report at ${EARL_PATH}`);
    console.error("Run 'npm run test:browser' first to generate the report.");
    process.exit(1);
  }

  // Build a lookup from testcaseId to expected outcome
  let fixtures: Fixture[];
  try {
    fixtures = JSON.parse(readFileSync(FIXTURES_PATH, "utf-8"));
  } catch {
    console.error(`Failed to read fixtures at ${FIXTURES_PATH}`);
    process.exit(1);
  }
  const expectedByTestcase = new Map<string, string>();
  for (const f of fixtures) {
    expectedByTestcase.set(f.testcaseId, f.expected);
  }

  // Aggregate per-rule stats from TestSubject-grouped EARL report
  const ruleStats = new Map<string, RuleStats>();

  for (const node of report["@graph"]) {
    const nodeType = (node as EarlTestSubject)["@type"];
    if (!Array.isArray(nodeType) || !nodeType.includes("TestSubject")) continue;
    const subject = node as EarlTestSubject;

    // Extract testcase ID from source URL
    const sourceMatch = subject.source.match(/\/([^/]+)\.html$/);
    if (!sourceMatch) continue;
    const testcaseId = sourceMatch[1];

    const expected = expectedByTestcase.get(testcaseId);
    if (!expected) continue;

    for (const assertion of subject.assertions) {
      // Extract ACT rule ID from isPartOf URL
      const ruleUrl = assertion.test.isPartOf[0];
      const ruleMatch = ruleUrl.match(/\/rules\/([^/]+)\//);
      if (!ruleMatch) continue;
      const actRuleId = ruleMatch[1];

      // Determine correctness: does the actual outcome match expected?
      const actualOutcome = assertion.result.outcome.replace("earl:", "");
      const correct = actualOutcome === expected;

      const stats = ruleStats.get(actRuleId) ?? { total: 0, passed: 0, failed: 0, cantTell: 0 };
      stats.total++;

      if (correct) stats.passed++;
      else if (actualOutcome === "cantTell") stats.cantTell++;
      else stats.failed++;

      ruleStats.set(actRuleId, stats);
    }
  }

  let hasFailures = false;

  console.log("\n=== ACT Conformance Gate (Browser) ===\n");
  console.log(
    "Rule".padEnd(35) +
    "Total".padEnd(8) +
    "Pass".padEnd(8) +
    "Fail".padEnd(8) +
    "Rate".padEnd(10) +
    "Status",
  );
  console.log("-".repeat(80));

  for (const [actRuleId, stats] of [...ruleStats].sort((a, b) => {
    const coreA = ACT_TO_CORE_RULE[a[0]] ?? a[0];
    const coreB = ACT_TO_CORE_RULE[b[0]] ?? b[0];
    return coreA.localeCompare(coreB);
  })) {
    const coreRuleId = ACT_TO_CORE_RULE[actRuleId] ?? actRuleId;

    // For rate calculation, exclude cantTell assertions
    const testable = stats.passed + stats.failed;
    const rate = testable > 0 ? stats.passed / testable : 1;
    const rateStr = (rate * 100).toFixed(1) + "%";

    const status = rate >= THRESHOLD ? "OK" : "FAIL";
    if (rate < THRESHOLD) hasFailures = true;

    console.log(
      coreRuleId.padEnd(35) +
      String(stats.total).padEnd(8) +
      String(stats.passed).padEnd(8) +
      String(stats.failed).padEnd(8) +
      rateStr.padEnd(10) +
      status,
    );
  }

  console.log("-".repeat(80));

  if (hasFailures) {
    console.error("Conformance gate FAILED: one or more enabled rules below 80% ACT conformance.");
    process.exit(1);
  } else {
    console.log("Conformance gate PASSED.\n");
  }
}

main();
