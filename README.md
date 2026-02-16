# @accesslint/core

[![npm version](https://img.shields.io/npm/v/@accesslint/core)](https://www.npmjs.com/package/@accesslint/core)
[![license](https://img.shields.io/npm/l/@accesslint/core)](https://github.com/AccessLint/core/blob/main/LICENSE)

Pure accessibility rule engine for WCAG auditing. 93 bundled rules (92 active by default) and zero browser dependencies.

> Automated testing catches a meaningful subset of accessibility issues, but not all of them. You'll still need to test with assistive technologies and include people with disabilities in user research.

## Contents

- [Why @accesslint/core](#why-accesslintcore)
- [Install](#install)
- [Quick start](#quick-start)
- [API](#api)
- [Rules](#rules)
- [Compatibility](#compatibility)
- [Development](#development)

## Why @accesslint/core

- **Synchronous API** — `runAudit()` returns results immediately, no async/await needed
- **Works with happy-dom** — full support for happy-dom, jsdom, and real browsers with no polyfills or workarounds, including color contrast checks in virtual DOMs
- **Lightweight** — 43 KB gzipped (IIFE), zero runtime dependencies
- **Chunked audits** — time-budgeted processing via [`createChunkedAudit`](#createchunkedauditdoc-document-chunkedaudit) to avoid long tasks on the main thread
- **ESM, CJS, and IIFE** — tree-shakable ES modules, CommonJS for Node, and a single-file IIFE for script injection into any page
- **MIT licensed**

## Install

```sh
npm install @accesslint/core
```

## Quick start

### Vitest + React Testing Library

Audit a rendered component in your existing test suite:

```tsx
import { render } from "@testing-library/react";
import { runAudit } from "@accesslint/core";
import { LoginForm } from "./LoginForm";

test("LoginForm has no accessibility violations", () => {
  const { container } = render(<LoginForm />);
  const { violations } = runAudit(container.ownerDocument);
  expect(violations).toEqual([]);
});
```

### Playwright

Inject the library into the page and audit the live DOM:

```ts
// a11y.spec.ts
import { test, expect } from "@playwright/test";

const iife = require.resolve("@accesslint/core/iife");

test("page has no accessibility violations", async ({ page }) => {
  await page.goto("https://example.com");

  await page.addScriptTag({ path: iife });

  const violations = await page.evaluate(() => {
    const { runAudit } = (window as any).AccessLintCore;
    return runAudit(document).violations.map(
      (v: any) => ({ ruleId: v.ruleId, message: v.message, selector: v.selector, impact: v.impact })
    );
  });

  expect(violations).toEqual([]);
});
```

### Cypress

Inject the library into the page and audit the live DOM:

```js
// cypress/e2e/a11y.cy.js
Cypress.Commands.add("audit", () => {
  return cy
    .readFile("node_modules/@accesslint/core/dist/index.iife.js")
    .then((src) => {
      return cy.window().then((win) => {
        win.eval(src);
        const result = win.AccessLintCore.runAudit(win.document);
        return result.violations;
      });
    });
});

describe("sample.html accessibility audit", () => {
  beforeEach(() => {
    cy.visit("sample.html");
  });

  it("has no accessibility violations", () => {
    cy.audit().should("have.length", 0);
  });
});
```

## API

### `runAudit(doc: Document): AuditResult`

Run all active rules against a document and return violations.

```ts
interface AuditResult {
  url: string;
  timestamp: number;
  violations: Violation[];
  ruleCount: number;
}

interface Violation {
  ruleId: string;
  selector: string;
  html: string;
  impact: "critical" | "serious" | "moderate" | "minor";
  message: string;
  context?: string;
  element?: Element;
}
```

### `createChunkedAudit(doc: Document): ChunkedAudit`

Create a chunked audit that processes rules in time-boxed batches to avoid long tasks.

```js
const audit = createChunkedAudit(document);

function processNext() {
  const hasMore = audit.processChunk(16); // 16ms budget per frame
  if (hasMore) requestAnimationFrame(processNext);
  else console.log(audit.getViolations());
}

processNext();
```

### `configureRules(options: ConfigureOptions)`

Customize which rules are active.

```js
import { configureRules } from "@accesslint/core";

// Disable a rule
configureRules({
  disabledRules: ["heading-order"],
});

// Include AAA-level rules (excluded by default)
configureRules({
  includeAAA: true,
});
```

### `rules`

Array of all bundled `Rule` objects.

### `getActiveRules(): Rule[]`

Returns bundled rules minus user-disabled rules, excluding AAA-level rules unless `includeAAA` is set (plus any additional rules from `configureRules()`).

### `getRuleById(id: string): Rule | undefined`

Look up a rule by its ID.

### Utilities

Helpers for building custom rules:

- `getAccessibleName(el)` — compute the accessible name of an element
- `getComputedRole(el)` — get the computed ARIA role
- `getImplicitRole(el)` — get the implicit (native) ARIA role
- `isAriaHidden(el)` — check if an element is hidden via `aria-hidden`
- `isValidRole(role)` — check if a string is a valid ARIA role
- `getAccessibleTextContent(el)` — get text content respecting `aria-hidden`
- `getSelector(el)` — generate a CSS selector for an element
- `getHtmlSnippet(el)` — get a truncated HTML snippet of an element

## Rules

92 rules active by default, covering WCAG 2.1 Level A and AA. One additional AAA-level rule (`color-contrast-enhanced`) is bundled but excluded by default; include it via `configureRules({ includeAAA: true })`.

| Rule | Level | WCAG | Description |
| ---- | ----- | ---- | ----------- |
| `accesslint-001` | A | 2.4.2 | Documents must have a `<title>` element. |
| `accesslint-002` | A | — | Page must have a mechanism to bypass repeated blocks. |
| `accesslint-003` | A | — | Page should contain a level-one heading. |
| `accesslint-004` | A | 4.1.2 | Frames must have an accessible name. |
| `accesslint-005` | A | 4.1.2 | Frame titles should be unique. |
| `accesslint-006` | AA | 1.4.4 | Viewport meta must not disable user scaling. |
| `accesslint-007` | A | 2.2.1 | Meta refresh must not redirect or refresh automatically. |
| `accesslint-008` | A | 2.2.1 | Meta refresh must not be used with a delay (no exceptions). |
| `accesslint-009` | A | 2.2.2 | `<blink>` must not be used. |
| `accesslint-010` | A | 2.2.2 | `<marquee>` must not be used. |
| `accesslint-011` | A | 1.1.1 | Images must have alternate text. |
| `accesslint-012` | A | 1.1.1 | SVG images must have an accessible name. |
| `accesslint-013` | A | 1.1.1, 4.1.2 | Image inputs must have alternate text. |
| `accesslint-014` | A | — | Image alt should not duplicate adjacent text. |
| `accesslint-015` | A | — | Alt text should not contain "image", "photo", etc. |
| `accesslint-016` | A | 1.1.1, 4.1.2 | `<area>` elements must have alt text. |
| `accesslint-017` | A | 1.1.1 | `<object>` elements must have alt text. |
| `accesslint-018` | A | 1.1.1 | `role="img"` elements must have an accessible name. |
| `accesslint-019` | A | 2.1.1 | Server-side image maps must not be used. |
| `accesslint-020` | A | 4.1.2 | Form elements must have labels. |
| `accesslint-021` | A | — | Form fields should not have multiple labels. |
| `accesslint-022` | A | 4.1.2 | Select elements must have a label. |
| `accesslint-023` | A | 4.1.2 | Input buttons must have discernible text. |
| `accesslint-024` | AA | 1.3.5 | Autocomplete attribute must use valid values. |
| `accesslint-025` | A | — | Accessible name must contain visible text. |
| `accesslint-026` | A | — | Forms should not use title as the only label. |
| `accesslint-027` | A | — | tabindex should not be greater than 0. |
| `accesslint-028` | A | — | Focusable elements must have an appropriate role. |
| `accesslint-029` | A | 4.1.2 | Interactive controls must not be nested. |
| `accesslint-030` | A | 2.1.1 | Scrollable regions must be keyboard accessible. |
| `accesslint-031` | A | — | Accesskey values must be unique. |
| `accesslint-032` | AA | 2.4.7 | Elements in focus order must have a visible focus indicator. |
| `accesslint-033` | A | — | Heading levels should increase by one. |
| `accesslint-034` | A | — | Headings must have discernible text. |
| `accesslint-035` | A | — | Paragraphs should not be styled as headings. |
| `accesslint-036` | A | — | Page should have one main landmark. |
| `accesslint-037` | A | — | No duplicate banner landmarks. |
| `accesslint-038` | A | — | No duplicate contentinfo landmarks. |
| `accesslint-039` | A | — | No duplicate main landmarks. |
| `accesslint-040` | A | — | Banner landmark should be top-level. |
| `accesslint-041` | A | — | Contentinfo landmark should be top-level. |
| `accesslint-042` | A | — | Main landmark should be top-level. |
| `accesslint-043` | A | — | Aside landmark should be top-level. |
| `accesslint-044` | A | — | Landmarks of the same type should have unique labels. |
| `accesslint-045` | A | — | All content should be within landmarks. |
| `accesslint-046` | A | 1.3.1 | `<ul>` and `<ol>` must only contain valid children. |
| `accesslint-047` | A | 1.3.1 | `<li>` must be in a `<ul>`, `<ol>`, or `<menu>`. |
| `accesslint-048` | A | 1.3.1 | `<dt>` and `<dd>` must be in a `<dl>`. |
| `accesslint-049` | A | 1.3.1 | `<dl>` must only contain valid children. |
| `accesslint-050` | AA | 1.4.12 | Letter spacing with `!important` must be at least 0.12em. |
| `accesslint-051` | AA | 1.4.12 | Line height with `!important` must be at least 1.5. |
| `accesslint-052` | AA | 1.4.12 | Word spacing with `!important` must be at least 0.16em. |
| `accesslint-053` | AA | 1.3.4 | Page orientation must not be restricted. |
| `accesslint-054` | A | 4.1.2 | ARIA role values must be valid. |
| `accesslint-055` | A | 4.1.2 | ARIA attributes must be valid (correctly spelled). |
| `accesslint-056` | A | 4.1.2 | ARIA attributes must have valid values. |
| `accesslint-057` | A | 4.1.2 | Required ARIA attributes must be present. |
| `accesslint-058` | A | 4.1.2 | ARIA attributes must be allowed for the role. |
| `accesslint-059` | A | 4.1.2 | ARIA role must be appropriate for the element. |
| `accesslint-060` | A | 1.3.1 | ARIA roles must have required child roles. |
| `accesslint-061` | A | 1.3.1 | ARIA roles must be in required parent roles. |
| `accesslint-062` | A | 4.1.2 | `aria-hidden` must not be on `<body>`. |
| `accesslint-063` | A | 4.1.2 | `aria-hidden` regions must not contain focusable elements. |
| `accesslint-064` | A | 4.1.2 | ARIA commands must have an accessible name. |
| `accesslint-065` | A | 4.1.2 | ARIA input fields must have an accessible name. |
| `accesslint-066` | A | 4.1.2 | ARIA toggle fields must have an accessible name. |
| `accesslint-067` | A | 4.1.2 | ARIA meters must have an accessible name. |
| `accesslint-068` | A | 4.1.2 | ARIA progressbars must have an accessible name. |
| `accesslint-069` | A | 4.1.2 | ARIA dialogs must have an accessible name. |
| `accesslint-070` | A | 4.1.2 | ARIA tooltips must have an accessible name. |
| `accesslint-071` | A | 4.1.2 | ARIA treeitems must have an accessible name. |
| `accesslint-072` | A | 4.1.2 | ARIA attributes must not be prohibited for the role. |
| `accesslint-073` | A | 4.1.2 | Presentation role must not conflict with focusability. |
| `accesslint-074` | A | 4.1.2 | Presentational children must not contain focusable content. |
| `accesslint-075` | A | 4.1.2 | Buttons must have discernible text. |
| `accesslint-076` | A | 4.1.2 | `<summary>` elements must have an accessible name. |
| `accesslint-077` | A | 2.4.4, 4.1.2 | Links must have discernible text. |
| `accesslint-078` | A | 2.4.1 | Skip links must point to a valid target. |
| `accesslint-079` | A | 1.4.1 | Links in text blocks must be distinguishable by more than color. |
| `accesslint-080` | A | 3.1.1 | `<html>` must have a `lang` attribute. |
| `accesslint-081` | A | 3.1.1 | `lang` on `<html>` must be valid. |
| `accesslint-082` | AA | 3.1.2 | `lang` attribute must have a valid value on all elements. |
| `accesslint-083` | A | 3.1.1 | `lang` and `xml:lang` must match. |
| `accesslint-084` | A | 1.3.1 | Table headers references must be valid. |
| `accesslint-085` | A | 1.3.1 | Table headers should be associated with data cells. |
| `accesslint-086` | A | 1.3.1 | Data cells in large tables should have associated headers. |
| `accesslint-087` | A | 1.3.1 | `scope` attribute must have a valid value. |
| `accesslint-088` | A | — | Table headers should have visible text. |
| `accesslint-089` | A | 4.1.2 | IDs used in ARIA must be unique. |
| `accesslint-090` | A | 1.2.2 | Videos must have captions. |
| `accesslint-091` | A | 1.2.1 | Audio elements should have a text alternative. |
| `accesslint-092` | AA | 1.4.3 | Text must have sufficient color contrast. |
| `accesslint-093` | AAA | 1.4.6 | Text must have enhanced color contrast (AAA). |

## Compatibility

Tested in the following environments:

| Environment | Support |
| ----------- | ------- |
| Node.js 18+ | Yes |
| happy-dom | Yes |
| jsdom | Yes |
| Chrome / Edge | Yes |
| Firefox | Yes |
| Safari | Yes |

## Development

```sh
npm install
npm test        # 1030 tests
npm run bench   # performance benchmarks
npm run build   # produces dist/index.js, dist/index.cjs, dist/index.d.ts
```

Found a bug or have a suggestion? [Open an issue](https://github.com/AccessLint/core/issues).

## License

MIT
