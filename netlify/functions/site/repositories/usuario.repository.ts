import { connectDatabase } from "../config/database";
import { UsuarioModel } from "../models/schemas/usuario.schema";

export interface UsuarioDoc {
  _id: unknown;
  email: string;
  senhaHash: string;
}

export const usuarioRepository = {
  async findByEmail(email: string): Promise<UsuarioDoc | null> {
    await connectDatabase();
    return UsuarioModel.findOne({ email: email.toLowerCase() }).lean<UsuarioDoc>();
  },

  async criar(email: string, senhaHash: string): Promise<void> {
    await connectDatabase();
    const normalizado = email.toLowerCase();
    await UsuarioModel.updateOne(
      { email: normalizado },
      { $setOnInsert: { email: normalizado, senhaHash } },
      { upsert: true },
    );
  },
};
