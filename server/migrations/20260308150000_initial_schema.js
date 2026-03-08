/**
 * @param {import("knex").Knex} knex
 */
exports.up = async function up(knex) {
  const addAuditColumns = (table) => {
    table.timestamp("created_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp("updated_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp("deleted_at", { useTz: true }).nullable();
  };

  await knex.schema.createTable("users", (table) => {
    table.uuid("id").primary();
    table.string("email", 255).notNullable().unique();
    table.string("full_name", 255).notNullable();
    addAuditColumns(table);
  });

  await knex.schema.createTable("categories", (table) => {
    table.string("id", 80).primary();
    table.uuid("user_id").notNullable().references("id").inTable("users").onDelete("CASCADE");
    table.string("name", 120).notNullable();
    table.text("description").notNullable();
    addAuditColumns(table);
    table.unique(["user_id", "name"]);
    table.index(["user_id", "deleted_at"], "categories_user_deleted_idx");
  });

  await knex.schema.createTable("lessons", (table) => {
    table.string("id", 80).primary();
    table.uuid("user_id").notNullable().references("id").inTable("users").onDelete("CASCADE");
    table.string("category_id", 80).notNullable().references("id").inTable("categories");
    table.string("slug", 120).notNullable();
    table.string("title", 255).notNullable();
    table.text("content").notNullable();
    table.integer("version").notNullable().defaultTo(1);
    addAuditColumns(table);
    table.unique(["user_id", "slug"]);
    table.index(["category_id"], "lessons_category_idx");
    table.index(["user_id", "deleted_at"], "lessons_user_deleted_idx");
  });

  await knex.schema.createTable("highlights", (table) => {
    table.bigIncrements("id").primary();
    table.uuid("user_id").notNullable().references("id").inTable("users").onDelete("CASCADE");
    table.string("lesson_id", 80).notNullable().references("id").inTable("lessons").onDelete("CASCADE");
    table.text("selected_text").notNullable();
    table.text("text_before").notNullable();
    table.text("text_after").notNullable();
    addAuditColumns(table);
    table.index(["lesson_id", "deleted_at"], "highlights_lesson_deleted_idx");
    table.index(["user_id", "deleted_at"], "highlights_user_deleted_idx");
  });

  await knex.schema.createTable("comments", (table) => {
    table.bigIncrements("id").primary();
    table.uuid("user_id").notNullable().references("id").inTable("users").onDelete("CASCADE");
    table.string("lesson_id", 80).notNullable().references("id").inTable("lessons").onDelete("CASCADE");
    table.bigInteger("highlight_id").nullable().references("id").inTable("highlights").onDelete("SET NULL");
    table.text("body").notNullable();
    addAuditColumns(table);
    table.index(["lesson_id", "deleted_at"], "comments_lesson_deleted_idx");
  });

  await knex.schema.createTable("llm_responses", (table) => {
    table.bigIncrements("id").primary();
    table.uuid("user_id").notNullable().references("id").inTable("users").onDelete("CASCADE");
    table.string("lesson_id", 80).nullable().references("id").inTable("lessons").onDelete("SET NULL");
    table.text("prompt").notNullable();
    table.text("response").notNullable();
    table.jsonb("metadata").notNullable().defaultTo("{}");
    addAuditColumns(table);
    table.index(["user_id", "deleted_at"], "llm_responses_user_deleted_idx");
  });

  await knex.schema.createTable("quizzes", (table) => {
    table.bigIncrements("id").primary();
    table.uuid("user_id").notNullable().references("id").inTable("users").onDelete("CASCADE");
    table.string("lesson_id", 80).notNullable().references("id").inTable("lessons").onDelete("CASCADE");
    table.string("title", 255).notNullable();
    table.jsonb("questions").notNullable();
    addAuditColumns(table);
    table.index(["lesson_id", "deleted_at"], "quizzes_lesson_deleted_idx");
  });

  await knex.schema.createTable("quiz_attempts", (table) => {
    table.bigIncrements("id").primary();
    table.uuid("user_id").notNullable().references("id").inTable("users").onDelete("CASCADE");
    table.bigInteger("quiz_id").notNullable().references("id").inTable("quizzes").onDelete("CASCADE");
    table.float("score").nullable();
    table.jsonb("answers").notNullable().defaultTo("{}");
    table.timestamp("submitted_at", { useTz: true }).nullable();
    addAuditColumns(table);
    table.index(["quiz_id", "deleted_at"], "quiz_attempts_quiz_deleted_idx");
    table.index(["user_id", "deleted_at"], "quiz_attempts_user_deleted_idx");
  });

  await knex.schema.createTable("tasks", (table) => {
    table.bigIncrements("id").primary();
    table.uuid("user_id").notNullable().references("id").inTable("users").onDelete("CASCADE");
    table.string("lesson_id", 80).nullable().references("id").inTable("lessons").onDelete("SET NULL");
    table.string("title", 255).notNullable();
    table.text("details").notNullable().defaultTo("");
    table.string("status", 32).notNullable().defaultTo("todo");
    table.timestamp("due_at", { useTz: true }).nullable();
    addAuditColumns(table);
    table.index(["user_id", "status", "deleted_at"], "tasks_user_status_deleted_idx");
  });

  await knex.schema.createTable("progress", (table) => {
    table.bigIncrements("id").primary();
    table.uuid("user_id").notNullable().references("id").inTable("users").onDelete("CASCADE");
    table.string("lesson_id", 80).notNullable().references("id").inTable("lessons").onDelete("CASCADE");
    table.integer("completion_percent").notNullable().defaultTo(0);
    table.timestamp("last_viewed_at", { useTz: true }).nullable();
    table.timestamp("completed_at", { useTz: true }).nullable();
    addAuditColumns(table);
    table.unique(["user_id", "lesson_id"]);
    table.index(["user_id", "deleted_at"], "progress_user_deleted_idx");
  });
};

/**
 * @param {import("knex").Knex} knex
 */
exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists("progress");
  await knex.schema.dropTableIfExists("tasks");
  await knex.schema.dropTableIfExists("quiz_attempts");
  await knex.schema.dropTableIfExists("quizzes");
  await knex.schema.dropTableIfExists("llm_responses");
  await knex.schema.dropTableIfExists("comments");
  await knex.schema.dropTableIfExists("highlights");
  await knex.schema.dropTableIfExists("lessons");
  await knex.schema.dropTableIfExists("categories");
  await knex.schema.dropTableIfExists("users");
};
