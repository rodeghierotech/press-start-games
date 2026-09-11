import express from "express"
import cors from "cors"

import routesAvaliacoes from "./routes/avaliacoes"
import routesCategorias from "./routes/categorias"
import routesClientes from "./routes/clientes"
import routesJogos from "./routes/jogos"
import routesLogin from "./routes/login"
import routesVendas from "./routes/vendas"

const app = express()
const port = 3000

app.use(express.json())
app.use(cors())

app.use("/avaliacoes", routesAvaliacoes)
app.use("/categorias", routesCategorias)
app.use("/clientes", routesClientes)
app.use("/jogos", routesJogos)
app.use("/login", routesLogin)
app.use("/vendas", routesVendas)

app.get("/", (req, res) => {
  res.send("API: Loja de Jogos")
})

app.listen(port, () => {
  console.log(`Servidor rodando na porta: ${port}`)
})
