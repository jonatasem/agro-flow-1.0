import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'ZILOR_SECRET_KEY';

function calcularDiferencaTempo(dataInicioStr: string | null | undefined): string {
  if (!dataInicioStr) return '00:00:00';
  const inicio = new Date(dataInicioStr).getTime();
  const agora = new Date().getTime();
  const diferenca = agora - inicio;
  if (diferenca <= 0) return '00:00:00';

  const totalSegundos = Math.floor(diferenca / 1000);
  const horas = Math.floor(totalSegundos / 3600);
  const minutos = Math.floor((totalSegundos % 3600) / 60);
  const segundos = totalSegundos % 60;
  return `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`;
}

export class OrdemServicoService {

  async salvarAutorizado(dados: { nome: string; matricula: string }) {
    const existe = await prisma.colaboradorAutorizado.findUnique({ where: { matricula: dados.matricula.trim() } });
    if (existe) throw new Error('Esta matrícula já está cadastrada.');
    return await prisma.colaboradorAutorizado.create({ 
      data: { nome: dados.nome.trim(), matricula: dados.matricula.trim() } 
    });
  }

  async validarMatricula(matricula: string) {
    const autorizado = await prisma.colaboradorAutorizado.findUnique({ where: { matricula: matricula.trim() } });
    if (!autorizado) throw new Error('Acesso negado.');
    const token = jwt.sign({ matricula: autorizado.matricula, nome: autorizado.nome }, JWT_SECRET, { expiresIn: '8h' });
    return { token, usuario: { matricula: autorizado.matricula, nome: autorizado.nome } };
  }

  async listarTodas() {
    return await prisma.ordemServico.findMany({ orderBy: { idCustomizado: 'desc' } });
  }

    async criar(dados: any) {
    const agora = new Date();
    const dataAtual = agora.toLocaleDateString('pt-BR');
    const horaAtual = agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const setorInicial = dados.setorOs?.[0] || {};

    // --- 🔄 FLUXO DE UNIFICAÇÃO DE OS ATIVA ---
    // 1. Busca se já existe uma OS aberta/em andamento para este trator
    const ordensDaFrota = await prisma.ordemServico.findMany({
      where: { prefixoTrator: dados.prefixoTrator.trim() }
    });

    const osAbertaExistente = ordensDaFrota.find(os => {
      return Array.isArray(os.setorOs) && os.setorOs.some((setor: any) => 
        setor.status === 'aguardando_manutencao' || setor.status === 'em_manutencao'
      );
    });

    // 2. Se encontrar uma OS ativa, injeta o novo setor nela em vez de criar uma nova OS
    if (osAbertaExistente) {
      const setorDestino = setorInicial.setor || 'Agricultura de Precisão';
      
      // Verifica se este setor específico já não está ativo nela para evitar duplicar o mesmo setor
      const setorJaExiste = osAbertaExistente.setorOs.some((s: any) => s.setor === setorDestino && s.status !== 'concluido');
      
      if (setorJaExiste) {
        throw new Error(`O setor ${setorDestino} já está em atendimento para a frota ${dados.prefixoTrator} na OS ${osAbertaExistente.idCustomizado}.`);
      }

      const novaOficina = {
        setor: setorDestino,
        status: 'aguardando_manutencao',
        qruDescricao: setorInicial.qruDescricao || 'Sem descrição inicial.',
        criadoPor: setorInicial.criadoPor || 'Sistema de Fluxo',
        dataCriacao: dataAtual,
        horaCriacao: horaAtual,
        solucaoTecnico: ''
      };

      // Atualiza a OS existente adicionando o novo setor ao array e retorna
      return await prisma.ordemServico.update({ 
        where: { idCustomizado: osAbertaExistente.idCustomizado }, 
        data: { 
          setorOs: { push: novaOficina } 
        }
      });
    }
    // --- FIM DO FLUXO DE UNIFICAÇÃO ---


    // --- 🚀 FLUXO PADRÃO: CRIA UMA NOVA OS SE A FROTA ESTIVER ZERADA ---
    const anoAtual = agora.getFullYear();
    const totalOrdensAno = await prisma.ordemServico.count({ 
      where: { idCustomizado: { startsWith: `OS-${anoAtual}-` } } 
    });
    
    const idCustomizado = `OS-${anoAtual}-${String(totalOrdensAno + 1).padStart(3, '0')}`;

    return await prisma.ordemServico.create({
      data: {
        idCustomizado,
        prefixoTrator: dados.prefixoTrator.trim(),
        idOperador: dados.idOperador.trim(),
        atividade: dados.atividade || 'Geral',
        usinaBase: dados.usinaBase || 'Geral Zilor',
        frente: dados.frente || 'Frente Geral',
        dataCriacao: dataAtual,
        horaCriacao: horaAtual,
        setorOs: [{
          setor: setorInicial.setor || 'Agricultura de Precisão',
          status: 'aguardando_manutencao',
          qruDescricao: setorInicial.qruDescricao || 'Sem descrição inicial.',
          criadoPor: setorInicial.criadoPor || 'Zilor Core',
          dataCriacao: dataAtual,
          horaCriacao: horaAtual,
          solucaoTecnico: ''
        }]
      }
    });
  }

