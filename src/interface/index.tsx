export interface Operador {
  codigo: string;
  nome: string;
}

export interface Equipamento {
  prefixo: string;
  tipo: string;
  modeloEquipamento: string;
  modeloPilotoPadrao: 'Trimble 1060' | 'Trimble 2050' | 'Topcon Value Line' | 'Nenhum';
  usinaAlocada: 'Lençóis' | 'Quatá' | 'Barra Grande' | 'Salto Botelho';
  setor: string;
}

export interface OrdemServicoAgro {
  id: string;
  prefixoTrator: string;
  idOperador: string;
  criadoPor: string;
  atividade: string;
  modeloPiloto: string;
  qruDescricao: string;
  status: 'pendente' | 'em_andamento' | 'concluido';
  triagemSetor: 'Agricultura de Precisão' | 'Elétrica Automotiva' | 'Mecânica/Hidráulica';
  tipoCausa?: 'Hardware (Defeito Real)' | 'Erro Operacional (Falta de Treinamento)' | 'Infraestrutura/Sinal';
  solucaoTecnico?: string;
  tecnicoResponsavel?: string;
  dataCriacao: string; 
  horaCriacao: string;
  usinaBase?: string;
  frente?: string;
}

export interface TelaHistoricoProps {
  ordens: OrdemServicoAgro[];
}

export interface FormularioOSProps {
  idEmEdicao: string | null;
  ordens: OrdemServicoAgro[];
  onSalvar: (dadosForm: Partial<OrdemServicoAgro>) => void;
  onCancelar: () => void;
}

export interface ColunaKanbanProps {
  titulo: string;
  status: OrdemServicoAgro['status'];
  ordens: OrdemServicoAgro[];
  onSelecionarCard: (os: OrdemServicoAgro) => void;
  onEditar: (os: OrdemServicoAgro, e: React.MouseEvent) => void;
  onExcluir: (id: string, e: React.MouseEvent) => void;
}