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

// 🎯 Atualizado: Adicionado id único para cada registro de oficina na array concorrente
export interface AtendimentoSetor {
  id?: string; // ID único (UUID) gerado para o Kanban cirúrgico
  _id?: string; // Fallback para compatibilidade direta com a tipagem do MongoDB se necessário
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
