import type { RouteHandler } from "../../../../helpers/route-handler";
import { renderPage } from "../../../../helpers/render";
import { produtoRepository } from "../../../../repositories/produto.repository";

const handler: RouteHandler = async (req, res) => {
  const produto = await produtoRepository.buscarPorId(String(res.locals.usuarioId), String(req.params.id));
  if (!produto) {
    return void res.redirect("/estoque");
  }
  renderPage(res, "estoque/form", {
    titulo: "Editar produto",
    subtitulo: `Altere os dados de "${produto.nome}".`,
    valores: produto,
    acao: `/estoque/${produto._id}`,
  });
};

export default handler;
