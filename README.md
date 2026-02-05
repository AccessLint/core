# @accesslint/core

Pure accessibility rule engine for WCAG auditing. 83 bundled rules, a declarative rule engine, and zero browser dependencies.

## Highlights

- **Lightweight** — 29 KB gzipped (IIFE), with zero runtime dependencies
- **Chunked audits** — time-budgeted processing via [`createChunkedAudit`](#createchunkedauditdoc-document-chunkedaudit) to avoid long tasks on the main thread
- **Declarative rule engine** — define custom rules as JSON and compile them with [`compileDeclarativeRule`](#compiledeclarativerulespec-declarativerule-rule), no JavaScript required
- **ESM, CJS, and IIFE** — tree-shakable ES modules, CommonJS for Node, and a single-file IIFE for script injection into any page
- **Runs anywhere** — works with happy-dom, jsdom, and real browsers with no DOM polyfills or compatibility workarounds. Run accessibility audits in Vitest and React Testing Library using the same environment as the rest of your tests
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
import { configureRules, compileDeclarativeRule } from "@accesslint/core";

configureRules({
  disabledRules: ["heading-order"],
  additionalRules: [compileDeclarativeRule(myCustomRule)],
});
```

### `compileDeclarativeRule(spec: DeclarativeRule): Rule`

Compile a declarative rule definition into an executable rule. Supports six check types: `selector-exists`, `attribute-value`, `attribute-missing`, `attribute-regex`, `child-required`, and `child-invalid`.

```js
const rule = compileDeclarativeRule({
  id: "no-autofocus",
  selector: "[autofocus]",
  check: { type: "selector-exists" },
  impact: "serious",
  message: "Autofocus attribute should not be used.",
  description: "autofocus moves focus unexpectedly.",
  wcag: ["2.4.3"],
  level: "A",
});
```

### `rules`

Array of all 83 bundled `Rule` objects.

### `getActiveRules(): Rule[]`

Returns bundled rules (minus disabled) plus any additional rules from `configureRules()`.

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

83 rules covering WCAG 2.1 Level A and AA.

| Rule | Level | WCAG | Description |
| ---- | ----- | ---- | ----------- |
| `document-title` | A | 2.4.2 | Documents must have a `<title>` element. |
| `bypass` | A | 2.4.1 | Page must have a mechanism to bypass repeated blocks. |
| `page-has-heading-one` | A | — | Page should contain a level-one heading. |
| `frame-title` | A | 4.1.2 | Frames must have an accessible name. |
| `frame-title-unique` | A | 4.1.2 | Frame titles should be unique. |
| `meta-viewport` | AA | 1.4.4 | Viewport meta must not disable user scaling. |
| `meta-refresh` | A | 2.2.1, 2.2.4, 3.2.5 | Meta refresh must not redirect automatically. |
| `blink` | A | 2.2.2 | `<blink>` must not be used. |
| `marquee` | A | 2.2.2 | `<marquee>` must not be used. |
| `img-alt` | A | 1.1.1 | Images must have alternate text. |
| `svg-img-alt` | A | 1.1.1 | SVG images must have an accessible name. |
| `input-image-alt` | A | 1.1.1, 4.1.2 | Image inputs must have alternate text. |
| `image-redundant-alt` | A | — | Image alt should not duplicate adjacent text. |
| `image-alt-redundant-words` | A | — | Alt text should not contain "image", "photo", etc. |
| `area-alt` | A | 1.1.1, 4.1.2 | `<area>` elements must have alt text. |
| `object-alt` | A | 1.1.1 | `<object>` elements must have alt text. |
| `role-img-alt` | A | 1.1.1 | `role="img"` elements must have an accessible name. |
| `server-side-image-map` | A | 2.1.1 | Server-side image maps must not be used. |
| `label` | A | 4.1.2 | Form elements must have labels. |
| `form-field-multiple-labels` | A | — | Form fields should not have multiple labels. |
| `select-name` | A | 4.1.2 | Select elements must have a label. |
| `input-button-name` | A | 4.1.2 | Input buttons must have discernible text. |
| `autocomplete-valid` | AA | 1.3.5 | Autocomplete must use valid values. |
| `label-content-name-mismatch` | A | 2.5.3 | Accessible name must contain visible text. |
| `label-title-only` | A | — | Forms should not use title as the only label. |
| `tabindex` | A | — | tabindex should not be greater than 0. |
| `focus-order-semantics` | A | — | Focusable elements must have an appropriate role. |
| `nested-interactive` | A | 4.1.2 | Interactive controls must not be nested. |
| `scrollable-region-focusable` | A | 2.1.1 | Scrollable regions must be keyboard accessible. |
| `accesskeys` | A | — | Accesskey values must be unique. |
| `heading-order` | A | — | Heading levels should increase by one. |
| `empty-heading` | A | — | Headings must have discernible text. |
| `p-as-heading` | A | — | Paragraphs should not be styled as headings. |
| `landmark-one-main` | A | — | Page should have one main landmark. |
| `landmark-no-duplicate-banner` | A | — | No duplicate banner landmarks. |
| `landmark-no-duplicate-contentinfo` | A | — | No duplicate contentinfo landmarks. |
| `landmark-no-duplicate-main` | A | — | No duplicate main landmarks. |
| `landmark-banner-is-top-level` | A | — | Banner landmark should be top-level. |
| `landmark-contentinfo-is-top-level` | A | — | Contentinfo landmark should be top-level. |
| `landmark-main-is-top-level` | A | — | Main landmark should be top-level. |
| `landmark-complementary-is-top-level` | A | — | Aside landmark should be top-level. |
| `landmark-unique` | A | — | Landmarks of the same type should have unique labels. |
| `region` | A | — | All content should be within landmarks. |
| `list` | A | 1.3.1 | Lists must only contain valid children. |
| `dlitem` | A | 1.3.1 | `<dt>`/`<dd>` must be in a `<dl>`. |
| `definition-list` | A | 1.3.1 | `<dl>` must only contain valid children. |
| `aria-roles` | A | 4.1.2 | ARIA role values must be valid. |
| `aria-valid-attr` | A | 4.1.2 | ARIA attributes must be correctly spelled. |
| `aria-valid-attr-value` | A | 4.1.2 | ARIA attributes must have valid values. |
| `aria-required-attr` | A | 4.1.2 | Required ARIA attributes must be present. |
| `aria-allowed-attr` | A | 4.1.2 | ARIA attributes must be allowed for the role. |
| `aria-allowed-role` | A | 4.1.2 | ARIA role must be appropriate for the element. |
| `aria-required-children` | A | 4.1.2 | Required child roles must be present. |
| `aria-required-parent` | A | 4.1.2 | Required parent roles must be present. |
| `aria-hidden-body` | A | 4.1.2 | `aria-hidden` must not be on `<body>`. |
| `aria-hidden-focus` | A | 4.1.2 | `aria-hidden` regions must not contain focusable elements. |
| `aria-command-name` | A | 4.1.2 | ARIA commands must have an accessible name. |
| `aria-input-field-name` | A | 4.1.2 | ARIA input fields must have an accessible name. |
| `aria-toggle-field-name` | A | 4.1.2 | ARIA toggle fields must have an accessible name. |
| `aria-meter-name` | A | 4.1.2 | ARIA meters must have an accessible name. |
| `aria-progressbar-name` | A | 4.1.2 | ARIA progressbars must have an accessible name. |
| `aria-dialog-name` | A | 4.1.2 | ARIA dialogs must have an accessible name. |
| `aria-tooltip-name` | A | 4.1.2 | ARIA tooltips must have an accessible name. |
| `aria-treeitem-name` | A | 4.1.2 | ARIA treeitems must have an accessible name. |
| `aria-prohibited-attr` | A | 4.1.2 | Prohibited ARIA attributes must not be used. |
| `presentation-role-conflict` | A | 4.1.2 | Presentation role must not conflict with focusability. |
| `button-name` | A | 4.1.2 | Buttons must have discernible text. |
| `summary-name` | A | 4.1.2 | `<summary>` elements must have an accessible name. |
| `link-name` | A | 2.4.4, 4.1.2 | Links must have discernible text. |
| `skip-link` | A | 2.4.1 | Skip links must point to a valid target. |
| `link-in-text-block` | A | 1.4.1 | Links in text must be distinguishable by more than color. |
| `html-has-lang` | A | 3.1.1 | `<html>` must have a `lang` attribute. |
| `html-lang-valid` | A | 3.1.1 | `lang` on `<html>` must be valid. |
| `valid-lang` | AA | 3.1.2 | `lang` attributes must have valid values. |
| `html-xml-lang-mismatch` | A | 3.1.1 | `lang` and `xml:lang` must match. |
| `td-headers-attr` | A | 1.3.1 | Table headers references must be valid. |
| `th-has-data-cells` | A | 1.3.1 | Table headers should have data cells. |
| `td-has-header` | A | 1.3.1 | Data cells in large tables should have headers. |
| `scope-attr-valid` | A | 1.3.1 | `scope` attribute must have a valid value. |
| `empty-table-header` | A | — | Table headers should have visible text. |
| `duplicate-id-aria` | A | 4.1.2 | IDs used in ARIA must be unique. |
| `video-caption` | A | 1.2.2 | Videos must have captions. |
| `audio-caption` | A | 1.2.1 | Audio elements should have a text alternative. |

## Benchmarks

Full audit (`runAudit`) on synthetic documents with a realistic mix of valid and invalid elements:

| Document size | ops/sec | mean |
| ------------- | ------: | ---: |
| 100 elements | 252 | 4.0 ms |
| 1,000 elements | 27 | 36.6 ms |
| 2,000 elements | 2.0 | 494 ms |

> Measured on GitHub Actions `ubuntu-latest` / Node 22 with `vitest bench` ([run](https://github.com/AccessLint/core/actions/runs/21695011947)).

### Concordance with axe-core

On a synthetic 500-element document exercising all rule categories:

| Metric | Value |
| ------ | ----: |
| Rules where both agree | 44 |
| @accesslint/core only | 9 |
| axe-core only | 4 |
| **Concordance** (agreement / core findings) | **83%** |
| **Coverage** (agreement / axe findings) | **92%** |

## Development

```sh
npm install
npm test        # 394 tests
npm run bench   # performance benchmarks
npm run build   # produces dist/index.js, dist/index.cjs, dist/index.d.ts
```

## License

MIT
