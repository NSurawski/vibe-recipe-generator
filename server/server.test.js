import { describe, it, expect, vi, beforeAll } from "vitest";
import request from "supertest";

// Prevent dotenv from requiring a .env file in the test environment
vi.mock("dotenv/config", () => ({}));

// Mock the Anthropic SDK so tests never make real API calls
const mockStream = {
  async *[Symbol.asyncIterator]() {
    yield {
      type: "content_block_delta",
      delta: {
        type: "text_delta",
        text: JSON.stringify({
          title: "Test Recipe",
          description: "A test recipe.",
          ingredients: [{ item: "water", amount: "1 cup" }],
          steps: ["Drink it."],
          time: "1 minute",
          difficulty: "Easy",
          vibe_notes: "Very hydrating.",
        }),
      },
    };
  },
};

vi.mock("@anthropic-ai/sdk", () => ({
  default: class {
    constructor() {
      this.messages = { stream: () => mockStream };
    }
  },
}));

let app;
beforeAll(async () => {
  process.env.NODE_ENV = "test";
  process.env.ANTHROPIC_API_KEY = "test-key";
  const mod = await import("./server.js");
  app = mod.app;
});

describe("POST /api/recipe — validation", () => {
  it("returns 400 when vibe is missing", async () => {
    const res = await request(app).post("/api/recipe").send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Please provide a vibe description");
  });

  it("returns 400 when vibe is empty whitespace", async () => {
    const res = await request(app).post("/api/recipe").send({ vibe: "   " });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Please provide a vibe description");
  });

  it("returns 400 when vibe is not a string", async () => {
    const res = await request(app).post("/api/recipe").send({ vibe: 42 });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Please provide a vibe description");
  });

  it("returns 400 when vibe exceeds 500 characters", async () => {
    const res = await request(app)
      .post("/api/recipe")
      .send({ vibe: "a".repeat(501) });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/too long/);
  });
});

describe("POST /api/recipe — streaming", () => {
  it("responds with SSE content-type for a valid vibe", async () => {
    const res = await request(app)
      .post("/api/recipe")
      .send({ vibe: "cozy sunday morning" })
      .buffer(true);

    expect(res.headers["content-type"]).toContain("text/event-stream");
  });

  it("sends a done event at the end of the stream", async () => {
    const res = await request(app)
      .post("/api/recipe")
      .send({ vibe: "cozy sunday morning" })
      .buffer(true);

    expect(res.text).toContain('"done":true');
  });

  it("includes text chunks before the done event", async () => {
    const res = await request(app)
      .post("/api/recipe")
      .send({ vibe: "cozy sunday morning" })
      .buffer(true);

    expect(res.text).toContain('"text"');
    expect(res.text).toContain("Test Recipe");
  });
});

describe("POST /api/modify — validation", () => {
  it("returns 400 when modification is missing", async () => {
    const res = await request(app).post("/api/modify").send({ recipe: { title: "Test" } });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Please provide a modification");
  });

  it("returns 400 when modification is empty whitespace", async () => {
    const res = await request(app).post("/api/modify").send({ recipe: { title: "Test" }, modification: "   " });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Please provide a modification");
  });

  it("returns 400 when recipe is missing", async () => {
    const res = await request(app).post("/api/modify").send({ modification: "make it spicier" });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Please provide a recipe to modify");
  });

  it("returns 400 when recipe is not an object", async () => {
    const res = await request(app).post("/api/modify").send({ recipe: "not-an-object", modification: "make it spicier" });
    expect(res.status).toBe(400);
  });
});

describe("POST /api/modify — streaming", () => {
  it("responds with SSE content-type for a valid request", async () => {
    const res = await request(app)
      .post("/api/modify")
      .send({ recipe: { title: "Test" }, modification: "make it spicier" })
      .buffer(true);
    expect(res.headers["content-type"]).toContain("text/event-stream");
  });

  it("sends a done event at the end of the stream", async () => {
    const res = await request(app)
      .post("/api/modify")
      .send({ recipe: { title: "Test" }, modification: "make it spicier" })
      .buffer(true);
    expect(res.text).toContain('"done":true');
  });

  it("includes text chunks before the done event", async () => {
    const res = await request(app)
      .post("/api/modify")
      .send({ recipe: { title: "Test" }, modification: "make it spicier" })
      .buffer(true);
    expect(res.text).toContain('"text"');
  });
});
