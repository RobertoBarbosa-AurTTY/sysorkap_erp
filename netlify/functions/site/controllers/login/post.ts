import type { RouteHandler } from "../../helpers/route-handler";
import { usuarioRepository } from "../../repositories/usuario.repository";
import { LEMBRAR_MAX_AGE, SESSAO_MAX_AGE, setAuthCookie } from "../../utils/cookie";
import { signJwt } from "../../utils/jwt";
import { hashSenha, verificarSenha } from "../../utils/password";
import { jsonError, jsonOk } from "../../utils/response";

const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

let dummyHash: string | undefined;
function hashDummy(): string {
  return (dummyHash ??= hashSenha("credencial-inexistente"));
}

const handler: RouteHandler = async (req, res) => {
  if (!req.is("application/json")) {
    return void jsonError(res, 415, "Content-Type deve ser application/json");
  }

  const { email, senha, lembrar } = (req.body ?? {}) as Record<string, unknown>;
  const emailLimpo = typeof email === "string" ? email.trim().toLowerCase() : "";
  const senhaTexto = typeof senha === "string" ? senha : "";

  if (!EMAIL_VALIDO.test(emailLimpo) || senhaTexto.length === 0) {
    return void jsonError(res, 400, "Informe email e senha validos");
  }

  let usuario;
  try {
    usuario = await usuarioRepository.findByEmail(emailLimpo);
  } catch {
    return void jsonError(res, 500, "Erro de conexao com o banco");
  }

  const senhaOk = verificarSenha(senhaTexto, usuario?.senhaHash ?? hashDummy());
  if (!senhaOk || !usuario) {
    return void jsonError(res, 401, "Credenciais invalidas");
  }

  const lembrarSessao = lembrar === true;
  const ttl = lembrarSessao ? LEMBRAR_MAX_AGE : SESSAO_MAX_AGE;
  setAuthCookie(res, signJwt(String(usuario._id), ttl), lembrarSessao);
  jsonOk(res);
};

export default handler;
