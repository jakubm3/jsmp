import { Router } from "express";
import { authRequired, getUserId, requireRole } from "../auth.js";
import { prisma } from "../prisma.js";
import { Role } from "@prisma/client";

export const orderRoutes = Router();

orderRoutes.get("/my", authRequired, async (req, res) => {
  const userId = getUserId(req);
  res.json(await prisma.order.findMany({ where: { userId }, include: { items: { include: { product: { include: { images: true } } } } }, orderBy: { createdAt: "desc" } }));
});

orderRoutes.get("/admin", authRequired, requireRole(Role.ADMIN), async (_req, res) => {
  res.json(await prisma.order.findMany({ include: { user: { select: { id: true, email: true, name: true } }, items: true }, orderBy: { createdAt: "desc" } }));
});
