import { useState, useEffect } from 'react';
import type { OrdemServicoAgro } from '../interface/index.js';

interface ModalDetalhesProps {
  os: OrdemServicoAgro;
  onFechar: () => void;
  onTransferirSetor: (idCustomizado: string, proximoSetor: OrdemServicoAgro['triagemSetor']) => Promise<void>;
  onAvancarStatus: (idCustomizado: string, proximoStatus: OrdemServicoAgro['status'], solucaoParcial: string, causaDefinida: OrdemServicoAgro['tipoCausa']) => Promise<void>;
  onDarBaixaFinal: (idCustomizado: string, dadosLaudo: { causa: OrdemServicoAgro['tipoCausa']; setor: OrdemServicoAgro['triagemSetor']; solucao: string }) => Promise<void>;
}

export default function ModalDetalhes({ os, onFechar, onTransferirSetor, onAvancarStatus, onDarBaixaFinal }: ModalDetalhesProps) {
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
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex justify-center items-center p-4 z-50 text-xs">
      <div className="bg-agro-card border border-agro-border rounded-2xl w-full max-w-md p-6 relative shadow-2xl">
        <div className="flex justify-between items-start border-b border-agro-border pb-2 mb-4">
          <h3 className="text-sm font-bold text-white">Trator {os.prefixoTrator} • {os.idCustomizado}</h3>
          <button onClick={onFechar} className="text-slate-400 hover:text-white font-bold text-sm cursor-pointer">✕</button>
        </div>

        <div className="bg-agro-dark/50 p-3 rounded-xl border border-agro-border mb-4 text-slate-400">
          <span className="text-[9px] uppercase font-bold text-amber-500 block">Sintoma Original (QRU):</span>
          "{os.qruDescricao}"
        </div>

        {os.status !== 'concluido' ? (
          <div className="space-y-3">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Setor Responsável</label>
              <select value={setor} onChange={e => setSetor(e.target.value as any)} className="w-full bg-agro-dark border border-agro-border rounded-xl p-2 text-slate-200 outline-none">
                <option value="Agricultura de Precisão">Agricultura de Precisão</option>
                <option value="Elétrica Automotiva">Elétrica Automotiva</option>
                <option value="Mecânica/Hidráulica">Mecânica/Hidráulica</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Causa Real Constatada</label>
              <select value={causa} onChange={e => setCausa(e.target.value as any)} className="w-full bg-agro-dark border border-agro-border rounded-xl p-2 text-slate-200 outline-none">
                <option value="Hardware (Defeito Real)">🔧 Hardware (Defeito Real)</option>
                <option value="Erro Operacional (Falta de Treinamento)">⚠️ Erro Operacional (Falta Treinamento)</option>
                <option value="Infraestrutura/Sinal">📡 Falha de Sinal</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Relatório de Solução / Andamento</label>
              <textarea value={solucao} onChange={e => setSolucao(e.target.value)} placeholder="Ex: Realizado a limpeza dos conectores..." rows={2} className="w-full bg-agro-dark border border-agro-border rounded-xl p-2 text-slate-200 outline-none resize-none" />
            </div>

            <div className="pt-2 space-y-2">
              {setorFoiAlterado && (
                <button onClick={() => onTransferirSetor(os.idCustomizado, setor)} className="w-full bg-amber-600 hover:bg-amber-700 text-white p-2.5 rounded-xl font-bold transition flex items-center justify-center gap-1 cursor-pointer">
                  Transferir para Fila: {setor === 'Elétrica Automotiva' ? 'Elétrica ⚡' : setor === 'Mecânica/Hidráulica' ? 'Mecânica 🔧' : 'AP 📡'}
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
          <div className="bg-agro-dark/50 p-4 rounded-xl space-y-1 text-slate-300">
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

