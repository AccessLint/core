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
}

export interface EarlGraphReport {
  "@context": Record<string, string>;
  "@graph": EarlAssertion[];
}

interface EarlAssertion {
  "@type": "Assertion";
  mode: "earl:automatic";
  assertedBy: string;
  subject: {
    "@type": ["earl:TestSubject", "sch:WebPage"];
    source: string;
  };
  result: {
    "@type": "TestResult";
    outcome: `earl:${string}`;
  };
  test: {
    "@type": "TestCase";
    title: string;
    isPartOf: [string];
  };
}

const ACT_TESTCASE_URL_PREFIX =
  "https://www.w3.org/WAI/content-assets/wcag-act-rules/testcases";
const ACT_RULE_URL_PREFIX =
  "https://www.w3.org/WAI/standards-guidelines/act/rules";

export function generateEarlReport(
  outcomes: FixtureOutcome[],
  assertedBy: string,
): EarlGraphReport {
  const graph: EarlAssertion[] = outcomes.map((outcome) => ({
    "@type": "Assertion",
    mode: "earl:automatic",
    assertedBy,
    subject: {
      "@type": ["earl:TestSubject", "sch:WebPage"],
      source: `${ACT_TESTCASE_URL_PREFIX}/${outcome.actRuleId}/${outcome.testcaseId}.html`,
    },
    result: {
      "@type": "TestResult",
      outcome: `earl:${outcome.actual}`,
    },
    test: {
      "@type": "TestCase",
      title: outcome.testcaseTitle,
      isPartOf: [`${ACT_RULE_URL_PREFIX}/${outcome.actRuleId}/`],
    },
  }));

  return {
    "@context": {
      "@vocab": "http://www.w3.org/ns/earl#",
      earl: "http://www.w3.org/ns/earl#",
      WCAG21: "https://www.w3.org/TR/WCAG21/#",
      sch: "https://schema.org/",
      doap: "http://usefulinc.com/ns/doap#",
      foaf: "http://xmlns.com/foaf/0.1/",
      dct: "http://purl.org/dc/terms/",
    },
    "@graph": graph,
  };
}
