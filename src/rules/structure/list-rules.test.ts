import { describe, it, expect } from "vitest";
import { list, dlitem, definitionList } from "./list-rules";

function makeDoc(html: string): Document {
  return new DOMParser().parseFromString(html, "text/html");
}

describe("list", () => {
  it("passes valid ul", () => {
    const doc = makeDoc("<html><body><ul><li>A</li><li>B</li></ul></body></html>");
    expect(list.run(doc)).toHaveLength(0);
  });

  it("reports non-li child in ul", () => {
    const doc = makeDoc("<html><body><ul><div>Bad</div></ul></body></html>");
    expect(list.run(doc)).toHaveLength(1);
  });
});

describe("dlitem", () => {
  it("passes dt/dd inside dl", () => {
    const doc = makeDoc("<html><body><dl><dt>T</dt><dd>D</dd></dl></body></html>");
    expect(dlitem.run(doc)).toHaveLength(0);
  });

  it("reports dt outside dl", () => {
    const doc = makeDoc("<html><body><dt>Bad</dt></body></html>");
    expect(dlitem.run(doc)).toHaveLength(1);
  });
});

describe("definition-list", () => {
  it("passes valid dl", () => {
    const doc = makeDoc("<html><body><dl><dt>T</dt><dd>D</dd></dl></body></html>");
    expect(definitionList.run(doc)).toHaveLength(0);
  });

  it("reports invalid child in dl", () => {
    const doc = makeDoc("<html><body><dl><p>Bad</p></dl></body></html>");
    expect(definitionList.run(doc)).toHaveLength(1);
  });
});
