const path = require("node:path");
const Database = require("better-sqlite3");

const dbPath = path.join(process.cwd(), "database.db");
const db = new Database(dbPath);

db.pragma("journal_mode = WAL");
db.exec(`
  CREATE TABLE IF NOT EXISTS highlights (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lesson_id TEXT NOT NULL,
    selected_text TEXT NOT NULL,
    text_before TEXT NOT NULL,
    text_after TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
`);

const getHighlightsStmt = db.prepare(
  `
    SELECT id, lesson_id, selected_text, text_before, text_after, created_at
    FROM highlights
    WHERE lesson_id = ?
    ORDER BY id ASC
  `,
);

const createHighlightStmt = db.prepare(
  `
    INSERT INTO highlights (lesson_id, selected_text, text_before, text_after)
    VALUES (?, ?, ?, ?)
  `,
);

const getHighlightByIdStmt = db.prepare(
  `
    SELECT id, lesson_id, selected_text, text_before, text_after, created_at
    FROM highlights
    WHERE id = ?
  `,
);

const deleteHighlightStmt = db.prepare(
  `
    DELETE FROM highlights
    WHERE id = ?
  `,
);

function getHighlightsByLessonId(lessonId) {
  return getHighlightsStmt.all(lessonId);
}

function createHighlight({ lesson_id, selected_text, text_before, text_after }) {
  const result = createHighlightStmt.run(
    lesson_id,
    selected_text,
    text_before,
    text_after,
  );

  return getHighlightByIdStmt.get(result.lastInsertRowid);
}

function deleteHighlightById(id) {
  const result = deleteHighlightStmt.run(id);
  return result.changes > 0;
}

module.exports = {
  db,
  getHighlightsByLessonId,
  createHighlight,
  deleteHighlightById,
};
