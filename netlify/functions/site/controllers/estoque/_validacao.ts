import { NovoProduto } from "../../repositories/produto.repository";

export interface FormProduto {
  nome?: unknown;
  sku?: unknown;
  codigoBarras?: unknown;
  categoria?: unknown;
  fornecedor?: unknown;
  imagem?: unknown;
  unidade?: unknown;
  estante?: unknown;
  nivel?: unknown;
  apto?: unknown;
  precoCusto?: unknown;
  precoVenda?: unknown;
  quantidadeAtual?: unknown;
  quantidadeMinima?: unknown;
}

function texto(valor: unknown): string {
  return typeof valor === "string" ? valor.trim() : "";
}

function numero(valor: unknown): number {
  const bruto = typeof valor === "string" ? valor.replace(",", ".") : valor;
  const n = Number(bruto);
  return Number.isFinite(n) && n >= 0 ? n : NaN;
}

export function validarProduto(corpo: FormProduto): { dados: NovoProduto; erros: string[] } {
  const dados: NovoProduto = {
    nome: texto(corpo.nome),
    sku: texto(corpo.sku).toUpperCase(),
    codigoBarras: texto(corpo.codigoBarras),
    categoria: texto(corpo.categoria),
    fornecedor: texto(corpo.fornecedor),
    imagem: texto(corpo.imagem),
    unidade: texto(corpo.unidade) || "un",
    estante: texto(corpo.estante).toUpperCase(),
    nivel: texto(corpo.nivel).toUpperCase(),
    apto: texto(corpo.apto).toUpperCase(),
    precoCusto: numero(corpo.precoCusto),
    precoVenda: numero(corpo.precoVenda),
    quantidadeAtual: numero(corpo.quantidadeAtual),
    quantidadeMinima: numero(corpo.quantidadeMinima),
  };

  const erros: string[] = [];
  if (dados.nome.length < 2) erros.push("Informe o nome do produto.");
  if (!dados.sku) erros.push("Informe o SKU do produto.");
  if (Number.isNaN(dados.precoCusto)) erros.push("Preço de custo inválido.");
  if (Number.isNaN(dados.precoVenda)) erros.push("Preço de venda inválido.");
  if (Number.isNaN(dados.quantidadeAtual)) erros.push("Quantidade em estoque inválida.");
  if (Number.isNaN(dados.quantidadeMinima)) erros.push("Quantidade mínima inválida.");

  return { dados, erros };
}

export function erroSalvar(erro: unknown): string[] {
  const codigo = (erro as { code?: number }).code;
  return codigo === 11000
    ? ["Já existe um produto com esse SKU na sua conta."]
    : ["Não foi possível salvar o produto. Tente novamente."];
}

export function validarLote(bruto: unknown[]): { dados: NovoProduto[]; erros: string[] } {
  const dados: NovoProduto[] = [];
  const erros: string[] = [];
  const skusVistos = new Set<string>();

  bruto.forEach((item, indice) => {
    const corpo = (item ?? {}) as FormProduto;
    const vazia = Object.values(corpo).every((v) => typeof v !== "string" || v.trim() === "");
    if (vazia) return;

    const linha = indice + 1;
    const { dados: produto, erros: errosProduto } = validarProduto(corpo);
    if (errosProduto.length > 0) {
      erros.push(`Linha ${linha}: ${errosProduto.join(" ")}`);
      return;
    }
    if (skusVistos.has(produto.sku)) {
      erros.push(`Linha ${linha}: SKU ${produto.sku} repetido na lista.`);
      return;
    }
    skusVistos.add(produto.sku);
    dados.push(produto);
  });

  if (dados.length === 0 && erros.length === 0) {
    erros.push("Preencha ao menos uma linha antes de salvar.");
  }
  return { dados, erros };
}
