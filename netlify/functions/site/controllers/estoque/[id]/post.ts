import type { RouteHandler } from "../../../helpers/route-handler";
import { renderPage } from "../../../helpers/render";
import { produtoRepository } from "../../../repositories/produto.repository";
import { validarProduto, erroSalvar, FormProduto } from "../_validacao";

const handler: RouteHandler = async (req, res) => {
  const id = String(req.params.id);
  const usuarioId = String(res.locals.usuarioId);
  const corpo = (req.body ?? {}) as FormProduto;
  const { dados, erros } = validarProduto(corpo);

  const acao = `/estoque/${id}`;
  if (erros.length > 0) {
    return void renderPage(res, "estoque/form", { titulo: "Editar produto", erros, valores: corpo, acao });
  }

  try {
    const atualizado = await produtoRepository.atualizar(usuarioId, id, dados);
    if (!atualizado) {
      return void res.redirect("/estoque");
    }
    res.redirect("/estoque?atualizado=1");
  } catch (erro) {
    renderPage(res, "estoque/form", { titulo: "Editar produto", erros: erroSalvar(erro), valores: corpo, acao });
  }
};

export default handler;
