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

  await prisma.ordemServico.deleteMany({});
  await prisma.equipamento.deleteMany({});
  await prisma.operador.deleteMany({});

  console.log('🚜 Cadastrando Equipamentos Mestre...');
  await prisma.equipamento.createMany({
    data: [
      {
        prefixo: '850002',
        tipo: 'Trator',
        modeloEquipamento: 'John Deere 6195M',
        modeloPilotoPadrao: 'StarFire 6000',
        usinaAlocada: 'Lençóis Paulista',
        setor: 'Transbordo (CTT)',
      },
      {
        prefixo: '850040',
        tipo: 'Trator',
        modeloEquipamento: 'Case IH Puma 230',
        modeloPilotoPadrao: 'Trimble AgGPS 542',
        usinaAlocada: 'Quatá',
        setor: 'Plantio',
      },
      {
        prefixo: 'CH9500',
        tipo: 'Colhedora',
        modeloEquipamento: 'John Deere CH950',
        modeloPilotoPadrao: 'StarFire 7000',
        usinaAlocada: 'Lençóis Paulista',
        setor: 'Colheita (CTT)',
      }
    ],
  });

  console.log('👨‍🌾 Cadastrando Operadores Mestre...');
  await prisma.operador.createMany({
    data: [
      { codigo: '23805', nome: 'Jonatas Silva' },
      { codigo: '14201', nome: 'Marcos Almeida' },
      { codigo: '99102', nome: 'Carlos Eduardo' },
    ],
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
