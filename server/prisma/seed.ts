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
        setor: 'Transbordo',
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
        prefixo: '401132',
        tipo: 'Colhedora Dupla',
        modeloEquipamento: 'John Deere 3522',
        modeloPilotoPadrao: 'Nav900',
        usinaAlocada: 'Salto Botelho',
        setor: 'Colheita',
      },     
      { 
        prefixo: "401243",
        tipo: "Caminhao", 
        modeloEquipamento: "CAVALO MECANICO VOLVO FMX 540",
        modeloPilotoPadrao: "Sem piloto",
        usinaAlocada: "Salto Botelho",
        setor: "Canavieiro"
      },
      { 
        prefixo: "600971",
        tipo: "Caminhao", 
        modeloEquipamento: "CAMINHAO COMBATE INCENDIO V.W 26.260",
        modeloPilotoPadrao: "Sem piloto",
        usinaAlocada: "Salto Botelho",
        setor: "Combate Incendio"
      },
    ],
  });

  console.log('👨‍🌾 Cadastrando Operadores Mestre...');
  await prisma.operador.createMany({
    data: [
      { codigo: "1537", nome: "LAUDEMIR BARILE" },
      { codigo: "9999", nome: "OPERADOR GENERICO" },
      { codigo: "2998", nome: "FUNCIONARIO GENERICO" },
      { codigo: "1000271", nome: "FELIPE SILVA BATISTA" },
      { codigo: "10038", nome: "JOSE SERGIO" },
      { codigo: "1006", nome: "ROBERTO DE OLIVEIRA SERODIO" },
      { codigo: "10091", nome: "WASHINGTON LUIZ OLIVEIRA" },
      { codigo: "10101001", nome: "MAICO DA SILVA" },
      { codigo: "10101002", nome: "UILSON CARLOS DA SILVA" },
      { codigo: "10101003", nome: "MARCIO ALVEZ" },
      { codigo: "10101004", nome: "DANILO DA SILVA VELOSO" },
      { codigo: "10101005", nome: "NELSON MUNIZ DA SILVA" },
      { codigo: "10101006", nome: "ANTONIO APARECIDO SOARES" },
      { codigo: "10101007", nome: "JOSE BEZERRA" },
      { codigo: "10101095", nome: "CANA KAPPAZ" },
      { codigo: "10114", nome: "ERIVALDO DA SILVA" },
      { codigo: "10115", nome: "ELPIDIO PAULINO FILHO" },
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
