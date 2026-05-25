export interface OrdemServico {
  id: string;
  frota: string;
  tipoVeiculo: 'Caminhão' | 'Prancha' | 'Colhedora' | 'Trator BMD';
  usina: 'Lençóis' | 'Quatá' | 'Salto Botelho' | 'Barra Grande';
  frente: string;
  equipamentoAfetado: 'Solinftec' | 'Trimble 1060' | 'Trimble 2050' | 'Topcon Value Line' | 'Rádio Mototrbo' | 'Sensores/Câmeras';
  descricaoProblema: string;
  tecnicoResponsavel: string;
  horarioAbertura: string;     // Hora de criação do agendamento
  horarioInicio?: string;       // Hora que mudou para 'em_andamento'
  horarioConclusao?: string;    // Hora que mudou para 'concluido'
  tempoExecucao?: string;       // Cálculo do tempo decorrido
  status: 'pendente' | 'em_andamento' | 'concluido';
}

export const ordensServicoIniciais: OrdemServico[] = [
  {
    id: 'OS-001',
    frota: '900159',
    tipoVeiculo: 'Caminhão',
    usina: 'Lençóis',
    frente: 'Frente 04 (Balde 🪣)',
    equipamentoAfetado: 'Rádio Mototrbo',
    descricaoProblema: 'Realizado a inversão da antena do rádio, carro Líder frente 04.',
    tecnicoResponsavel: '+55 18 99786-9714',
    horarioAbertura: '23/05/2026 10:00',
    horarioInicio: '23/05/2026 10:15',
    horarioConclusao: '23/05/2026 10:42',
    tempoExecucao: '27 minutos',
    status: 'concluido'
  },
  {
    id: 'OS-002',
    frota: '800105',
    tipoVeiculo: 'Prancha',
    usina: 'Lençóis',
    frente: 'Frente 03',
    equipamentoAfetado: 'Rádio Mototrbo',
    descricaoProblema: 'Aparelho inoperante. Necessário fazer a troca de fusível na cabine.',
    tecnicoResponsavel: 'Jonatas Moreira',
    horarioAbertura: '23/05/2026 12:57',
    status: 'pendente'
  }
];