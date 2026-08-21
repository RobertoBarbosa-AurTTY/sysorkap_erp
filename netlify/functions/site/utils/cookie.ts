import type { Request, Response } from "express";
import { env } from "../config/env";

export const AUTH_COOKIE = "sysorkap_token";
export const SESSAO_MAX_AGE = 60 * 60 * 8;
export const LEMBRAR_MAX_AGE = 60 * 60 * 24 * 30;

export function readCookie(req: Request, nome: string): string | undefined {
  const parte = req.headers.cookie
    ?.split(";")
    .map((p) => p.trim())
    .find((p) => p.startsWith(`${nome}=`));
  return parte?.slice(nome.length + 1);
}

export function setAuthCookie(res: Response, token: string, lembrar: boolean): void {
  const partes = [`${AUTH_COOKIE}=${token}`, "Path=/", "HttpOnly", "SameSite=Lax"];
  if (lembrar) partes.push(`Max-Age=${LEMBRAR_MAX_AGE}`);
  if (env.nodeEnv === "production") partes.push("Secure");
  res.setHeader("Set-Cookie", partes.join("; "));
}

export function clearAuthCookie(res: Response): void {
  res.setHeader("Set-Cookie", `${AUTH_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`);
}
