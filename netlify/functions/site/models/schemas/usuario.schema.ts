import { Schema, model } from "mongoose";

const usuarioSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    senhaHash: { type: String, required: true },
  },
  { timestamps: true, collection: "usuarios" },
);

export const UsuarioModel = model("Usuario", usuarioSchema);
