import "express-async-errors";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { config } from "./config.js";
import { HttpError } from "./errors.js";

import { authRoutes } from "./routes/authRoutes.js";
import { userRoutes } from "./routes/userRoutes.js";
import { productRoutes } from "./routes/productRoutes.js";
import { categoryRoutes } from "./routes/categoryRoutes.js";
import { favoriteRoutes } from "./routes/favoriteRoutes.js";
import { cartRoutes } from "./routes/cartRoutes.js";
import { orderRoutes } from "./routes/orderRoutes.js";
import { adminRoutes } from "./routes/adminRoutes.js";

export function createApp() {
  const app = express();
  app.use(helmet());
  const allowed = config.corsOrigin.split(",").map(s => s.trim());
  app.use(cors({ origin: allowed, credentials: false }));
  app.use(express.json({ limit: "1mb" }));
  app.use(morgan("dev"));

  app.get("/health", (_req, res) => res.json({ ok: true }));

  app.use("/api/auth", authRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/products", productRoutes);
  app.use("/api/categories", categoryRoutes);
  app.use("/api/favorites", favoriteRoutes);
  app.use("/api/cart", cartRoutes);
  app.use("/api/orders", orderRoutes);
  app.use("/api/admin", adminRoutes);

  app.use((err: any, _req: any, res: any, _next: any) => {
    if (err instanceof HttpError) return res.status(err.status).json({ message: err.message });
    if (err?.name === "ZodError") return res.status(400).json({ message: "Validation error", issues: err.issues });
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  });

  return app;
}
