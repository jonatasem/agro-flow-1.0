import React, { useState, useEffect } from 'react';
import { frotasCadastradas, operadoresCadastrados } from '../data/mockApi';
import type { OrdemServicoAgro } from '../interface/index';

interface FormularioOSProps {
  idEmEdicao: string | null;
  ordens: OrdemServicoAgro[];
  onSalvar: (dadosForm: Partial<OrdemServicoAgro>) => void;
  onCancelar: () => void;
}

export default function FormularioOS({ idEmEdicao, ordens, onSalvar, onCancelar }: FormularioOSProps) {
  const [prefixo, setPrefixo] = useState('');
  const [operador, setOperador] = useState('');
  const [criador, setCriador] = useState('');
  const [frente, setFrente] = useState('');
  const [atividade, setAtividade] = useState('');
  const [piloto, setPiloto] = useState('');
  const [usina, setUsina] = useState('');
  const [qru, setQru] = useState('');

  useEffect(() => {
    if (idEmEdicao) {
      const os = ordens.find(o => o.id === idEmEdicao);
      if (os) {
        setPrefixo(os.prefixoTrator || '');
        setOperador(os.idOperador || '');
        setCriador(os.criadoPor || '');
        setFrente(os.frente || '');
        setAtividade(os.atividade || '');
        setPiloto(os.modeloPiloto || '');
        setUsina(os.usinaBase || '');
        setQru(os.qruDescricao || '');
      }
    }
  }, [idEmEdicao, ordens]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    onSalvar({
      prefixoTrator: prefixo,
      idOperador: operador,
      criadoPor: criador,
      frente: frente,
      atividade: atividade,
      modeloPiloto: piloto,
      usinaBase: usina,
      qruDescricao: qru
    });
  };

  return (
    <section className="max-w-2xl mx-auto bg-[#181b26] border border-[#2a3042] rounded-2xl p-6 shadow-xl text-xs">
      <h2 className="text-lg font-black text-white mb-1">
        {idEmEdicao ? '📝 Editar Registro de Chamado' : '🚀 Registrar Nova O.S. Operacional'}
      </h2>
      <p className="text-slate-400 mb-6">Insira ou procure os dados do equipamento e operador.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Input com Busca de Equipamento/Frota */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Prefixo do Trator / Equipamento *</label>
            <input 
              type="text" 
              required 
              list="lista-frotas"
              value={prefixo} 
              onChange={e => setPrefixo(e.target.value)} 
              placeholder="Digite ou clique para buscar frota..." 
              className="w-full bg-[#12141c] border border-[#2a3042] rounded-xl p-2.5 text-slate-200 outline-none focus:border-amber-500/50" 
            />
            <datalist id="lista-frotas">
            {frotasCadastradas.map(frota => (
                <option key={frota.prefixo} value={frota.prefixo}>
                {frota.modeloEquipamento}
                </option>
            ))}
            </datalist>
          </div>

          {/* Input com Busca de Operador */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Código do Operador *</label>
            <input 
              type="text" 
              required 
              list="lista-operadores"
              value={operador} 
              onChange={e => setOperador(e.target.value)} 
              placeholder="Digite ou clique para buscar operador..." 
              className="w-full bg-[#12141c] border border-[#2a3042] rounded-xl p-2.5 text-slate-200 outline-none focus:border-amber-500/50" 
            />
            <datalist id="lista-operadores">
              {operadoresCadastrados.map(op => (
                <option key={op.codigo} value={op.codigo}>
                  {op.nome}
                </option>
              ))}
            </datalist>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Quem está abrindo a OS? *</label>
            <input type="text" required value={criador} onChange={e => setCriador(e.target.value)} placeholder="Ex: COA - Central" className="w-full bg-[#12141c] border border-[#2a3042] rounded-xl p-2.5 text-slate-200 outline-none" />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Frente *</label>
            <input type="text" required value={frente} onChange={e => setFrente(e.target.value)} placeholder="Ex: Frente 2" className="w-full bg-[#12141c] border border-[#2a3042] rounded-xl p-2.5 text-slate-200 outline-none" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Atividade</label>
            <input type="text" value={atividade} onChange={e => setAtividade(e.target.value)} placeholder="Ex: Transbordo" className="w-full bg-[#12141c] border border-[#2a3042] rounded-xl p-2.5 text-slate-200 outline-none" />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Piloto Automático</label>
            <input type="text" value={piloto} onChange={e => setPiloto(e.target.value)} placeholder="Ex: Trimble 1060" className="w-full bg-[#12141c] border border-[#2a3042] rounded-xl p-2.5 text-slate-200 outline-none" />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Usina Base</label>
            <input type="text" value={usina} onChange={e => setUsina(e.target.value)} placeholder="Ex: Usina São José" className="w-full bg-[#12141c] border border-[#2a3042] rounded-xl p-2.5 text-slate-200 outline-none" />
          </div>
        </div>

        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Descrição do QRU *</label>
          <textarea required value={qru} onChange={e => setQru(e.target.value)} placeholder="Descreva o problema relatado..." rows={3} className="w-full bg-[#12141c] border border-[#2a3042] rounded-xl p-2.5 text-slate-200 outline-none resize-none" />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onCancelar} className="bg-[#1e2230] hover:bg-[#2a3042] text-slate-300 font-bold px-5 py-2.5 rounded-xl transition cursor-pointer">
            Cancelar
          </button>
          <button type="submit" className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black px-5 py-2.5 rounded-xl transition cursor-pointer flex items-center gap-1">
            {idEmEdicao ? 'Atualizar O.S.' : 'Injetar O.S. no Painel 🚀'}
          </button>
        </div>
      </form>
    </section>
  );
}
