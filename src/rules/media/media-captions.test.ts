import { describe, it, expect } from "vitest";
import { videoCaptions, audioCaptions } from "./media-captions";
import { makeDoc } from "../test-helpers";

describe("accesslint-090", () => {
  it("reports video without captions track", () => {
    const doc = makeDoc('<html><body><video src="movie.mp4"></video></body></html>');
    const violations = videoCaptions.run(doc);
    expect(violations).toHaveLength(1);
    expect(violations[0].ruleId).toBe("accesslint-090");
  });

  it("passes video with captions track", () => {
    const doc = makeDoc(`
      <html><body>
        <video src="movie.mp4">
          <track kind="captions" src="captions.vtt">
        </video>
      </body></html>
    `);
    expect(videoCaptions.run(doc)).toHaveLength(0);
  });

  it("passes video with subtitles track", () => {
    const doc = makeDoc(`
      <html><body>
        <video src="movie.mp4">
          <track kind="subtitles" src="subs.vtt">
        </video>
      </body></html>
    `);
    // Subtitles are accepted as a valid caption alternative
    expect(videoCaptions.run(doc)).toHaveLength(0);
  });

  it("reports video with wrong track kind (descriptions)", () => {
    const doc = makeDoc(`
      <html><body>
        <video src="movie.mp4">
          <track kind="descriptions" src="desc.vtt">
        </video>
      </body></html>
    `);
    const violations = videoCaptions.run(doc);
    expect(violations).toHaveLength(1);
  });

  it("skips muted background videos", () => {
    const doc = makeDoc('<html><body><video src="bg.mp4" muted autoplay loop></video></body></html>');
    expect(videoCaptions.run(doc)).toHaveLength(0);
  });

  it("skips aria-hidden video", () => {
    const doc = makeDoc('<html><body><video src="movie.mp4" aria-hidden="true"></video></body></html>');
    expect(videoCaptions.run(doc)).toHaveLength(0);
  });

  it("skips computed-hidden video", () => {
    const doc = makeDoc('<html><body><video src="movie.mp4" style="display:none"></video></body></html>');
    expect(videoCaptions.run(doc)).toHaveLength(0);
  });

  it("skips autoplay-only video", () => {
    const doc = makeDoc('<html><body><video src="bg.mp4" autoplay></video></body></html>');
    expect(videoCaptions.run(doc)).toHaveLength(0);
  });
});

describe("accesslint-091", () => {
  it("reports audio without transcript", () => {
    // happy-dom doesn't apply UA stylesheet for audio, so explicit display is needed
    const doc = makeDoc('<html><body><audio src="podcast.mp3" controls style="display:block"></audio></body></html>');
    const violations = audioCaptions.run(doc);
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
    expect(audioCaptions.run(doc)).toHaveLength(0);
  });

  it("passes audio with descriptions track", () => {
    const doc = makeDoc(`
      <html><body>
        <audio src="podcast.mp3" controls>
          <track kind="descriptions" src="desc.vtt">
        </audio>
      </body></html>
    `);
    expect(audioCaptions.run(doc)).toHaveLength(0);
  });

  it("passes audio with aria-describedby", () => {
    const doc = makeDoc(`
      <html><body>
        <p id="transcript">Full transcript here...</p>
        <audio src="podcast.mp3" aria-describedby="transcript"></audio>
      </body></html>
    `);
    expect(audioCaptions.run(doc)).toHaveLength(0);
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
    expect(audioCaptions.run(doc)).toHaveLength(0);
  });

  it("skips aria-hidden audio", () => {
    const doc = makeDoc('<html><body><audio src="podcast.mp3" aria-hidden="true"></audio></body></html>');
    expect(audioCaptions.run(doc)).toHaveLength(0);
  });

  it("skips computed-hidden audio", () => {
    const doc = makeDoc('<html><body><audio src="podcast.mp3" style="display:none"></audio></body></html>');
    expect(audioCaptions.run(doc)).toHaveLength(0);
  });
});
