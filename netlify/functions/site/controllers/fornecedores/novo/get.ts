import type { RouteHandler } from "../../../helpers/route-handler";
import { renderPage } from "../../../helpers/render";

const handler: RouteHandler = (_req, res) => {
  renderPage(res, "fornecedores/form", { titulo: "Novo fornecedor" });
};

export default handler;
