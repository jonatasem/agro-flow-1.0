import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'ZILOR_SECRET_KEY';

interface SetorOs {
  id?: string;
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

  async atualizar(idCustomizado: string, dados: any) {
    if (!idCustomizado || idCustomizado === 'undefined') {
      throw new Error("O 'idCustomizado' da OS não foi fornecido ou é inválido.");
    }

    const osOriginal = await prisma.ordemServico.findUnique({ where: { idCustomizado } });
    if (!osOriginal) throw new Error("Ordem de serviço não encontrada no banco.");

    const dadosAtualizacao: any = {};
    if (dados.idOperador !== undefined) dadosAtualizacao.idOperador = dados.idOperador?.trim();
    if (dados.frente !== undefined) dadosAtualizacao.frente = dados.frente?.trim();
    if (dados.atividade !== undefined) dadosAtualizacao.atividade = dados.atividade?.trim();
    if (dados.usinaBase !== undefined) dadosAtualizacao.usinaBase = dados.usinaBase?.trim();
    if (dados.prefixoTrator !== undefined) dadosAtualizacao.prefixoTrator = dados.prefixoTrator?.trim();

    if (dados.setorOs && Array.isArray(dados.setorOs) && dados.setorOs.length > 0) {
      const setoresExistentes = [...(osOriginal.setorOs as any[])];
      if (setoresExistentes.length > 0) {
        setoresExistentes[0] = {
          ...setoresExistentes[0],
          qruDescricao: dados.setorOs[0].qruDescricao?.trim() || setoresExistentes[0].qruDescricao
        };
        dadosAtualizacao.setorOs = setoresExistentes;
      }
    }

    return await prisma.ordemServico.update({
      where: { idCustomizado },
      data: dadosAtualizacao
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

    // 🛑 Modificado: Se já existe uma OS aberta para o trator, não adicionamos outra oficina concorrente na array. 
    // Nós barramos ou simplesmente atualizamos o setor ativo atual para o novo desejado.
    if (osAbertaExistente) {
      const setorDestino = setorInicial.setor || 'Agricultura de Precisão';
      const oficinaAtiva = (osAbertaExistente.setorOs as any[]).find((s: any) => s.status !== 'concluido');
      
      if (oficinaAtiva && oficinaAtiva.setor === setorDestino) {
        throw new Error(`O setor ${setorDestino} já está em atendimento ativo para este trator.`);
      }

      // Se a intenção é mover de setor porque o trator está em outra oficina aberta, limpamos a array substituindo pela nova oficina informada
      const novaOficina: SetorOs = {
        id: uuidv4(),
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
        data: { setorOs: [novaOficina] } // 🔁 Mantém apenas uma única oficina ativa limpa
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
          id: uuidv4(),
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

  async atualizarStatusOficina(idCustomizado: string, setorId: string, status: string, solucao?: string, causa?: string) {
    const os = await prisma.ordemServico.findUnique({ where: { idCustomizado } });
    if (!os) throw new Error("OS não encontrada.");

    const setorOsAtualizado = (os.setorOs as any[]).map(s => {
      if (s.id === setorId) {
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

    return await prisma.ordemServico.update({ where: { idCustomizado }, data: { setorOs: setorOsAtualizado } });
  }

  // 🔄 CORREÇÃO CIRÚRGICA: MUTAÇÃO PURA DE SETOR
  // Remove totalmente o registro antigo para evitar acúmulo na array e impedir cards fantasmas.
  async injetarNovaOficina(idCustomizado: string, setorId: string, setorDestino: string) {
    const os = await prisma.ordemServico.findUnique({ where: { idCustomizado } });
    if (!os) throw new Error("OS não encontrada.");
    
    const agora = new Date();
    const dataAtual = agora.toLocaleDateString('pt-BR');
    const horaAtual = agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    // 1. Filtramos para REMOVER completamente a oficina antiga da array
    const arraySemOficinaAntiga = (os.setorOs as any[]).filter(s => s.id !== setorId);

    // 2. Buscamos a oficina de origem apenas para manter o QRU / Descrição digitada originalmente
    const oficinaOrigem = (os.setorOs as any[]).find(s => s.id === setorId);

    // 3. Montamos o novo setor que vai assumir o card na triagem do Kanban de destino
    const novaOficina: SetorOs = {
      id: uuidv4(), // Novo ID único gerado para a oficina ativa
      setor: setorDestino,
      status: 'aguardando_manutencao',
      qruDescricao: oficinaOrigem?.qruDescricao || "Transferido sem descrição",
      criadoPor: oficinaOrigem?.criadoPor || 'Sistema de Fluxo',
      dataCriacao: dataAtual,
      horaCriacao: horaAtual,
      solucaoTecnico: ''
    };

    // 4. Sobrescrevemos a propriedade no MongoDB deixando apenas a nova oficina ativa
    return await prisma.ordemServico.update({ 
      where: { idCustomizado }, 
      data: { setorOs: [...arraySemOficinaAntiga, novaOficina] } 
    });
  }

  async finalizarOficina(idCustomizado: string, setorId: string, tipoCausa: string, solucao: string, tecnico: string) {
    const os = await prisma.ordemServico.findUnique({ where: { idCustomizado } });
    if (!os) throw new Error("OS não encontrada.");

    const setorOsAtualizado = (os.setorOs as any[]).map(s => {
      if (s.id === setorId) {
        return { 
          ...s, 
          status: 'concluido', 
          tipoCausa, 
          solucaoTecnico: solucao, 
          tecnicoResponsavel: tecnico, 
          tempoManutencao: this.calcularDiferencaTempo(s.dataInicioManutencao) 
        };
      }
      return s;
    });

    return await prisma.ordemServico.update({ where: { idCustomizado }, data: { setorOs: setorOsAtualizado } });
  }

  async eliminar(idCustomizado: string) { return await prisma.ordemServico.delete({ where: { idCustomizado } }); }
  async listarFrotasMestre() { return await prisma.equipamento.findMany(); }
  async listarOperadoresMestre() { return await prisma.operador.findMany(); }
}
