import { useState } from 'react';
import { ordensServicoIniciais, type OrdemServico } from './data/mockApi';

export default function App() {
  const [ordens, setOrdens] = useState<OrdemServico[]>(ordensServicoIniciais);
  const [osSelecionada, setOsSelecionada] = useState<OrdemServico | null>(null);

  // Função auxiliar para pegar a string de data/hora atual
  const obterDataHoraAtual = () => {
    const agora = new Date();
    return {
      texto: `${agora.toLocaleDateString('pt-BR')} ${agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`,
      objeto: agora
    };
  };

  // Função para calcular a diferença de tempo em minutos/horas
  const calcularDiferencaTempo = (inicioStr: string, fimObj: Date): string => {
    try {
      // Converte dd/mm/aaaa hh:mm para objeto Date utilizável
      const [data, hora] = inicioStr.split(' ');
      const [dia, mes, ano] = data.split('/');
      const [horas, minutos] = hora.split(':');
      const dataInicio = new Date(Number(ano), Number(mes) - 1, Number(dia), Number(horas), Number(minutos));
      
      const diferencaMs = fimObj.getTime() - dataInicio.getTime();
      const diferencaMinutos = Math.floor(diferencaMs / (1000 * 60));

      if (diferencaMinutos < 60) {
        return `${diferencaMinutos} min`;
      } else {
        const h = Math.floor(diferencaMinutos / 60);
        const m = diferencaMinutos % 60;
        return `${h}h ${m}min`;
      }
    } catch (e) {
      return 'Tempo não calculado';
    }
  };

  // Gerenciador de Ciclo de Vida dos Status (Pendente -> Em Andamento -> Concluído)
  const alterarStatus = (id: string, novoStatus: 'pendente' | 'em_andamento' | 'concluido') => {
    const { texto: dataHoraStr, objeto: dataHoraObj } = obterDataHoraAtual();

    setOrdens(prevOrdens =>
      prevOrdens.map(os => {
        if (os.id !== id) return os;

        const atualizacao: Partial<OrdemServico> = { status: novoStatus };

        if (novoStatus === 'em_andamento') {
          atualizacao.horarioInicio = dataHoraStr;
          // Limpa conclusões anteriores caso tenha retornado de status
          atualizacao.horarioConclusao = undefined;
          atualizacao.tempoExecucao = undefined;
        } else if (novoStatus === 'concluido') {
          atualizacao.horarioConclusao = dataHoraStr;
          // Calcula tempo com base na hora que iniciou a manutenção
          if (os.horarioInicio) {
            atualizacao.tempoExecucao = calcularDiferencaTempo(os.horarioInicio, dataHoraObj);
          } else {
            atualizacao.tempoExecucao = "Direto p/ Conclusão";
          }
        } else if (novoStatus === 'pendente') {
          // Reset completo dos marcadores temporais ao voltar para a fila
          atualizacao.horarioInicio = undefined;
          atualizacao.horarioConclusao = undefined;
          atualizacao.tempoExecucao = undefined;
        }

        const osAtualizada = { ...os, ...atualizacao };
        // Se a OS atualizada for a que está aberta no Pop-up, atualiza o Pop-up também
        if (osSelecionada?.id === id) setOsSelecionada(osAtualizada);
        
        return osAtualizada;
      })
    );
  };

  return (
    <div className="min-h-screen bg-agro-dark text-slate-100 font-sans p-4 md:p-8">
      
      {/* Header institucional */}
      <header className="mb-8 border-b border-agro-border pb-6 flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black tracking-wider text-white">ZILOR</span>
            <span className="bg-agro-green text-slate-950 text-xs font-black px-2 py-0.5 rounded-md">GLOBAL-TECH</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Plataforma Unificada de Gestão Operacional Intersetorial</p>
        </div>
      </header>

      {/* Grid Principal das Três Colunas (Kanban de Operação) */}
      <main>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Coluna 1: Pendentes / Agendados */}
          <div className="bg-[#181b26] p-4 rounded-2xl border border-agro-border/60">
            <div className="flex justify-between items-center mb-4 px-2">
              <h3 className="font-bold text-amber-500 flex items-center gap-2">⏳ Agendados / Pendentes</h3>
              <span className="bg-agro-border px-2 py-0.5 rounded-md text-xs font-bold">
                {ordens.filter(o => o.status === 'pendente').length}
              </span>
            </div>
            
            <div className="space-y-4">
              {ordens.filter(o => o.status === 'pendente').map(os => (
                <div 
                  key={os.id}
                  onClick={() => setOsSelecionada(os)}
                  className="bg-agro-card border border-agro-border p-4 rounded-xl cursor-pointer hover:border-amber-500/40 transition-all duration-200 shadow-md group"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold text-slate-400">Frota {os.frota}</span>
                    <span className="text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded font-bold uppercase tracking-wider">Aguardando</span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-200 group-hover:text-amber-400 transition-colors">{os.tipoVeiculo} — {os.equipamentoAfetado}</h4>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-2 bg-agro-dark/50 p-2 rounded">{os.descricaoProblema}</p>
                  
                  <div className="mt-4 pt-3 border-t border-agro-border/40 flex justify-between items-center">
                    <span className="text-[10px] text-slate-500">{os.horarioAbertura}</span>
                    <button 
                      onClick={(e) => { e.stopPropagation(); alterarStatus(os.id, 'em_andamento'); }}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg transition"
                    >
                      Iniciar Trabalho 🚀
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Coluna 2: Em Manutenção / Em Andamento */}
          <div className="bg-[#181b26] p-4 rounded-2xl border border-agro-border/60">
            <div className="flex justify-between items-center mb-4 px-2">
              <h3 className="font-bold text-blue-400 flex items-center gap-2">🛠️ Em Manutenção</h3>
              <span className="bg-agro-border px-2 py-0.5 rounded-md text-xs font-bold">
                {ordens.filter(o => o.status === 'em_andamento').length}
              </span>
            </div>

            <div className="space-y-4">
              {ordens.filter(o => o.status === 'em_andamento').map(os => (
                <div 
                  key={os.id}
                  onClick={() => setOsSelecionada(os)}
                  className="bg-agro-card border border-blue-500/30 p-4 rounded-xl cursor-pointer hover:border-blue-400 transition-all duration-200 shadow-md group"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold text-slate-400">Frota {os.frota}</span>
                    <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded font-bold uppercase tracking-wider animate-pulse">Na Bancada</span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-200 group-hover:text-blue-400 transition-colors">{os.tipoVeiculo} — {os.equipamentoAfetado}</h4>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-2 bg-agro-dark/50 p-2 rounded">{os.descricaoProblema}</p>
                  
                  <div className="mt-4 pt-3 border-t border-agro-border/40 flex justify-between items-center gap-2">
                    <button 
                      onClick={(e) => { e.stopPropagation(); alterarStatus(os.id, 'pendente'); }}
                      className="text-slate-400 hover:text-slate-200 text-[10px] font-medium transition"
                    >
                      ↩️ Voltar p/ Fila
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); alterarStatus(os.id, 'concluido'); }}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg transition"
                    >
                      Concluir O.S. ✅
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Coluna 3: Concluídas / Pronto para o Campo */}
          <div className="bg-[#181b26] p-4 rounded-2xl border border-agro-border/60">
            <div className="flex justify-between items-center mb-4 px-2">
              <h3 className="font-bold text-emerald-400 flex items-center gap-2">✅ Pronto para o Campo</h3>
              <span className="bg-agro-border px-2 py-0.5 rounded-md text-xs font-bold">
                {ordens.filter(o => o.status === 'concluido').length}
              </span>
            </div>

            <div className="space-y-4">
              {ordens.filter(o => o.status === 'concluido').map(os => (
                <div 
                  key={os.id}
                  onClick={() => setOsSelecionada(os)}
                  className="bg-agro-card border border-agro-border p-4 rounded-xl cursor-pointer hover:border-emerald-500/20 opacity-85 hover:opacity-100 transition-all duration-200 shadow-md group"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold text-slate-400">Frota {os.frota}</span>
                    <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10">Liberado</span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-200">{os.tipoVeiculo} — {os.equipamentoAfetado}</h4>
                  
                  {os.tempoExecucao && (
                    <div className="text-[11px] text-emerald-400 bg-emerald-950/30 font-medium px-2 py-1 rounded-md mt-2 inline-block">
                      ⏱️ Tempo de Reparo: {os.tempoExecucao}
                    </div>
                  )}

                  <div className="mt-4 pt-3 border-t border-agro-border/40 flex justify-between items-center">
                    <button 
                      onClick={(e) => { e.stopPropagation(); alterarStatus(os.id, 'em_andamento'); }}
                      className="text-slate-500 hover:text-slate-400 text-[10px] transition"
                    >
                      🛠️ Reabrir Manutenção
                    </button>
                    <span className="text-[10px] text-slate-500 font-medium">Fim: {os.horarioConclusao?.split(' ')[1]}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>

      {/* 🛑 POP-UP MODAL DETALHADO (Ativado ao clicar em qualquer card) */}
      {osSelecionada && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex justify-center items-center p-4 z-50 animate-fadeIn">
          <div className="bg-agro-card border border-agro-border rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
            
            {/* Header Modal */}
            <div className="flex justify-between items-start border-b border-agro-border pb-4 mb-4">
              <div>
                <span className="text-xs font-black text-slate-400 tracking-widest uppercase">{osSelecionada.id} • {osSelecionada.usina}</span>
                <h3 className="text-xl font-bold text-white mt-1">{osSelecionada.tipoVeiculo} — Frota {osSelecionada.frota}</h3>
              </div>
              <button 
                onClick={() => setOsSelecionada(null)}
                className="text-slate-400 hover:text-white bg-agro-dark p-2 rounded-lg text-xs font-bold transition cursor-pointer"
              >
                Fechar ✕
              </button>
            </div>

            {/* Informações detalhadas */}
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4 bg-agro-dark/50 p-3 rounded-xl border border-agro-border/40">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Frente de Trabalho</span>
                  <span className="font-semibold text-slate-200">{osSelecionada.frente}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Tecnologia Embarcada</span>
                  <span className="font-semibold text-slate-300">⚙️ {osSelecionada.equipamentoAfetado}</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Histórico Técnico da Atividade</span>
                <p className="bg-agro-dark/30 p-3 rounded-xl border border-agro-border/20 text-slate-300 leading-relaxed text-xs">
                  {osSelecionada.descricaoProblema}
                </p>
              </div>

              {/* Rastreabilidade Temporal de Auditoria */}
              <div className="bg-agro-dark/50 p-4 rounded-xl border border-agro-border/30 space-y-2 text-xs text-slate-400">
                <div className="flex justify-between">
                  <span>📅 Criação do Agendamento:</span>
                  <span className="font-medium text-slate-300">{osSelecionada.horarioAbertura}</span>
                </div>
                <div className="flex justify-between">
                  <span>🚀 Início da Manutenção:</span>
                  <span className="font-medium text-slate-300">{osSelecionada.horarioInicio || 'Não Iniciada'}</span>
                </div>
                {osSelecionada.horarioConclusao && (
                  <div className="flex justify-between text-emerald-400">
                    <span>🏁 Conclusão Operacional:</span>
                    <span className="font-medium">{osSelecionada.horarioConclusao}</span>
                  </div>
                )}
                {osSelecionada.tempoExecucao && (
                  <div className="flex justify-between border-t border-agro-border/60 pt-2 text-white font-bold">
                    <span>⏱️ Tempo Líquido de Reparo:</span>
                    <span className="text-emerald-400">{osSelecionada.tempoExecucao}</span>
                  </div>
                )}
              </div>

              <div className="text-xs text-slate-500 flex items-center gap-1.5 pt-2">
                👤 <span className="font-medium">Responsável Técnico registrado:</span> {osSelecionada.tecnicoResponsavel}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}