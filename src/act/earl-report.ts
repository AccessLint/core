/**
 * Generate a W3C EARL (Evaluation and Report Language) JSON-LD report
 * from ACT conformance test results.
 *
 * Format follows https://www.w3.org/WAI/standards-guidelines/act/report/earl/
 * using the W3C-hosted context at:
 *   https://www.w3.org/WAI/content-assets/wcag-act-rules/earl-context.json
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
  test: {
    title: string;
    isPartOf: string[];
  };
  result: {
    outcome: `earl:${string}`;
  };
}

export interface EarlTestSubject {
  "@type": "TestSubject";
  source: string;
  assertions: EarlAssertion[];
}

interface EarlAssertor {
  "@type": "Assertor";
  name: string;
  description: string;
  homepage: string;
  release: {
    "@type": "Version";
    revision: string;
  };
}

export interface EarlGraphReport {
  "@context": string;
  "@graph": (EarlTestSubject | EarlAssertor)[];
}

const ACT_TESTCASE_URL_PREFIX =
  "https://www.w3.org/WAI/content-assets/wcag-act-rules/testcases";
const ACT_RULE_URL_PREFIX =
  "https://www.w3.org/WAI/standards-guidelines/act/rules";

export function generateEarlReport(
  outcomes: FixtureOutcome[],
  version: string,
): EarlGraphReport {
  // Group outcomes by test page (source URL)
  const subjectMap = new Map<string, EarlAssertion[]>();

  for (const outcome of outcomes) {
    const source = `${ACT_TESTCASE_URL_PREFIX}/${outcome.actRuleId}/${outcome.testcaseId}.html`;
    let assertions = subjectMap.get(source);
    if (!assertions) {
      assertions = [];
      subjectMap.set(source, assertions);
    }
    assertions.push({
      "@type": "Assertion",
      mode: "earl:automatic",
      test: {
        title: outcome.coreRuleId,
        isPartOf: [`${ACT_RULE_URL_PREFIX}/${outcome.actRuleId}/`],
      },
      result: {
        outcome: `earl:${outcome.actual}`,
      },
    });
  }

  const subjects: EarlTestSubject[] = [...subjectMap].map(([source, assertions]) => ({
    "@type": "TestSubject",
    source,
    assertions,
  }));

  const assertor: EarlAssertor = {
    "@type": "Assertor",
    name: "AccessLint",
    description: "Automated accessibility testing engine",
    homepage: "https://github.com/AccessLint/core",
    release: {
      "@type": "Version",
      revision: version,
    },
  };

  return {
    "@context": "https://act-rules.github.io/earl-context.json",
    "@graph": [assertor, ...subjects],
  };
}
