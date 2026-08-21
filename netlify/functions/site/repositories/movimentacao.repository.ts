import { BaseRepository } from "./base.repository";
import { Movimentacao, NovaMovimentacao, AtualizacaoMovimentacao, TipoMovimentacao } from "../models/movimentacao.model";

export class MovimentacaoRepository extends BaseRepository<Movimentacao> {
  findByProduto(produtoId: string): Movimentacao[] {
    return this.itens.filter((item) => item.produtoId === produtoId);
  }

  findByTipo(tipo: TipoMovimentacao): Movimentacao[] {
    return this.itens.filter((item) => item.tipo === tipo);
  }

  create(dados: NovaMovimentacao): Movimentacao {
    return super.create(dados);
  }

  update(id: string, dados: AtualizacaoMovimentacao): Movimentacao | undefined {
    return super.update(id, dados);
  }
}