  async atualizar(idCustomizado: string, dados: any) {
    return await prisma.ordemServico.update({
      where: { idCustomizado },
      data: { 
        idOperador: dados.idOperador, 
        frente: dados.frente, 
        atividade: dados.atividade, 
        usinaBase: dados.usinaBase 
      }
    });
  }

  async atualizarStatusOficina(idCustomizado: string, setor: string, status: string, solucao?: string, causa?: string) {
    const os = await prisma.ordemServico.findUnique({ where: { idCustomizado } });
    if (!os) throw new Error("Ordem de serviço não encontrada.");

    const setorOsAtualizado = os.setorOs.map(s => {
      if (s.setor === setor) {
        return {
          ...s,
          status,
          solucaoTecnico: solucao ?? s.solucaoTecnico,
          tipoCausa: causa ?? s.tipoCausa,
          dataInicioManutencao: status === 'em_manutencao' ? new Date().toISOString() : s.dataInicioManutencao
        };
      }
      return s;
    });

    return await prisma.ordemServico.update({ 
      where: { idCustomizado }, 
      data: { setorOs: setorOsAtualizado } 
    });
  }

  async injetarNovaOficina(idCustomizado: string, setorOrigem: string, setorDestino: string) {
    const os = await prisma.ordemServico.findUnique({ where: { idCustomizado } });
    if (!os) throw new Error("Ordem de serviço não encontrada.");
    
    const jaExiste = os.setorOs.some(s => s.setor === setorDestino);
    if (!jaExiste) {
      const agora = new Date();
      const novaOficina = {
        setor: setorDestino,
        status: 'aguardando_manutencao',
        qruDescricao: `Transferido de ${setorOrigem}`,
        criadoPor: 'Sistema de Fluxo',
        dataCriacao: agora.toLocaleDateString('pt-BR'),
        horaCriacao: agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        solucaoTecnico: ''
      };
      return await prisma.ordemServico.update({ 
        where: { idCustomizado }, 
        data: { setorOs: { push: novaOficina } } 
      });
    }
    return os;
  }

  async finalizarOficina(idCustomizado: string, setor: string, tipoCausa: string, solucao: string, tecnico: string) {
    const os = await prisma.ordemServico.findUnique({ where: { idCustomizado } });
    if (!os) throw new Error("Ordem de serviço não encontrada.");

    const setorOsAtualizado = os.setorOs.map(s => {
      if (s.setor === setor) {
        return {
          ...s,
          status: 'concluido',
          tipoCausa,
          solucaoTecnico: solucao,
          tecnicoResponsavel: tecnico,
          tempoManutencao: calcularDiferencaTempo(s.dataInicioManutencao)
        };
      }
      return s;
    });

    return await prisma.ordemServico.update({ 
      where: { idCustomizado }, 
      data: { setorOs: setorOsAtualizado } 
    });
  }

  async eliminar(idCustomizado: string) {
    return await prisma.ordemServico.delete({ where: { idCustomizado } });
  }

  async listarFrotasMestre() {
    return await prisma.equipamento.findMany();
  }

  async listarOperadoresMestre() {
    return await prisma.operador.findMany();
  }
}
