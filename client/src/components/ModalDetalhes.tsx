import { useState, useEffect } from 'react';
import type { OrdemServicoAgro, AtendimentoSetor } from '../interface/index.js';

interface ModalDetalhesProps {
  os: OrdemServicoAgro;
  setorContexto: string;
  onFechar: () => void;
  // 🎯 Atualizado: Agora espera receber apenas o setorDestino (o ID da oficina ativa já é controlado no escopo do App.tsx)
  onTransferirSetor: (idCustomizado: string, setorOrigem: string, setorDestino: string) => Promise<void>;
  // 🎯 Atualizado: Removidos parâmetros de texto redundantes
  onAvancarStatus: (idCustomizado: string, proximoStatus: AtendimentoSetor['status'], solucaoParcial: string, causaDefinida: AtendimentoSetor['tipoCausa']) => Promise<void>;
  onDarBaixaFinal: (idCustomizado: string, dadosLaudo: { causa: Required<AtendimentoSetor>['tipoCausa']; solucao: string }) => Promise<void>;
}

export default function ModalDetalhes({ 
  os, 
  setorContexto, 
  onFechar, 
  onTransferirSetor, 
  onAvancarStatus, 
  onDarBaixaFinal 
}: ModalDetalhesProps) {
  
  const oficinaAtual = os.setorOs.find(s => s.setor === setorContexto);

  const [setorDestino, setSetorDestino] = useState<string>(setorContexto);
  const [causa, setCausa] = useState<Required<AtendimentoSetor>['tipoCausa']>(
    oficinaAtual?.tipoCausa || 'Hardware (Defeito Real)'
  );
  const [solucao, setSolucao] = useState(oficinaAtual?.solucaoTecnico || '');

  useEffect(() => {
    if (oficinaAtual) {
      setSolucao(oficinaAtual.solucaoTecnico || '');
      if (oficinaAtual.tipoCausa) setCausa(oficinaAtual.tipoCausa);
    }
  }, [os, setorContexto]);

  const setorFoiAlterado = setorDestino !== setorContexto;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex justify-center items-center p-4 z-50 text-xs">
      <div className="bg-agro-card border border-agro-border rounded-2xl w-full max-w-md p-6 relative shadow-2xl flex flex-col max-h-[90vh]">
        
        <div className="flex justify-between items-start border-b border-agro-border pb-2 mb-4 shrink-0">
          <div>
            <h3 className="text-sm font-bold text-white">Frota {os.prefixoTrator} • {os.idCustomizado}</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Oficina em Foco: <span className="text-green-400 font-bold">{setorContexto}</span></p>
          </div>
          <button onClick={onFechar} className="text-slate-400 hover:text-white font-bold text-sm cursor-pointer">✕</button>
        </div>

        <div className="overflow-y-auto pr-1 space-y-4 flex-1 custom-scrollbar">
          
          <div className="bg-agro-dark/50 p-3 rounded-xl border border-agro-border text-slate-400">
            <span className="text-[9px] uppercase font-bold text-amber-500 block mb-0.5">QRU (OS criada por {oficinaAtual?.criadoPor || 'COA'}):</span>
            "{oficinaAtual?.qruDescricao || 'Aguardando avaliação técnica.'}"
          </div>

          {oficinaAtual && oficinaAtual.status !== 'concluido' ? (
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Encaminhar / Transferir de Oficina</label>
                <select value={setorDestino} onChange={e => setSetorDestino(e.target.value)} className="w-full bg-agro-dark border border-agro-border rounded-xl p-2 text-slate-200 outline-none focus:border-green-500/30">
                  <option value="Agricultura de Precisão">📡 Agricultura de Precisão</option>
                  <option value="Elétrica">⚡ Elétrica</option>
                  <option value="Mecânica">🔧 Mecânica</option>
                  <option value="Borracharia">🚚 Borracharia</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Causa Constatada</label>
                <select value={causa} onChange={e => setCausa(e.target.value as any)} className="w-full bg-agro-dark border border-agro-border rounded-xl p-2 text-slate-200 outline-none focus:border-green-500/30">
                  <option value="Hardware (Defeito Real)">🔧 Hardware (Defeito Real)</option>
                  <option value="Erro Operacional">⚠️ Erro Operacional</option>
                  <option value="Infraestrutura (Sinal)">📡 Infraestrutura (Sinal)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Laudo de Solução / Notas de Manutenção</label>
                <textarea value={solucao} onChange={e => setSolucao(e.target.value)} placeholder="Ex: Efetuado a troca dos chicotes rompidos..." rows={3} className="w-full bg-agro-dark border border-agro-border rounded-xl p-2 text-slate-200 outline-none resize-none focus:border-green-500/30" />
              </div>

              <div className="pt-2 space-y-2">
                {setorFoiAlterado && (
                  <button 
                    onClick={async () => { await onTransferirSetor(os.idCustomizado, setorContexto, setorDestino); onFechar(); }} 
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white p-2.5 rounded-xl font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                  >
                    Disparar Fluxo Paralelo para: {setorDestino} 🚀
                  </button>
                )}

                {oficinaAtual.status === 'aguardando_manutencao' ? (
                  <button 
                    onClick={async () => { await onAvancarStatus(os.idCustomizado, 'em_manutencao', solucao, causa); onFechar(); }} 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded-xl font-bold transition cursor-pointer"
                  >
                    Mover para Oficina (Iniciar Manutenção) 🛠️
                  </button>
                ) : (
                  <button 
                    onClick={async () => { await onDarBaixaFinal(os.idCustomizado, { causa, solucao }); onFechar(); }} 
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white p-2.5 rounded-xl font-bold transition cursor-pointer"
                  >
                    Dar Baixa nesta OS ✅
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-agro-dark/40 p-4 rounded-xl border border-emerald-500/10 space-y-1 text-slate-300">
              <p className="text-emerald-400 font-bold mb-1 flex items-center gap-1">✅ Atendimento Encerrado nesta Oficina</p>
              <p><span className="text-slate-500 font-bold">Veredito Técnico:</span> {oficinaAtual?.tipoCausa}</p>
              <p><span className="text-slate-500 font-bold">Solução Aplicada:</span> {oficinaAtual?.solucaoTecnico || 'Resolvido.'}</p>
              <p><span className="text-slate-500 font-bold">Executor Responsável:</span> {oficinaAtual?.tecnicoResponsavel || 'Não Informado'}</p>
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
}
