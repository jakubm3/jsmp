import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { createApp } from "../src/app.js";
import { prisma } from "../src/prisma.js";
import { hashPassword } from "../src/auth.js";
import { Role } from "@prisma/client";

const app = createApp();

describe("product category hierarchy", () => {
  let parentId = "";
  let childId = "";
  let productId = "";

  beforeAll(async () => {
    const user = await prisma.user.upsert({
      where: { email: "hierarchy-filter@test.local" },
      update: {},
      create: { email: "hierarchy-filter@test.local", passwordHash: await hashPassword("pass1234"), role: Role.USER, name: "Hierarchy Tester" },
    });

    const parent = await prisma.category.upsert({
      where: { id: "cat_parent_hier" },
      update: {},
      create: { id: "cat_parent_hier", name: "Parent (hierarchy test)" },
    });
    parentId = parent.id;

    const child = await prisma.category.upsert({
      where: { id: "cat_child_hier" },
      update: {},
      create: { id: "cat_child_hier", name: "Child (hierarchy test)", parentId: parent.id },
    });
    childId = child.id;

    const product = await prisma.product.create({
      data: {
        title: "Hierarchy product",
        description: "Should appear when filtering by parent category",
        price: 123.45,
        categoryId: child.id,
        sellerId: user.id,
        isActive: true,
      },
    });
    productId = product.id;

    await prisma.productImage.create({ data: { productId: product.id, url: "https://picsum.photos/seed/hierarchy/640/480" } });
  });

  afterAll(async () => {
    await prisma.productImage.deleteMany({ where: { productId } });
    await prisma.product.deleteMany({ where: { id: productId } });
    await prisma.category.deleteMany({ where: { id: { in: [childId, parentId] } } });
    await prisma.user.deleteMany({ where: { email: "hierarchy-filter@test.local" } });
    await prisma.$disconnect();
  });

  it("returns products from child categories when filtering by parent", async () => {
    const res = await request(app).get("/api/products").query({ categoryId: parentId });
    expect(res.status).toBe(200);
    const ids = res.body.map((p: any) => p.id);
    expect(ids).toContain(productId);
  });
});
