import type { RouteHandler } from "../../helpers/route-handler";
import { renderPage } from "../../helpers/render";
import { AUTH_COOKIE, readCookie } from "../../utils/cookie";
import { verifyJwt } from "../../utils/jwt";

const handler: RouteHandler = (req, res) => {
  const token = readCookie(req, AUTH_COOKIE);
  if (token && verifyJwt(token)) {
    res.redirect("/");
    return;
  }
  renderPage(res, "auth/login", { titulo: "Login" });
};

export default handler;
