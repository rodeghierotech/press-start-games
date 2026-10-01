import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { test } from "node:test"

const backRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const frontRoot = path.resolve(backRoot, "..", "full_262_front", "src")

async function source(...parts) {
  return readFile(path.join(frontRoot, ...parts), "utf8")
}

test("frontend offers featured games and the authenticated account route", async () => {
  const [app, routes, session, account] = await Promise.all([
    source("App.tsx"),
    source("main.tsx"),
    source("utils", "sessao.ts"),
    source("CustomerAccount.tsx"),
  ])

  assert.match(app, /destaques=true/)
  assert.match(app, /Ver somente destaques/)
  assert.match(routes, /path: "minha-conta"/)
  assert.match(session, /sessao_id/)
  assert.match(account, /clientes\/me\/interacoes/)
})

test("game interactions send the stored JWT as a bearer token", async () => {
  const details = await source("GameDetails.tsx")
  assert.match(details, /cabecalhoAutorizacao\(clienteLogado\.token\)/)
  assert.doesNotMatch(details, /body:\s*JSON\.stringify\(\{\s*id_cliente/)
})

test("game details guides an authenticated administrator to the customer login", async () => {
  const [details, session] = await Promise.all([
    source("GameDetails.tsx"),
    source("utils", "sessao.ts"),
  ])

  assert.match(details, /sessaoAdmin/)
  assert.match(details, /Você está conectado como administrador/)
  assert.match(details, /Entrar como cliente/)
  assert.match(session, /encerrarSessaoAdmin/)
})

test("dashboard authenticates administrative requests and offers a review response action", async () => {
  const dashboard = await source("AdminDashboard.tsx")
  assert.match(dashboard, /cabecalhoAutorizacao\(admin\.token\)/)
  assert.match(dashboard, /Responder/)
  assert.match(dashboard, /avaliacoes\/\$\{avaliacaoRespondida\.id_avaliacao\}\/resposta/)
})

test("dashboard lists available games with their administrative details", async () => {
  const dashboard = await source("AdminDashboard.tsx")

  assert.match(dashboard, /Jogos disponíveis/)
  assert.match(dashboard, /Categoria/)
  assert.match(dashboard, /Destaque/)
  assert.match(dashboard, /Nenhum jogo cadastrado/)
})
