import type { ColunaKanbanProps } from '../interface/index.js';
import { Edit3, Trash2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function ColunaKanban({ titulo, status, ordens, onSelecionarCard, onEditar, onExcluir }: ColunaKanbanProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const classes = {
    colunaBg: isDark ? 'bg-[#181b26] border-agro-border/50' : 'bg-white border-emerald-100 shadow-md',
    contadorBg: isDark ? 'bg-agro-dark text-slate-300' : 'bg-emerald-50 text-emerald-800',
    cardBg: isDark ? 'bg-agro-card border-agro-border hover:border-amber-500/20' : 'bg-emerald-50/20 border-emerald-100/70 hover:border-emerald-400 hover:shadow-sm',
    textoPrefixo: isDark ? 'text-slate-200' : 'text-slate-800 font-bold',
    textoAtividade: isDark ? 'text-slate-300' : 'text-emerald-950',
    caixaDescricao: isDark ? 'bg-agro-dark/50 border-agro-border/30' : 'bg-white border-emerald-100 shadow-inner',
    botoesPainel: isDark ? 'border-agro-border/40' : 'border-emerald-100/60'
  };

  const ordensFiltradas = ordens.filter(o => o.status === status);

  return (
    <div className={`p-4 rounded-2xl border transition-colors duration-200 ${classes.colunaBg}`}>
      <h3 className="font-bold text-xs uppercase text-slate-400 mb-4 tracking-wider flex justify-between items-center">
        <span className={isDark ? 'text-slate-400' : 'text-emerald-900 font-extrabold'}>{titulo}</span>
        <span className={`px-2 py-0.5 rounded font-black text-[10px] ${classes.contadorBg}`}>{ordensFiltradas.length}</span>
      </h3>

      <div className="space-y-3">
        {ordensFiltradas.map(os => {
          const temSolucao = os.solucaoTecnico && os.solucaoTecnico.trim() !== '';

          return (
            <div 
              key={os.idCustomizado} 
              onClick={() => onSelecionarCard(os)} 
              className={`border p-4 rounded-xl cursor-pointer transition-all duration-200 group relative ${classes.cardBg}`}
            >
              <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                <span className={classes.textoPrefixo}>Frota: {os.prefixoTrator}</span>
                <span className="text-[9px] text-slate-500 font-bold">{os.idCustomizado}</span>
              </div>
              <h4 className={`text-xs font-bold ${classes.textoAtividade}`}>{os.atividade} • {os.modeloPiloto}</h4>

              <div className={`mt-2 p-2 rounded border ${classes.caixaDescricao}`}>
                {temSolucao ? (
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-start gap-1">
                    <span className="mt-0.5"><CheckCircle2 size={11}/></span>
                    <span><strong>Ação:</strong> {os.solucaoTecnico}</span>
                  </p>
                ) : (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 italic flex items-start gap-1">
                    <span className="mt-0.5 text-amber-500"><AlertTriangle size={11}/></span>
                    <span>"{os.qruDescricao}"</span>
                  </p>
                )}
              </div>

              <div className={`mt-3 pt-2 border-t flex justify-end gap-3 opacity-40 group-hover:opacity-100 transition ${classes.botoesPainel}`}>
                <button 
                  onClick={(e) => onEditar(os, e)} 
                  className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5 text-[10px] font-bold cursor-pointer"
                >
                  <Edit3 size={11}/> Editar
                </button>
                <button 
                  onClick={(e) => onExcluir(os.idCustomizado, e)} 
                  className="text-red-600 dark:text-red-400 hover:underline flex items-center gap-0.5 text-[10px] font-bold cursor-pointer"
                >
                  <Trash2 size={11}/> Excluir
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
