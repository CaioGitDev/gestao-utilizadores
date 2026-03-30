import { tryCatch } from "../helpers/errorHandler.js";
import { getLogger } from "../helpers/logger.js";
import { getCookie } from "../helpers/cookieHelper.js";

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
    this.API_BASE = "https://p4edev.ipolisboa.min-saude.pt/APIS/P4ECOREAPI";
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
        dataSource: DevExpress.data.AspNet.createStore({
          key: "id",
          loadUrl: `${this.API_BASE}/api/tmpUserDemo`,
          insertUrl: `${this.API_BASE}/api/tmpUserDemo`,
          updateUrl: `${this.API_BASE}/api/tmpUserDemo`,
          deleteUrl: `${this.API_BASE}/api/tmpUserDemo`,
          onBeforeSend: (method, ajaxOptions) => {
            const token = getCookie("ipo_auth_token");
            if (token) {
              ajaxOptions.headers = ajaxOptions.headers || {};
              ajaxOptions.headers["Authorization"] = `Bearer ${token}`;
            }
            if (method === "insert") {
              ajaxOptions.headers["X-Username"] = "64621";
            }
          },
          onInserted: (_, __) =>
            this.#notifyFn("success", "Utilizador criado", ""),
          onUpdated: (_, __) =>
            this.#notifyFn("success", "Utilizador actualizado", ""),
          onRemoved: (_) => this.#notifyFn("info", "Utilizador removido", ""),
          onLoadError: (e) =>
            this.#notifyFn("error", "Erro ao carregar", e.message),
        }),

        columns: [
          {
            dataField: "id",
            caption: "ID",
            width: 110,
            allowEditing: false,
            alignment: "center",
            cellTemplate: (container, options) => {
              const span = document.createElement("span");
              span.title = options.value ?? "";
              span.textContent = options.value
                ? options.value.substring(0, 8) + "…"
                : "—";
              span.style.fontFamily = "monospace";
              span.style.fontSize = "0.8rem";
              container.append(span);
            },
          },
          {
            dataField: "numMec",
            caption: "Nº Mec.",
            dataType: "number",
            width: 90,
            alignment: "center",
            validationRules: [
              { type: "required", message: "Nº mecanográfico é obrigatório." },
              { type: "numeric", message: "Deve ser numérico." },
            ],
          },
          {
            dataField: "nome",
            caption: "Nome",
            validationRules: [
              { type: "required", message: "Nome é obrigatório." },
              { type: "stringLength", min: 2, message: "Mínimo 2 caracteres." },
            ],
          },
          {
            dataField: "email",
            caption: "Email",
            validationRules: [
              { type: "required", message: "Email é obrigatório." },
              { type: "email", message: "Formato de email inválido." },
            ],
          },
          {
            dataField: "categoriaId",
            caption: "Categoria",
            lookup: {
              dataSource: this.#categoriasCache,
              valueExpr: "id",
              displayExpr: "nome",
              allowClearing: true,
            },
          },

          {
            dataField: "ativo",
            caption: "Activo",
            dataType: "boolean",
            width: 90,
            alignment: "center",
            cellTemplate: (container, options) => {
              const badge = document.createElement("span");
              badge.className = `status-badge ${options.value ? "active" : "inactive"}`;
              badge.textContent = options.value ? "✔ Sim" : "✘ Não";
              container.append(badge);
            },
          },

          {
            dataField: "dataInicioFuncoes",
            caption: "Início Funções",
            dataType: "date",
            format: "dd/MM/yyyy",
            width: 130,
            alignment: "center",
            validationRules: [
              { type: "required", message: "Data de início é obrigatória." },
            ],
          },
          {
            dataField: "dataFimFuncoes",
            caption: "Fim Funções",
            dataType: "date",
            format: "dd/MM/yyyy",
            width: 130,
            alignment: "center",
          },
          {
            dataField: "dataCriacao",
            caption: "Data Criação",
            dataType: "date",
            format: "dd/MM/yyyy HH:mm",
            width: 140,
            allowEditing: false,
            alignment: "center",
          },
          {
            dataField: "criadoPor",
            caption: "Criado Por",
            width: 120,
            allowEditing: false,
          },
        ],

        editing: {
          mode: "popup",
          allowAdding: true,
          allowUpdating: true,
          allowDeleting: true,
          useIcons: true,
          popup: {
            title: "Utilizador",
            showTitle: true,
            width: 600,
            height: "auto",
            showCloseButton: true,
          },
          form: {
            colCount: 2,
            items: [
              { dataField: "numMec", label: { text: "Nº Mecanográfico" } },
              {
                dataField: "ativo",
                label: { text: "Activo" },
                editorType: "dxCheckBox",
                colSpan: 1,
              },
              {
                dataField: "nome",
                label: { text: "Nome Completo" },
                colSpan: 2,
              },
              { dataField: "email", label: { text: "Email" }, colSpan: 2 },
              {
                dataField: "categoriaId",
                label: { text: "Categoria" },
                colSpan: 2,
              },
              {
                dataField: "dataInicioFuncoes",
                label: { text: "Início de Funções" },
              },
              {
                dataField: "dataFimFuncoes",
                label: { text: "Fim de Funções (opcional)" },
              },
            ],
          },
        },

        toolbar: {
          items: [
            {
              name: "addRowButton",
              location: "before",
              widget: "dxButton",
              options: {
                icon: "plus",
                text: "Novo Utilizador",
                type: "default",
                stylingMode: "contained",
              },
            },
            {
              location: "before",
              widget: "dxButton",
              options: {
                icon: "refresh",
                text: "Actualizar",
                onClick: () => this.refresh(),
              },
            },
            {
              location: "before",
              widget: "dxButton",
              options: {
                icon: "refresh",
                text: "Recarregar Categorias",
                hint: "Recarrega o lookup de categorias",
                onClick: async () => {
                  await this.#loadCategorias();
                  this.refresh();
                  this.#notifyFn("info", "Categorias actualizadas", "");
                },
              },
            },
            { name: "searchPanel", location: "after" },
          ],
        },

        showBorders: true,
        rowAlternationEnabled: true,
        hoverStateEnabled: true,
        paging: { pageSize: 10 },
        pager: { showPageSizeSelector: true, allowedPageSizes: [5, 10, 25] },
        filterRow: { visible: true },
        searchPanel: { visible: true, placeholder: "Pesquisar…" },
        columnChooser: { enabled: true },
        export: { enabled: true, fileName: "utilizadores_demo" },
        loadPanel: { enabled: true, text: "A carregar…" },
      })
      .dxDataGrid("instance");

    log.info("UserDemoGrid inicializado.");
  }

  refresh() {
    this.#gridInstance?.getDataSource().reload();
    log.debug("Grid de utilizadores actualizado.");
  }
}
