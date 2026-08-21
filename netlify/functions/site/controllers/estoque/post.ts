import type { RouteHandler } from "../../helpers/route-handler";
import { renderPage } from "../../helpers/render";
import { produtoRepository } from "../../repositories/produto.repository";
import { validarProduto, erroSalvar, FormProduto } from "./_validacao";

const handler: RouteHandler = async (req, res) => {
  const corpo = (req.body ?? {}) as FormProduto;
  const { dados, erros } = validarProduto(corpo);

  if (erros.length > 0) {
    return void renderPage(res, "estoque/form", { titulo: "Novo produto", erros, valores: corpo, acao: "/estoque" });
  }

  try {
    await produtoRepository.criar(String(res.locals.usuarioId), dados);
    res.redirect("/estoque");
  } catch (erro) {
    renderPage(res, "estoque/form", {
      titulo: "Novo produto",
      erros: erroSalvar(erro),
      valores: corpo,
      acao: "/estoque",
    });
  }
};

export default handler;
