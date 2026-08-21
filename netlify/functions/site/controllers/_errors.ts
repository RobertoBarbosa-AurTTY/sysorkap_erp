import { Request, Response } from "express";
import { renderPage } from "../helpers/render";

export function notFound(_req: Request, res: Response): void {
  res.status(404).render("pages/notfound", { titulo: "404" });
}
