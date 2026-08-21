import type { RouteHandler } from "../../helpers/route-handler";
import { produtoRepository } from "../../repositories/produto.repository";
import { validarLote, erroSalvar } from "./_validacao";

const handler: RouteHandler = async (req, res) => {
  if (!req.is("application/json")) {
    return void res.status(415).json({ ok: false, erros: ["Content-Type deve ser application/json"] });
  }

  const bruto = (req.body ?? {}) as { produtos?: unknown };
  const linhas = Array.isArray(bruto.produtos) ? bruto.produtos : [];
  const { dados, erros } = validarLote(linhas);

  if (erros.length === 0) {
    try {
      const existentes = await produtoRepository.skusExistentes(
        String(res.locals.usuarioId),
        dados.map((p) => p.sku),
      );
      for (const produto of dados) {
        if (existentes.includes(produto.sku)) {
          erros.push(`SKU ${produto.sku} já está cadastrado na sua conta.`);
        }
      }
    } catch {
      erros.push("Erro de conexao com o banco");
    }
  }

  if (erros.length > 0) {
    return void res.status(400).json({ ok: false, erros });
  }

  try {
    await produtoRepository.criarVarios(String(res.locals.usuarioId), dados);
    res.status(201).json({ ok: true, total: dados.length });
  } catch (erro) {
    res.status(500).json({ ok: false, erros: erroSalvar(erro) });
  }
};

export default handler;
