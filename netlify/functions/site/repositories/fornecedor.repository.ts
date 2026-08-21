import { BaseRepository } from "./base.repository";
import { Fornecedor, NovoFornecedor, AtualizacaoFornecedor } from "../models/fornecedor.model";

export class FornecedorRepository extends BaseRepository<Fornecedor> {
  create(dados: NovoFornecedor): Fornecedor {
    return super.create(dados);
  }

  update(id: string, dados: AtualizacaoFornecedor): Fornecedor | undefined {
    return super.update(id, dados);
  }
}