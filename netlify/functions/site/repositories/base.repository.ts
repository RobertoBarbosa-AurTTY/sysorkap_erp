import { randomUUID } from "crypto";

export interface Entidade {
  id: string;
  criadoEm: string;
  atualizadoEm?: string;
}

export abstract class BaseRepository<T extends Entidade> {
  protected itens: T[] = [];

  findAll(): T[] {
    return [...this.itens];
  }

  findById(id: string): T | undefined {
    return this.itens.find((item) => item.id === id);
  }

  create(dados: Omit<T, "id" | "criadoEm" | "atualizadoEm">): T {
    const agora = new Date().toISOString();
    const item = {
      ...dados,
      id: randomUUID(),
      criadoEm: agora,
      atualizadoEm: agora,
    } as T;
    this.itens.push(item);
    return item;
  }

  update(id: string, dados: Partial<Omit<T, "id" | "criadoEm">>): T | undefined {
    const item = this.findById(id);
    if (!item) return undefined;
    const atualizado = { ...item, ...dados, atualizadoEm: new Date().toISOString() } as T;
    this.itens = this.itens.map((i) => (i.id === id ? atualizado : i));
    return atualizado;
  }

  remove(id: string): boolean {
    const antes = this.itens.length;
    this.itens = this.itens.filter((item) => item.id !== id);
    return this.itens.length < antes;
  }

  clear(): void {
    this.itens = [];
  }
}