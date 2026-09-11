import "dotenv/config";
import { prisma } from "../lib/prisma";

try {
  await prisma.$queryRaw`SELECT 1`;
  console.log("Conexao com o PostgreSQL/Neon realizada com sucesso.");
} catch (error) {
  console.error("Nao foi possivel conectar ao PostgreSQL/Neon.");
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}