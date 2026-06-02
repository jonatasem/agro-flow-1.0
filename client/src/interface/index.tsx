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

export interface OrdemServicoAgro {
  id: string;
  idCustomizado: string; 
  prefixoTrator: string;
  idOperador: string;
  criadoPor: string;
  atividade: string;
  qruDescricao: string;
  status: 'pendente' | 'em_andamento' | 'concluido';
  triagemSetor: 'Agricultura de Precisão' | 'Elétrica' | 'Mecânica' | 'Borracharia';
  tipoCausa?: 'Hardware (Defeito Real)' | 'Erro Operacional' | 'Infraestrutura (Sinal)';
  solucaoTecnico?: string;
  tecnicoResponsavel?: string;
  dataCriacao: string; 
  horaCriacao: string;
  usinaBase?: string;
  frente?: string;
  atualizadoEm?: string;
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
  status: OrdemServicoAgro['status'];
  ordens: OrdemServicoAgro[];
  onSelecionarCard: (os: OrdemServicoAgro) => void;
  onEditar: (os: OrdemServicoAgro, e: React.MouseEvent) => void;
  onExcluir: (idCustomizado: string, e: React.MouseEvent) => void;
}

export interface LoadingStatusProps {
  mensagem?: string;
}
