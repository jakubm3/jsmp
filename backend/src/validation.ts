import { z } from "zod";
export const registerSchema = z.object({ email: z.string().email(), password: z.string().min(6), name: z.string().min(1).optional() });
export const loginSchema = z.object({ email: z.string().email(), password: z.string().min(1) });
export const updateProfileSchema = z.object({ name: z.string().min(1).optional() });
export const productCreateSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  price: z.number().positive(),
  categoryId: z.string().optional().nullable(),
  imageUrls: z.array(z.string().url()).optional().default([])
});
export const productUpdateSchema = productCreateSchema.partial();
export const categorySchema = z.object({ name: z.string().min(1), parentId: z.string().optional().nullable() });
export const cartUpdateSchema = z.object({ productId: z.string(), quantity: z.number().int().min(1).max(99) });
export const cartRemoveSchema = z.object({ productId: z.string() });
export const checkoutSchema = z.object({ paymentMethod: z.enum(["CARD","BLIK","TRANSFER"]).default("CARD") });
