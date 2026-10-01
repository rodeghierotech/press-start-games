ALTER TABLE "jogos" ADD COLUMN "destaque" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "clientes" ADD COLUMN "sessao_id" UUID NOT NULL DEFAULT gen_random_uuid();
CREATE UNIQUE INDEX "clientes_sessao_id_key" ON "clientes"("sessao_id");

CREATE TABLE "respostas_avaliacao" (
  "id_resposta" SERIAL PRIMARY KEY,
  "mensagem" TEXT NOT NULL,
  "data_resposta" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "id_avaliacao" INTEGER NOT NULL,
  "id_admin" INTEGER NOT NULL
);

CREATE UNIQUE INDEX "respostas_avaliacao_id_avaliacao_key"
  ON "respostas_avaliacao"("id_avaliacao");

ALTER TABLE "respostas_avaliacao"
  ADD CONSTRAINT "respostas_avaliacao_id_avaliacao_fkey"
  FOREIGN KEY ("id_avaliacao") REFERENCES "avaliacoes"("id_avaliacao")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "respostas_avaliacao"
  ADD CONSTRAINT "respostas_avaliacao_id_admin_fkey"
  FOREIGN KEY ("id_admin") REFERENCES "admins"("id_admin")
  ON DELETE RESTRICT ON UPDATE CASCADE;
