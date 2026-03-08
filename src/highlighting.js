export function getPlainTextFromHtml(html) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  return doc.body.textContent ?? "";
}

export function buildHighlightPayloadFromOffsets(
  fullText,
  startOffset,
  endOffset,
  contextLength = 50,
) {
  return {
    selected_text: fullText.slice(startOffset, endOffset),
    text_before: fullText.slice(Math.max(0, startOffset - contextLength), startOffset),
    text_after: fullText.slice(endOffset, endOffset + contextLength),
  };
}

export function findAnchoredRange(fullText, highlight) {
  const selectedText = highlight?.selected_text ?? "";
  const before = highlight?.text_before ?? "";
  const after = highlight?.text_after ?? "";

  if (!selectedText) {
    return null;
  }

  let searchFrom = 0;
  while (searchFrom <= fullText.length) {
    const index = fullText.indexOf(selectedText, searchFrom);
    if (index === -1) {
      return null;
    }

    const beforeWindow = fullText.slice(Math.max(0, index - before.length), index);
    const afterWindow = fullText.slice(
      index + selectedText.length,
      index + selectedText.length + after.length,
    );

    const beforeMatches = before.length === 0 || beforeWindow.endsWith(before);
    const afterMatches = after.length === 0 || afterWindow.startsWith(after);

    if (beforeMatches && afterMatches) {
      return { start: index, end: index + selectedText.length };
    }

    searchFrom = index + 1;
  }

  return null;
}

function locateTextPosition(rootNode, globalOffset) {
  const walker = document.createTreeWalker(rootNode, NodeFilter.SHOW_TEXT);
  let traversed = 0;
  let current;
  let lastTextNode = null;

  // eslint-disable-next-line no-cond-assign
  while ((current = walker.nextNode())) {
    lastTextNode = current;
    const nodeLength = current.textContent?.length ?? 0;
    if (globalOffset <= traversed + nodeLength) {
      return {
        node: current,
        offset: Math.max(0, globalOffset - traversed),
      };
    }
    traversed += nodeLength;
  }

  if (!lastTextNode) {
    return null;
  }

  return {
    node: lastTextNode,
    offset: lastTextNode.textContent?.length ?? 0,
  };
}

function wrapRangeInMark(doc, start, end, id) {
  const startPosition = locateTextPosition(doc.body, start);
  const endPosition = locateTextPosition(doc.body, end);

  if (!startPosition || !endPosition) {
    return false;
  }

  if (
    startPosition.node === endPosition.node &&
    startPosition.offset >= endPosition.offset
  ) {
    return false;
  }

  const range = doc.createRange();
  range.setStart(startPosition.node, startPosition.offset);
  range.setEnd(endPosition.node, endPosition.offset);

  const mark = doc.createElement("mark");
  mark.className = "lesson-highlight";
  mark.setAttribute("data-id", String(id));
  mark.setAttribute("title", "Click to delete highlight");

  const fragment = range.extractContents();
  mark.appendChild(fragment);
  range.insertNode(mark);
  return true;
}

export function applyHighlightsToHtml(html, highlights) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const fullText = doc.body.textContent ?? "";

  const anchored = (highlights ?? [])
    .map((highlight) => {
      const range = findAnchoredRange(fullText, highlight);
      if (!range) return null;
      return { ...highlight, ...range };
    })
    .filter(Boolean)
    .sort((a, b) => a.start - b.start);

  let previousEnd = -1;
  for (const highlight of anchored) {
    if (highlight.start < previousEnd) {
      // Skip overlaps in this MVP implementation.
      continue;
    }

    const success = wrapRangeInMark(doc, highlight.start, highlight.end, highlight.id);
    if (success) {
      previousEnd = highlight.end;
    }
  }

  return doc.body.innerHTML;
}
