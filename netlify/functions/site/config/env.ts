const isProducao = process.env.NODE_ENV === "production";

if (isProducao && (process.env.SESSION_SECRET ?? "").length < 32) {
  throw new Error("SESSION_SECRET ausente ou fraca em producao (min 32 chars)");
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  appName: process.env.APP_NAME ?? "Sysorkap",
  sessionSecret: process.env.SESSION_SECRET ?? "dev-only-not-for-production",
  dbUrl: process.env.DB_URL ?? "",
  dbName: process.env.DB_NAME ?? "sysorkap",
} as const;
