export const schemas = {
  Erro: {
    type: "object",
    properties: {
      erro: {
        description: "Mensagem de erro ou detalhes de validação do Zod.",
        oneOf: [
          { type: "string" },
          { type: "object", additionalProperties: true },
        ],
      },
    },
    required: ["erro"],
  },
  Categoria: {
    type: "object",
    properties: {
      id_categoria: { type: "integer", example: 1 },
      nome: { type: "string", example: "RPG" },
    },
    required: ["id_categoria", "nome"],
  },
  CategoriaInput: {
    type: "object",
    properties: { nome: { type: "string", minLength: 2, example: "RPG" } },
    required: ["nome"],
  },
  Cliente: {
    type: "object",
    properties: {
      id_cliente: { type: "integer", example: 1 },
      nome: { type: "string", example: "Ana Silva" },
      email: { type: "string", format: "email", example: "ana@example.com" },
      telefone: { type: "string", example: "11999999999" },
    },
    required: ["id_cliente", "nome", "email", "telefone"],
  },
  ClienteInput: {
    type: "object",
    properties: {
      nome: { type: "string", minLength: 3, example: "Ana Silva" },
      email: { type: "string", format: "email", example: "ana@example.com" },
      telefone: { type: "string", minLength: 8, example: "11999999999" },
      senha: { type: "string", minLength: 6, example: "senha123" },
    },
    required: ["nome", "email", "telefone", "senha"],
  },
  Jogo: {
    type: "object",
    properties: {
      id_jogo: { type: "integer", example: 1 },
      nome: { type: "string", example: "The Legend of Zelda" },
      descricao: { type: "string", nullable: true, example: "Aventura em mundo aberto" },
      preco: { type: "string", example: "249.90", description: "Decimal serializado pelo Prisma." },
      estoque: { type: "integer", example: 10 },
      plataforma: { type: "string", example: "Nintendo Switch" },
      data_lancamento: { type: "string", format: "date-time", example: "2023-05-12T00:00:00.000Z" },
      id_categoria: { type: "integer", example: 1 },
      jogos: { type: "array", items: { $ref: "#/components/schemas/Jogo" } },
      categoria: { $ref: "#/components/schemas/Categoria" },
      avaliacoes: { type: "array", items: { $ref: "#/components/schemas/Avaliacao" } },
    },
    required: ["id_jogo", "nome", "descricao", "preco", "estoque", "plataforma", "data_lancamento", "id_categoria"],
  },
  JogoInput: {
    type: "object",
    properties: {
      nome: { type: "string", minLength: 2, example: "The Legend of Zelda" },
      descricao: { type: "string", nullable: true, example: "Aventura em mundo aberto" },
      preco: { type: "number", format: "double", exclusiveMinimum: 0, example: 249.9 },
      estoque: { type: "integer", minimum: 0, example: 10 },
      plataforma: { type: "string", minLength: 2, example: "Nintendo Switch" },
      data_lancamento: { type: "string", format: "date", example: "2023-05-12" },
      id_categoria: { type: "integer", example: 1 },
    },
    required: ["nome", "preco", "estoque", "plataforma", "data_lancamento", "id_categoria"],
  },
  Avaliacao: {
    type: "object",
    properties: {
      id_avaliacao: { type: "integer", example: 1 },
      nota: { type: "integer", minimum: 1, maximum: 5, example: 5 },
      comentario: { type: "string", nullable: true, example: "Excelente jogo" },
      data_avaliacao: { type: "string", format: "date-time" },
      id_cliente: { type: "integer", example: 1 },
      id_jogo: { type: "integer", example: 1 },
      cliente: { $ref: "#/components/schemas/Cliente" },
      jogo: { $ref: "#/components/schemas/Jogo" },
    },
    required: ["id_avaliacao", "nota", "comentario", "data_avaliacao", "id_cliente", "id_jogo"],
  },
  AvaliacaoInput: {
    type: "object",
    properties: {
      nota: { type: "integer", minimum: 1, maximum: 5, example: 5 },
      comentario: { type: "string", nullable: true, example: "Excelente jogo" },
      id_cliente: { type: "integer", example: 1 },
      id_jogo: { type: "integer", example: 1 },
    },
    required: ["nota", "id_cliente", "id_jogo"],
  },
  ItemVendaInput: {
    type: "object",
    properties: {
      id_jogo: { type: "integer", example: 1 },
      quantidade: { type: "integer", minimum: 1, example: 2 },
    },
    required: ["id_jogo", "quantidade"],
  },
  VendaInput: {
    type: "object",
    properties: {
      id_cliente: { type: "integer", example: 1 },
      forma_pagamento: { type: "string", minLength: 2, example: "Cartão" },
      itens: { type: "array", minItems: 1, items: { $ref: "#/components/schemas/ItemVendaInput" } },
    },
    required: ["id_cliente", "forma_pagamento", "itens"],
  },
  LoginInput: {
    type: "object",
    properties: {
      email: { type: "string", format: "email", example: "ana@example.com" },
      senha: { type: "string", example: "senha123" },
    },
    required: ["email", "senha"],
  },
  LoginResponse: {
    type: "object",
    properties: {
      tipo: { type: "string", enum: ["admin", "cliente"], example: "cliente" },
      id_admin: { type: "integer", example: 1 },
      id_cliente: { type: "integer", example: 1 },
      nome: { type: "string", example: "Ana Silva" },
      email: { type: "string", format: "email", example: "ana@example.com" },
      token: { type: "string", example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." },
    },
    required: ["nome", "email", "token"],
  },
} as const