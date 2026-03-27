import { tryCatch } from "../helpers/errorHandler.js";
import { getLogger } from "../helpers/logger.js";

const log = getLogger("UserDemoGrid");

export class UserDemoGridComponent {
  #service;
  #categoriaService;
  #containerId;
  #gridInstance;
  #notifyFn;

  // cache das categorias
  #categoriasCache = [];

  /**
   * @param {UserDemoService} service
   * @param {CategoriaService} categoriaService
   * @param {string} containerId
   * @param {Function} notifyFn
   */
  constructor(service, categoriaService, containerId, notifyFn) {
    this.#service = service;
    this.#categoriaService = categoriaService;
    this.#containerId = containerId;
    this.#notifyFn = notifyFn;
  }

  async init() {
    log.info("A inicializar User Grid");
    await this.#loadCategorias();
    this.#buildGrid();
  }

  async #loadCategorias() {
    const result = await tryCatch(
      () => this.#categoriaService.getAllAtivas(),
      (err) => log.warn("Não foi possivel carregar as categorias", err.message),
    );

    this.#categoriasCache = result
      ? result.map((x) => ({
          id: x.id,
          nome: x.nome,
        }))
      : [];

    log.debug("Categorias carregadas", this.#categoriasCache.length);
  }

  #buildGrid() {
    this.#gridInstance = $(`#${this.#containerId}`)
      .dxDataGrid({
        dataSource: new DevExpress.data.CustomStore({
          key: "id",
          load: async () => {
            const result = await tryCatch(
              () =>
                this.#service
                  .getAll()
                  .then((users) => users.map((u) => u.toApiPayload(true))),
              (err) =>
                this.#notifyFn(
                  "error",
                  "Erro ao carregar utilizadores",
                  err.message,
                ),
            );

            return result ?? [];
          },
          insert: async (values) => {
            const result = await tryCatch(
              () => this.#service.create(values),
              (err) =>
                this.#notifyFn(
                  "error",
                  "Erro ao criar utilizador",
                  err.message,
                ),
            );

            if (result) {
              this.#notifyFn(
                "success",
                "Utilizador criado",
                `${result.nome} adicionado com sucesso.`,
              );
            }

            return result?.toApiPayload(true) ?? values;
          },
          update: async (key, values) => {
            const result = await tryCatch(
              () => this.#service.update(key, values),
              (err) =>
                this.#notifyFn(
                  "error",
                  "Erro ao atualizar utilizador",
                  err.message,
                ),
            );
            if (result) {
              this.#notifyFn("success", "Utilizador atualizado", "");
            }
          },
          remove: async (key) => {
            const confirmed = await this.#confirmDelete();

            if (!confirmed) throw new Error("Operação cancelada");

            await tryCatch(
              () => this.#service.remove(key),
              (err) =>
                this.#notifyFn(
                  "error",
                  "Erro ao remover utilizador",
                  err.message,
                ),
            );

            this.#notifyFn("info", "Utilizador removido", "Registo eleminado.");
          },
        }),

        columns: [],
        editing: {},
        toolbar: {},

        showBorders: true,
        rowAlternationEnable: true,
        hoverStateEnabled: true,
        paging: { pageSize: 10 },
        pager: {
          showPageSizeSelector: true,
          allowedPageSizes: [5, 10, 25],
        },
        filterRow: {
          visible: true,
        },
        searchPanel: {
          visible: true,
          placeholder: "pesquisar...",
        },
        columnChooser: { enabled: true },
        export: {
          enabled: true,
          fileName: "Utilizadores_demo",
        },
        loadPanel: {
          enabled: true,
          text: "A carregar...",
        },
      })
      .dxDataGrid("instance");
  }

  async #confirmDelete() {
    return new Promise((resolve) => {
      DevExpress.ui.dialog
        .confirm(
          "Tem a certeza que pretende eliminar este utilziador?",
          "Confirmar eliminação",
        )
        .then(resolve);
    });
  }
}
