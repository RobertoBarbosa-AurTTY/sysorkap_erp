import fs from "fs";
import mongoose from "mongoose";
import { hashSenha } from "../netlify/functions/site/utils/password.ts";

const args = process.argv.slice(2);
const pares: [string, string][] = [];
for (let i = 0; i + 1 < args.length; i += 2) pares.push([args[i], args[i + 1]]);

const alvos: [string, string][] =
  pares.length > 0
    ? pares
    : [
        ["admin1@gmail.com", "123"],
        ["admin2@gmail.com", "123"],
      ];

const envFile = fs.readFileSync(".env", "utf8");
const dbUrl = envFile.match(/^DB_URL\s*=\s*(.+)$/m)?.[1]?.trim();
const dbName = envFile.match(/^DB_NAME\s*=\s*(.+)$/m)?.[1]?.trim() ?? "sysorkap";

if (!dbUrl) throw new Error("DB_URL nao encontrada no .env");

await mongoose.connect(dbUrl, { dbName, serverSelectionTimeoutMS: 10000 });

const usuarios = mongoose.connection.collection("usuarios");
for (const [email, senha] of alvos) {
  const normalizado = email.toLowerCase();
  await usuarios.updateOne(
    { email: normalizado },
    { $setOnInsert: { email: normalizado, senhaHash: hashSenha(senha) } },
    { upsert: true },
  );
  console.log(`Usuario pronto: ${normalizado}`);
}

console.log(`${alvos.length} usuario(s) sincronizado(s) no banco "${dbName}".`);
await mongoose.disconnect();
