import { describe, it, expect } from "vitest";
import { videoCaptions, audioCaptions } from "./media-captions";

function makeDoc(html: string): Document {
  return new DOMParser().parseFromString(html, "text/html");
}

describe("video-caption", () => {
  it("reports video without captions track", () => {
    const doc = makeDoc('<html><body><video src="movie.mp4"></video></body></html>');
    const violations = videoCaptions.run(doc);
    expect(violations).toHaveLength(1);
    expect(violations[0].ruleId).toBe("video-caption");
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
});

describe("audio-caption", () => {
  it("reports audio without transcript", () => {
    const doc = makeDoc('<html><body><audio src="podcast.mp3"></audio></body></html>');
    const violations = audioCaptions.run(doc);
    expect(violations).toHaveLength(1);
    expect(violations[0].ruleId).toBe("audio-caption");
  });

  it("passes audio with captions track", () => {
    const doc = makeDoc(`
      <html><body>
        <audio src="podcast.mp3">
          <track kind="captions" src="transcript.vtt">
        </audio>
      </body></html>
    `);
    expect(audioCaptions.run(doc)).toHaveLength(0);
  });

  it("passes audio with descriptions track", () => {
    const doc = makeDoc(`
      <html><body>
        <audio src="podcast.mp3">
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
          <audio src="podcast.mp3"></audio>
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
});
