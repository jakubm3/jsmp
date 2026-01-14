import { Router } from "express";
import { authRequired, getUserId } from "../auth.js";
import { prisma } from "../prisma.js";

export const favoriteRoutes = Router();

favoriteRoutes.get("/", authRequired, async (req, res) => {
  const userId = getUserId(req);
  const favs = await prisma.favorite.findMany({ where: { userId }, include: { product: { include: { images: true, category: true } } }, orderBy: { createdAt: "desc" } });
  res.json(favs.map(f => f.product));
});

favoriteRoutes.post("/:productId/toggle", authRequired, async (req, res) => {
  const userId = getUserId(req);
  const productId = req.params.productId;
  const existing = await prisma.favorite.findUnique({ where: { userId_productId: { userId, productId } } });
  if (existing) { await prisma.favorite.delete({ where: { userId_productId: { userId, productId } } }); res.json({ isFavorite: false }); }
  else { await prisma.favorite.create({ data: { userId, productId } }); res.json({ isFavorite: true }); }
});
