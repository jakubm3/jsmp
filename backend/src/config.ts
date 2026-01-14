import dotenv from "dotenv";
dotenv.config();

export const config = {
  port: Number(process.env.PORT ?? 4000),
  jwtSecret: process.env.JWT_SECRET ?? "devsecret",
  corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:5173",
};
