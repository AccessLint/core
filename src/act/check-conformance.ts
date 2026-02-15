/**
 * CI conformance gate: reads the EARL report and fails if any enabled,
 * non-limited rule drops below 80% ACT conformance.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { defaultDisabledRuleIds } from "../rules/index";
import { ACT_TO_CORE_RULE, HAPPY_DOM_LIMITED_RULES } from "./act-mapping";
import type { EarlReport } from "./earl-report";

const EARL_PATH = resolve(
  import.meta.dirname,
  "../../act-fixtures/earl-report.json",
);
const THRESHOLD = 0.8;

interface RuleStats {
  total: number;
  passed: number;
  failed: number;
  cantTell: number;
}

function main() {
  let report: EarlReport;
  try {
    report = JSON.parse(readFileSync(EARL_PATH, "utf-8"));
  } catch {
    console.error(`Failed to read EARL report at ${EARL_PATH}`);
    console.error("Run 'npm run test:act' first to generate the report.");
    process.exit(1);
  }

  // Aggregate per-rule stats
  const ruleStats = new Map<string, RuleStats>();

  for (const assertion of report.assertions) {
    // Extract ACT rule ID from the test URL
    const urlMatch = assertion.test.url.match(/\/rules\/([^/]+)\//);
    if (!urlMatch) continue;
    const actRuleId = urlMatch[1];

    const stats = ruleStats.get(actRuleId) ?? { total: 0, passed: 0, failed: 0, cantTell: 0 };
    stats.total++;

    const outcome = assertion.result.outcome;
    if (outcome === "earl:passed") stats.passed++;
    else if (outcome === "earl:failed") stats.failed++;
    else if (outcome === "earl:cantTell") stats.cantTell++;

    ruleStats.set(actRuleId, stats);
  }

  let hasFailures = false;

  console.log("\n=== ACT Conformance Gate ===\n");
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
    const isDisabled = defaultDisabledRuleIds.has(coreRuleId);
    const isLimited = HAPPY_DOM_LIMITED_RULES.has(coreRuleId);

    // For rate calculation, exclude cantTell assertions
    const testable = stats.passed + stats.failed;
    const rate = testable > 0 ? stats.passed / testable : 1;
    const rateStr = (rate * 100).toFixed(1) + "%";

    let status: string;
    if (isDisabled) {
      status = "SKIP (disabled)";
    } else if (isLimited) {
      status = "SKIP (limited)";
    } else if (rate >= THRESHOLD) {
      status = "OK";
    } else {
      status = "FAIL";
      hasFailures = true;
    }

    const marker = isLimited ? " *" : isDisabled ? " ~" : "";
    console.log(
      (coreRuleId + marker).padEnd(35) +
      String(stats.total).padEnd(8) +
      String(stats.passed).padEnd(8) +
      String(stats.failed).padEnd(8) +
      rateStr.padEnd(10) +
      status,
    );
  }

  console.log("-".repeat(80));
  console.log("* = happy-dom limited, ~ = default-disabled\n");

  if (hasFailures) {
    console.error("Conformance gate FAILED: one or more enabled rules below 80% ACT conformance.");
    process.exit(1);
  } else {
    console.log("Conformance gate PASSED.\n");
  }
}

main();
