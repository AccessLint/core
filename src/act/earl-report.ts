/**
 * Generate a W3C EARL (Evaluation and Report Language) JSON-LD report
 * from ACT conformance test results.
 *
 * Format expected by the ACT Implementation Generator at:
 *   https://act-implementor.netlify.app/
 *
 * The top-level object is the assertor with an `assertedThat` array
 * containing flat assertions (the JSON-LD reverse of `assertedBy`).
 *
 * @see https://www.w3.org/TR/EARL10-Schema/
 */

export interface FixtureOutcome {
  testcaseId: string;
  testcaseTitle: string;
  actRuleId: string;
  coreRuleId: string;
  expected: "passed" | "failed" | "inapplicable";
  actual: "passed" | "failed" | "inapplicable";
  correct: boolean;
}

export interface EarlAssertion {
  "@type": "Assertion";
  mode: "earl:automatic";
  subject: {
    "@type": ["TestSubject", "WebPage"];
    source: string;
  };
  test: {
    title: string;
    isPartOf: string[];
  };
  result: {
    outcome: `earl:${string}`;
  };
}

export interface EarlReport {
  "@context": string;
  "@type": ["Project", "Assertor"];
  name: string;
  description: string;
  homepage: string;
  release: {
    "@type": "Version";
    revision: string;
  };
  assertedThat: EarlAssertion[];
}

const ACT_TESTCASE_URL_PREFIX =
  "https://www.w3.org/WAI/content-assets/wcag-act-rules/testcases";
const ACT_RULE_URL_PREFIX =
  "https://www.w3.org/WAI/standards-guidelines/act/rules";

export function generateEarlReport(
  outcomes: FixtureOutcome[],
  version: string,
): EarlReport {
  const assertions: EarlAssertion[] = outcomes.map((outcome) => ({
    "@type": "Assertion",
    mode: "earl:automatic",
    subject: {
      "@type": ["TestSubject", "WebPage"],
      source: `${ACT_TESTCASE_URL_PREFIX}/${outcome.actRuleId}/${outcome.testcaseId}.html`,
    },
    test: {
      title: outcome.coreRuleId,
      isPartOf: [`${ACT_RULE_URL_PREFIX}/${outcome.actRuleId}/`],
    },
    result: {
      outcome: `earl:${outcome.actual}`,
    },
  }));

  return {
    "@context": "https://act-rules.github.io/earl-context.json",
    "@type": ["Project", "Assertor"],
    name: "AccessLint",
    description: "Automated accessibility testing engine",
    homepage: "https://github.com/AccessLint/core",
    release: {
      "@type": "Version",
      revision: version,
    },
    assertedThat: assertions,
  };
}
