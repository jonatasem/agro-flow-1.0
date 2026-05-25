export interface Operador {
  codigo: string;
  nome: string;
  setor: string;
  turno: string;
}

export interface Equipamento {
  prefixo: string;
  tipo: string;
  modeloEquipamento: string;
  modeloPilotoPadrao: 'Trimble 1060' | 'Trimble 2050' | 'Topcon Value Line' | 'Nenhum';
  usinaAlocada: 'Lençóis' | 'Quatá' | 'Barra Grande';
}

export interface OrdemServicoAgro {
  id: string;
  prefixoTrator: string;       
  idOperador: string;          
  atividade: string;
  modeloPiloto: string;
  usina: string;
  frente: string;
  qruDescricao: string; 
  criadoPor: string; 
  status: 'pendente' | 'em_andamento' | 'concluido';
  triagemSetor: 'Agricultura de Precisão' | 'Elétrica Automotiva' | 'Mecânica/Hidráulica';
  dataCriacao: string;      
  horaCriacao: string;      
  tipoCausa?: 'Hardware (Defeito Real)' | 'Erro Operacional (Falta de Treinamento)' | 'Infraestrutura/Sinal';
  solucaoTecnico?: string; 
  tecnicoResponsavel?: string;
  tempoExecucaoMinutos?: number;
}