import type { RequestHandler } from "express";
import { helpersNav } from "../helpers/nav";
import { AUTH_COOKIE, readCookie } from "../utils/cookie";
import { verifyJwt } from "../utils/jwt";

const ROTAS_PUBLICAS: Record<string, string[]> = {
  "/login": ["GET", "POST"],
  "/logout": ["POST"],
};

export const requireAuth: RequestHandler = (req, res, next) => {
  res.locals.nav = helpersNav(req.path);
  if (ROTAS_PUBLICAS[req.path]?.includes(req.method)) return next();
  const token = readCookie(req, AUTH_COOKIE);
  const payload = token ? verifyJwt(token) : null;
  if (!payload) {
    if (req.method === "GET") return res.redirect("/login");
    return res.status(401).json({ ok: false, message: "Nao autenticado" });
  }
  res.locals.usuarioId = payload.sub;
  next();
};
