import type { Operador, Equipamento, OrdemServicoAgro } from "../interface";


export const listaOperadores: Operador[] = [
  { codigo: '23805', nome: 'João da Silva (Alemão)', setor: 'CCT', turno: 'Turno C (Noturno)' },
  { codigo: '14220', nome: 'Carlos Eduardo (Cadu)', setor: 'Plantio', turno: 'Turno A (Diurno)' },
  { codigo: '33410', nome: 'Marcos Roberto', setor: 'Preparo de Solo', turno: 'Turno B (Vespertino)' },
  { codigo: '45090', nome: 'Antônio Souza', setor: 'Tratos Culturais', turno: 'Turno A (Diurno)' }
];

export const listaEquipamentos: Equipamento[] = [
  { prefixo: '850002', tipo: 'Trator', modeloEquipamento: 'John Deere 6100J', modeloPilotoPadrao: 'Trimble 1060', usinaAlocada: 'Lençóis' },
  { prefixo: '850010', tipo: 'Trator', modeloEquipamento: 'Case IH Puma 230', modeloPilotoPadrao: 'Trimble 2050', usinaAlocada: 'Lençóis' },
  { prefixo: '850045', tipo: 'Trator', modeloEquipamento: 'New Holland T8', modeloPilotoPadrao: 'Trimble 1060', usinaAlocada: 'Quatá' },
  { prefixo: '850099', tipo: 'Trator', modeloEquipamento: 'John Deere 8R', modeloPilotoPadrao: 'Topcon Value Line', usinaAlocada: 'Barra Grande' }
];

export const ordensServicoIniciais: OrdemServicoAgro[] = [
  {
    id: 'OS-850002-9912',
    prefixoTrator: '850002',
    idOperador: '23805',
    atividade: 'Transbordo',
    modeloPiloto: 'Trimble 1060',
    usina: 'Lençóis',
    frente: 'Frente 2',
    qruDescricao: 'Piloto não habilita no monitor, trator não segue a linha do projeto.',
    criadoPor: 'COA - Central',
    triagemSetor: 'Agricultura de Precisão',
    dataCriacao: '2026-05-20',
    horaCriacao: '19:30',
    status: 'pendente',
    solucaoTecnico: '' // Alteração aqui: evita undefined ao ler o campo
  }
];
