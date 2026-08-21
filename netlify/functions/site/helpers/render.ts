import { Response } from "express";

interface PageOptions {
  titulo?: string;
  [key: string]: unknown;
}

export function renderPage(res: Response, view: string, opts: PageOptions = {}): void {
  res.render(`pages/${view}`, {
    titulo: opts.titulo ?? "Sysorkap",
    ...opts,
  });
}
