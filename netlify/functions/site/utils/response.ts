import type { Response } from "express";

export function jsonOk(res: Response, data: object = {}): void {
  res.status(200).json({ ok: true, ...data });
}

export function jsonError(res: Response, status: number, message: string): void {
  res.status(status).json({ ok: false, message });
}
