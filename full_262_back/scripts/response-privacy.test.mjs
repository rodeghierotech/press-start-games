import assert from "node:assert/strict"
import { once } from "node:events"
import { after, test } from "node:test"
import express from "express"

// Route tests use a disconnected Prisma client; no database or AI calls are made.
process.env.DATABASE_URL = "postgresql://test:test@127.0.0.1:1/test"
process.env.GEMINI_API_KEY = ""
const { prisma } = await import("../lib/prisma.ts")
const { default: jogos } = await import("../src/routes/jogos.ts")
const { default: avaliacoes } = await import("../src/routes/avaliacoes.ts")
const { default: vendas } = await import("../src/routes/vendas.ts")

const app = express()
app.use(express.json())
app.use("/jogos", jogos)
app.use("/avaliacoes", avaliacoes)
app.use("/vendas", vendas)
const server = app.listen(0, "127.0.0.1")
await once(server, "listening")
const baseUrl = `http://127.0.0.1:${server.address().port}`
test("AI metrics return JSON and count received requests without querying the provider", async () => {
  const before = await fetch(`${baseUrl}/jogos/metricas/ia`)
  assert.equal(before.status, 200)
  assert.equal(before.headers.get("cache-control"), "no-store")
  const initial = await before.json()
  assert.equal(initial.totalConsultas, 0)
  const rejected = await fetch(`${baseUrl}/jogos/sugestao-ia`, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: "{}",
  })
  assert.equal(rejected.status, 400)
  const afterRequest = await fetch(`${baseUrl}/jogos/metricas/ia`)
  assert.deepEqual(await afterRequest.json(), { totalConsultas: 1 })
})
after(async () => {
  server.closeAllConnections()
  await new Promise(resolve => server.close(resolve))
  await prisma.$disconnect()
})

const cliente = { id_cliente: 1, nome: "Cliente teste", email: "teste@example.invalid", telefone: "12345678", senha: "HASH_NAO_PUBLICAR" }
const publicFields = { id_cliente: true, nome: true }
const salesFields = { ...publicFields, email: true, telefone: true }

function replaceMethod(t, target, method, replacement) {
  const original = target[method]
  target[method] = replacement
  t.after(() => { target[method] = original })
}

function selectedCliente(relation, expectedFields) {
  assert.deepEqual(relation, { select: expectedFields })
  return Object.fromEntries(Object.keys(relation.select).map(key => [key, cliente[key]]))
}

const cases = [
  { path: "/jogos", model: "jogo", method: "findMany", fields: publicFields, nested: true },
  { path: "/avaliacoes", model: "avaliacao", method: "findMany", fields: publicFields },
  { path: "/avaliacoes", model: "avaliacao", method: "create", fields: publicFields, body: { nota: 5, id_cliente: 1, id_jogo: 1 } },
  { path: "/vendas", model: "venda", method: "findMany", fields: salesFields },
  { path: "/vendas", model: "venda", method: "create", fields: salesFields, body: { id_cliente: 1, forma_pagamento: "PIX", itens: [{ id_jogo: 1, quantidade: 1 }] } },
]

for (const scenario of cases) {
  test(`${scenario.body ? "POST" : "GET"} ${scenario.path} selects safe customer fields`, async t => {
    let selectionChecked = false
    const query = async args => {
      const relation = scenario.nested ? args.include.avaliacoes.include.cliente : args.include.cliente
      const safeCliente = selectedCliente(relation, scenario.fields)
      selectionChecked = true
      const row = scenario.nested ? { avaliacoes: [{ cliente: safeCliente }] } : { cliente: safeCliente }
      return scenario.body ? row : [row]
    }
    if (scenario.path === "/vendas" && scenario.body) {
      replaceMethod(t, prisma, "$transaction", async callback => callback({
        jogo: { findMany: async () => [{ id_jogo: 1, nome: "Jogo", estoque: 2, preco: 10 }], update: async () => ({}) },
        venda: { create: query },
      }))
    } else {
      replaceMethod(t, prisma[scenario.model], scenario.method, query)
    }
    const response = await fetch(`${baseUrl}${scenario.path}`, {
      method: scenario.body ? "POST" : "GET",
      ...(scenario.body ? { headers: { "Content-Type": "application/json" }, body: JSON.stringify(scenario.body) } : {}),
    })
    const body = await response.text()
    assert.equal(response.status, scenario.body ? 201 : 200, body)
    assert.ok(selectionChecked)
    assert.ok(body.includes("Cliente teste"))
    assert.ok(!body.includes("senha"))
    assert.ok(!body.includes(cliente.senha))
  })
}

test("database failures do not expose internal data in public responses", async t => {
  replaceMethod(t, prisma.avaliacao, "create", async () => {
    throw { message: "Database error", senha: cliente.senha }
  })
  const response = await fetch(`${baseUrl}/avaliacoes`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nota: 5, id_cliente: 1, id_jogo: 1 }),
  })
  assert.equal(response.status, 400)
  assert.deepEqual(await response.json(), { erro: "Não foi possível registrar a avaliação" })
})
