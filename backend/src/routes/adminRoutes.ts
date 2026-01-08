import { Router } from "express";
import { authRequired, requireRole } from "../auth.js";
import { prisma } from "../prisma.js";
import { Role } from "@prisma/client";

export const adminRoutes = Router();
adminRoutes.use(authRequired, requireRole(Role.ADMIN));

adminRoutes.get("/users", async (_req, res) => {
  res.json(await prisma.user.findMany({ select: { id: true, email: true, name: true, role: true, isActive: true, createdAt: true }, orderBy: { createdAt: "desc" } }));
});
adminRoutes.post("/users/:id/toggle-active", async (req, res) => {
  const u = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!u) return res.status(404).json({ message: "User not found" });
  const updated = await prisma.user.update({ where: { id: u.id }, data: { isActive: !u.isActive } });
  res.json({ id: updated.id, isActive: updated.isActive });
});

adminRoutes.get("/products", async (_req, res) => {
  res.json(await prisma.product.findMany({ include: { seller: { select: { id: true, email: true, name: true } }, images: true, category: true }, orderBy: { createdAt: "desc" } }));
});
adminRoutes.post("/products/:id/toggle-active", async (req, res) => {
  const p = await prisma.product.findUnique({ where: { id: req.params.id } });
  if (!p) return res.status(404).json({ message: "Product not found" });
  const updated = await prisma.product.update({ where: { id: p.id }, data: { isActive: !p.isActive } });
  res.json({ id: updated.id, isActive: updated.isActive });
});
