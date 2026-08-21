import { Types } from "mongoose";
import { connectDatabase } from "../config/database";
import { ProdutoModel, ProdutoDoc } from "../models/schemas/produto.schema";

export interface NovoProduto {
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
}

export interface ResumoEstoque {
  valorVenda: number;
  parados: number;
  baixos: number;
  itens: number;
}

export interface FiltrosProduto {
  busca?: string;
  categoria?: string;
  status?: string;
}

function escaparRegex(texto: string): string {
  return texto.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function montarFiltro(usuarioId: string, filtros: FiltrosProduto): Record<string, unknown> {
  const filtro: Record<string, unknown> = { usuarioId: new Types.ObjectId(usuarioId) };
  if (filtros.busca) {
    const rx = new RegExp(escaparRegex(filtros.busca), "i");
    filtro.$or = [{ nome: rx }, { sku: rx }, { fornecedor: rx }];
  }
  if (filtros.categoria) filtro.categoria = filtros.categoria;
  if (filtros.status === "esgotado") {
    filtro.quantidadeAtual = { $lte: 0 };
  } else if (filtros.status === "baixo") {
    filtro.$and = [{ quantidadeAtual: { $gt: 0 } }, { $expr: { $lte: ["$quantidadeAtual", "$quantidadeMinima"] } }];
  } else if (filtros.status === "ok") {
    filtro.$expr = { $gt: ["$quantidadeAtual", "$quantidadeMinima"] };
  }
  return filtro;
}

export const produtoRepository = {
  async categorias(usuarioId: string): Promise<string[]> {
    await connectDatabase();
    const lista = await ProdutoModel.distinct("categoria", {
      usuarioId: new Types.ObjectId(usuarioId),
      categoria: { $ne: "" },
    });
    return (lista as string[]).sort((a, b) => a.localeCompare(b, "pt-BR"));
  },
  async resumo(usuarioId: string): Promise<ResumoEstoque> {
    await connectDatabase();
    const [r] = await ProdutoModel.aggregate<{ valorVenda?: number; itens?: number; parados?: number; baixos?: number }>([
      { $match: { usuarioId: new Types.ObjectId(usuarioId) } },
      {
        $group: {
          _id: null,
          valorVenda: { $sum: { $multiply: ["$precoVenda", "$quantidadeAtual"] } },
          itens: { $sum: "$quantidadeAtual" },
          parados: { $sum: { $cond: [{ $lte: ["$quantidadeAtual", 0] }, 1, 0] } },
          baixos: {
            $sum: {
              $cond: [{ $and: [{ $gt: ["$quantidadeAtual", 0] }, { $lte: ["$quantidadeAtual", "$quantidadeMinima"] }] }, 1, 0],
            },
          },
        },
      },
    ]);
    return {
      valorVenda: r?.valorVenda ?? 0,
      itens: r?.itens ?? 0,
      parados: r?.parados ?? 0,
      baixos: r?.baixos ?? 0,
    };
  },

  async listarPaginado(
    usuarioId: string,
    paginaRequisitada: number,
    porPagina: number,
    filtros: FiltrosProduto = {},
  ): Promise<{ produtos: ProdutoDoc[]; total: number; pagina: number; totalPaginas: number }> {
    await connectDatabase();
    const filtro = montarFiltro(usuarioId, filtros);
    const total = await ProdutoModel.countDocuments(filtro);
    const totalPaginas = Math.max(1, Math.ceil(total / porPagina));
    const pagina = Math.min(Math.max(1, paginaRequisitada), totalPaginas);
    const produtos = await ProdutoModel.find(filtro)
      .sort({ nome: 1 })
      .skip((pagina - 1) * porPagina)
      .limit(porPagina)
      .lean<ProdutoDoc[]>();
    return { produtos, total, pagina, totalPaginas };
  },

  async criar(usuarioId: string, dados: NovoProduto): Promise<ProdutoDoc> {
    await connectDatabase();
    const doc = await ProdutoModel.create({
      ...dados,
      usuarioId: new Types.ObjectId(usuarioId),
    });
    return doc.toObject();
  },

  async skusExistentes(usuarioId: string, skus: string[]): Promise<string[]> {
    if (skus.length === 0) return [];
    await connectDatabase();
    const encontrados = await ProdutoModel.find({
      usuarioId: new Types.ObjectId(usuarioId),
      sku: { $in: skus },
    })
      .select("sku")
      .lean<{ sku: string }[]>();
    return encontrados.map((p) => p.sku);
  },

  async criarVarios(usuarioId: string, lista: NovoProduto[]): Promise<number> {
    if (lista.length === 0) return 0;
    await connectDatabase();
    const docs = await ProdutoModel.insertMany(
      lista.map((dados) => ({ ...dados, usuarioId: new Types.ObjectId(usuarioId) })),
    );
    return docs.length;
  },

  async buscarPorId(usuarioId: string, id: string): Promise<ProdutoDoc | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    await connectDatabase();
    return ProdutoModel.findOne({
      _id: new Types.ObjectId(id),
      usuarioId: new Types.ObjectId(usuarioId),
    }).lean<ProdutoDoc>();
  },

  async atualizar(usuarioId: string, id: string, dados: NovoProduto): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) return false;
    await connectDatabase();
    const resultado = await ProdutoModel.updateOne(
      { _id: new Types.ObjectId(id), usuarioId: new Types.ObjectId(usuarioId) },
      { $set: dados },
    );
    return resultado.matchedCount > 0;
  },

  async excluir(usuarioId: string, id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) return false;
    await connectDatabase();
    const resultado = await ProdutoModel.deleteOne({
      _id: new Types.ObjectId(id),
      usuarioId: new Types.ObjectId(usuarioId),
    });
    return resultado.deletedCount > 0;
  },
};
