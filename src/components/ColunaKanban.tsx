import type { OrdemServicoAgro } from '../interface/index';
import { Edit3, Trash2, CheckCircle2, AlertTriangle } from 'lucide-react';

interface ColunaKanbanProps {
  titulo: string;
  status: OrdemServicoAgro['status'];
  ordens: OrdemServicoAgro[];
  onSelecionarCard: (os: OrdemServicoAgro) => void;
  onEditar: (os: OrdemServicoAgro, e: React.MouseEvent) => void;
  onExcluir: (id: string, e: React.MouseEvent) => void;
}

export default function ColunaKanban({ titulo, status, ordens, onSelecionarCard, onEditar, onExcluir }: ColunaKanbanProps) {
  const ordensFiltradas = ordens.filter(o => o.status === status);

  return (
    <div className="bg-[#181b26] p-4 rounded-2xl border border-[#2a3042]/50">
      <h3 className="font-bold text-xs uppercase text-slate-400 mb-4 tracking-wider flex justify-between items-center">
        <span>{titulo}</span>
        <span className="bg-[#12141c] px-2 py-0.5 rounded text-slate-300 font-bold">{ordensFiltradas.length}</span>
      </h3>

      <div className="space-y-3">
        {ordensFiltradas.map(os => {
          const temSolucao = os.solucaoTecnico && os.solucaoTecnico.trim() !== '';

          return (
            <div key={os.id} onClick={() => onSelecionarCard(os)} className="bg-[#1e2230] border border-[#2a3042] p-4 rounded-xl cursor-pointer hover:border-amber-500/20 transition group relative">
              <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                <span className="font-black text-slate-200">🚜 Trator {os.prefixoTrator}</span>
                <span className="text-[9px] text-slate-500 font-bold">Por: {os.criadoPor}</span>
              </div>
              <h4 className="text-xs font-bold text-slate-300">{os.atividade} • {os.modeloPiloto}</h4>

              <div className="mt-2 bg-[#12141c]/50 p-2 rounded border border-[#2a3042]/30">
                {temSolucao ? (
                  <p className="text-[11px] text-emerald-400 font-medium flex items-start gap-1">
                    <span className="mt-0.5"><CheckCircle2 size={11}/></span>
                    <span><strong>Ação:</strong> {os.solucaoTecnico}</span>
                  </p>
                ) : (
                  <p className="text-[11px] text-slate-400 italic flex items-start gap-1">
                    <span className="mt-0.5 text-amber-500"><AlertTriangle size={11}/></span>
                    <span>"{os.qruDescricao}"</span>
                  </p>
                )}
              </div>

              <div className="mt-3 pt-2 border-t border-[#2a3042]/40 flex justify-end gap-3 opacity-30 group-hover:opacity-100 transition">
                <button onClick={(e) => onEditar(os, e)} className="text-blue-400 hover:text-blue-300 flex items-center gap-0.5 text-[10px] font-bold"><Edit3 size={11}/> Editar</button>
                <button onClick={(e) => onExcluir(os.id, e)} className="text-red-400 hover:text-red-300 flex items-center gap-0.5 text-[10px] font-bold"><Trash2 size={11}/> Excluir</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}