import { type Request } from 'express';

// Estrutura interna para manipulação das oficinas/setores no Backend
export interface AtendimentoSetorInput {
  id?: string; // <-- Permitir a leitura do ID único gerado pelo Prisma
  setor: 'Agricultura de Precisão' | 'Elétrica' | 'Mecânica' | 'Borracharia';
  status?: 'aguardando_manutencao' | 'em_manutencao' | 'concluido';
  qruDescricao: string;
  criadoPor: string;
  dataCriacao?: string;
  horaCriacao?: string;
  solucaoTecnico?: string;
  tipoCausa?: 'Hardware (Defeito Real)' | 'Erro Operacional' | 'Infraestrutura (Sinal)';
  tecnicoResponsavel?: string;
}

// DTO / Input usado na abertura de uma nova O.S.
export interface CreateOrdemInput {
  prefixoTrator: string;
  idOperador: string;
  atividade: string;
  usinaBase: string;
  frente: string;
  setores: AtendimentoSetorInput[]; // Payload estruturado vindo do formulário front-end
}

// DTO / Input usado para atualizar os metadados de cabeçalho da OS
export interface UpdateOrdemInput {
  idOperador?: string;
  frente?: string;
  atividade?: string;
  usinaBase?: string;
}

// 🎯 DTO de Payload atualizado para referenciar o ID único da oficina (Evita duplicações)
export interface AtualizarStatusSetorInput {
  setorId: string; // <-- Identificação unitária da oficina na array
  status: 'aguardando_manutencao' | 'em_manutencao' | 'concluido';
  solucaoTecnico?: string;
  tipoCausa?: 'Hardware (Defeito Real)' | 'Erro Operacional' | 'Infraestrutura (Sinal)';
}

export interface BaixaSetorInput {
  setorId: string; // <-- Identificação unitária da oficina na array
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
