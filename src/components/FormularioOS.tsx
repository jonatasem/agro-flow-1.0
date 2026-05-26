import React, { useState, useEffect } from 'react';
import { frotasCadastradas, operadoresCadastrados } from '../data/mockApi';
import type { FormularioOSProps } from '../interface';

export default function FormularioOS({ idEmEdicao, ordens, onSalvar, onCancelar }: FormularioOSProps) {
  const [prefixo, setPrefixo] = useState('');
  const [operador, setOperador] = useState('');
  const [criador, setCriador] = useState('');
  const [frente, setFrente] = useState('');
  const [atividade, setAtividade] = useState('');
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
        setQru(os.qruDescricao || '');
      }
    }
  }, [idEmEdicao, ordens]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Busca os dados do equipamento cadastrado para injetar automaticamente piloto e usina
    const equipamentoInfo = frotasCadastradas.find(
      f => f.prefixo.toLowerCase() === prefixo.trim().toLowerCase()
    );
    
    onSalvar({
      prefixoTrator: prefixo,
      idOperador: operador,
      criadoPor: criador,
      frente: frente,
      atividade: atividade,
      // Se achar o equipamento, injeta os dados da API/Mock, senão deixa o que já existia na OS ou vazio
      modeloPiloto: equipamentoInfo ? equipamentoInfo.modeloPilotoPadrao : '',
      usinaBase: equipamentoInfo ? equipamentoInfo.usinaAlocada : '',
      qruDescricao: qru
    });
  };

  return (
    <section className="max-w-2xl mx-auto bg-[#181b26] border border-agro-border rounded-2xl p-6 shadow-xl text-xs">
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
              className="w-full bg-agro-dark border border-agro-border rounded-xl p-2.5 text-slate-200 outline-none focus:border-amber-500/50" 
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
              className="w-full bg-agro-dark border border-agro-border rounded-xl p-2.5 text-slate-200 outline-none focus:border-amber-500/50" 
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

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Quem está abrindo a OS? *</label>
            <input type="text" required value={criador} onChange={e => setCriador(e.target.value)} placeholder="Ex: COA - Central" className="w-full bg-agro-dark border border-agro-border rounded-xl p-2.5 text-slate-200 outline-none focus:border-amber-500/50" />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Frente *</label>
            <input type="text" required value={frente} onChange={e => setFrente(e.target.value)} placeholder="Ex: Frente 2" className="w-full bg-agro-dark border border-agro-border rounded-xl p-2.5 text-slate-200 outline-none focus:border-amber-500/50" />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Atividade</label>
            <input type="text" value={atividade} onChange={e => setAtividade(e.target.value)} placeholder="Ex: Transbordo" className="w-full bg-agro-dark border border-agro-border rounded-xl p-2.5 text-slate-200 outline-none focus:border-amber-500/50" />
          </div>
        </div>

        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Descrição do QRU *</label>
          <textarea required value={qru} onChange={e => setQru(e.target.value)} placeholder="Descreva o problema relatado..." rows={3} className="w-full bg-agro-dark border border-agro-border rounded-xl p-2.5 text-slate-200 outline-none resize-none focus:border-amber-500/50" />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onCancelar} className="bg-agro-card hover:bg-agro-border text-slate-300 font-bold px-5 py-2.5 rounded-xl transition cursor-pointer">
            Cancelar
          </button>
          <button type="submit" className="bg-green-500 hover:bg-green-600 text-slate-950 font-black px-5 py-2.5 rounded-xl transition cursor-pointer flex items-center gap-1">
            {idEmEdicao ? 'Atualizar O.S.' : 'Injetar O.S. no Painel 🚀'}
          </button>
        </div>
      </form>
    </section>
  );
}

