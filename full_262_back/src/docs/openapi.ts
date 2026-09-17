import { paths } from "./paths"
import { schemas } from "./schemas"

export const openapiDocument = {
  openapi: "3.0.3",
  info: {
    title: "Loja de Jogos API",
    version: "1.0.0",
    description: "Documentação da API REST da Loja de Jogos.",
  },
  servers: [{ url: "http://localhost:3000", description: "Servidor local" }],
  tags: [
    { name: "Avaliações" },
    { name: "Categorias" },
    { name: "Clientes" },
    { name: "Jogos" },
    { name: "Login" },
    { name: "Vendas" },
  ],
  components: {
    securitySchemes: {
      bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT", description: "JWT retornado pelos endpoints de login." },
    },
    schemas,
  },
  paths,
} as const