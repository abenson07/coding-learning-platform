const path = require("node:path");
const fs = require("node:fs");
const express = require("express");
const {
  getLessonBySlug,
  getHighlightsByLessonId,
  createHighlight,
  deleteHighlightById,
  checkDatabaseHealth,
} = require("./db");

const PORT = process.env.PORT ? Number(process.env.PORT) : 3765;
const app = express();

app.use(express.json());

app.get("/api/health", async (_req, res, next) => {
  try {
    await checkDatabaseHealth();
    res.status(200).json({ status: "ok" });
  } catch (error) {
    next(error);
  }
});

app.get("/api/lessons/intro", async (_req, res, next) => {
  try {
    const lesson = await getLessonBySlug("intro");
    if (!lesson) {
      return res.status(404).json({ error: "Lesson not found." });
    }
    return res.status(200).json(lesson);
  } catch (error) {
    return next(error);
  }
});

app.get("/api/highlights/:lessonId", async (req, res, next) => {
  try {
    const rows = await getHighlightsByLessonId(req.params.lessonId);
    return res.status(200).json(rows);
  } catch (error) {
    return next(error);
  }
});

app.post("/api/highlights", async (req, res, next) => {
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

  try {
    const created = await createHighlight({
      lesson_id: lesson_id.trim(),
      selected_text,
      text_before,
      text_after,
    });

    return res.status(201).json(created);
  } catch (error) {
    return next(error);
  }
});

app.delete("/api/highlights/:id", async (req, res, next) => {
  const id = Number.parseInt(req.params.id, 10);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: "Highlight id must be a positive integer." });
  }

  try {
    const deleted = await deleteHighlightById(id);
    if (!deleted) {
      return res.status(404).json({ error: "Highlight not found." });
    }

    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
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

module.exports = { app };
