const { DEFAULT_USER_ID } = require("../constants");

/**
 * @param {import("knex").Knex} knex
 */
exports.seed = async function seed(knex) {
  await knex("progress").del();
  await knex("quiz_attempts").del();
  await knex("quizzes").del();
  await knex("comments").del();
  await knex("highlights").del();
  await knex("llm_responses").del();
  await knex("tasks").del();
  await knex("lessons").del();
  await knex("categories").del();
  await knex("users").del();

  await knex("users").insert({
    id: DEFAULT_USER_ID,
    email: "ian@example.com",
    full_name: "Ian Learner",
  });

  await knex("categories").insert([
    {
      id: "javascript-fundamentals",
      user_id: DEFAULT_USER_ID,
      name: "JavaScript Fundamentals",
      description: "Core JavaScript concepts that power modern web applications.",
    },
    {
      id: "frontend-engineering",
      user_id: DEFAULT_USER_ID,
      name: "Frontend Engineering",
      description: "Patterns for building maintainable, user-friendly interfaces.",
    },
    {
      id: "backend-architecture",
      user_id: DEFAULT_USER_ID,
      name: "Backend Architecture",
      description: "Reliable API and data design for production services.",
    },
  ]);

  await knex("lessons").insert([
    {
      id: "intro",
      user_id: DEFAULT_USER_ID,
      category_id: "javascript-fundamentals",
      slug: "intro",
      title: "Introduction to JavaScript Functions",
      version: 1,
      content:
        "<p>Functions are reusable blocks of code that let you organize logic into named units. You can call a function as many times as needed to avoid repeating yourself and keep code easier to maintain.</p>" +
        "<p>There are several ways to define functions in JavaScript, including function declarations, function expressions, and methods on objects. Each style is useful in different situations.</p>" +
        "<p>Arrow functions provide a concise syntax and lexical <code>this</code> behavior, which can simplify callback-heavy code. They are common in modern JavaScript, especially in React applications.</p>",
    },
    {
      id: "js-arrays-map-filter-reduce",
      user_id: DEFAULT_USER_ID,
      category_id: "javascript-fundamentals",
      slug: "js-arrays-map-filter-reduce",
      title: "Array Transformations with map, filter, and reduce",
      version: 1,
      content:
        "<p>Array helpers make data transformations expressive and easy to read. Use <code>map</code> to transform each element, <code>filter</code> to keep matching items, and <code>reduce</code> to build a single result.</p>" +
        "<p>Composing these methods encourages immutable, predictable logic. It also makes unit testing easier because each step has a clear input and output.</p>",
    },
    {
      id: "react-state-and-effects",
      user_id: DEFAULT_USER_ID,
      category_id: "frontend-engineering",
      slug: "react-state-and-effects",
      title: "Managing State and Effects in React",
      version: 1,
      content:
        "<p>React state stores data that drives your UI. Keep state close to where it is used, and derive values when possible instead of duplicating information.</p>" +
        "<p><code>useEffect</code> is for synchronizing with external systems such as APIs, timers, and subscriptions. Prefer clear dependencies and cleanup to avoid stale behavior.</p>",
    },
    {
      id: "api-error-handling-patterns",
      user_id: DEFAULT_USER_ID,
      category_id: "backend-architecture",
      slug: "api-error-handling-patterns",
      title: "API Error Handling Patterns",
      version: 1,
      content:
        "<p>Good APIs return consistent error formats with actionable messages. This helps frontend clients present useful feedback to users and simplifies debugging.</p>" +
        "<p>Use typed error classes and centralized middleware to translate internal failures into stable HTTP responses.</p>",
    },
    {
      id: "database-indexing-basics",
      user_id: DEFAULT_USER_ID,
      category_id: "backend-architecture",
      slug: "database-indexing-basics",
      title: "Database Indexing Basics",
      version: 1,
      content:
        "<p>Indexes speed up lookups by helping the database locate rows efficiently. Add indexes for columns used in filters, joins, and sort clauses that appear frequently.</p>" +
        "<p>Each index has a write cost, so choose them intentionally and verify impact with query plans.</p>",
    },
  ]);
};
