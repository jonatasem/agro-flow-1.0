import React, { useState, useEffect } from 'react';
import api from '../services/api';
import type { FormularioOSProps, Equipamento, Operador } from '../interface/index.js';

export default function FormularioOS({ idEmEdicao, ordens, onSalvar, onCancelar }: FormularioOSProps) {
  const [prefixo, setPrefixo] = useState('');
  const [operador, setOperador] = useState('');
  const [criador, setCriador] = useState('');
  const [frente, setFrente] = useState('');
  const [atividade, setAtividade] = useState('');
  const [qru, setQru] = useState('');

  // Estados dinâmicos que alimentarão as tags <datalist> direto do Banco de Dados
  const [frotasCadastradas, setFrotasCadastradas] = useState<Equipamento[]>([]);
  const [operadoresCadastrados, setOperadoresCadastrados] = useState<Operador[]>([]);

  // Carrega os dados mestre do MongoDB para o Autocomplete do formulário
  useEffect(() => {
    const carregarDadosMestre = async () => {
      try {
        const [resFrotas, resOperadores] = await Promise.all([
          api.get('/frotas-mestre'),
          api.get('/operadores-mestre')
        ]);
        setFrotasCadastradas(resFrotas.data);
        setOperadoresCadastrados(resOperadores.data);
      } catch (error) {
        console.error("Erro ao alimentar campos do formulário:", error);
      }
    };

    carregarDadosMestre();
  }, []);

  useEffect(() => {
    if (idEmEdicao) {
      const os = ordens.find(o => o.idCustomizado === idEmEdicao);
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
    
    // Procura o equipamento selecionado para auto-injetar os dados corretos no payload
    const equipamentoInfo = frotasCadastradas.find(
      f => f.prefixo.toLowerCase() === prefixo.trim().toLowerCase()
    );
    
    onSalvar({
      prefixoTrator: prefixo,
      idOperador: operador,
      criadoPor: criador,
      frente: frente,
      atividade: atividade,
      modeloPiloto: equipamentoInfo ? equipamentoInfo.modeloPilotoPadrao : 'Não Identificado',
      usinaBase: equipamentoInfo ? equipamentoInfo.usinaAlocada : 'Geral Zilor',
      qruDescricao: qru
    });
  };

  return (
    <section className="max-w-2xl mx-auto bg-[#181b26] border border-agro-border rounded-2xl p-6 shadow-xl text-xs">
      <h2 className="text-lg font-black text-white mb-1">
        {idEmEdicao ? '📝 Editar Registro de Chamado' : '🚀 Registrar Nova O.S. Operacional'}
      </h2>
      <p className="text-slate-400 mb-6">Insira os dados do equipamento ativo para sincronia no MongoDB.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Prefixo do Trator / Equipamento *</label>
            <input 
              type="text" 
              required 
              list="lista-frotas-db"
              value={prefixo} 
              onChange={e => setPrefixo(e.target.value)} 
              placeholder="Digite ou selecione a frota..." 
              className="w-full bg-agro-dark border border-agro-border rounded-xl p-2.5 text-slate-200 outline-none focus:border-green-500/50" 
            />
            <datalist id="lista-frotas-db">
              {frotasCadastradas.map(frota => (
                <option key={frota.prefixo} value={frota.prefixo}>
                  {frota.modeloEquipamento} ({frota.setor})
                </option>
              ))}
            </datalist>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Código do Operador *</label>
            <input 
              type="text" 
              required 
              list="lista-operadores-db"
              value={operador} 
              onChange={e => setOperador(e.target.value)} 
              placeholder="Digite ou selecione o operador..." 
              className="w-full bg-agro-dark border border-agro-border rounded-xl p-2.5 text-slate-200 outline-none focus:border-green-500/50" 
            />
            <datalist id="lista-operadores-db">
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
            <input type="text" required value={criador} onChange={e => setCriador(e.target.value)} placeholder="Ex: COA - Central" className="w-full bg-agro-dark border border-agro-border rounded-xl p-2.5 text-slate-200 outline-none focus:border-green-500/50" />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Frente *</label>
            <input type="text" required value={frente} onChange={e => setFrente(e.target.value)} placeholder="Ex: Frente 2" className="w-full bg-agro-dark border border-agro-border rounded-xl p-2.5 text-slate-200 outline-none focus:border-green-500/50" />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Atividade</label>
            <input type="text" value={atividade} onChange={e => setAtividade(e.target.value)} placeholder="Ex: Transbordo" className="w-full bg-agro-dark border border-agro-border rounded-xl p-2.5 text-slate-200 outline-none focus:border-green-500/50" />
          </div>
        </div>

        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Descrição do QRU *</label>
          <textarea required value={qru} onChange={e => setQru(e.target.value)} placeholder="Descreva o problema relatado..." rows={3} className="w-full bg-agro-dark border border-agro-border rounded-xl p-2.5 text-slate-200 outline-none resize-none focus:border-green-500/50" />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onCancelar} className="bg-agro-card hover:bg-agro-border text-slate-300 font-bold px-5 py-2.5 rounded-xl transition cursor-pointer">
            Cancelar
          </button>
          <button type="submit" className="bg-green-500 hover:bg-green-600 text-slate-950 font-black px-5 py-2.5 rounded-xl transition cursor-pointer flex items-center gap-1">
            {idEmEdicao ? 'Atualizar O.S.' : 'Salvar no MongoDB Atlas 🚀'}
          </button>
        </div>
      </form>
    </section>
  );
}
