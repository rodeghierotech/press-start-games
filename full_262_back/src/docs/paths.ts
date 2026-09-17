const json = (schema: object, example?: unknown) => ({
  content: { "application/json": { schema, ...(example === undefined ? {} : { example }) } },
})

const response = (description: string, schema: object, example?: unknown) => ({
  description,
  content: { "application/json": { schema, ...(example === undefined ? {} : { example }) } },
})

const arrayOf = (name: string) => ({ type: "array", items: { $ref: `#/components/schemas/${name}` } })
const ref = (name: string) => ({ $ref: `#/components/schemas/${name}` })
const errorResponse = (description: string) => response(description, ref("Erro"), { erro: "Não foi possível processar a solicitação" })

export const paths = {
  "/": {
    get: {
      summary: "Verifica se a API está disponível",
      responses: { 200: response("API disponível", { type: "string" }, "API: Loja de Jogos") },
    },
  },
  "/avaliacoes": {
    get: {
      summary: "Lista avaliações",
      responses: { 200: response("Avaliações encontradas", arrayOf("Avaliacao")), 500: errorResponse("Falha ao carregar avaliações") },
    },
    post: {
      summary: "Registra uma avaliação",
      requestBody: { required: true, ...json(ref("AvaliacaoInput")) },
      responses: { 201: response("Avaliação registrada", ref("Avaliacao")), 400: errorResponse("Dados inválidos ou avaliação não registrada") },
    },
  },
  "/categorias": {
    get: {
      summary: "Lista categorias com seus jogos",
      responses: { 200: response("Categorias encontradas", arrayOf("Categoria")), 500: errorResponse("Falha ao carregar categorias") },
    },
    post: {
      summary: "Cadastra uma categoria",
      requestBody: { required: true, ...json(ref("CategoriaInput")) },
      responses: { 201: response("Categoria criada", ref("Categoria")), 400: errorResponse("Dados inválidos ou categoria não criada") },
    },
  },
  "/clientes": {
    get: {
      summary: "Lista clientes sem expor senhas",
      responses: { 200: response("Clientes encontrados", arrayOf("Cliente")), 500: errorResponse("Falha ao carregar clientes") },
    },
    post: {
      summary: "Cadastra um cliente",
      requestBody: { required: true, ...json(ref("ClienteInput")) },
      responses: { 201: response("Cliente criado", ref("Cliente")), 400: errorResponse("Dados inválidos ou cliente não criado") },
    },
  },
  "/jogos": {
    get: {
      summary: "Lista jogos com categorias e avaliações",
      responses: { 200: response("Jogos encontrados", arrayOf("Jogo")), 500: errorResponse("Falha ao carregar jogos") },
    },
    post: {
      summary: "Cadastra um jogo",
      requestBody: { required: true, ...json(ref("JogoInput")) },
      responses: { 201: response("Jogo criado", ref("Jogo")), 400: errorResponse("Dados inválidos ou jogo não criado") },
    },
  },
  "/jogos/metricas/ia": {
    get: {
      summary: "Consulta a quantidade de solicitações à IA",
      responses: { 200: response("Métrica retornada", { type: "object", properties: { totalConsultas: { type: "integer", example: 3 } }, required: ["totalConsultas"] }) },
    },
  },
  "/jogos/pesquisa/{termo}": {
    get: {
      summary: "Pesquisa jogos por nome, plataforma ou categoria",
      parameters: [{ name: "termo", in: "path", required: true, schema: { type: "string" }, example: "RPG" }],
      responses: { 200: response("Jogos encontrados", arrayOf("Jogo")), 500: errorResponse("Falha na pesquisa") },
    },
  },
  "/jogos/sugestao-ia": {
    post: {
      summary: "Solicita uma sugestão de jogo à IA",
      requestBody: {
        required: true,
        ...json({ type: "object", properties: { preferencia: { type: "string", minLength: 8, maxLength: 500, example: "Quero um RPG de aventura para jogar no Switch" } }, required: ["preferencia"] }),
      },
      responses: { 200: response("Sugestão gerada", { type: "object", properties: { sugestao: { type: "string" } }, required: ["sugestao"] }), 400: errorResponse("Preferência inválida"), 500: errorResponse("Falha ao consultar a IA") },
    },
  },
  "/login": {
    post: {
      summary: "Realiza login unificado de administrador ou cliente",
      requestBody: { required: true, ...json(ref("LoginInput")) },
      responses: { 200: response("Login realizado", ref("LoginResponse")), 400: errorResponse("E-mail ou senha não informados"), 401: errorResponse("Login ou senha incorretos"), 500: errorResponse("Falha ao iniciar sessão") },
    },
  },
  "/login/admin": {
    post: {
      summary: "Realiza login de administrador",
      requestBody: { required: true, ...json(ref("LoginInput")) },
      responses: { 200: response("Login realizado", ref("LoginResponse")), 400: errorResponse("Login ou senha incorretos") },
    },
  },
  "/login/cliente": {
    post: {
      summary: "Realiza login de cliente",
      requestBody: { required: true, ...json(ref("LoginInput")) },
      responses: { 200: response("Login realizado", ref("LoginResponse")), 400: errorResponse("Login ou senha incorretos") },
    },
  },
  "/vendas": {
    get: {
      summary: "Lista vendas com cliente e itens",
      responses: { 200: response("Vendas encontradas", { type: "array", items: { type: "object", additionalProperties: true } }), 500: errorResponse("Falha ao carregar vendas") },
    },
    post: {
      summary: "Registra uma venda e atualiza o estoque",
      requestBody: { required: true, ...json(ref("VendaInput")) },
      responses: { 201: response("Venda registrada", { type: "object", additionalProperties: true }), 400: errorResponse("Dados inválidos, jogo inexistente ou estoque insuficiente") },
    },
  },
} as const