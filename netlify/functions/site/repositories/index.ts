import { ClienteRepository } from "./cliente.repository";
import { FornecedorRepository } from "./fornecedor.repository";
import { MovimentacaoRepository } from "./movimentacao.repository";

export const repositories = {
  clientes: new ClienteRepository(),
  fornecedores: new FornecedorRepository(),
  movimentacoes: new MovimentacaoRepository(),
};
