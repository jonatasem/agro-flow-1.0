import type { Operador, Equipamento, OrdemServicoAgro } from "../interface";


export const operadoresCadastrados: Operador[] = [
  { codigo: '23805', nome: 'João da Silva (Alemão)', setor: 'CCT', turno: 'Turno C (Noturno)' },
  { codigo: '14220', nome: 'Carlos Eduardo (Cadu)', setor: 'Plantio', turno: 'Turno A (Diurno)' },
  { codigo: '33410', nome: 'Marcos Roberto', setor: 'Preparo de Solo', turno: 'Turno B (Vespertino)' },
  { codigo: '45090', nome: 'Antônio Souza', setor: 'Tratos Culturais', turno: 'Turno A (Diurno)' }
];

export const frotasCadastradas: Equipamento[] = [
  { prefixo: '850002', tipo: 'Trator', modeloEquipamento: 'John Deere 6100J', modeloPilotoPadrao: 'Trimble 1060', usinaAlocada: 'Lençóis' },
  { prefixo: '850010', tipo: 'Trator', modeloEquipamento: 'Case IH Puma 230', modeloPilotoPadrao: 'Trimble 2050', usinaAlocada: 'Lençóis' },
  { prefixo: '850045', tipo: 'Trator', modeloEquipamento: 'New Holland T8', modeloPilotoPadrao: 'Trimble 1060', usinaAlocada: 'Quatá' },
  { prefixo: '850099', tipo: 'Trator', modeloEquipamento: 'John Deere 8R', modeloPilotoPadrao: 'Topcon Value Line', usinaAlocada: 'Barra Grande' }
];

export const ordensServicoIniciais: OrdemServicoAgro[] = [
  {
    id: "OS-850001-3491",
    prefixoTrator: "850001",
    idOperador: "23805",
    criadoPor: "COA - Central",
    atividade: "Plantio",
    modeloPiloto: "John Deere Gen4",
    qruDescricao: "Piloto não engatando, apresentando falha de comunicação na rede CAN.",
    status: "pendente",
    triagemSetor: "Agricultura de Precisão",
    dataCriacao: "2026-05-20",
    horaCriacao: "07:30",
    usinaBase: "Usina São José",
    frente: "Frente 2"
  },
  {
    id: "OS-850002-9912",
    prefixoTrator: "850002",
    idOperador: "10442",
    criadoPor: "COA - Central",
    atividade: "Transbordo",
    modeloPiloto: "Trimble 1060",
    qruDescricao: "Piloto não habilita no monitor, trator não segue a linha do projeto.",
    status: "pendente",
    triagemSetor: "Agricultura de Precisão",
    dataCriacao: "2026-05-22",
    horaCriacao: "09:15",
    usinaBase: "Usina Barra Grande",
    frente: "Frente 1"
  }
];