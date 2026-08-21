export interface Cliente {
  id: string;
  nome: string;
  documento: string;
  email?: string;
  telefone?: string;
  endereco?: string;
  criadoEm: string;
  atualizadoEm: string;
}

export type NovoCliente = Omit<Cliente, "id" | "criadoEm" | "atualizadoEm">;
export type AtualizacaoCliente = Partial<Omit<Cliente, "id" | "criadoEm">>;