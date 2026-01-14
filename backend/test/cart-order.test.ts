import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { createApp } from "../src/app.js";
import { prisma } from "../src/prisma.js";

const app = createApp();

describe("cart + checkout", () => {
  let token = "";
  let productId = "";

  beforeAll(async () => {
    const res = await request(app).post("/api/auth/login").send({ email: "user@local.test", password: "user123" });
    token = res.body.token;
    productId = (await prisma.product.findFirst())!.id;
  });

  afterAll(async () => { await prisma.$disconnect(); });

  it("adds and checkouts", async () => {
    const add = await request(app).post("/api/cart/add").set("Authorization", `Bearer ${token}`).send({ productId, quantity: 2 });
    expect(add.status).toBe(200);

    const chk = await request(app).post("/api/cart/checkout").set("Authorization", `Bearer ${token}`).send({ paymentMethod: "BLIK" });
    expect(chk.status).toBe(200);
    expect(chk.body.items.length).toBeGreaterThan(0);
    expect(chk.body.payment).toBeTruthy();
    expect(chk.body.payment.method).toBe("BLIK");
    expect(chk.body.payment.status).toBe("PAID");
    expect(Number(chk.body.payment.amount)).toBeGreaterThan(0);
    expect(chk.body.shipment).toBeTruthy();
    expect(chk.body.shipment.status).toBe("PREPARING");
    expect(chk.body.shipment.orderId).toBe(chk.body.id);
  });
});
