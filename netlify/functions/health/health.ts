import express from "express";
import serverless from "serverless-http";

const app = express();

app.use(express.json());

app.use((req, _res, next) => {
  const prefix = "/.netlify/functions/health";
  if (req.url === prefix) {
    req.url = "/";
  } else if (req.url.startsWith(prefix + "/")) {
    req.url = req.url.slice(prefix.length);
  }
  next();
});

app.get("/", (_req, res) => {
  res.json({
    ok: true,
    message: "Servidor online",
    timestamp: new Date().toISOString(),
  });
});

export const handler = serverless(app);