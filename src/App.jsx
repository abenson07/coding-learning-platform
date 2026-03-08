import { useEffect, useMemo, useRef, useState } from "react";
import {
  applyHighlightsToHtml,
  buildHighlightPayloadFromOffsets,
  getPlainTextFromHtml,
} from "./highlighting";

function getRangeOffsetsWithinContainer(container, range) {
  const preSelectionRange = document.createRange();
  preSelectionRange.selectNodeContents(container);
  preSelectionRange.setEnd(range.startContainer, range.startOffset);
  const start = preSelectionRange.toString().length;
  const selectedLength = range.toString().length;

  return {
    start,
    end: start + selectedLength,
  };
}

async function requestJson(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) {
    let message = "Request failed";
    try {
      const data = await response.json();
      message = data.error ?? message;
    } catch {
      // Use fallback message when no JSON body is present.
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export default function App() {
  const contentRef = useRef(null);
  const [lesson, setLesson] = useState(null);
  const [highlights, setHighlights] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectionMenu, setSelectionMenu] = useState(null);
  const [deleteMenu, setDeleteMenu] = useState(null);

  const plainText = useMemo(() => getPlainTextFromHtml(lesson?.content ?? ""), [lesson]);

  const renderedLessonHtml = useMemo(() => {
    if (!lesson) {
      return "";
    }
    return applyHighlightsToHtml(lesson.content, highlights);
  }, [lesson, highlights]);

  async function fetchHighlights(lessonId) {
    const escapedLessonId =
      typeof CSS !== "undefined" && typeof CSS.escape === "function"
        ? CSS.escape(lessonId)
        : encodeURIComponent(lessonId);
    const records = await requestJson(`/api/highlights/${escapedLessonId}`);
    setHighlights(records);
  }

  async function loadLessonAndHighlights() {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const lessonData = await requestJson("/api/lessons/intro");
      setLesson(lessonData);
      await fetchHighlights(lessonData.id);
    } catch (error) {
      setErrorMessage(error.message || "Unable to load lesson.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadLessonAndHighlights();
  }, []);

  useEffect(() => {
    function dismissMenus(event) {
      const target = event.target;
      if (target instanceof HTMLElement && target.closest("[data-floating-menu='true']")) {
        return;
      }
      setSelectionMenu(null);
      setDeleteMenu(null);
    }

    document.addEventListener("mousedown", dismissMenus);
    return () => document.removeEventListener("mousedown", dismissMenus);
  }, []);

  function handleMouseUp() {
    const container = contentRef.current;
    const selection = window.getSelection();

    if (!container || !selection || selection.rangeCount === 0) {
      return;
    }

    const range = selection.getRangeAt(0);
    if (range.collapsed) {
      return;
    }

    if (!container.contains(range.commonAncestorContainer)) {
      return;
    }

    const selectedText = selection.toString().trim();
    if (!selectedText) {
      return;
    }

    const startElement =
      range.startContainer.nodeType === Node.TEXT_NODE
        ? range.startContainer.parentElement
        : range.startContainer;
    const endElement =
      range.endContainer.nodeType === Node.TEXT_NODE
        ? range.endContainer.parentElement
        : range.endContainer;
    if (
      startElement?.closest("mark.lesson-highlight") ||
      endElement?.closest("mark.lesson-highlight")
    ) {
      return;
    }

    const offsets = getRangeOffsetsWithinContainer(container, range);
    const payload = buildHighlightPayloadFromOffsets(plainText, offsets.start, offsets.end, 50);
    if (!payload.selected_text) {
      return;
    }

    const rect = range.getBoundingClientRect();
    setDeleteMenu(null);
    setSelectionMenu({
      payload,
      top: rect.top + window.scrollY - 42,
      left: rect.left + window.scrollX + rect.width / 2,
    });
  }

  async function createHighlight() {
    if (!lesson || !selectionMenu?.payload) {
      return;
    }

    try {
      setErrorMessage("");
      await requestJson("/api/highlights", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lesson_id: lesson.id,
          ...selectionMenu.payload,
        }),
      });
      await fetchHighlights(lesson.id);
    } catch (error) {
      setErrorMessage(error.message || "Unable to save highlight.");
    } finally {
      setSelectionMenu(null);
      window.getSelection()?.removeAllRanges();
    }
  }

  function maybeOpenDeleteMenu(event) {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }

    const mark = target.closest("mark.lesson-highlight");
    if (!mark) {
      return;
    }

    const id = Number.parseInt(mark.dataset.id ?? "", 10);
    if (!id) {
      return;
    }

    const rect = mark.getBoundingClientRect();
    setSelectionMenu(null);
    setDeleteMenu({
      id,
      top: rect.top + window.scrollY - 38,
      left: rect.right + window.scrollX + 8,
    });
  }

  async function deleteHighlight(id) {
    if (!lesson) {
      return;
    }

    try {
      setErrorMessage("");
      await requestJson(`/api/highlights/${id}`, { method: "DELETE" });
      await fetchHighlights(lesson.id);
    } catch (error) {
      setErrorMessage(error.message || "Unable to delete highlight.");
    } finally {
      setDeleteMenu(null);
    }
  }

  if (isLoading) {
    return (
      <main className="mx-auto flex min-h-screen max-w-5xl items-start px-6 py-12">
        <p className="text-sm text-slate-600">Loading lesson...</p>
      </main>
    );
  }

  if (errorMessage && !lesson) {
    return (
      <main className="mx-auto flex min-h-screen max-w-5xl items-start px-6 py-12">
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{errorMessage}</p>
      </main>
    );
  }

  return (
    <main className="mx-auto grid min-h-screen max-w-6xl grid-cols-1 gap-10 px-6 py-10 lg:grid-cols-[1fr_320px]">
      <section className="relative">
        <header className="mb-6">
          <p className="mb-3 text-sm text-slate-500">&larr; All projects</p>
          <h1 className="text-4xl font-semibold text-slate-900">{lesson?.title}</h1>
          <p className="mt-2 text-sm text-slate-500">Example lesson</p>
        </header>

        {errorMessage ? (
          <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {errorMessage}
          </p>
        ) : null}

        <article
          ref={contentRef}
          className="lesson-content rounded-xl border border-slate-200 bg-white p-8 shadow-sm"
          onMouseUp={handleMouseUp}
          onMouseEnter={maybeOpenDeleteMenu}
          onMouseOver={maybeOpenDeleteMenu}
          onClick={maybeOpenDeleteMenu}
          dangerouslySetInnerHTML={{ __html: renderedLessonHtml }}
        />
      </section>

      <aside className="h-fit rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-medium text-slate-900">Project context</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Add relevant context for your project and store it alongside the lesson.
        </p>
        <dl className="mt-6 space-y-4 text-sm">
          <div>
            <dt className="font-medium text-slate-800">Memory</dt>
            <dd className="mt-1 text-slate-600">
              Keep language concise and direct, with minimal conversational overhead.
            </dd>
          </div>
          <div>
            <dt className="font-medium text-slate-800">Highlights</dt>
            <dd className="mt-1 text-slate-600">{highlights.length} stored for this lesson</dd>
          </div>
        </dl>
      </aside>

      {selectionMenu ? (
        <button
          data-floating-menu="true"
          type="button"
          className="floating-action-button"
          style={{ top: `${selectionMenu.top}px`, left: `${selectionMenu.left}px` }}
          onClick={createHighlight}
        >
          Highlight
        </button>
      ) : null}

      {deleteMenu ? (
        <button
          data-floating-menu="true"
          type="button"
          className="floating-delete-button"
          style={{ top: `${deleteMenu.top}px`, left: `${deleteMenu.left}px` }}
          onClick={() => deleteHighlight(deleteMenu.id)}
        >
          Delete
        </button>
      ) : null}
    </main>
  );
}
