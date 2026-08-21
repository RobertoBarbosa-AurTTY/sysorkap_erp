export type TipoMovimentacao = "entrada" | "saida";

export interface Movimentacao {
  id: string;
  tipo: TipoMovimentacao;
  produtoId: string;
  quantidade: number;
  observacao?: string;
  data: string;
  criadoEm: string;
}

export type NovaMovimentacao = Omit<Movimentacao, "id" | "criadoEm">;
export type AtualizacaoMovimentacao = Partial<Omit<Movimentacao, "id" | "criadoEm">>;