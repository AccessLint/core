import { describe, it, expect } from "vitest";
import { accesslint091 } from "./accesslint-091";
import { makeDoc } from "../test-helpers";

describe("accesslint-091", () => {
  it("reports audio without transcript", () => {
    // happy-dom doesn't apply UA stylesheet for audio, so explicit display is needed
    const doc = makeDoc('<html><body><audio src="podcast.mp3" controls style="display:block"></audio></body></html>');
    const violations = accesslint091.run(doc);
    expect(violations).toHaveLength(1);
    expect(violations[0].ruleId).toBe("accesslint-091");
  });

  it("passes audio with captions track", () => {
    const doc = makeDoc(`
      <html><body>
        <audio src="podcast.mp3" controls>
          <track kind="captions" src="transcript.vtt">
        </audio>
      </body></html>
    `);
    expect(accesslint091.run(doc)).toHaveLength(0);
  });

  it("passes audio with descriptions track", () => {
    const doc = makeDoc(`
      <html><body>
        <audio src="podcast.mp3" controls>
          <track kind="descriptions" src="desc.vtt">
        </audio>
      </body></html>
    `);
    expect(accesslint091.run(doc)).toHaveLength(0);
  });

  it("passes audio with aria-describedby", () => {
    const doc = makeDoc(`
      <html><body>
        <p id="transcript">Full transcript here...</p>
        <audio src="podcast.mp3" aria-describedby="transcript"></audio>
      </body></html>
    `);
    expect(accesslint091.run(doc)).toHaveLength(0);
  });

  it("passes audio with nearby transcript link", () => {
    const doc = makeDoc(`
      <html><body>
        <div>
          <audio src="podcast.mp3" controls></audio>
          <a href="/transcript">View transcript</a>
        </div>
      </body></html>
    `);
    expect(accesslint091.run(doc)).toHaveLength(0);
  });

  it("skips aria-hidden audio", () => {
    const doc = makeDoc('<html><body><audio src="podcast.mp3" aria-hidden="true"></audio></body></html>');
    expect(accesslint091.run(doc)).toHaveLength(0);
  });

  it("skips computed-hidden audio", () => {
    const doc = makeDoc('<html><body><audio src="podcast.mp3" style="display:none"></audio></body></html>');
    expect(accesslint091.run(doc)).toHaveLength(0);
  });
});
