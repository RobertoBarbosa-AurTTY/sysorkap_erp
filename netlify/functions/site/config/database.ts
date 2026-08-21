import mongoose from "mongoose";
import { env } from "./env";

let cachedConnection: Promise<typeof mongoose> | null = null;

const USUARIOS_PADRAO: [string, string][] = [
  ["admin1@gmail.com", "123"],
  ["admin2@gmail.com", "123"],
];

async function iniciarEmMemoria(): Promise<string> {
  const nomePacote = ["mongodb", "memory", "server"].join("-");
  const { MongoMemoryServer } = await import(nomePacote);
  const servidor = await MongoMemoryServer.create();
  return servidor.getUri();
}

async function resolverUrl(): Promise<string> {
  if (env.dbUrl) return env.dbUrl;
  if (env.nodeEnv === "production") {
    throw new Error("DB_URL nao definida no ambiente");
  }
  return iniciarEmMemoria();
}

async function semearUsuarios(): Promise<void> {
  const { hashSenha } = await import("../utils/password");
  const colecao = mongoose.connection.collection("usuarios");
  for (const [email, senha] of USUARIOS_PADRAO) {
    const normalizado = email.toLowerCase();
    await colecao.updateOne(
      { email: normalizado },
      { $setOnInsert: { email: normalizado, senhaHash: hashSenha(senha) } },
      { upsert: true },
    );
  }
}

export function connectDatabase(): Promise<typeof mongoose> {
  if (!cachedConnection) {
    cachedConnection = resolverUrl()
      .then((url) =>
        mongoose.connect(url, {
          dbName: env.dbName,
          serverSelectionTimeoutMS: 10000,
        }),
      )
      .then(async (conexao) => {
        if (!env.dbUrl) await semearUsuarios();
        return conexao;
      })
      .catch((erro) => {
        cachedConnection = null;
        throw erro;
      });
  }
  return cachedConnection;
}

export async function disconnectDatabase(): Promise<void> {
  if (cachedConnection) {
    await mongoose.disconnect();
    cachedConnection = null;
  }
}
