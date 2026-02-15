/**
 * Generate a W3C EARL (Evaluation and Report Language) JSON-LD report
 * from ACT conformance test results.
 *
 * @see https://www.w3.org/TR/EARL10-Schema/
 * @see https://act-rules.github.io/pages/implementations/reporting/
 */

export interface FixtureOutcome {
  testcaseId: string;
  testcaseTitle: string;
  actRuleId: string;
  coreRuleId: string;
  expected: "passed" | "failed" | "inapplicable";
  actual: "passed" | "failed" | "inapplicable";
  correct: boolean;
  limited: boolean;
}

export interface EarlReport {
  "@context": string;
  "@type": string;
  name: string;
  vendor: {
    "@type": string;
    name: string;
    url: string;
  };
  assertions: EarlAssertion[];
}

interface EarlAssertion {
  "@type": string;
  test: {
    "@type": string;
    title: string;
    url: string;
  };
  subject: {
    "@type": string;
    description: string;
  };
  result: {
    "@type": string;
    outcome: string;
  };
  mode: string;
}

const EARL_CONTEXT = "https://act-rules.github.io/earl-context.json";
const ACT_RULE_URL_PREFIX = "https://www.w3.org/WAI/standards-guidelines/act/rules/";

function mapOutcome(outcome: FixtureOutcome): string {
  if (outcome.limited) {
    return "earl:cantTell";
  }
  return outcome.correct ? "earl:passed" : "earl:failed";
}

export function generateEarlReport(outcomes: FixtureOutcome[]): EarlReport {
  const assertions: EarlAssertion[] = outcomes.map((outcome) => ({
    "@type": "Assertion",
    test: {
      "@type": "TestCase",
      title: outcome.testcaseTitle,
      url: `${ACT_RULE_URL_PREFIX}${outcome.actRuleId}/#${outcome.testcaseId}`,
    },
    subject: {
      "@type": "TestSubject",
      description: `ACT test case: ${outcome.testcaseTitle}`,
    },
    result: {
      "@type": "TestResult",
      outcome: mapOutcome(outcome),
    },
    mode: "earl:automatic",
  }));

  return {
    "@context": EARL_CONTEXT,
    "@type": "Assertor",
    name: "@accesslint/core",
    vendor: {
      "@type": "Organization",
      name: "AccessLint",
      url: "https://github.com/AccessLint/core",
    },
    assertions,
  };
}
