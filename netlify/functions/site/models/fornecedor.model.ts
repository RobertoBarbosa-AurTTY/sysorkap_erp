export interface Fornecedor {
  id: string;
  razaoSocial: string;
  documento: string;
  email?: string;
  telefone?: string;
  endereco?: string;
  criadoEm: string;
  atualizadoEm: string;
}

export type NovoFornecedor = Omit<Fornecedor, "id" | "criadoEm" | "atualizadoEm">;
export type AtualizacaoFornecedor = Partial<Omit<Fornecedor, "id" | "criadoEm">>;