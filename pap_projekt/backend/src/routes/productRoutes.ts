import { Router } from "express";
import { prisma } from "../prisma.js";
import { authRequired, getUserId } from "../auth.js";
import { productCreateSchema, productUpdateSchema } from "../validation.js";
import { notFound, forbidden } from "../errors.js";
import { Role } from "@prisma/client";

export const productRoutes = Router();

/**
 * PUBLIC: lista aktywnych ofert
 * query:
 *  - search
 *  - categoryId
 *  - sort: newest | priceAsc | priceDesc
 */
productRoutes.get("/", async (req, res) => {
  const search = (req.query.search as string | undefined)?.trim();
  const categoryId = (req.query.categoryId as string | undefined)?.trim();
  const sort = (req.query.sort as string | undefined) ?? "newest";

  let categoryIds: string[] = [];
  if (categoryId) {
    const rows = await prisma.$queryRaw<{ id: string }[]>`
      WITH RECURSIVE subcats AS (
        SELECT id FROM "Category" WHERE id = ${categoryId}
        UNION ALL
        SELECT c.id FROM "Category" c JOIN subcats s ON c."parentId" = s.id
      )
      SELECT id FROM subcats;
    `;
    categoryIds = rows.map((r) => r.id);
    if (categoryIds.length === 0) categoryIds = [categoryId];
  }

  const orderBy =
    sort === "priceAsc"
      ? { price: "asc" as const }
      : sort === "priceDesc"
        ? { price: "desc" as const }
        : { createdAt: "desc" as const };

  res.json(
    await prisma.product.findMany({
      where: {
        isActive: true,
        ...(search
          ? {
              OR: [
                { title: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } },
              ],
            }
          : {}),
        ...(categoryIds.length ? { categoryId: { in: categoryIds } } : {}),
      },
      include: {
        images: true,
        category: true,
        seller: { select: { id: true, email: true, name: true } },
      },
      orderBy,
    })
  );
});

/**
 * AUTH: moje oferty (także nieaktywne)
 */
productRoutes.get("/mine", authRequired, async (req, res) => {
  const userId = getUserId(req);
  res.json(
    await prisma.product.findMany({
      where: { sellerId: userId },
      include: { images: true, category: true },
      orderBy: { createdAt: "desc" },
    })
  );
});

productRoutes.get("/:id", async (req, res) => {
  const p = await prisma.product.findUnique({
    where: { id: req.params.id },
    include: {
      images: true,
      category: true,
      seller: { select: { id: true, email: true, name: true } },
    },
  });
  if (!p || !p.isActive) throw notFound("Product not found");
  res.json(p);
});

productRoutes.post("/", authRequired, async (req, res) => {
  const userId = getUserId(req);
  const data = productCreateSchema.parse(req.body);

  res.status(201).json(
    await prisma.product.create({
      data: {
        title: data.title,
        description: data.description,
        price: data.price,
        categoryId: data.categoryId ?? null,
        sellerId: userId,
        images: { create: data.imageUrls.map((url) => ({ url })) },
      },
      include: { images: true, category: true },
    })
  );
});

productRoutes.put("/:id", authRequired, async (req, res) => {
  const userId = getUserId(req);
  const data = productUpdateSchema.parse(req.body);

  const existing = await prisma.product.findUnique({ where: { id: req.params.id } });
  if (!existing) throw notFound("Product not found");

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw notFound("User not found");

  if (existing.sellerId !== userId && user.role !== Role.ADMIN) throw forbidden();

  res.json(
    await prisma.product.update({
      where: { id: existing.id },
      data: {
        title: data.title ?? undefined,
        description: data.description ?? undefined,
        price: data.price ?? undefined,
        categoryId: data.categoryId === undefined ? undefined : data.categoryId ?? null,
        ...(data.imageUrls
          ? { images: { deleteMany: {}, create: data.imageUrls.map((url) => ({ url })) } }
          : {}),
      },
      include: { images: true, category: true },
    })
  );
});

productRoutes.delete("/:id", authRequired, async (req, res) => {
  const userId = getUserId(req);

  const existing = await prisma.product.findUnique({ where: { id: req.params.id } });
  if (!existing) throw notFound("Product not found");

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw notFound("User not found");

  if (existing.sellerId !== userId && user.role !== Role.ADMIN) throw forbidden();

  await prisma.product.update({ where: { id: existing.id }, data: { isActive: false } });
  res.status(204).send();
});
