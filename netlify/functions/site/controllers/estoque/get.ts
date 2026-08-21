import type { RouteHandler } from "../../helpers/route-handler";
import { renderPage } from "../../helpers/render";
import { produtoRepository, ResumoEstoque, FiltrosProduto } from "../../repositories/produto.repository";
import { ProdutoDoc } from "../../models/schemas/produto.schema";

const POR_PAGINA = 10;

function texto(valor: unknown): string {
  return typeof valor === "string" ? valor.trim().slice(0, 100) : "";
}

const handler: RouteHandler = async (req, res) => {
  const requisitada = Number(req.query.pagina);
  const paginaRequisitada = Number.isInteger(requisitada) && requisitada >= 1 ? requisitada : 1;

  const filtros: FiltrosProduto = {
    busca: texto(req.query.q),
    categoria: texto(req.query.categoria),
    status: texto(req.query.status),
  };
  const statusValido = ["ok", "baixo", "esgotado"].includes(filtros.status ?? "");
  if (!statusValido) filtros.status = undefined;

  let produtos: ProdutoDoc[] = [];
  let resumo: ResumoEstoque = { valorVenda: 0, parados: 0, baixos: 0, itens: 0 };
  let categorias: string[] = [];
  let total = 0;
  let pagina = 1;
  let totalPaginas = 1;
  let erro = false;

  try {
    const usuarioId = String(res.locals.usuarioId);
    const [paginado, resumoBanco, categoriasBanco] = await Promise.all([
      produtoRepository.listarPaginado(usuarioId, paginaRequisitada, POR_PAGINA, filtros),
      produtoRepository.resumo(usuarioId),
      produtoRepository.categorias(usuarioId),
    ]);
    produtos = paginado.produtos;
    total = paginado.total;
    pagina = paginado.pagina;
    totalPaginas = paginado.totalPaginas;
    resumo = resumoBanco;
    categorias = categoriasBanco;
  } catch {
    erro = true;
  }

  renderPage(res, "estoque/index", {
    titulo: "Estoque",
    produtos,
    erro,
    pagina,
    totalPaginas,
    total,
    resumo,
    categorias,
    filtros,
    atualizado: req.query.atualizado === "1",
    excluido: req.query.excluido === "1",
  });
};

export default handler;
