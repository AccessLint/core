import { describe, it, expect } from "vitest";
import { makeDoc } from "../test-helpers";
import {
  ariaCommandName,
  ariaInputFieldName,
  ariaToggleFieldName,
  ariaMeterName,
  ariaProgressbarName,
  ariaDialogName,
  ariaTooltipName,
  ariaTreeitemName,
} from "./aria-name-rules";


describe("accesslint-064", () => {
  it("passes command with text", () => {
    const doc = makeDoc('<div role="button">Click me</div>');
    expect(ariaCommandName.run(doc)).toHaveLength(0);
  });

  it("passes command with aria-label", () => {
    const doc = makeDoc('<div role="button" aria-label="Close"></div>');
    expect(ariaCommandName.run(doc)).toHaveLength(0);
  });

  it("reports command without name", () => {
    const doc = makeDoc('<div role="button"></div>');
    const violations = ariaCommandName.run(doc);
    expect(violations).toHaveLength(1);
  });

  it("skips native buttons (handled by button-name)", () => {
    const doc = makeDoc("<button></button>");
    expect(ariaCommandName.run(doc)).toHaveLength(0);
  });

  it("passes menuitem with name", () => {
    const doc = makeDoc('<div role="menuitem">Edit</div>');
    expect(ariaCommandName.run(doc)).toHaveLength(0);
  });

  it("passes command with img alt inside", () => {
    const doc = makeDoc('<div role="button"><img src="x.png" alt="Icon"></div>');
    expect(ariaCommandName.run(doc)).toHaveLength(0);
  });
});

describe("accesslint-065", () => {
  it("passes textbox with aria-label", () => {
    const doc = makeDoc('<div role="textbox" aria-label="Username"></div>');
    expect(ariaInputFieldName.run(doc)).toHaveLength(0);
  });

  it("reports textbox without name", () => {
    const doc = makeDoc('<div role="textbox"></div>');
    const violations = ariaInputFieldName.run(doc);
    expect(violations).toHaveLength(1);
  });

  it("passes combobox with name", () => {
    const doc = makeDoc('<div role="combobox" aria-label="Country"></div>');
    expect(ariaInputFieldName.run(doc)).toHaveLength(0);
  });

  it("reports slider without name", () => {
    const doc = makeDoc('<div role="slider" aria-valuenow="50"></div>');
    const violations = ariaInputFieldName.run(doc);
    expect(violations).toHaveLength(1);
  });

  it("skips native inputs (handled by label rule)", () => {
    const doc = makeDoc('<input type="text">');
    expect(ariaInputFieldName.run(doc)).toHaveLength(0);
  });
});

describe("accesslint-066", () => {
  it("passes checkbox with name", () => {
    const doc = makeDoc('<div role="checkbox" aria-checked="false">Subscribe</div>');
    expect(ariaToggleFieldName.run(doc)).toHaveLength(0);
  });

  it("reports checkbox without name", () => {
    const doc = makeDoc('<div role="checkbox" aria-checked="false"></div>');
    const violations = ariaToggleFieldName.run(doc);
    expect(violations).toHaveLength(1);
  });

  it("passes switch with aria-label", () => {
    const doc = makeDoc('<div role="switch" aria-checked="true" aria-label="Dark mode"></div>');
    expect(ariaToggleFieldName.run(doc)).toHaveLength(0);
  });

  it("skips native checkboxes", () => {
    const doc = makeDoc('<input type="checkbox">');
    expect(ariaToggleFieldName.run(doc)).toHaveLength(0);
  });
});

describe("accesslint-067", () => {
  it("passes meter with aria-label", () => {
    const doc = makeDoc('<div role="meter" aria-valuenow="70" aria-label="Battery level"></div>');
    expect(ariaMeterName.run(doc)).toHaveLength(0);
  });

  it("reports meter without name", () => {
    const doc = makeDoc('<div role="meter" aria-valuenow="70"></div>');
    const violations = ariaMeterName.run(doc);
    expect(violations).toHaveLength(1);
  });

  it("passes native meter with aria-label", () => {
    const doc = makeDoc('<meter value="0.7" aria-label="Progress"></meter>');
    expect(ariaMeterName.run(doc)).toHaveLength(0);
  });
});

describe("accesslint-068", () => {
  it("passes progressbar with aria-label", () => {
    const doc = makeDoc('<div role="progressbar" aria-valuenow="50" aria-label="Upload progress"></div>');
    expect(ariaProgressbarName.run(doc)).toHaveLength(0);
  });

  it("reports progressbar without name", () => {
    const doc = makeDoc('<div role="progressbar" aria-valuenow="50"></div>');
    const violations = ariaProgressbarName.run(doc);
    expect(violations).toHaveLength(1);
  });
});

describe("accesslint-069", () => {
  it("passes dialog with aria-label", () => {
    const doc = makeDoc('<div role="dialog" aria-label="Confirm action"></div>');
    expect(ariaDialogName.run(doc)).toHaveLength(0);
  });

  it("passes dialog with aria-labelledby", () => {
    const doc = makeDoc('<div role="dialog" aria-labelledby="title"><h2 id="title">Settings</h2></div>');
    expect(ariaDialogName.run(doc)).toHaveLength(0);
  });

  it("reports empty dialog without name", () => {
    const doc = makeDoc('<div role="dialog"></div>');
    const violations = ariaDialogName.run(doc);
    expect(violations).toHaveLength(1);
  });

  it("checks alertdialog", () => {
    const doc = makeDoc('<div role="alertdialog"></div>');
    const violations = ariaDialogName.run(doc);
    expect(violations).toHaveLength(1);
  });

  it("passes native dialog with aria-label", () => {
    const doc = makeDoc('<dialog aria-label="Settings"><p>Content</p></dialog>');
    expect(ariaDialogName.run(doc)).toHaveLength(0);
  });
});

describe("accesslint-070", () => {
  it("passes tooltip with text content", () => {
    const doc = makeDoc('<div role="tooltip">Helpful hint</div>');
    expect(ariaTooltipName.run(doc)).toHaveLength(0);
  });

  it("reports empty tooltip", () => {
    const doc = makeDoc('<div role="tooltip"></div>');
    const violations = ariaTooltipName.run(doc);
    expect(violations).toHaveLength(1);
  });
});

describe("accesslint-071", () => {
  it("passes treeitem with text", () => {
    const doc = makeDoc('<div role="treeitem">Documents</div>');
    expect(ariaTreeitemName.run(doc)).toHaveLength(0);
  });

  it("reports treeitem without name", () => {
    const doc = makeDoc('<div role="treeitem"></div>');
    const violations = ariaTreeitemName.run(doc);
    expect(violations).toHaveLength(1);
  });
});
