import { RequestHandler } from "express";

export function stripPrefix(functionName: string): RequestHandler {
  return (req, _res, next) => {
    const prefix = `/.netlify/functions/${functionName}`;
    if (req.url === prefix) {
      req.url = "/";
    } else if (req.url.startsWith(prefix + "/")) {
      req.url = req.url.slice(prefix.length);
    }
    next();
  };
}