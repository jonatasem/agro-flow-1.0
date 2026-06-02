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
    
    // 🔥 FORÇA O HORÁRIO DE BRASÍLIA EM PRODUÇÃO (Evita as 3 horas adiantadas)
    const dataAtual = agora.toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' }); // Retorna "YYYY-MM-DD"
    const horaAtual = agora.toLocaleTimeString('pt-BR', { 
      timeZone: 'America/Sao_Paulo', 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    }); // Retorna "HH:MM"
    
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
    const osAtual = await prisma.ordemServico.findUnique({ where: { idCustomizado } });
    if (!osAtual) throw new Error("Ordem de serviço não encontrada");

    const novosDados: any = { ...dados };
    const agora = new Date();

    // 🏎‍🟀 Cenário A: Movendo de Triagem (pendente) para Em Manutenção (em_andamento)
    if (dados.status === 'em_andamento' && osAtual.status === 'pendente') {
      novosDados.dataInicioManutencao = agora; // Grava o objeto Date puro (Prisma converte para UTC no MongoDB)
    }

    // 🏁 Cenário B: Movendo de Em Manutenção (em_andamento) para Concluído (concluido)
    if (dados.status === 'concluido' && osAtual.status === 'em_andamento') {
      novosDados.dataFimManutencao = agora;
      
      // Se não houver dataInicioManutencao, usa o atualizadoEm antigo como fallback
      const inicio = osAtual.dataInicioManutencao ? new Date(osAtual.dataInicioManutencao) : osAtual.atualizadoEm;
      
      // getTime() pega os milissegundos absolutos baseados na era Unix. 
      // Como ambos vieram do banco ou do mesmo ponteiro do motor V8, o cálculo passa a ser imutável ao fuso.
      const diferencaMilissegundos = agora.getTime() - inicio.getTime();
      
      if (diferencaMilissegundos > 0) {
        const totalMinutos = Math.floor(diferencaMilissegundos / 1000 / 60);
        const horas = Math.floor(totalMinutos / 60);
        const minutos = totalMinutos % 60;
        
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
