import assert from "node:assert/strict"
import { once } from "node:events"
import { after, test } from "node:test"
import express from "express"
import jwt from "jsonwebtoken"

process.env.JWT_KEY = "test-secret"

const { autenticar, exigirAdmin, exigirCliente } = await import("../src/middlewares/auth.ts")

const app = express()
app.get("/cliente", autenticar, exigirCliente, (req, res) => res.json({ usuario: req.usuario }))
app.get("/admin", autenticar, exigirAdmin, (req, res) => res.json({ usuario: req.usuario }))
const server = app.listen(0, "127.0.0.1")
await once(server, "listening")
const baseUrl = `http://127.0.0.1:${server.address().port}`

const tokenCliente = jwt.sign({ clienteLogadoId: 7, clienteLogadoNome: "Cliente teste" }, process.env.JWT_KEY)
const tokenAdmin = jwt.sign({ adminLogadoId: 3, adminLogadoNome: "Admin teste" }, process.env.JWT_KEY)

test("rejects a protected route without bearer token", async () => {
  const response = await fetch(`${baseUrl}/cliente`)
  assert.equal(response.status, 401)
  assert.deepEqual(await response.json(), { erro: "Sessão inválida ou expirada" })
})

test("rejects an administrator token on a client route", async () => {
  const response = await fetch(`${baseUrl}/cliente`, { headers: { Authorization: `Bearer ${tokenAdmin}` } })
  assert.equal(response.status, 403)
})

test("rejects a client token on an administrator route", async () => {
  const response = await fetch(`${baseUrl}/admin`, { headers: { Authorization: `Bearer ${tokenCliente}` } })
  assert.equal(response.status, 403)
})

test("accepts a valid token for its matching role", async () => {
  const response = await fetch(`${baseUrl}/cliente`, { headers: { Authorization: `Bearer ${tokenCliente}` } })
  assert.equal(response.status, 200)
  assert.deepEqual(await response.json(), { usuario: { tipo: "cliente", id: 7, nome: "Cliente teste" } })
})

after(async () => {
  server.closeAllConnections()
  await new Promise(resolve => server.close(resolve))
})
