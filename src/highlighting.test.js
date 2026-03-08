import { describe, expect, it } from "vitest";
import {
  applyHighlightsToHtml,
  buildHighlightPayloadFromOffsets,
  findAnchoredRange,
  getPlainTextFromHtml,
} from "./highlighting";

describe("highlighting utilities", () => {
  it("builds payload with surrounding context", () => {
    const text = "Functions are reusable blocks of code.";
    const start = text.indexOf("reusable");
    const end = start + "reusable".length;

    const payload = buildHighlightPayloadFromOffsets(text, start, end, 6);
    expect(payload.selected_text).toBe("reusable");
    expect(payload.text_before).toBe("s are ");
    expect(payload.text_after).toBe(" block");
  });

  it("finds an anchored text range", () => {
    const text = "alpha beta gamma beta gamma";
    const highlight = {
      selected_text: "beta",
      text_before: "pha ",
      text_after: " gamm",
    };

    expect(findAnchoredRange(text, highlight)).toEqual({ start: 6, end: 10 });
  });

  it("applies highlight tags to lesson HTML", () => {
    const html = "<p>Functions are reusable blocks of code.</p>";
    const fullText = getPlainTextFromHtml(html);
    const start = fullText.indexOf("reusable");
    const payload = buildHighlightPayloadFromOffsets(
      fullText,
      start,
      start + "reusable".length,
    );

    const output = applyHighlightsToHtml(html, [{ id: 12, ...payload }]);
    expect(output).toContain('mark class="lesson-highlight" data-id="12"');
    expect(output).toContain("reusable");
  });

  it("fails gracefully when highlight cannot be matched", () => {
    const html = "<p>Arrow functions provide concise syntax.</p>";
    const output = applyHighlightsToHtml(html, [
      {
        id: 99,
        selected_text: "does-not-exist",
        text_before: "x",
        text_after: "y",
      },
    ]);

    expect(output).toBe("<p>Arrow functions provide concise syntax.</p>");
  });
});
