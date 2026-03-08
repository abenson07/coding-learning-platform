const path = require("node:path");
const fs = require("node:fs");
const express = require("express");
const {
  getHighlightsByLessonId,
  createHighlight,
  deleteHighlightById,
} = require("./db");

const PORT = process.env.PORT ? Number(process.env.PORT) : 3765;
const app = express();

const lesson = {
  id: "intro",
  title: "Introduction to JavaScript Functions",
  content:
    "<p>Functions are reusable blocks of code that let you organize logic into named units. You can call a function as many times as needed to avoid repeating yourself and keep code easier to maintain.</p>" +
    "<p>There are several ways to define functions in JavaScript, including function declarations, function expressions, and methods on objects. Each style is useful in different situations.</p>" +
    "<p>Arrow functions provide a concise syntax and lexical <code>this</code> behavior, which can simplify callback-heavy code. They are common in modern JavaScript, especially in React applications.</p>",
};

app.use(express.json());

app.get("/api/lessons/intro", (_req, res) => {
  res.status(200).json(lesson);
});

app.get("/api/highlights/:lessonId", (req, res) => {
  const rows = getHighlightsByLessonId(req.params.lessonId);
  res.status(200).json(rows);
});

app.post("/api/highlights", (req, res) => {
  const { lesson_id, selected_text, text_before, text_after } = req.body ?? {};

  if (
    typeof lesson_id !== "string" ||
    typeof selected_text !== "string" ||
    typeof text_before !== "string" ||
    typeof text_after !== "string" ||
    lesson_id.trim() === "" ||
    selected_text.trim() === ""
  ) {
    return res.status(400).json({
      error:
        "Invalid payload. Expected lesson_id, selected_text, text_before, and text_after.",
    });
  }

  const created = createHighlight({
    lesson_id: lesson_id.trim(),
    selected_text,
    text_before,
    text_after,
  });

  return res.status(201).json(created);
});

app.delete("/api/highlights/:id", (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: "Highlight id must be a positive integer." });
  }

  const deleted = deleteHighlightById(id);
  if (!deleted) {
    return res.status(404).json({ error: "Highlight not found." });
  }

  return res.status(204).send();
});

const distPath = path.join(process.cwd(), "dist");
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get(/.*/, (_req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
  });
}

module.exports = { app, lesson };
