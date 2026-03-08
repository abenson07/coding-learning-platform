import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { createRequire } from "node:module";

process.env.NODE_ENV = "test";
delete process.env.DATABASE_URL;

const require = createRequire(import.meta.url);
const { app } = require("./index");
const { db } = require("./db");

describe("highlight API", () => {
  beforeAll(async () => {
    await db.migrate.latest();
    await db.seed.run();
  });

  beforeEach(async () => {
    await db("highlights").del();
  });

  afterAll(async () => {
    await db.destroy();
  });

  it("returns hardcoded intro lesson", async () => {
    const response = await request(app).get("/api/lessons/intro");
    expect(response.status).toBe(200);
    expect(response.body.id).toBe("intro");
    expect(response.body.slug).toBe("intro");
    expect(response.body.title).toBe("Introduction to JavaScript Functions");
  });

  it("creates, lists, and deletes highlights", async () => {
    const createResponse = await request(app).post("/api/highlights").send({
      lesson_id: "intro",
      selected_text: "Functions",
      text_before: "",
      text_after: " are",
    });

    expect(createResponse.status).toBe(201);
    expect(createResponse.body.id).toBeTypeOf("number");

    const listResponse = await request(app).get("/api/highlights/intro");
    expect(listResponse.status).toBe(200);
    expect(listResponse.body).toHaveLength(1);
    expect(listResponse.body[0].selected_text).toBe("Functions");

    const deleteResponse = await request(app).delete(
      `/api/highlights/${createResponse.body.id}`,
    );
    expect(deleteResponse.status).toBe(204);

    const listAfterDelete = await request(app).get("/api/highlights/intro");
    expect(listAfterDelete.body).toHaveLength(0);
  });

  it("returns healthy status when database is reachable", async () => {
    const response = await request(app).get("/api/health");
    expect(response.status).toBe(200);
    expect(response.body.status).toBe("ok");
  });

  it("validates payload shape for create endpoint", async () => {
    const response = await request(app).post("/api/highlights").send({
      lesson_id: "intro",
      selected_text: "",
    });

    expect(response.status).toBe(400);
    expect(response.body.error).toContain("Invalid payload");
  });
});
