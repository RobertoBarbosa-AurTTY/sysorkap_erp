import { createHmac, timingSafeEqual } from "crypto";
import { env } from "../config/env";

export interface JwtPayload {
  sub: string;
  iat: number;
  exp: number;
}

function assinar(dados: string): string {
  return createHmac("sha256", env.sessionSecret).update(dados).digest("base64url");
}

export function signJwt(sub: string, ttlSegundos: number): string {
  const agora = Math.floor(Date.now() / 1000);
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(
    JSON.stringify({ sub, iat: agora, exp: agora + ttlSegundos }),
  ).toString("base64url");
  return `${header}.${payload}.${assinar(`${header}.${payload}`)}`;
}

export function verifyJwt(token: string): JwtPayload | null {
  const [header, payload, assinatura] = token.split(".");
  if (!header || !payload || !assinatura) return null;
  const esperada = Buffer.from(assinar(`${header}.${payload}`));
  const recebida = Buffer.from(assinatura);
  if (recebida.length !== esperada.length || !timingSafeEqual(recebida, esperada)) return null;
  try {
    const dados = JSON.parse(Buffer.from(payload, "base64url").toString()) as JwtPayload;
    return typeof dados.exp === "number" && dados.exp > Date.now() / 1000 ? dados : null;
  } catch {
    return null;
  }
}
