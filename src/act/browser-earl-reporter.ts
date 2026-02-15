import type {
  FullConfig,
  FullResult,
  Reporter,
  Suite,
  TestCase,
  TestResult,
} from "@playwright/test/reporter";
import { writeFileSync, mkdirSync, readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { generateEarlReport, type FixtureOutcome } from "./earl-report";

const EARL_OUTPUT_PATH = resolve(
  import.meta.dirname,
  "../../act-fixtures/earl-report-browser.json",
);

const PACKAGE_JSON_PATH = resolve(import.meta.dirname, "../../package.json");

/**
 * Playwright reporter that generates a W3C EARL report from browser ACT tests.
 *
 * Test titles encode metadata as: `[expected] title |act:actRuleId|core:coreRuleId|tc:testcaseId`
 */
export default class BrowserEarlReporter implements Reporter {
  private outcomes: FixtureOutcome[] = [];

  onTestEnd(test: TestCase, result: TestResult): void {
    const title = test.title;
    const metaMatch = title.match(
      /\|act:([^|]+)\|core:([^|]+)\|tc:([^|]+)$/,
    );
    if (!metaMatch) return;

    const expectedMatch = title.match(/^\[(passed|failed|inapplicable)\]/);
    if (!expectedMatch) return;

    const actRuleId = metaMatch[1];
    const coreRuleId = metaMatch[2];
    const testcaseId = metaMatch[3];
    const expected = expectedMatch[1] as "passed" | "failed" | "inapplicable";

    // Extract actual outcome from test annotations or status
    const status = result.status; // "passed" | "failed" | "timedOut" | "skipped"

    // Skipped tests (external stylesheets, Shadow DOM) can't be evaluated
    if (status === "skipped") return;

    const testPassed = status === "passed";

    // Determine actual outcome: if the test passed, the rule behaved correctly
    let actual: "passed" | "failed" | "inapplicable";
    if (testPassed) {
      actual = expected; // Test passed means actual matched expected
    } else {
      // Test failed — invert the expectation
      actual = expected === "failed" ? "passed" : "failed";
    }

    this.outcomes.push({
      testcaseId,
      testcaseTitle: title.replace(/\s*\|act:[^|]+\|core:[^|]+\|tc:[^|]+$/, "").replace(/^\[(passed|failed|inapplicable)\]\s*/, ""),
      actRuleId,
      coreRuleId,
      expected,
      actual,
      correct: testPassed,
    });
  }

  onEnd(_result: FullResult): void {
    if (this.outcomes.length === 0) return;

    const pkg = JSON.parse(readFileSync(PACKAGE_JSON_PATH, "utf-8"));
    const assertedBy = `https://github.com/AccessLint/core/releases/tag/v${pkg.version}`;

    const report = generateEarlReport(this.outcomes, assertedBy);
    const outputDir = dirname(EARL_OUTPUT_PATH);
    mkdirSync(outputDir, { recursive: true });
    writeFileSync(EARL_OUTPUT_PATH, JSON.stringify(report, null, 2) + "\n");
    console.log(`\nBrowser EARL report written to ${EARL_OUTPUT_PATH}\n`);
  }
}
