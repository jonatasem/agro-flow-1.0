import type { ColunaKanbanProps } from '../interface/index.js';
import { Edit3, Trash2, CheckCircle2, AlertTriangle, Clock, MapPin, User, ShieldAlert, Calendar, Timer, Lock } from 'lucide-react';
import { formatarDataBR } from '../utils/date.js';
import { useState, useEffect, useMemo } from 'react';

function CardCronometro({ dataInicio }: { dataInicio: string | undefined }) {
  const [tempoPassado, setTempoPassado] = useState('00:00:00');

  useEffect(() => {
    if (!dataInicio) return;

    const calcularDiferenca = () => {
      const inicio = new Date(dataInicio).getTime();
      const agora = new Date().getTime();
      const diferenca = agora - inicio;

      if (diferenca <= 0) {
        setTempoPassado('00:00:00');
        return;
      }

      const totalSegundos = Math.floor(diferenca / 1000);
      const horas = Math.floor(totalSegundos / 3600);
      const minutos = Math.floor((totalSegundos % 3600) / 60);
      const segundos = totalSegundos % 60;

      setTempoPassado(
        `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`
      );
    };

    calcularDiferenca();
    const intervalo = setInterval(calcularDiferenca, 1000);

    return () => clearInterval(intervalo);
  }, [dataInicio]);

  return (
    <div className="bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-[11px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1.5 animate-pulse">
      <Timer size={13} className="text-amber-500" />
      <span>Manutenção: {tempoPassado}</span>
    </div>
  );
}

