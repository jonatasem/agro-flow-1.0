import { useState, useEffect } from 'react';
import type { OrdemServicoAgro, AtendimentoSetor } from '../interface/index.js';

interface ModalDetalhesProps {
  os: OrdemServicoAgro;
  setorContexto: string; // 📡 Alinha o modal com a oficina ativa selecionada no monitor do Kanban
  onFechar: () => void;
  onTransferirSetor: (idCustomizado: string, proximoSetor: OrdemServicoAgro['setorOs'][number]['setor']) => Promise<void>;
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
  
  // 🔍 Localiza o sub-documento da oficina atual que está sob análise
  const oficinaAtual = os.setorOs.find(s => s.setor === setorContexto);

  const [setorDestino, setSetorDestino] = useState<OrdemServicoAgro['setorOs'][number]['setor']>(
    (setorContexto as any) || 'Agricultura de Precisão'
  );
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

  // Se o usuário mudar o select do setor, ativa o gatilho de transferência concorrente
  const setorFoiAlterado = setorDestino !== setorContexto;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex justify-center items-center p-4 z-50 text-xs">
      <div className="bg-agro-card border border-agro-border rounded-2xl w-full max-w-md p-6 relative shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Cabeçalho */}
        <div className="flex justify-between items-start border-b border-agro-border pb-2 mb-4 shrink-0">
          <div>
            <h3 className="text-sm font-bold text-white">Trator {os.prefixoTrator} • {os.idCustomizado}</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Oficina em Foco: <span className="text-green-400 font-bold">{setorContexto}</span></p>
          </div>
          <button onClick={onFechar} className="text-slate-400 hover:text-white font-bold text-sm cursor-pointer">✕</button>
        </div>

        {/* Área Rolável do Modal */}
        <div className="overflow-y-auto pr-1 space-y-4 flex-1 custom-scrollbar">
          
          {/* Sintoma (QRU) Isolado da Oficina */}
          <div className="bg-agro-dark/50 p-3 rounded-xl border border-agro-border text-slate-400">
            <span className="text-[9px] uppercase font-bold text-amber-500 block mb-0.5">Sintoma nesta Oficina (Apontado por {oficinaAtual?.criadoPor || 'COA'}):</span>
            "{oficinaAtual?.qruDescricao || 'Aguardando avaliação técnica.'}"
          </div>

          {oficinaAtual && oficinaAtual.status !== 'concluido' ? (
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Encaminhar / Transferir de Oficina</label>
                <select value={setorDestino} onChange={e => setSetorDestino(e.target.value as any)} className="w-full bg-agro-dark border border-agro-border rounded-xl p-2 text-slate-200 outline-none focus:border-green-500/30">
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
                  <button onClick={async () => { await onTransferirSetor(os.idCustomizado, setorDestino); onFechar(); }} className="w-full bg-amber-600 hover:bg-amber-700 text-white p-2.5 rounded-xl font-bold transition flex items-center justify-center gap-1 cursor-pointer">
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
                    Dar Baixa nesta Oficina ✅
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
              {oficinaAtual?.tempoManutencao && (
                <p><span className="text-slate-500 font-bold">Tempo logado em Box:</span> <span className="text-slate-200 font-mono bg-agro-dark px-1.5 py-0.5 rounded border border-agro-border">{oficinaAtual.tempoManutencao}</span></p>
              )}
            </div>
          )}

          {/* 📋 Histórico do Ecossistema Concorrente (Auditoria Visual) */}
          {os.setorOs.length > 1 && (
            <div className="pt-2 border-t border-agro-border/60 shrink-0">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Linha do Tempo das Oficinas</span>
              <div className="space-y-1.5">
                {os.setorOs.map((s, idx) => (
                  <div key={idx} className={`p-2 rounded-lg border text-[11px] flex justify-between items-center ${s.setor === setorContexto ? 'bg-green-500/5 border-green-500/30' : 'bg-agro-dark/30 border-agro-border/50'}`}>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 font-medium">
                        {s.setor === 'Agricultura de Precisão' ? '📡 AP' : s.setor === 'Elétrica' ? '⚡ ELE' : s.setor === 'Mecânica' ? '🔧 MEC' : '🚚 BOR'}
                      </span>
                    </div>
                    <span className={`px-2 py-0.5 rounded font-bold text-[9px] ${s.status === 'concluido' ? 'bg-emerald-500/10 text-emerald-400' : s.status === 'em_manutencao' ? 'bg-blue-500/10 text-blue-400' : 'bg-amber-500/10 text-amber-400'}`}>
                      {s.status === 'concluido' ? 'Liberado' : s.status === 'em_manutencao' ? 'Em Box' : 'Triagem'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
}
