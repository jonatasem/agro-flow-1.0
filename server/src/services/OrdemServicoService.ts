import { PrismaClient } from '@prisma/client';
import type { CreateOrdemInput, UpdateOrdemInput } from '../interfaces/index.js';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL ?? ''
    }
  }
});

export class OrdemServicoService {
  async listarTodas() {
    return await prisma.ordemServico.findMany({
      orderBy: {
        idCustomizado: 'desc'
      }
    });
  }

  async criar(dados: CreateOrdemInput) {
    const agora = new Date();
    const dataAtual = `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, '0')}-${String(agora.getDate()).padStart(2, '0')}`;
    const horaAtual = `${String(agora.getHours()).padStart(2, '0')}:${String(agora.getMinutes()).padStart(2, '0')}`;
    
    const numeroAleatorio = Math.floor(1000 + Math.random() * 9000);
    const idCustomizado = `OS-${dados.prefixoTrator}-${numeroAleatorio}`;

    return await prisma.ordemServico.create({
      data: {
        idCustomizado,
        prefixoTrator: dados.prefixoTrator,
        idOperador: dados.idOperador,
        criadoPor: dados.criadoPor,
        atividade: dados.atividade || '',
        modeloPiloto: dados.modeloPiloto || '',
        usinaBase: dados.usinaBase || '',
        frente: dados.frente || '',
        qruDescricao: dados.qruDescricao || '',
        triagemSetor: dados.triagemSetor,
        status: 'pendente',
        dataCriacao: dataAtual,
        horaCriacao: horaAtual,
        solucaoTecnico: ''
      }
    });
  }

  async atualizar(idCustomizado: string, dados: UpdateOrdemInput) {
    return await prisma.ordemServico.update({
      where: { idCustomizado },
      data: dados
    });
  }

  async eliminar(idCustomizado: string) {
    return await prisma.ordemServico.delete({
      where: { idCustomizado }
    });
  }

  async listarFrotasMestre() {
    return await prisma.equipamento.findMany();
  }

  async listarOperadoresMestre() {
    return await prisma.operador.findMany();
  }
}