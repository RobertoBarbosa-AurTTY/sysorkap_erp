import express from "express";
import { resolveViewsDir } from "./helpers/paths";
import { stripPrefix } from "./middleware/strip-prefix";
import { requireAuth } from "./middleware/auth";
import { notFound } from "./controllers/_errors";
import { registerRoutes } from "./routes.generated";

export function createApp(): express.Express {
  const app = express();

  app.set("view engine", "ejs");
  app.set("views", resolveViewsDir());

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(stripPrefix("site"));
  app.use(requireAuth);

  registerRoutes(app);

  app.use(notFound);

  return app;
}
