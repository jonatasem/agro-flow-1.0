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
    // 1. Busca a O.S. atual para saber o status que ela estava antes
    const osAtual = await prisma.ordemServico.findUnique({ where: { idCustomizado } });
    if (!osAtual) throw new Error("Ordem de serviço não encontrada");

    const novosDados: any = { ...dados };
    const agora = new Date();

    // 🏎‍🟀 Cenário A: Movendo de Triagem (pendente) para Em Manutenção (em_andamento)
    if (dados.status === 'em_andamento' && osAtual.status === 'pendente') {
      novosDados.dataInicioManutencao = agora;
    }

    // 🏁 Cenário B: Movendo de Em Manutenção (em_andamento) para Concluído (concluido)
    if (dados.status === 'concluido' && osAtual.status === 'em_andamento') {
      novosDados.dataFimManutencao = agora;
      
      const inicio = osAtual.dataInicioManutencao ? new Date(osAtual.dataInicioManutencao) : osAtual.atualizadoEm;
      const diferencaMilissegundos = agora.getTime() - inicio.getTime();
      
      if (diferencaMilissegundos > 0) {
        const totalMinutos = Math.floor(diferencaMilissegundos / 1000 / 60);
        const horas = Math.floor(totalMinutos / 60);
        const minutos = totalMinutos % 60;
        
        // Formata um texto amigável para persistir no MongoDB
        novosDados.tempoManutencao = horas > 0 
          ? `${String(horas).padStart(2, '0')}h ${String(minutos).padStart(2, '0')}m`
          : `${String(minutos).padStart(2, '0')}m`;
      } else {
        novosDados.tempoManutencao = "00m";
      }
    }

    return await prisma.ordemServico.update({
      where: { idCustomizado },
      data: novosDados
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