export default function ColunaKanban({ 
  titulo, 
  status, 
  setorAtivo, 
  ordens, 
  onSelecionarCard, 
  onEditar, 
  onExcluir 
}: ColunaKanbanProps) {

  const ordensFiltradas = useMemo(() => {
    return ordens.filter(os => {
      const subAtendimento = os.setorOs.find(s => s.setor === setorAtivo);
      return subAtendimento ? subAtendimento.status === status : false;
    });
  }, [ordens, status, setorAtivo]);

  return (
    <div className="bg-[#181b26] p-4 rounded-2xl border border-agro-border/50 flex flex-col min-h-125">
      
      <h3 className="font-bold text-xs uppercase text-slate-400 mb-4 tracking-wider flex justify-between items-center shrink-0">
        <span>{titulo}</span>
        <span className="bg-agro-dark px-2.5 py-0.5 rounded-full text-slate-300 font-bold text-[11px]">
          {ordensFiltradas.length}
        </span>
      </h3>

      <div className="space-y-3 flex-1 overflow-y-auto max-h-[75vh] pr-1 custom-scrollbar">
        {ordensFiltradas.map(os => {
          const oficinaDoCard = os.setorOs.find(s => s.setor === setorAtivo);
          
          const temSolucao = oficinaDoCard?.solucaoTecnico && oficinaDoCard.solucaoTecnico.trim() !== '';
          const isConcluido = oficinaDoCard?.status === 'concluido';

          return (
            <div 
              key={os.idCustomizado} 
              onClick={() => onSelecionarCard(os)} 
              className="bg-agro-card border border-agro-border p-4 rounded-xl cursor-pointer hover:border-green-500/30 transition-all duration-200 group relative flex flex-col gap-2.5"
            >
              
              <div className="flex justify-between items-center text-[11px]">
                <span className="font-black text-xs bg-green-500/10 text-green-400 px-2 py-0.5 rounded-lg border border-green-500/20">
                  🚜 Frota {os.prefixoTrator}
                </span>
                <span className="text-[10px] text-slate-500 font-mono tracking-tight">
                  #{os.idCustomizado}
                </span>
              </div>

              {oficinaDoCard?.status === 'em_manutencao' && oficinaDoCard.dataInicioManutencao && (
                <CardCronometro dataInicio={oficinaDoCard.dataInicioManutencao} />
              )}

              {isConcluido && oficinaDoCard?.tempoManutencao && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-[10px] px-2.5 py-1 rounded-lg flex items-center gap-1 w-fit">
                  ⏱️ Duração da manutenção {oficinaDoCard.tempoManutencao}
                </div>
              )}

              <div className="space-y-1.5 text-[11px] text-slate-300">
                <div className="flex items-center gap-1.5">
                  <ShieldAlert size={12} className="text-slate-500 shrink-0" />
                  <span className="font-bold">Operação: <span className="font-normal text-slate-400">{os.atividade}</span></span>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-agro-dark/40 border border-agro-border/30 rounded-lg px-2 py-1 flex items-center gap-1 text-slate-300 truncate">
                    <User size={11} className="text-slate-500 shrink-0" />
                    <span className="truncate">Op: {os.idOperador}</span>
                  </div>
                  <div className="bg-agro-dark/40 border border-agro-border/30 rounded-lg px-2 py-1 flex items-center gap-1 text-slate-300 truncate">
                    <MapPin size={11} className="text-slate-500 shrink-0" />
                    <span className="truncate">{os.frente}</span>
                  </div>
                </div>
              </div>

              <div className="bg-agro-dark/50 p-2.5 rounded-xl border border-agro-border/30 text-[11px] leading-relaxed">
                {temSolucao ? (
                  <div className="text-emerald-400 font-medium flex items-start gap-1.5">
                    <CheckCircle2 size={13} className="shrink-0 mt-0.5 text-emerald-400" />
                    <p className="line-clamp-3"><strong>Laudo:</strong> {oficinaDoCard.solucaoTecnico}</p>
                  </div>
                ) : (
                  <div className="text-slate-400 italic flex items-start gap-1.5">
                    <AlertTriangle size={13} className="shrink-0 mt-0.5 text-amber-500" />
                    <p className="line-clamp-3">"{oficinaDoCard?.qruDescricao || os.setorOs[0]?.qruDescricao}"</p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500 font-medium border-t border-dashed border-agro-border/40 pt-2">
                <div className="flex items-center gap-1">
                  <Clock size={11} />
                  <span>Chegada: <strong className="text-slate-400">{oficinaDoCard?.horaCriacao || os.horaCriacao}</strong></span>
                </div>
                <div className="flex items-center gap-1 justify-end text-right">
                  <Calendar size={11} />
                  <span>Data: <strong className="text-slate-400">{formatarDataBR(oficinaDoCard?.dataCriacao || os.dataCriacao)}</strong></span>
                </div>
              </div>

              <div className="mt-1 pt-2 border-t border-agro-border/40 flex justify-between items-center gap-2 opacity-30 group-hover:opacity-100 transition-opacity duration-200">
                <span className="text-[10px] text-slate-500 font-medium truncate max-w-[55%]">
                  Por: {oficinaDoCard?.criadoPor || 'COA'}
                </span>
                
                <div className="flex items-center gap-3 shrink-0">
                  {isConcluido ? (
                    <div className="text-slate-500 flex items-center gap-1 text-[10px] font-bold select-none bg-agro-dark border border-agro-border px-2 py-0.5 rounded-md">
                      <Lock size={10} className="text-slate-600" /> Histórico Trancado
                    </div>
                  ) : (
                    <>
                      <button 
                        onClick={(e) => { e.stopPropagation(); onEditar(os, e); }} 
                        className="text-blue-400 hover:text-blue-300 flex items-center gap-0.5 text-[10px] font-bold cursor-pointer transition"
                      >
                        <Edit3 size={11}/> Editar
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); onExcluir(os.idCustomizado, e); }} 
                        className="text-red-400 hover:text-red-300 flex items-center gap-0.5 text-[10px] font-bold cursor-pointer transition"
                      >
                        <Trash2 size={11}/> Excluir
                      </button>
                    </>
                  )}
                </div>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}
