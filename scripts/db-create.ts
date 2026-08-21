import fs from "fs";
import mongoose from "mongoose";

const env = fs.readFileSync(".env", "utf8");
const dbUrl = env.match(/^DB_URL\s*=\s*(.+)$/m)?.[1]?.trim();
const dbName = env.match(/^DB_NAME\s*=\s*(.+)$/m)?.[1]?.trim() ?? "sysorkap";

if (!dbUrl) throw new Error("DB_URL nao encontrada no .env");

await mongoose.connect(dbUrl, { dbName, serverSelectionTimeoutMS: 10000 });
const db = mongoose.connection.db!;
const names = (await db.listCollections().toArray()).map((c) => c.name);

if (names.length === 0) {
  await db.createCollection("_init");
  console.log(`Banco "${dbName}" criado (collection placeholder "_init" — remova ao criar as suas)`);
} else {
  if (names.includes("_init") && names.length > 1) await db.collection("_init").drop();
  console.log(`Banco "${dbName}" existe. Collections: ${names.join(", ")}`);
}

// ============================================
// AQUI: crie suas collections
// Exemplo: await db.createCollection("produtos");
// ============================================

await mongoose.disconnect();