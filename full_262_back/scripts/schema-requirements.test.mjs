import assert from "node:assert/strict"
import { readFile, readdir } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { test } from "node:test"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const schema = await readFile(path.join(root, "prisma", "schema.prisma"), "utf8")
const migrationsDir = path.join(root, "prisma", "migrations")

test("schema includes the PDF requirement fields and administrative review response", () => {
  assert.match(schema, /sessao_id\s+String\s+@unique\s+@default\(uuid\(\)\)/)
  assert.match(schema, /destaque\s+Boolean\s+@default\(false\)/)
  assert.match(schema, /model RespostaAvaliacao\s*\{/)
  assert.match(schema, /id_avaliacao\s+Int\s+@unique/)
  assert.match(schema, /id_admin\s+Int/)
})

test("migration adds the PDF requirement database objects without recreating existing tables", async () => {
  const migration = (await readdir(migrationsDir)).find(name => name.endsWith("_add_pdf_requirements"))
  assert.ok(migration, "expected an add_pdf_requirements migration")
  const sql = await readFile(path.join(migrationsDir, migration, "migration.sql"), "utf8")
  assert.match(sql, /ALTER TABLE "jogos" ADD COLUMN "destaque" BOOLEAN NOT NULL DEFAULT false;/)
  assert.match(sql, /ALTER TABLE "clientes" ADD COLUMN "sessao_id" UUID/)
  assert.match(sql, /CREATE TABLE "respostas_avaliacao"/)
  assert.doesNotMatch(sql, /DROP TABLE/i)
})
