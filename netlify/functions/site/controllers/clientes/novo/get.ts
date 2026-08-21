import type { RouteHandler } from "../../../helpers/route-handler";
import { renderPage } from "../../../helpers/render";

const handler: RouteHandler = (_req, res) => {
  renderPage(res, "clientes/form", { titulo: "Novo cliente" });
};

export default handler;
