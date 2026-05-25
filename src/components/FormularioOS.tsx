import { useState, useEffect } from 'react';
import type { OrdemServicoAgro } from '../interface/index';
import { listaEquipamentos, listaOperadores } from '../data/mockApi';

interface FormularioProps {
  idEmEdicao: string | null;
  ordens: OrdemServicoAgro[];
  onSalvar: (dados: Partial<OrdemServicoAgro>) => void;
  onCancelar: () => void;
}

export default function FormularioOS({ idEmEdicao, ordens, onSalvar, onCancelar }: FormularioProps) {
  const [prefixo, setPrefixo] = useState('');
  const [operador, setOperador] = useState('');
  const [criador, setCriador] = useState('');
  const [frente, setFrente] = useState('');
  const [atividade, setAtividade] = useState('Transbordo');
  const [piloto, setPiloto] = useState('');
  const [usina, setUsina] = useState('');
  const [qru, setQru] = useState('');

  // Efeito para carregar dados caso seja uma Edição (Update)
  useEffect(() => {
    if (idEmEdicao) {
      const os = ordens.find(o => o.id === idEmEdicao);
      if (os) {
        setPrefixo(os.prefixoTrator);
        setOperador(os.idOperador);
        setCriador(os.criadoPor);
        setFrente(os.frente);
        setAtividade(os.atividade);
        setPiloto(os.modeloPiloto);
        setUsina(os.usina);
        setQru(os.qruDescricao);
      }
    }
  }, [idEmEdicao, ordens]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSalvar({
      prefixoTrator: prefixo,
      idOperador: operador,
      criadoPor: criador,
      frente,
      atividade,
      modeloPiloto: piloto,
      usina,
      qruDescricao: qru
    });
  };

  return (
    <section className="max-w-2xl mx-auto bg-[#181b26] border border-[#2a3042] rounded-2xl p-6 shadow-xl text-xs">
      <h2 className="text-lg font-black text-white mb-1">
        {idEmEdicao ? '✏️ Editar Registro de Chamado' : '🚀 Registrar Nova O.S. Operacional'}
      </h2>
      <p className="text-slate-400 mb-6">Insira os dados coletados do COA ou do campo de safra.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Prefixo do Trator *</label>
            <select required value={prefixo} onChange={e => {
              const pref = e.target.value;
              setPrefixo(pref);
              const maq = listaEquipamentos.find(m => m.prefixo === pref);
              if (maq) { setPiloto(maq.modeloPilotoPadrao); setUsina(maq.usinaAlocada); }
            }} className="w-full bg-[#12141c] border border-[#2a3042] rounded-xl p-3 text-slate-200 outline-none focus:border-amber-500">
              <option value="">-- Selecione o Trator --</option>
              {listaEquipamentos.map(m => <option key={m.prefixo} value={m.prefixo}>🚜 {m.prefixo} | {m.modeloEquipamento}</option>)}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Código do Operador *</label>
            <select required value={operador} onChange={e => setOperador(e.target.value)} className="w-full bg-[#12141c] border border-[#2a3042] rounded-xl p-3 text-slate-200 outline-none focus:border-amber-500">
              <option value="">-- Selecione o Operador --</option>
              {listaOperadores.map(op => <option key={op.codigo} value={op.codigo}>🔑 {op.codigo} - {op.nome}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Quem está abrindo a OS? *</label>
            <input type="text" required placeholder="Ex: COA Central" value={criador} onChange={e => setCriador(e.target.value)} className="w-full bg-[#12141c] border border-[#2a3042] rounded-xl p-3 text-slate-200 outline-none focus:border-amber-500" />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Frente / Talhão *</label>
            <input type="text" required placeholder="Ex: Frente 2" value={frente} onChange={e => setFrente(e.target.value)} className="w-full bg-[#12141c] border border-[#2a3042] rounded-xl p-3 text-slate-200 outline-none focus:border-amber-500" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-[#12141c]/40 p-3 rounded-xl border border-[#2a3042]/50">
          <div>
            <span className="text-[9px] text-slate-500 font-bold uppercase block">Piloto Automático</span>
            <span className="text-xs font-bold text-amber-500">{piloto || 'Selecione a máquina'}</span>
          </div>
          <div>
            <span className="text-[9px] text-slate-500 font-bold uppercase block">Usina Base</span>
            <span className="text-xs font-bold text-slate-300">{usina || 'Selecione a máquina'}</span>
          </div>
          <div>
            <label className="text-[9px] font-bold text-slate-400 uppercase block">Operação</label>
            <select value={atividade} onChange={e => setAtividade(e.target.value)} className="bg-transparent text-slate-200 font-semibold outline-none cursor-pointer">
              <option value="Transbordo">Transbordo</option>
              <option value="Plantio Mecanizado">Plantio Mecanizado</option>
              <option value="Preparo de Solo">Preparo de Solo</option>
              <option value="Tratos Culturais">Tratos Culturais</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Descrição do QRU *</label>
          <textarea required rows={3} placeholder="Descreva o problema relatado..." value={qru} onChange={e => setQru(e.target.value)} className="w-full bg-[#12141c] border border-[#2a3042] rounded-xl p-3 text-slate-200 outline-none focus:border-amber-500 resize-none" />
        </div>

        <div className="flex gap-4 pt-2">
          <button type="button" onClick={onCancelar} className="w-1/3 bg-[#1e2230] hover:bg-[#2a3042] p-3 rounded-xl text-slate-300 font-bold transition">Cancelar</button>
          <button type="submit" className="flex-1 bg-amber-500 hover:bg-amber-600 p-3 rounded-xl text-slate-950 font-black transition">
            {idEmEdicao ? 'Salvar Alterações 💾' : 'Injetar O.S. no Painel 🚀'}
          </button>
        </div>
      </form>
    </section>
  );
}
