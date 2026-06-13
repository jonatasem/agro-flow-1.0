import { type Request } from 'express';

// Estrutura interna para manipulação das oficinas/setores no Backend
export interface AtendimentoSetorInput {
  setor: 'Agricultura de Precisão' | 'Elétrica' | 'Mecânica' | 'Borracharia';
  status?: 'aguardando_manutencao' | 'em_manutencao' | 'concluido';
  qruDescricao: string;
  criadoPor: string;
  dataCriacao?: string;
  horaCriacao?: string;
}

// DTO / Input usado na abertura de uma nova O.S.
export interface CreateOrdemInput {
  prefixoTrator: string;
  idOperador: string;
  atividade: string;
  usinaBase: string;
  frente: string;
  setores: AtendimentoSetorInput[]; // Payload estruturado em árvore vindo do formulário front-end
}

// DTO / Input usado para atualizar os metadados de cabeçalho da OS
export interface UpdateOrdemInput {
  idOperador?: string;
  frente?: string;
  atividade?: string;
  usinaBase?: string;
}

// DTO de Payload para as ações específicas de alteração de status/baixa nas oficinas
export interface AtualizarStatusSetorInput {
  setor: 'Agricultura de Precisão' | 'Elétrica' | 'Mecânica' | 'Borracharia';
  status: 'aguardando_manutencao' | 'em_manutencao' | 'concluido';
  solucaoTecnico?: string;
  tipoCausa?: 'Hardware (Defeito Real)' | 'Erro Operacional' | 'Infraestrutura (Sinal)';
}

export interface BaixaSetorInput {
  setor: 'Agricultura de Precisão' | 'Elétrica' | 'Mecânica' | 'Borracharia';
  tipoCausa: 'Hardware (Defeito Real)' | 'Erro Operacional' | 'Infraestrutura (Sinal)';
  solucaoTecnico: string;
  tecnicoResponsavel: string;
}

// Estende o Request para o Express aceitar o token descriptografado pelo Middleware
export interface AuthenticatedRequest extends Request {
  usuarioLogado?: {
    matricula: string;
    nome: string;
  };
}
