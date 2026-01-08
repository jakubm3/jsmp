import { Router } from "express";
import { authRequired, getUserId } from "../auth.js";
import { prisma } from "../prisma.js";
import { cartUpdateSchema, cartRemoveSchema, checkoutSchema } from "../validation.js";
import { badRequest } from "../errors.js";

export const cartRoutes = Router();

cartRoutes.get("/", authRequired, async (req, res) => {
  const userId = getUserId(req);
  res.json(await prisma.cartItem.findMany({ where: { userId }, include: { product: { include: { images: true } } }, orderBy: { createdAt: "desc" } }));
});

cartRoutes.post("/add", authRequired, async (req, res) => {
  const userId = getUserId(req);
  const data = cartUpdateSchema.parse(req.body);
  res.json(await prisma.cartItem.upsert({
    where: { userId_productId: { userId, productId: data.productId } },
    update: { quantity: data.quantity },
    create: { userId, productId: data.productId, quantity: data.quantity }
  }));
});

cartRoutes.post("/remove", authRequired, async (req, res) => {
  const userId = getUserId(req);
  const data = cartRemoveSchema.parse(req.body);
  await prisma.cartItem.delete({ where: { userId_productId: { userId, productId: data.productId } } });
  res.status(204).send();
});

cartRoutes.post("/checkout", authRequired, async (req, res) => {
  const userId = getUserId(req);
  const data = checkoutSchema.parse(req.body);
  const items = await prisma.cartItem.findMany({ where: { userId }, include: { product: true } });
  if (items.length === 0) throw badRequest("Cart is empty");
  const total = items.reduce((acc, it) => acc + Number(it.product.price) * it.quantity, 0);

  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: { userId, totalPrice: total, status: "PAID", items: { create: items.map(it => ({ productId: it.productId, quantity: it.quantity, unitPrice: it.product.price })) } },
    });

    await tx.payment.create({
      data: { orderId: created.id, amount: total, method: data.paymentMethod, status: "PAID" }
    });

    await tx.shipment.create({
      data: { orderId: created.id, status: "PREPARING" }
    });

    await tx.cartItem.deleteMany({ where: { userId } });
    return tx.order.findUniqueOrThrow({
      where: { id: created.id },
      include: {
        items: { include: { product: { include: { images: true } } } },
        payment: true,
        shipment: true,
      }
    });
  });

  res.json(order);
});
