export interface Operador {
  id?: string;
  codigo: string;
  nome: string;
}

export interface Equipamento {
  id?: string;
  frota: string;
  modelo: string;
}

// Sub-documento que representa o estado isolado de cada oficina
export interface AtendimentoSetor {
  setor: 'Agricultura de Precisão' | 'Elétrica' | 'Mecânica' | 'Borracharia';
  status: 'aguardando_manutencao' | 'em_manutencao' | 'concluido';
  qruDescricao: string;
  criadoPor: string;
  dataCriacao: string;
  horaCriacao: string;
  dataInicioManutencao?: string;
  tempoManutencao?: string;
  solucaoTecnico: string;
  tipoCausa?: 'Hardware (Defeito Real)' | 'Erro Operacional' | 'Infraestrutura (Sinal)';
  tecnicoResponsavel?: string;
}

// Estrutura principal da Ordem de Serviço Agrícola
export interface OrdemServicoAgro {
  id: string;
  idCustomizado: string;
  prefixoTrator: string;
  idOperador: string;
  atividade: string;
  usinaBase: string;
  frente: string;
  dataCriacao: string;
  horaCriacao: string;
  atualizadoEm?: string;
  setorOs: AtendimentoSetor[];
}

// Props das Telas e Componentes do Ecossistema
export interface TelaHistoricoProps {
  ordens: OrdemServicoAgro[];
}

export interface FormularioOSProps {
  idEmEdicao: string | null;
  ordens: OrdemServicoAgro[];
  onSalvar: (dadosForm: Partial<OrdemServicoAgro>) => Promise<void>;
  onCancelar: () => void;
}

export interface ColunaKanbanProps {
  titulo: string;
  status: AtendimentoSetor['status'];
  setorAtivo: string;
  ordens: OrdemServicoAgro[];
  onSelecionarCard: (os: OrdemServicoAgro) => void;
  onEditar: (os: OrdemServicoAgro, e: React.MouseEvent) => void;
  onExcluir: (idCustomizado: string, e: React.MouseEvent) => void;
}

export interface LoadingStatusProps {
  mensagem?: string;
}
