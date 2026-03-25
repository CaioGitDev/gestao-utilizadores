export class UserDemo {
  // propriedades
  #id;
  #numMec;
  #nome;
  #email;
  #categoriaId;
  #ativo;
  #dataInicioFuncoes;
  #dataFimFuncoes;
  #dataCriacao;
  #criadoPor;

  constructor(data = {}) {
    this.#id = data.id ?? null;
    this.numMec = data.numMec ?? null;
    this.nome = data.nome ?? "";
    this.email = data.email;
    this.categoriaId = data.categoriaId ?? 1;
    this.#ativo = data.ativo ?? true;
    this.#dataInicioFuncoes = data.dataInicioFuncoes
      ? new Date(data.dataInicioFuncoes)
      : null;
    this.#dataFimFuncoes = data.dataFimFuncoes
      ? new Date(data.dataFimFuncoes)
      : null;
    this.#dataCriacao = data.dataCriacao
      ? new Date(data.dataCriacao)
      : new Date();
    this.#criadoPor = data.criadoPor ?? "";
  }

  // GETS
  get id() {
    return this.#id;
  }
  get numMec() {
    return this.#numMec;
  }
  get nome() {
    return this.#nome;
  }
  get email() {
    return this.#email;
  }
  get categoriaId() {
    return this.#categoriaId;
  }
  get ativo() {
    return this.#ativo;
  }
  get dataInicioFuncoes() {
    return this.#dataInicioFuncoes;
  }
  get dataFimFuncoes() {
    return this.#dataFimFuncoes;
  }
  get dataCriacao() {
    return this.#dataCriacao;
  }
  get criadoPor() {
    return this.#criadoPor;
  }

  get nomeAbreviado() {
    if (!this.#nome) return "-";
    // caio roberto rosa
    const partes = this.#nome.trim().split(" ");
    return partes.length > 1 ? `${partes[partes.length - 1]}` : partes[0];
  }

  // ── Setters com validação ──────────────────────────────────
  set numMec(value) {
    const n = parseInt(value, 10);
    if (isNaN(n) || n <= 0) throw new Error("Número mecanográfico inválido.");
    this.#numMec = n;
  }

  set nome(value) {
    if (typeof value !== "string" || value.trim().length < 2) {
      throw new Error("Nome deve ter pelo menos 2 caracteres.");
    }
    this.#nome = value.trim();
  }

  set email(value) {
     const trimmed    = typeof value === 'string' ? value.trim() : '';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) throw new Error('Email inválido.');
    this.#email = trimmed.toLowerCase();
  }

  set categoriaId(value) {
    this.#categoriaId = value !== undefined ? value : null;
  }
  set ativo(value) {
    this.#ativo = Boolean(value);
  }

  set dataInicioFuncoes(value) {
    if (!value) throw new Error("Data de início de funções é obrigatória.");
    this.#dataInicioFuncoes = new Date(value);
  }

  set dataFimFuncoes(value) {
    this.#dataFimFuncoes = value ? new Date(value) : null;
  }

  set criadoPor(value) {
    if (!value || String(value).trim() === "")
      throw new Error('"Criado por" é obrigatório.');
    this.#criadoPor = String(value).trim();
  }

  toApiPayload(includeId = true) {
    const payload = {
      numMec: this.#numMec,
      nome: this.#nome,
      email: this.#email,
      categoriaId: this.#categoriaId,
      ativo: this.#ativo,
      dataInicioFuncoes: this.#dataInicioFuncoes?.toISOString() ?? null,
      dataFimFuncoes: this.#dataFimFuncoes?.toISOString() ?? null,
      criadoPor: this.#criadoPor,
    };

    if (includeId && this.#id) payload.id = this.#id;

    return payload;
  }

  // FACTORY
  static fromApi(raw) {
    return new UserDemo(raw);
  }
  static fromApiList(arr) {
    return Array.isArray(arr) ? arr.map(UserDemo.fromApi) : [];
  }

  toString() {
    return `User(id=${this.#id}, numMec= ${this.#numMec}, nome="${this.#nome}")`;
  }
}
