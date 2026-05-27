export interface CreateOrdemInput {
  prefixoTrator: string;
  idOperador: string;
  criadoPor: string;
  atividade: string;
  modeloPiloto: string;
  usinaBase: string;
  frente: string;
  qruDescricao: string;
  triagemSetor: string;
}

export interface UpdateOrdemInput {
  status?: 'pendente' | 'em_andamento' | 'concluido';
  triagemSetor?: 'Agricultura de Precisão' | 'Elétrica Automotiva' | 'Mecânica/Hidráulica';
  tipoCausa?: 'Hardware (Defeito Real)' | 'Erro Operacional (Falta de Treinamento)' | 'Infraestrutura/Sinal';
  solucaoTecnico?: string;
  tecnicoResponsavel?: string;
}
