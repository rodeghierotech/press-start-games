import bcrypt from "bcrypt"
import { prisma } from "../lib/prisma"

async function main() {
  const senhaAdmin = bcrypt.hashSync("Admin@123", 12)
  const senhaCliente = bcrypt.hashSync("Cliente@123", 12)

  await prisma.admin.upsert({
    where: { email: "admin@lojajogos.com" },
    update: {},
    create: {
      nome: "Administrador",
      email: "admin@lojajogos.com",
      senha: senhaAdmin,
    },
  })

  const acao = await prisma.categoria.upsert({
    where: { nome: "Acao" },
    update: {},
    create: { nome: "Acao" },
  })

  const rpg = await prisma.categoria.upsert({
    where: { nome: "RPG" },
    update: {},
    create: { nome: "RPG" },
  })

  const esporte = await prisma.categoria.upsert({
    where: { nome: "Esporte" },
    update: {},
    create: { nome: "Esporte" },
  })

  const aventura = await prisma.categoria.upsert({
    where: { nome: "Aventura" },
    update: {},
    create: { nome: "Aventura" },
  })

  const corrida = await prisma.categoria.upsert({
    where: { nome: "Corrida" },
    update: {},
    create: { nome: "Corrida" },
  })

  const jogos = [
    {
      nome: "Grand Theft Auto V",
      descricao: "Jogo de mundo aberto com acao, missoes e exploracao urbana",
      preco: 149.9,
      estoque: 10,
      plataforma: "PlayStation 5",
      data_lancamento: new Date("2022-03-15T00:00:00.000Z"),
      id_categoria: acao.id_categoria,
    },
    {
      nome: "Red Dead Redemption 2",
      descricao: "Aventura de mundo aberto no velho oeste com acao e narrativa",
      preco: 199.9,
      estoque: 7,
      plataforma: "PlayStation 5",
      data_lancamento: new Date("2018-10-26T00:00:00.000Z"),
      id_categoria: acao.id_categoria,
    },
    {
      nome: "Cyberpunk 2077",
      descricao: "RPG de acao em mundo aberto ambientado na cidade futurista de Night City",
      preco: 179.9,
      estoque: 12,
      plataforma: "PC",
      data_lancamento: new Date("2020-12-10T00:00:00.000Z"),
      id_categoria: acao.id_categoria,
    },
    {
      nome: "Elden Ring",
      descricao: "RPG de acao e fantasia com exploracao livre, combates desafiadores e vasto mundo aberto",
      preco: 249.9,
      estoque: 8,
      plataforma: "PlayStation 5",
      data_lancamento: new Date("2022-02-25T00:00:00.000Z"),
      id_categoria: rpg.id_categoria,
    },
    {
      nome: "EA Sports FC 25",
      descricao: "Simulador de futebol com partidas competitivas, Ultimate Team e modo carreira",
      preco: 299.9,
      estoque: 15,
      plataforma: "Xbox Series",
      data_lancamento: new Date("2024-09-27T00:00:00.000Z"),
      id_categoria: esporte.id_categoria,
    },
    {
      nome: "The Witcher 3: Wild Hunt",
      descricao: "RPG de fantasia com narrativa marcante, monstros e um enorme mundo aberto para explorar",
      preco: 129.9,
      estoque: 9,
      plataforma: "PC",
      data_lancamento: new Date("2015-05-19T00:00:00.000Z"),
      id_categoria: rpg.id_categoria,
    },
    {
      nome: "Forza Horizon 5",
      descricao: "Jogo de corrida em mundo aberto pelas paisagens do Mexico com centenas de carros",
      preco: 219.9,
      estoque: 11,
      plataforma: "Xbox Series",
      data_lancamento: new Date("2021-11-09T00:00:00.000Z"),
      id_categoria: corrida.id_categoria,
    },
    {
      nome: "Minecraft",
      descricao: "Aventura criativa em um mundo de blocos onde voce pode construir, explorar e sobreviver",
      preco: 99.9,
      estoque: 20,
      plataforma: "Nintendo Switch",
      data_lancamento: new Date("2011-11-18T00:00:00.000Z"),
      id_categoria: aventura.id_categoria,
    },
    {
      nome: "God of War Ragnarök",
      descricao: "Aventura epica de Kratos e Atreus pelos reinos da mitologia nordica",
      preco: 279.9,
      estoque: 6,
      plataforma: "PlayStation 5",
      data_lancamento: new Date("2022-11-09T00:00:00.000Z"),
      id_categoria: aventura.id_categoria,
    },
    {
      nome: "Baldur's Gate 3",
      descricao: "RPG baseado em Dungeons and Dragons com escolhas profundas e cooperacao para ate quatro jogadores",
      preco: 199.9,
      estoque: 7,
      plataforma: "PC",
      data_lancamento: new Date("2023-08-03T00:00:00.000Z"),
      id_categoria: rpg.id_categoria,
    },
  ]

  const substituicoes = [
    ["Cyber Quest", "Cyberpunk 2077"],
    ["Fantasy Kingdom", "Elden Ring"],
    ["Pro Soccer 2026", "EA Sports FC 25"],
  ] as const

  for (const [nomeAntigo, nomeNovo] of substituicoes) {
    const jogoAntigo = await prisma.jogo.findFirst({ where: { nome: nomeAntigo } })
    const jogoNovo = await prisma.jogo.findFirst({ where: { nome: nomeNovo } })
    if (jogoAntigo && !jogoNovo) {
      await prisma.jogo.update({ where: { id_jogo: jogoAntigo.id_jogo }, data: { nome: nomeNovo } })
    }
  }

  for (const jogo of jogos) {
    await prisma.jogo.upsert({
      where: { id_jogo: (await prisma.jogo.findFirst({ where: { nome: jogo.nome }, select: { id_jogo: true } }))?.id_jogo || -1 },
      update: jogo,
      create: jogo,
    })
  }

  await prisma.cliente.upsert({
    where: { email: "cliente@email.com" },
    update: {},
    create: {
      nome: "Cliente Exemplo",
      email: "cliente@email.com",
      telefone: "(53) 99123-4567",
      senha: senhaCliente,
    },
  })

  console.log("Dados iniciais da loja de jogos cadastrados")
}

await main()
await prisma.$disconnect()
