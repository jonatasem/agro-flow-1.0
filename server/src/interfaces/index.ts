import { type Request } from 'express';

export interface CreateOrdemInput {
  prefixoTrator: string;
  idOperador: string;
  criadoPor: string;
  atividade: string;
  modeloPiloto?: string;
  usinaBase: string;
  frente: string;
  qruDescricao: string;
  triagemSetor: string;
}

export interface UpdateOrdemInput {
  status?: 'pendente' | 'em_andamento' | 'concluido';
  triagemSetor?: 'Agricultura de Precisão' | 'Elétrica' | 'Mecânica' | 'Borracharia';
  tipoCausa?: 'Hardware (Defeito Real)' | 'Erro Operacional' | 'Infraestrutura (Sinal)';
  solucaoTecnico?: string;
  tecnicoResponsavel?: string;
}

// Estende o Request para o Express aceitar o token descriptografado
export interface AuthenticatedRequest extends Request {
  usuarioLogado?: {
    matricula: string;
    nome: string;
  };
}