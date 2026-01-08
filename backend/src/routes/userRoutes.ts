import { Router } from "express";
import { authRequired, getUserId } from "../auth.js";
import { prisma } from "../prisma.js";
import { updateProfileSchema } from "../validation.js";

export const userRoutes = Router();

userRoutes.get("/me", authRequired, async (req, res) => {
  const id = getUserId(req);
  res.json(await prisma.user.findUnique({ where: { id }, select: { id: true, email: true, name: true, role: true, isActive: true, createdAt: true } }));
});
userRoutes.put("/me", authRequired, async (req, res) => {
  const id = getUserId(req);
  const data = updateProfileSchema.parse(req.body);
  res.json(await prisma.user.update({ where: { id }, data, select: { id: true, email: true, name: true, role: true, isActive: true } }));
});
