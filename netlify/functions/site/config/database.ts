import mongoose from "mongoose";
import { env } from "./env";

let cachedConnection: Promise<typeof mongoose> | null = null;

export function connectDatabase(): Promise<typeof mongoose> {
  if (!env.dbUrl) {
    throw new Error("DB_URL nao definida no ambiente");
  }
  if (!cachedConnection) {
    cachedConnection = mongoose.connect(env.dbUrl, {
      dbName: env.dbName,
      serverSelectionTimeoutMS: 10000,
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