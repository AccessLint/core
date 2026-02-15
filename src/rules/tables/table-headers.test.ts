import { describe, it, expect } from "vitest";
import { tdHeadersAttr, thHasDataCells, tdHasHeader, scopeAttrValid, emptyTableHeader } from "./table-headers";

function makeDoc(html: string): Document {
  return new DOMParser().parseFromString(html, "text/html");
}

describe("accesslint-084", () => {
  it("passes valid headers attribute", () => {
    const doc = makeDoc(`
      <table>
        <tr><th id="name">Name</th><th id="age">Age</th></tr>
        <tr><td headers="name">John</td><td headers="age">30</td></tr>
      </table>
    `);
    expect(tdHeadersAttr.run(doc)).toHaveLength(0);
  });

  it("reports invalid headers reference", () => {
    const doc = makeDoc(`
      <table>
        <tr><th id="name">Name</th></tr>
        <tr><td headers="invalid">John</td></tr>
      </table>
    `);
    const violations = tdHeadersAttr.run(doc);
    expect(violations).toHaveLength(1);
    expect(violations[0].message).toContain("invalid");
  });

  it("passes multiple valid headers", () => {
    const doc = makeDoc(`
      <table>
        <tr><th id="name">Name</th><th id="type">Type</th></tr>
        <tr><td headers="name type">John Developer</td></tr>
      </table>
    `);
    expect(tdHeadersAttr.run(doc)).toHaveLength(0);
  });
});

describe("accesslint-085", () => {
  it("passes table with headers and data", () => {
    const doc = makeDoc(`
      <table>
        <tr><th>Name</th><th>Age</th></tr>
        <tr><td>John</td><td>30</td></tr>
      </table>
    `);
    expect(thHasDataCells.run(doc)).toHaveLength(0);
  });

  it("reports table with only headers", () => {
    const doc = makeDoc(`
      <table>
        <tr><th>Col 1</th><th>Col 2</th></tr>
        <tr><th>Row 1</th><th>Row 2</th></tr>
      </table>
    `);
    const violations = thHasDataCells.run(doc);
    expect(violations).toHaveLength(1);
  });

  it("skips presentational tables", () => {
    const doc = makeDoc(`
      <table role="presentation">
        <tr><th>Header</th></tr>
      </table>
    `);
    expect(thHasDataCells.run(doc)).toHaveLength(0);
  });
});

describe("accesslint-086", () => {
  it("passes small table without explicit headers", () => {
    const doc = makeDoc(`
      <table>
        <tr><th>A</th><th>B</th></tr>
        <tr><td>1</td><td>2</td></tr>
      </table>
    `);
    // 2x2 table - small, passes
    expect(tdHasHeader.run(doc)).toHaveLength(0);
  });

  it("passes large table with scoped headers", () => {
    const doc = makeDoc(`
      <table>
        <tr><th scope="col">A</th><th scope="col">B</th><th scope="col">C</th><th scope="col">D</th></tr>
        <tr><td>1</td><td>2</td><td>3</td><td>4</td></tr>
        <tr><td>5</td><td>6</td><td>7</td><td>8</td></tr>
        <tr><td>9</td><td>10</td><td>11</td><td>12</td></tr>
        <tr><td>13</td><td>14</td><td>15</td><td>16</td></tr>
      </table>
    `);
    expect(tdHasHeader.run(doc)).toHaveLength(0);
  });

  it("skips presentational tables", () => {
    const doc = makeDoc(`
      <table role="presentation">
        <tr><td>A</td><td>B</td><td>C</td><td>D</td></tr>
        <tr><td>1</td><td>2</td><td>3</td><td>4</td></tr>
      </table>
    `);
    expect(tdHasHeader.run(doc)).toHaveLength(0);
  });
});

describe("accesslint-087", () => {
  it("passes valid scope values", () => {
    const doc = makeDoc(`
      <table>
        <tr><th scope="col">Name</th><th scope="col">Age</th></tr>
        <tr><th scope="row">John</th><td>30</td></tr>
      </table>
    `);
    expect(scopeAttrValid.run(doc)).toHaveLength(0);
  });

  it("reports invalid scope value", () => {
    const doc = makeDoc(`
      <table>
        <tr><th scope="column">Name</th></tr>
      </table>
    `);
    const violations = scopeAttrValid.run(doc);
    expect(violations).toHaveLength(1);
    expect(violations[0].message).toContain("column");
  });

  it("passes rowgroup and colgroup", () => {
    const doc = makeDoc(`
      <table>
        <tr><th scope="colgroup" colspan="2">Group</th></tr>
        <tr><th scope="rowgroup">Subgroup</th><td>Data</td></tr>
      </table>
    `);
    expect(scopeAttrValid.run(doc)).toHaveLength(0);
  });

  it("is case-insensitive", () => {
    const doc = makeDoc(`
      <table>
        <tr><th scope="COL">Name</th></tr>
      </table>
    `);
    expect(scopeAttrValid.run(doc)).toHaveLength(0);
  });
});

describe("accesslint-088", () => {
  it("passes header with text", () => {
    const doc = makeDoc(`
      <table>
        <tr><th>Name</th><th>Age</th></tr>
      </table>
    `);
    expect(emptyTableHeader.run(doc)).toHaveLength(0);
  });

  it("reports empty header", () => {
    const doc = makeDoc(`
      <table>
        <tr><th></th><th>Name</th></tr>
      </table>
    `);
    const violations = emptyTableHeader.run(doc);
    expect(violations).toHaveLength(1);
    expect(violations[0].ruleId).toBe("accesslint-088");
  });

  it("passes header with aria-label", () => {
    const doc = makeDoc(`
      <table>
        <tr><th aria-label="Select all"></th><th>Name</th></tr>
      </table>
    `);
    expect(emptyTableHeader.run(doc)).toHaveLength(0);
  });

  it("reports whitespace-only header", () => {
    const doc = makeDoc(`
      <table>
        <tr><th>   </th><th>Name</th></tr>
      </table>
    `);
    const violations = emptyTableHeader.run(doc);
    expect(violations).toHaveLength(1);
  });

  it("skips presentational tables", () => {
    const doc = makeDoc(`
      <table role="none">
        <tr><th></th></tr>
      </table>
    `);
    expect(emptyTableHeader.run(doc)).toHaveLength(0);
  });

  it("skips aria-hidden headers", () => {
    const doc = makeDoc(`
      <table>
        <tr><th aria-hidden="true"></th></tr>
      </table>
    `);
    expect(emptyTableHeader.run(doc)).toHaveLength(0);
  });
});
