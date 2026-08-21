import { randomBytes, scryptSync, timingSafeEqual } from "crypto";

const KEY_LEN = 64;

export function hashSenha(senha: string): string {
  const salt = randomBytes(16);
  const derivada = scryptSync(senha.normalize("NFKC"), salt, KEY_LEN);
  return `${salt.toString("hex")}:${derivada.toString("hex")}`;
}

export function verificarSenha(senha: string, armazenada: string): boolean {
  const [saltHex, hashHex] = armazenada.split(":");
  if (!saltHex || !hashHex) return false;
  const esperada = Buffer.from(hashHex, "hex");
  const derivada = scryptSync(senha.normalize("NFKC"), Buffer.from(saltHex, "hex"), KEY_LEN);
  return derivada.length === esperada.length && timingSafeEqual(derivada, esperada);
}
