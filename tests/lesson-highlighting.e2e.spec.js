import { expect, test } from "@playwright/test";

async function clearHighlights(request) {
  const response = await request.get("/api/highlights/intro");
  const highlights = await response.json();

  for (const highlight of highlights) {
    await request.delete(`/api/highlights/${highlight.id}`);
  }
}

async function selectPhraseInParagraph(page, paragraphIndex, phrase) {
  const paragraph = page.locator(".lesson-content p").nth(paragraphIndex);
  await paragraph.evaluate((node, targetPhrase) => {
    const textNode = node.firstChild;
    if (!textNode || textNode.nodeType !== Node.TEXT_NODE) {
      throw new Error("Paragraph does not contain a text node");
    }

    const content = textNode.textContent ?? "";
    const start = content.indexOf(targetPhrase);
    if (start === -1) {
      throw new Error(`Could not find phrase: ${targetPhrase}`);
    }

    const range = document.createRange();
    range.setStart(textNode, start);
    range.setEnd(textNode, start + targetPhrase.length);

    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);

    node.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
  }, phrase);
}

test.describe("lesson highlighting acceptance flow", () => {
  test.beforeEach(async ({ request }) => {
    await clearHighlights(request);
  });

  test("creates, persists, reloads, and deletes highlights", async ({ page, request }) => {
    await page.goto("/");

    await expect(
      page.getByRole("heading", { name: "Introduction to JavaScript Functions" }),
    ).toBeVisible();
    await expect(page.locator(".lesson-content p")).toHaveCount(3);

    await selectPhraseInParagraph(page, 0, "reusable blocks of code");
    await page.getByRole("button", { name: "Highlight" }).click();
    await expect(page.locator("mark.lesson-highlight")).toHaveCount(1);

    await selectPhraseInParagraph(page, 1, "function expressions");
    await page.getByRole("button", { name: "Highlight" }).click();
    await expect(page.locator("mark.lesson-highlight")).toHaveCount(2);

    await page.reload();
    await expect(page.locator("mark.lesson-highlight")).toHaveCount(2);

    const recordsBeforeDelete = await (await request.get("/api/highlights/intro")).json();
    expect(recordsBeforeDelete).toHaveLength(2);

    await page.locator("mark.lesson-highlight").first().click();
    await page.getByRole("button", { name: "Delete" }).click();
    await expect(page.locator("mark.lesson-highlight")).toHaveCount(1);

    await page.reload();
    await expect(page.locator("mark.lesson-highlight")).toHaveCount(1);

    const recordsAfterDelete = await (await request.get("/api/highlights/intro")).json();
    expect(recordsAfterDelete).toHaveLength(1);
  });
});
