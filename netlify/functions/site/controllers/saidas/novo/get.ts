import type { RouteHandler } from "../../../helpers/route-handler";
import { renderPage } from "../../../helpers/render";

const handler: RouteHandler = (_req, res) => {
  renderPage(res, "saidas/form", { titulo: "Nova saída" });
};

export default handler;
