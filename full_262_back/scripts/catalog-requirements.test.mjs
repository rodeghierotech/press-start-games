import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { test } from "node:test"

const backRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const frontRoot = path.resolve(backRoot, "..", "full_262_front", "src")

test("home displays featured games independently from the full catalog", async () => {
  const app = await readFile(path.join(frontRoot, "App.tsx"), "utf8")

  assert.match(app, /const jogosDestaque = useMemo/)
  assert.match(app, /Jogos em destaque/)
  assert.match(app, /<GameGrid jogos=\{jogosDestaque\}/)
})

test("home highlights the newest and best rated catalog entries", async () => {
  const app = await readFile(path.join(frontRoot, "App.tsx"), "utf8")

  assert.match(app, /const jogosMaisRecentes = useMemo/)
  assert.match(app, /const jogosMaisAvaliados = useMemo/)
  assert.match(app, /Últimos cadastrados/)
  assert.match(app, /Melhor avaliados/)
})

test("seed catalog includes twenty real games and at least five featured games", async () => {
  const seed = await readFile(path.join(backRoot, "prisma", "seed.ts"), "utf8")
  const gameNames = [
    "Grand Theft Auto V",
    "Red Dead Redemption 2",
    "Cyberpunk 2077",
    "Elden Ring",
    "Hades",
    "Resident Evil 4",
    "Ghost of Tsushima",
    "Horizon Forbidden West",
    "Marvel's Spider-Man 2",
    "The Legend of Zelda: Tears of the Kingdom",
  ]

  for (const gameName of gameNames) assert.match(seed, new RegExp(`nome: "${gameName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"`))
  assert.ok((seed.match(/data_lancamento:/g) || []).length >= 20)
  assert.ok((seed.match(/destaque: true/g) || []).length >= 5)
})
