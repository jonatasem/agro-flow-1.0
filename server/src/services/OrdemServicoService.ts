import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'ZILOR_SECRET_KEY';

interface SetorOs {
  setor: string;
  status: 'aguardando_manutencao' | 'em_manutencao' | 'concluido';
  qruDescricao: string;
  criadoPor: string;
  dataCriacao: string;
  horaCriacao: string;
  dataInicioManutencao?: string | null;
  tempoManutencao?: string | null;
  solucaoTecnico: string;
  tipoCausa?: string | null;
  tecnicoResponsavel?: string | null;
}

export class OrdemServicoService {

  private calcularDiferencaTempo(dataInicioStr: string | null | undefined): string {
    if (!dataInicioStr) return '00:00:00';
    const inicio = new Date(dataInicioStr).getTime();
    const agora = new Date().getTime();
    const diferenca = agora - inicio;
    if (diferenca <= 0) return '00:00:00';
    const s = Math.floor((diferenca / 1000) % 60);
    const m = Math.floor((diferenca / 1000 / 60) % 60);
    const h = Math.floor(diferenca / 1000 / 3600);
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

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

  // --- MÉTODO ATUALIZADO PARA SUPORTAR EDIÇÃO COMPLETA DO FRONTEND ---
  async atualizar(idCustomizado: string, dados: any) {
    return await prisma.ordemServico.update({
      where: { idCustomizado },
      data: { 
        idOperador: dados.idOperador?.trim(), 
        frente: dados.frente?.trim(), 
        atividade: dados.atividade?.trim(), 
        usinaBase: dados.usinaBase?.trim(),
        prefixoTrator: dados.prefixoTrator?.trim()
      }
    });
  }

  async criar(dados: any) {
    const agora = new Date();
    const dataAtual = agora.toLocaleDateString('pt-BR');
    const horaAtual = agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const setorInicial = dados.setorOs?.[0] || {};

    const osAbertaExistente = await prisma.ordemServico.findFirst({
      where: {
        prefixoTrator: dados.prefixoTrator.trim(),
        setorOs: { some: { status: { in: ['aguardando_manutencao', 'em_manutencao'] } } }
      }
    });

    if (osAbertaExistente) {
      const setorDestino = setorInicial.setor || 'Agricultura de Precisão';
      const setorJaExiste = (osAbertaExistente.setorOs as any[]).some((s: any) => s.setor === setorDestino && s.status !== 'concluido');
      
      if (setorJaExiste) throw new Error(`O setor ${setorDestino} já está em atendimento.`);

      const novaOficina: SetorOs = {
        setor: setorDestino,
        status: 'aguardando_manutencao',
        qruDescricao: setorInicial.qruDescricao || 'Sem descrição inicial.',
        criadoPor: setorInicial.criadoPor || 'Sistema de Fluxo',
        dataCriacao: dataAtual,
        horaCriacao: horaAtual,
        solucaoTecnico: ''
      };

      return await prisma.ordemServico.update({ 
        where: { idCustomizado: osAbertaExistente.idCustomizado }, 
        data: { setorOs: [...(osAbertaExistente.setorOs as any[]), novaOficina] } 
      });
    }

    const ano = agora.getFullYear();
    const total = await prisma.ordemServico.count({ where: { idCustomizado: { startsWith: `OS-${ano}-` } } });
    
    return await prisma.ordemServico.create({
      data: {
        idCustomizado: `OS-${ano}-${String(total + 1).padStart(3, '0')}`,
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

  async atualizarStatusOficina(idCustomizado: string, setor: string, status: string, solucao?: string, causa?: string) {
    const os = await prisma.ordemServico.findUnique({ where: { idCustomizado } });
    if (!os) throw new Error("OS não encontrada.");

    const setorOsAtualizado = (os.setorOs as any[]).map(s => {
      if (s.setor === setor) {
        return { ...s, status, solucaoTecnico: solucao ?? s.solucaoTecnico, tipoCausa: causa ?? s.tipoCausa, dataInicioManutencao: status === 'em_manutencao' ? new Date().toISOString() : s.dataInicioManutencao };
      }
      return s;
    });

    return await prisma.ordemServico.update({ where: { idCustomizado }, data: { setorOs: setorOsAtualizado } });
  }

  async injetarNovaOficina(idCustomizado: string, setorOrigem: string, setorDestino: string) {
    const os = await prisma.ordemServico.findUnique({ where: { idCustomizado } });
    if (!os) throw new Error("OS não encontrada.");
    
    const arrayAtual = os.setorOs as any[];

    // Pegamos o objeto do setor original para preservar a descrição (QRU)
    const setorOriginal = arrayAtual.find(s => s.setor === setorOrigem);

    const novaOficina: SetorOs = {
      setor: setorDestino,
      status: 'aguardando_manutencao',
      // Preservamos o QRU original e os dados de criação
      qruDescricao: setorOriginal?.qruDescricao || "Transferido",
      criadoPor: setorOriginal?.criadoPor || 'Sistema de Fluxo',
      dataCriacao: setorOriginal?.dataCriacao || new Date().toLocaleDateString('pt-BR'),
      horaCriacao: setorOriginal?.horaCriacao || new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      solucaoTecnico: ''
    };

    // Substituímos o array inteiro por um novo array contendo APENAS o novo setor
    return await prisma.ordemServico.update({ 
      where: { idCustomizado }, 
      data: { setorOs: [novaOficina] } // Aqui está a mágica: substitui tudo pelo novo
    });
  }

  async finalizarOficina(idCustomizado: string, setor: string, tipoCausa: string, solucao: string, tecnico: string) {
    const os = await prisma.ordemServico.findUnique({ where: { idCustomizado } });
    if (!os) throw new Error("OS não encontrada.");

    const setorOsAtualizado = (os.setorOs as any[]).map(s => {
      if (s.setor === setor) {
        return { ...s, status: 'concluido', tipoCausa, solucaoTecnico: solucao, tecnicoResponsavel: tecnico, tempoManutencao: this.calcularDiferencaTempo(s.dataInicioManutencao) };
      }
      return s;
    });

    return await prisma.ordemServico.update({ where: { idCustomizado }, data: { setorOs: setorOsAtualizado } });
  }

  async eliminar(idCustomizado: string) { return await prisma.ordemServico.delete({ where: { idCustomizado } }); }
  async listarFrotasMestre() { return await prisma.equipamento.findMany(); }
  async listarOperadoresMestre() { return await prisma.operador.findMany(); }
}