export class Categoria {
  // [POO: Propriedades privadas]
  #id;
  #nome;
  #descricao;
  #ativo;
  #dataCriacao;

  constructor(data = {}) {
    this.#id = data.id ?? null;
    this.#nome = data.nome ?? "";
    this.#descricao = data.descricao ?? "";
    this.#ativo = data.ativo ?? true;
    this.#dataCriacao = data.dataCriacao
      ? new Date(data.dataCriacao)
      : new Date();
  }

  // ── Getters ────────────────────────────────────────────────
  get id() {
    return this.#id;
  }
  get nome() {
    return this.#nome;
  }
  get descricao() {
    return this.#descricao;
  }
  get ativo() {
    return this.#ativo;
  }
  get dataCriacao() {
    return this.#dataCriacao;
  }

  // ── Setters com validação ──────────────────────────────────
  set nome(value) {
    if (typeof value !== "string" || value.trim().length < 2) {
      throw new Error("Nome deve ter pelo menos 2 caracteres.");
    }
    this.#nome = value.trim();
  }

  set descricao(value) {
    if (typeof value !== "string") throw new Error("Descrição inválida.");
    this.#descricao = value.trim();
  }

  set ativo(value) {
    this.#ativo = Boolean(value);
  }

  /**
   * Serializa para envio à API.
   * @param {boolean} includeId 
   */
  toApiPayload(includeId = true) {
    const payload = {
      nome: this.#nome,
      descricao: this.#descricao,
      ativo: this.#ativo,
    };
    if (includeId && this.#id !== null) payload.id = this.#id;
    return payload;
  }

  // [Factory Method estático]
  static fromApi(raw) {
    return new Categoria(raw);
  }
  static fromApiList(arr) {
    return Array.isArray(arr) ? arr.map(Categoria.fromApi) : [];
  }

  toString() {
    return `Categoria(id=${this.#id}, nome="${this.#nome}")`;
  }
}
