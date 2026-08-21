import type { RouteHandler } from "../../../../helpers/route-handler";
import { produtoRepository } from "../../../../repositories/produto.repository";

const handler: RouteHandler = async (req, res) => {
  await produtoRepository.excluir(String(res.locals.usuarioId), String(req.params.id));
  res.redirect("/estoque?excluido=1");
};

export default handler;
