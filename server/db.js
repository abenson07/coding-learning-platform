const { db } = require("./knex");
const { DEFAULT_USER_ID } = require("./constants");

async function getLessonBySlug(slug, userId = DEFAULT_USER_ID) {
  return db("lessons")
    .select("id", "slug", "title", "content", "version")
    .where({
      slug,
      user_id: userId,
    })
    .whereNull("deleted_at")
    .first();
}

async function getHighlightsByLessonId(lessonId, userId = DEFAULT_USER_ID) {
  return db("highlights")
    .select("id", "lesson_id", "selected_text", "text_before", "text_after", "created_at")
    .where({
      lesson_id: lessonId,
      user_id: userId,
    })
    .whereNull("deleted_at")
    .orderBy("id", "asc");
}

async function createHighlight(
  { lesson_id, selected_text, text_before, text_after },
  userId = DEFAULT_USER_ID,
) {
  const [created] = await db("highlights")
    .insert({
      user_id: userId,
      lesson_id,
      selected_text,
      text_before,
      text_after,
    })
    .returning(["id", "lesson_id", "selected_text", "text_before", "text_after", "created_at"]);

  return created;
}

async function deleteHighlightById(id, userId = DEFAULT_USER_ID) {
  const deletedCount = await db("highlights")
    .where({
      id,
      user_id: userId,
    })
    .whereNull("deleted_at")
    .update({
      deleted_at: db.fn.now(),
      updated_at: db.fn.now(),
    });

  return deletedCount > 0;
}

async function checkDatabaseHealth() {
  await db.raw("select 1 as ok");
  return true;
}

module.exports = {
  db,
  getLessonBySlug,
  getHighlightsByLessonId,
  createHighlight,
  deleteHighlightById,
  checkDatabaseHealth,
};
