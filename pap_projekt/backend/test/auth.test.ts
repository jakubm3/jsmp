import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { createApp } from "../src/app.js";
import { prisma } from "../src/prisma.js";

const app = createApp();

describe("auth", () => {
  beforeAll(async () => { await prisma.user.findMany({ take: 1 }); });
  afterAll(async () => { await prisma.$disconnect(); });

  it("registers and logs in", async () => {
    const email = `t${Date.now()}@local.test`;
    const r = await request(app).post("/api/auth/register").send({ email, password: "pass1234", name: "T" });
    expect(r.status).toBe(200);
    const l = await request(app).post("/api/auth/login").send({ email, password: "pass1234" });
    expect(l.status).toBe(200);
  });
});
