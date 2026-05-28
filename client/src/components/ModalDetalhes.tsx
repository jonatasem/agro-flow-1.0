import { useState, useEffect } from 'react';
import type { OrdemServicoAgro } from '../interface/index.js';
import { useTheme } from '../context/ThemeContext';

interface ModalDetalhesProps {
  os: OrdemServicoAgro;
  onFechar: () => void;
  onTransferirSetor: (idCustomizado: string, proximoSetor: OrdemServicoAgro['triagemSetor']) => Promise<void>;
  onAvancarStatus: (idCustomizado: string, proximoStatus: OrdemServicoAgro['status'], solucaoParcial: string, causaDefinida: OrdemServicoAgro['tipoCausa']) => Promise<void>;
  onDarBaixaFinal: (idCustomizado: string, dadosLaudo: { causa: OrdemServicoAgro['tipoCausa']; setor: OrdemServicoAgro['triagemSetor']; solucao: string }) => Promise<void>;
}

export default function ModalDetalhes({ os, onFechar, onTransferirSetor, onAvancarStatus, onDarBaixaFinal }: ModalDetalhesProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Mapeamento condicional de estilização baseado no tema ativo
  const classes = {
    backdrop: 'fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex justify-center items-center p-4 z-50 text-xs',
    modalCard: isDark ? 'bg-agro-card border-agro-border text-slate-100' : 'bg-white border-emerald-100 text-slate-800 shadow-2xl',
    titulo: isDark ? 'text-white' : 'text-emerald-900',
    caixaQru: isDark ? 'bg-agro-dark/50 border-agro-border text-slate-400' : 'bg-emerald-50/50 border-emerald-100 text-slate-600',
    labels: isDark ? 'text-slate-400' : 'text-emerald-800 font-bold',
    selectsInputs: isDark ? 'bg-agro-dark border-agro-border text-slate-200' : 'bg-emerald-50/40 border-emerald-200 text-emerald-950 focus:border-emerald-500',
    caixaConcluido: isDark ? 'bg-agro-dark/50 text-slate-300' : 'bg-emerald-50/40 border border-emerald-100 text-slate-700'
  };

  const [setor, setSetor] = useState<OrdemServicoAgro['triagemSetor']>(os.triagemSetor || 'Agricultura de Precisão');
  const [causa, setCausa] = useState<Required<OrdemServicoAgro>['tipoCausa']>(os.tipoCausa || 'Hardware (Defeito Real)');
  const [solucao, setSolucao] = useState(os.solucaoTecnico || '');

  useEffect(() => {
    setSolucao(os.solucaoTecnico || '');
    if (os.triagemSetor) setSetor(os.triagemSetor);
    if (os.tipoCausa) setCausa(os.tipoCausa);
  }, [os]);

  const setorFoiAlterado = setor !== os.triagemSetor;

  return (
    <div className={classes.backdrop}>
      <div className={`border rounded-2xl w-full max-w-md p-6 relative transition-colors duration-200 ${classes.modalCard}`}>
        <div className="flex justify-between items-start border-b border-agro-border pb-2 mb-4">
          <h3 className={`text-sm font-bold ${classes.titulo}`}>Trator {os.prefixoTrator} • {os.idCustomizado}</h3>
          <button onClick={onFechar} className="text-slate-400 hover:text-white font-bold text-sm cursor-pointer">✕</button>
        </div>

        <div className={`p-3 rounded-xl border mb-4 ${classes.caixaQru}`}>
          <span className="text-[9px] uppercase font-bold text-amber-500 block">Sintoma Original (QRU):</span>
          "{os.qruDescricao}"
        </div>

        {os.status !== 'concluido' ? (
          <div className="space-y-3">
            <div>
              <label className={`text-[10px] uppercase block mb-1 ${classes.labels}`}>Setor Responsável</label>
              <select value={setor} onChange={e => setSetor(e.target.value as any)} className={`w-full border rounded-xl p-2 outline-none ${classes.selectsInputs}`}>
                <option value="Agricultura de Precisão" className="text-slate-900">Agricultura de Precisão</option>
                <option value="Elétrica" className="text-slate-900">Elétrica</option>
                <option value="Mecânica" className="text-slate-900">Mecânica</option>
                <option value="Borracharia" className="text-slate-900">Borracharia</option>
              </select>
            </div>
            <div>
              <label className={`text-[10px] uppercase block mb-1 ${classes.labels}`}>Causa Real Constatada</label>
              <select value={causa} onChange={e => setCausa(e.target.value as any)} className={`w-full border rounded-xl p-2 outline-none ${classes.selectsInputs}`}>
                <option value="Hardware (Defeito Real)" className="text-slate-900">🔧 Hardware (Defeito Real)</option>
                <option value="Erro Operacional" className="text-slate-900">⚠️ Erro Operacional</option>
                <option value="Infraestrutura (Sinal)" className="text-slate-900">📡 Infraestrutura (Sinal)</option>
              </select>
            </div>
            <div>
              <label className={`text-[10px] uppercase block mb-1 ${classes.labels}`}>Relatório de Solução / Andamento</label>
              <textarea value={solucao} onChange={e => setSolucao(e.target.value)} placeholder="Ex: Realizado a limpeza dos conectores..." rows={2} className={`w-full border rounded-xl p-2 outline-none resize-none ${classes.selectsInputs}`} />
            </div>

            <div className="pt-2 space-y-2">
              {setorFoiAlterado && (
                <button onClick={() => onTransferirSetor(os.idCustomizado, setor)} className="w-full bg-amber-600 hover:bg-amber-700 text-white p-2.5 rounded-xl font-bold transition flex items-center justify-center gap-1 cursor-pointer">
                  Transferir para Fila: {setor === 'Elétrica' ? 'Elétrica ⚡' : setor === 'Mecânica' ? 'Mecânica 🔧' : setor === 'Borracharia' ? 'Borracharia 🔧': 'AP 📡'}
                </button>
              )}

              {os.status === 'pendente' ? (
                <button 
                  onClick={() => onAvancarStatus(os.idCustomizado, 'em_andamento', solucao, causa)} 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded-xl font-bold transition cursor-pointer"
                >
                  Iniciar manutenção 🛠️
                </button>
              ) : (
                <button onClick={() => onDarBaixaFinal(os.idCustomizado, { causa, setor, solucao })} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white p-2.5 rounded-xl font-bold transition cursor-pointer">
                  Dar Baixa Final (Concluir) 🏁
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className={`p-4 rounded-xl space-y-1 ${classes.caixaConcluido}`}>
            <p className="text-emerald-400 font-bold mb-1">Ordem Encerrada</p>
            <p><span className="text-slate-500 font-bold">Veredito:</span> {os.tipoCausa}</p>
            <p><span className="text-slate-500 font-bold">Ação Corretiva:</span> {os.solucaoTecnico}</p>
            <p><span className="text-slate-500 font-bold">Executor:</span> {os.tecnicoResponsavel}</p>
          </div>
        )}
      </div>
    </div>
  );
}