import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import type { Request, Response, NextFunction } from "express";
import { Role } from "@prisma/client";
import { config } from "./config.js";
import { unauthorized, forbidden } from "./errors.js";

export type JwtUser = { sub: string; role: Role };

export function signToken(userId: string, role: Role) {
  return jwt.sign({ sub: userId, role } satisfies JwtUser, config.jwtSecret, { expiresIn: "7d" });
}
export async function hashPassword(p: string) { return bcrypt.hash(p, 10); }
export async function verifyPassword(p: string, h: string) { return bcrypt.compare(p, h); }

export function authRequired(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) throw unauthorized();
  const token = header.slice("Bearer ".length);
  try { (req as any).user = jwt.verify(token, config.jwtSecret) as JwtUser; next(); }
  catch { throw unauthorized(); }
}
export function requireRole(role: Role) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const u = (req as any).user as JwtUser | undefined;
    if (!u) throw unauthorized();
    if (u.role !== role) throw forbidden();
    next();
  };
}
export function getUserId(req: Request) {
  const u = (req as any).user as JwtUser | undefined;
  if (!u) throw unauthorized();
  return u.sub;
}
