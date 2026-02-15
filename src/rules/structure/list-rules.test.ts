import { describe, it, expect } from "vitest";
import { list, dlitem, definitionList } from "./list-rules";

function makeDoc(html: string): Document {
  return new DOMParser().parseFromString(html, "text/html");
}

describe("accesslint-046", () => {
  it("passes valid ul", () => {
    const doc = makeDoc("<html><body><ul><li>A</li><li>B</li></ul></body></html>");
    expect(list.run(doc)).toHaveLength(0);
  });

  it("reports non-li child in ul", () => {
    const doc = makeDoc("<html><body><ul><div>Bad</div></ul></body></html>");
    expect(list.run(doc)).toHaveLength(1);
  });

  it("reports bare text node in ul", () => {
    const doc = makeDoc("<html><body><ul>Bare text<li>Item</li></ul></body></html>");
    const violations = list.run(doc);
    expect(violations).toHaveLength(1);
    expect(violations[0].message).toContain("text");
    expect(violations[0].message).toContain("<li>");
  });

  it("passes ul with only whitespace text nodes", () => {
    const doc = makeDoc("<html><body><ul> <li>A</li> <li>B</li> </ul></body></html>");
    expect(list.run(doc)).toHaveLength(0);
  });
});

describe("accesslint-048", () => {
  it("passes dt/dd inside dl", () => {
    const doc = makeDoc("<html><body><dl><dt>T</dt><dd>D</dd></dl></body></html>");
    expect(dlitem.run(doc)).toHaveLength(0);
  });

  it("reports dt outside dl", () => {
    const doc = makeDoc("<html><body><dt>Bad</dt></body></html>");
    expect(dlitem.run(doc)).toHaveLength(1);
  });
});

describe("accesslint-049", () => {
  it("passes valid dl", () => {
    const doc = makeDoc("<html><body><dl><dt>T</dt><dd>D</dd></dl></body></html>");
    expect(definitionList.run(doc)).toHaveLength(0);
  });

  it("reports invalid child in dl", () => {
    const doc = makeDoc("<html><body><dl><p>Bad</p></dl></body></html>");
    expect(definitionList.run(doc)).toHaveLength(1);
  });

  it("reports bare text node in dl", () => {
    const doc = makeDoc("<html><body><dl>Bare text<dt>T</dt><dd>D</dd></dl></body></html>");
    const violations = definitionList.run(doc);
    expect(violations).toHaveLength(1);
    expect(violations[0].message).toContain("<dt>");
  });
});
