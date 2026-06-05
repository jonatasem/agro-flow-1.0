import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import type { CreateOrdemInput, UpdateOrdemInput } from '../interfaces/index.js';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL ?? ''
    }
  }
});

const JWT_SECRET = process.env.JWT_SECRET || '';

export class OrdemServicoService {

  // CADASTRA UM NOVO COLABORADOR AUTORIZADO
  async salvarAutorizado(dados: { nome: string; matricula: string }) {
    const existe = await prisma.colaboradorAutorizado.findUnique({
      where: { matricula: dados.matricula.trim() }
    });

    if (existe) {
      throw new Error('Esta matrícula já está cadastrada como autorizada no sistema.');
    }

    return await prisma.colaboradorAutorizado.create({
      data: {
        nome: dados.nome.trim(),
        matricula: dados.matricula.trim()
      }
    });
  }

  // VALIDA A MATRÍCULA DO COLABORADOR NO LOGIN
  async validarMatricula(matricula: string) {
    const autorizado = await prisma.colaboradorAutorizado.findUnique({
      where: {
        matricula: matricula.trim()
      }
    });

    if (!autorizado) {
      throw new Error('Acesso negado. Matrícula não autorizada a acessar o sistema.');
    }

    // Gerando o token com a propriedade 'matricula' correta do banco
    const token = jwt.sign(
      { matricula: autorizado.matricula, nome: autorizado.nome },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    return {
      token,
      usuario: {
        matricula: autorizado.matricula,
        nome: autorizado.nome
      }
    };
  }

  // LISTA TODAS AS ORDENS DE SERVIÇO
  async listarTodas() {
    return await prisma.ordemServico.findMany({
      orderBy: {
        idCustomizado: 'desc'
      }
    });
  }

  // CRIA UMA NOVA ORDEM DE SERVIÇO
  async criar(dados: CreateOrdemInput) {
    const agora = new Date();
    const dataAtual = agora.toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' }); 
    const horaAtual = agora.toLocaleTimeString('pt-BR', { 
      timeZone: 'America/Sao_Paulo', 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    }); 
    
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

  // ATUALIZA STATUS OU DADOS DA ORDEM
  async atualizar(idCustomizado: string, dados: UpdateOrdemInput) {
    const osAtual = await prisma.ordemServico.findUnique({ where: { idCustomizado } });
    if (!osAtual) throw new Error("Ordem de serviço não encontrada");

    const novosDados: any = { ...dados };
    const agora = new Date();

    if (dados.status === 'em_andamento' && osAtual.status === 'pendente') {
      novosDados.dataInicioManutencao = agora; 
    }

    if (dados.status === 'concluido' && osAtual.status === 'em_andamento') {
      novosDados.dataFimManutencao = agora;
      
      const inicio = osAtual.dataInicioManutencao ? new Date(osAtual.dataInicioManutencao) : osAtual.atualizadoEm;
      const diferencaMilissegundos = agora.getTime() - (inicio ? inicio.getTime() : agora.getTime());
      
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

  // ❌ DELETA UMA ORDEM
  async eliminar(idCustomizado: string) {
    return await prisma.ordemServico.delete({
      where: { idCustomizado }
    });
  }

  // 🚜 BUSCA OS EQUIPAMENTOS CADASTRADOS MESTRE
  async listarFrotasMestre() {
    return await prisma.equipamento.findMany();
  }

  // 👷 BUSCA OS OPERADORES/TRATORISTAS CADASTRADOS MESTRE
  async listarOperadoresMestre() {
    return await prisma.operador.findMany();
  }
}
