import 'dotenv/config'; 
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function main() {
  console.log('🚜 Cadastrando Funcionários Autorizados...');
  await prisma.colaboradorAutorizado.create({
    data: 
      { 
        matricula: '23805', 
        nome: 'Jonatas Elieser Moreira' 
      }
  });

  console.log('✅ Banco de dados MongoDB populado com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
