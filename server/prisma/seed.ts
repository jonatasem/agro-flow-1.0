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
  console.log('🌱 Apagando dados antigos (Reset)...');

  // await prisma.ordemServico.deleteMany({});
  await prisma.equipamento.deleteMany({});
  // await prisma.operador.deleteMany({});

  console.log('🚜 Cadastrando Equipamentos Mestre...');
  await prisma.equipamento.createMany({
    data: [
      {
        frota: '850002',
        modelo: 'John Deere 6195M'
      }
    ],
  });

  /*
  
    console.log('👨‍🌾 Cadastrando Operadores Mestre...');
    await prisma.operador.createMany({
      data: [
        { codigo: "1537", nome: "LAUDEMIR BARILE" }
      ],
    });

  */

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
