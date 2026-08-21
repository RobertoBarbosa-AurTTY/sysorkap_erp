import { BaseRepository } from "./base.repository";
import { Cliente, NovoCliente, AtualizacaoCliente } from "../models/cliente.model";

export class ClienteRepository extends BaseRepository<Cliente> {
  create(dados: NovoCliente): Cliente {
    return super.create(dados);
  }

  update(id: string, dados: AtualizacaoCliente): Cliente | undefined {
    return super.update(id, dados);
  }
}