import { Schema, model, Types } from "mongoose";

const produtoSchema = new Schema(
  {
    usuarioId: { type: Schema.Types.ObjectId, ref: "Usuario", required: true },
    nome: { type: String, required: true, trim: true },
    sku: { type: String, required: true, uppercase: true, trim: true },
    codigoBarras: { type: String, trim: true, default: "" },
    categoria: { type: String, trim: true, default: "" },
    fornecedor: { type: String, trim: true, default: "" },
    imagem: { type: String, trim: true, default: "" },
    unidade: { type: String, trim: true, default: "un" },
    estante: { type: String, trim: true, default: "" },
    nivel: { type: String, trim: true, default: "" },
    apto: { type: String, trim: true, default: "" },
    precoCusto: { type: Number, required: true, min: 0 },
    precoVenda: { type: Number, required: true, min: 0 },
    quantidadeAtual: { type: Number, required: true, default: 0 },
    quantidadeMinima: { type: Number, required: true, default: 0 },
  },
  { timestamps: true, collection: "produtos" },
);

produtoSchema.index({ usuarioId: 1, sku: 1 }, { unique: true });

export interface ProdutoDoc {
  _id: Types.ObjectId;
  usuarioId: Types.ObjectId;
  nome: string;
  sku: string;
  codigoBarras: string;
  categoria: string;
  fornecedor: string;
  imagem: string;
  unidade: string;
  estante: string;
  nivel: string;
  apto: string;
  precoCusto: number;
  precoVenda: number;
  quantidadeAtual: number;
  quantidadeMinima: number;
  createdAt: Date;
  updatedAt: Date;
}

export const ProdutoModel = model<ProdutoDoc>("Produto", produtoSchema);
