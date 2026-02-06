import { writeFileSync, mkdirSync, existsSync, readFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { resolve } from "node:path";
import { ACT_TO_CORE_RULE } from "./act-mapping";

const TESTCASES_URL =
  "https://www.w3.org/WAI/content-assets/wcag-act-rules/testcases.json";
const OUTPUT_DIR = resolve(import.meta.dirname, "../../act-fixtures");
const OUTPUT_FILE = resolve(OUTPUT_DIR, "act-testcases.json");
const INDEX_CACHE = resolve(OUTPUT_DIR, "testcases-index.json");

interface ActTestCase {
  ruleId: string;
  ruleName: string;
  testcaseId: string;
  testcaseTitle: string;
  expected: "passed" | "failed" | "inapplicable";
  url: string;
  approved: boolean;
}

interface FixtureEntry {
  testcaseId: string;
  testcaseTitle: string;
  actRuleId: string;
  actRuleName: string;
  coreRuleId: string;
  expected: "passed" | "failed" | "inapplicable";
  html: string;
}


function curlFetch(url: string): string | null {
  try {
    return execSync(
      `curl -sf --retry 2 --retry-delay 3 --max-time 20 "${url}"`,
      { encoding: "utf-8", timeout: 60000 },
    );
  } catch {
    return null;
  }
}

function main() {
  // Load existing fixtures to avoid re-downloading
  const existing = new Map<string, FixtureEntry>();
  if (existsSync(OUTPUT_FILE)) {
    const prev: FixtureEntry[] = JSON.parse(
      readFileSync(OUTPUT_FILE, "utf-8"),
    );
    for (const e of prev) existing.set(e.testcaseId, e);
    console.log(`Loaded ${existing.size} existing fixtures`);
  }

  let data: { testcases: ActTestCase[] };
  if (existsSync(INDEX_CACHE)) {
    console.log("Using cached testcases index...");
    data = JSON.parse(readFileSync(INDEX_CACHE, "utf-8"));
  } else {
    console.log("Fetching ACT testcases index...");
    const indexJson = curlFetch(TESTCASES_URL);
    if (!indexJson) {
      throw new Error("Failed to fetch testcases.json");
    }
    data = JSON.parse(indexJson) as { testcases: ActTestCase[] };
    if (!existsSync(OUTPUT_DIR)) {
      mkdirSync(OUTPUT_DIR, { recursive: true });
    }
    writeFileSync(INDEX_CACHE, JSON.stringify(data, null, 2));
  }

  const mapped = data.testcases.filter(
    (tc) => tc.approved && tc.ruleId in ACT_TO_CORE_RULE,
  );

  const needed = mapped.filter((tc) => !existing.has(tc.testcaseId));
  console.log(
    `Found ${mapped.length} mapped test cases, ${needed.length} to download`,
  );

  if (needed.length > 0) {
    let downloaded = 0;
    let failed = 0;

    for (let i = 0; i < needed.length; i++) {
      const tc = needed[i];
      const html = curlFetch(tc.url);
      if (html) {
        existing.set(tc.testcaseId, {
          testcaseId: tc.testcaseId,
          testcaseTitle: tc.testcaseTitle,
          actRuleId: tc.ruleId,
          actRuleName: tc.ruleName,
          coreRuleId: ACT_TO_CORE_RULE[tc.ruleId],
          expected: tc.expected,
          html,
        });
        downloaded++;
      } else {
        failed++;
      }

      if ((i + 1) % 50 === 0) {
        console.log(`  Progress: ${downloaded} ok, ${failed} failed, ${i + 1}/${needed.length}`);
        // Save incrementally every 50
        const snapshot = mapped
          .map((t) => existing.get(t.testcaseId))
          .filter((e): e is FixtureEntry => e !== undefined);
        writeFileSync(OUTPUT_FILE, JSON.stringify(snapshot, null, 2));
      }
    }
    console.log(`Downloaded ${downloaded} new, ${failed} failed`);
  }

  // Write all fixtures (existing + new)
  const all = mapped
    .map((tc) => existing.get(tc.testcaseId))
    .filter((e): e is FixtureEntry => e !== undefined);

  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  writeFileSync(OUTPUT_FILE, JSON.stringify(all, null, 2));
  console.log(`Wrote ${all.length}/${mapped.length} test cases to ${OUTPUT_FILE}`);
}

try {
  main();
} catch (err) {
  console.error(err);
  process.exit(1);
}
