import { Router } from "express";
import { prisma } from "../prisma.js";
import { authRequired, requireRole } from "../auth.js";
import { categorySchema } from "../validation.js";
import { Role } from "@prisma/client";

export const categoryRoutes = Router();
categoryRoutes.get("/", async (_req, res) => res.json(await prisma.category.findMany({ orderBy: { name: "asc" } })));
categoryRoutes.post("/", authRequired, requireRole(Role.ADMIN), async (req, res) => {
  const data = categorySchema.parse(req.body);
  res.status(201).json(await prisma.category.create({ data: { name: data.name, parentId: data.parentId ?? null } }));
});
categoryRoutes.put("/:id", authRequired, requireRole(Role.ADMIN), async (req, res) => {
  const data = categorySchema.parse(req.body);
  res.json(await prisma.category.update({ where: { id: req.params.id }, data: { name: data.name, parentId: data.parentId ?? null } }));
});
categoryRoutes.delete("/:id", authRequired, requireRole(Role.ADMIN), async (req, res) => {
  await prisma.category.delete({ where: { id: req.params.id } });
  res.status(204).send();
});
