import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { createApp } from "../src/app.js";
import { prisma } from "../src/prisma.js";
import { hashPassword } from "../src/auth.js";
import { Role } from "@prisma/client";

const app = createApp();

describe("profile + admin", () => {
  let adminToken = "";
  let userToken = "";
  let userId = "";

  beforeAll(async () => {
    const adminEmail = "admin-tests@local.test";
    await prisma.user.upsert({
      where: { email: adminEmail },
      update: {},
      create: { email: adminEmail, passwordHash: await hashPassword("admin123"), role: Role.ADMIN, name: "Admin T" },
    });

    const adminLogin = await request(app).post("/api/auth/login").send({ email: adminEmail, password: "admin123" });
    adminToken = adminLogin.body.token;

    const register = await request(app).post("/api/auth/register").send({ email: `u${Date.now()}@local.test`, password: "pass1234", name: "User T" });
    userToken = register.body.token;
    userId = register.body.user.id;
  });

  afterAll(async () => { await prisma.$disconnect(); });

  it("updates profile name", async () => {
    const res = await request(app).put("/api/users/me").set("Authorization", `Bearer ${userToken}`).send({ name: "Nowe Imię" });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe("Nowe Imię");

    const fromDb = await prisma.user.findUnique({ where: { id: res.body.id } });
    expect(fromDb?.name).toBe("Nowe Imię");
  });

  it("admin manages categories", async () => {
    const create = await request(app).post("/api/categories").set("Authorization", `Bearer ${adminToken}`).send({ name: "Test cat", parentId: null });
    expect(create.status).toBe(201);

    const update = await request(app).put(`/api/categories/${create.body.id}`).set("Authorization", `Bearer ${adminToken}`).send({ name: "Test cat 2", parentId: null });
    expect(update.status).toBe(200);
    expect(update.body.name).toBe("Test cat 2");

    const del = await request(app).delete(`/api/categories/${create.body.id}`).set("Authorization", `Bearer ${adminToken}`);
    expect(del.status).toBe(204);

    const inDb = await prisma.category.findUnique({ where: { id: create.body.id } });
    expect(inDb).toBeNull();
  });

  it("admin can change user role", async () => {
    const res = await request(app).post(`/api/admin/users/${userId}/role`).set("Authorization", `Bearer ${adminToken}`).send({ role: "ADMIN" });
    expect(res.status).toBe(200);
    expect(res.body.role).toBe("ADMIN");

    const inDb = await prisma.user.findUnique({ where: { id: userId } });
    expect(inDb?.role).toBe(Role.ADMIN);
  });
});
