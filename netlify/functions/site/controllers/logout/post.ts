import type { RouteHandler } from "../../helpers/route-handler";
import { clearAuthCookie } from "../../utils/cookie";

const handler: RouteHandler = (_req, res) => {
  clearAuthCookie(res);
  res.redirect("/login");
};

export default handler;
