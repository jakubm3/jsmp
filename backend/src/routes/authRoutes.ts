import { Router } from "express";
import { prisma } from "../prisma.js";
import { registerSchema, loginSchema } from "../validation.js";
import { hashPassword, verifyPassword, signToken } from "../auth.js";
import { badRequest, unauthorized } from "../errors.js";

export const authRoutes = Router();

authRoutes.post("/register", async (req, res) => {
  const data = registerSchema.parse(req.body);
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) throw badRequest("Email already in use");
  const user = await prisma.user.create({
    data: { email: data.email, passwordHash: await hashPassword(data.password), name: data.name },
    select: { id: true, email: true, name: true, role: true, isActive: true, createdAt: true }
  });
  res.json({ token: signToken(user.id, user.role), user });
});

authRoutes.post("/login", async (req, res) => {
  const data = loginSchema.parse(req.body);
  const user = await prisma.user.findUnique({ where: { email: data.email } });
  if (!user) throw unauthorized("Invalid credentials");
  if (!user.isActive) throw unauthorized("Account is disabled");
  if (!(await verifyPassword(data.password, user.passwordHash))) throw unauthorized("Invalid credentials");
  res.json({ token: signToken(user.id, user.role), user: { id: user.id, email: user.email, name: user.name, role: user.role, isActive: user.isActive, createdAt: user.createdAt } });
});
