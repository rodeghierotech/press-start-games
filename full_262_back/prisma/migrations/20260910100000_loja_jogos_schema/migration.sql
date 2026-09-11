DROP TABLE IF EXISTS "avaliacoes";
DROP TABLE IF EXISTS "itens_venda";
DROP TABLE IF EXISTS "vendas";
DROP TABLE IF EXISTS "jogos";
DROP TABLE IF EXISTS "categorias";
DROP TABLE IF EXISTS "agendamentos";
DROP TABLE IF EXISTS "servicos";
DROP TABLE IF EXISTS "categorias_servico";
DROP TABLE IF EXISTS "barbeiros";
DROP TABLE IF EXISTS "clientes";
DROP TABLE IF EXISTS "admins";
DROP TABLE IF EXISTS "carros";
DROP TABLE IF EXISTS "marcas";
DROP TYPE IF EXISTS "Combustiveis";

CREATE TABLE "clientes" (
  "id_cliente" SERIAL PRIMARY KEY,
  "nome" VARCHAR(100) NOT NULL,
  "email" VARCHAR(100) NOT NULL UNIQUE,
  "telefone" VARCHAR(20) NOT NULL,
  "senha" VARCHAR(255) NOT NULL
);

CREATE TABLE "admins" (
  "id_admin" SERIAL PRIMARY KEY,
  "nome" VARCHAR(100) NOT NULL,
  "email" VARCHAR(100) NOT NULL UNIQUE,
  "senha" VARCHAR(255) NOT NULL
);

CREATE TABLE "categorias" (
  "id_categoria" SERIAL PRIMARY KEY,
  "nome" VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE "jogos" (
  "id_jogo" SERIAL PRIMARY KEY,
  "nome" VARCHAR(100) NOT NULL,
  "descricao" TEXT,
  "preco" DECIMAL(10, 2) NOT NULL,
  "estoque" INTEGER NOT NULL,
  "plataforma" VARCHAR(50) NOT NULL,
  "data_lancamento" DATE NOT NULL,
  "id_categoria" INTEGER NOT NULL,
  CONSTRAINT "jogos_id_categoria_fkey"
    FOREIGN KEY ("id_categoria") REFERENCES "categorias"("id_categoria")
    ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "vendas" (
  "id_venda" SERIAL PRIMARY KEY,
  "data_venda" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "valor_total" DECIMAL(10, 2) NOT NULL,
  "forma_pagamento" VARCHAR(30) NOT NULL,
  "id_cliente" INTEGER NOT NULL,
  CONSTRAINT "vendas_id_cliente_fkey"
    FOREIGN KEY ("id_cliente") REFERENCES "clientes"("id_cliente")
    ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "itens_venda" (
  "id_item" SERIAL PRIMARY KEY,
  "quantidade" INTEGER NOT NULL,
  "preco_unitario" DECIMAL(10, 2) NOT NULL,
  "subtotal" DECIMAL(10, 2) NOT NULL,
  "id_venda" INTEGER NOT NULL,
  "id_jogo" INTEGER NOT NULL,
  CONSTRAINT "itens_venda_id_venda_fkey"
    FOREIGN KEY ("id_venda") REFERENCES "vendas"("id_venda")
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "itens_venda_id_jogo_fkey"
    FOREIGN KEY ("id_jogo") REFERENCES "jogos"("id_jogo")
    ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "avaliacoes" (
  "id_avaliacao" SERIAL PRIMARY KEY,
  "nota" INTEGER NOT NULL,
  "comentario" TEXT,
  "data_avaliacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "id_cliente" INTEGER NOT NULL,
  "id_jogo" INTEGER NOT NULL,
  CONSTRAINT "avaliacoes_id_cliente_fkey"
    FOREIGN KEY ("id_cliente") REFERENCES "clientes"("id_cliente")
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "avaliacoes_id_jogo_fkey"
    FOREIGN KEY ("id_jogo") REFERENCES "jogos"("id_jogo")
    ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "avaliacoes_cliente_jogo_key"
  ON "avaliacoes"("id_cliente", "id_jogo");
