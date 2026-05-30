import React, { useState, useEffect } from 'react';
import { useDadosMestre } from '../hook/useDadosMestre.js';
import type { FormularioOSProps, OrdemServicoAgro } from '../interface/index.js';

export default function FormularioOS({ idEmEdicao, ordens, onSalvar, onCancelar }: FormularioOSProps) {
  const [prefixo, setPrefixo] = useState('');
  const [operador, setOperador] = useState('');
  const [criador, setCriador] = useState('');
  const [frente, setFrente] = useState('');
  const [atividade, setAtividade] = useState('');
  const [qru, setQru] = useState('');
  
  const [usinaSelecionada, setUsinaSelecionada] = useState('');
  const [setorSelecionado, setSetorSelecionado] = useState<OrdemServicoAgro['triagemSetor'] | ''>('');

  // Consome os dados mestre do hook isolado de forma direta e limpa
  const { frotasCadastradas, operadoresCadastrados } = useDadosMestre();

  const cidadesZilor = ['Salto Botelho', 'Quatá', 'Barra Grande', 'Lençóis Paulista'];
  const SetoresZilor: OrdemServicoAgro['triagemSetor'][] = ['Agricultura de Precisão', 'Elétrica', 'Mecânica', 'Borracharia'];
  const equipamentosZilor = ["Colhedora", "Transbordo", "Caminhão Canavieiro", "Caminhão Prancha", "Carretel", "Eletro/Moto Bomba", "Estação Meteorológica", "Plantadora", "Pluviômetro"];
  const criadoresOsZilor = ["Coa", "Jonatas", "Everton", "Marcelo"];
  const frentesZilor = ["Frente 1", "Frente 2", "Frente 3", "Frente 4", "Frente 92", "Frente 65", "Frente 66", "Frente 98"];

  // Monitora a digitação da frota para pré-selecionar a Usina Alocada do Trator
  useEffect(() => {
    if (!idEmEdicao && prefixo.trim()) {
      const tratorEncontrado = frotasCadastradas.find(
        f => f.prefixo.trim().toLowerCase() === prefixo.trim().toLowerCase()
      );
      if (tratorEncontrado) {
        setUsinaSelecionada(tratorEncontrado.usinaAlocada);
      }
    }
  }, [prefixo, frotasCadastradas, idEmEdicao]);

  // Monitora se o formulário está em modo de edição para carregar os valores antigos
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
        setUsinaSelecionada(os.usinaBase || '');
        setSetorSelecionado(os.triagemSetor || '');
      }
    }
  }, [idEmEdicao, ordens]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const equipamentoInfo = frotasCadastradas.find(
      f => f.prefixo.trim().toLowerCase() === prefixo.trim().toLowerCase()
    );

    const cidadeFinal = usinaSelecionada || (equipamentoInfo ? equipamentoInfo.usinaAlocada : 'Geral Zilor');
    
    onSalvar({
      prefixoTrator: prefixo.trim(),
      idOperador: operador.trim(),
      criadoPor: criador.trim(),
      frente: frente.trim(),
      atividade: atividade.trim(),
      modeloPiloto: equipamentoInfo ? equipamentoInfo.modeloPilotoPadrao : 'Não Identificado',
      usinaBase: cidadeFinal,
      triagemSetor: setorSelecionado as OrdemServicoAgro['triagemSetor'],
      qruDescricao: qru.trim()
    });
  };

  return (
    <section className="max-w-2xl mx-auto bg-[#181b26] border border-agro-border rounded-2xl p-6 shadow-xl text-xs">
      <h2 className="text-lg font-black text-white mb-1">
        {idEmEdicao ? '📝 Editar Registro de Chamado' : '🚀 Registrar Nova O.S. Operacional'}
      </h2>
      <p className="text-slate-400 mb-6">Insira os dados do equipamento ativo para sincronia no MongoDB.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Linha 1: Frota e Operador */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Frota do Equipamento *</label>
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
              {frotasCadastradas
                .slice(0, 5)
                .map(frota => (
                  <option key={frota.prefixo} value={frota.prefixo}>
                    {frota.modeloEquipamento} ({frota.usinaAlocada})
                  </option>
                ))
              }
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
              {operadoresCadastrados
                .slice(0, 5)
                .map(op => (
                  <option key={op.codigo} value={op.codigo}>
                    {op.nome}
                  </option>
                ))
              }
            </datalist>
          </div>
        </div>

        {/* Linha 2: Criador, Frente e Atividade */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Quem está abrindo a OS? *</label>
            <input 
              type="text" 
              required 
              list="lista-criadores-db"
              value={criador} 
              onChange={e => setCriador(e.target.value)} 
              placeholder="Ex: COA - Central" 
              className="w-full bg-agro-dark border border-agro-border rounded-xl p-2.5 text-slate-200 outline-none focus:border-green-500/50" 
            />
            <datalist id="lista-criadores-db">
              {criadoresOsZilor.map(c => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>
          
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Frente *</label>
            <input 
              type="text" 
              required 
              list="lista-frentes-db"
              value={frente} 
              onChange={e => setFrente(e.target.value)} 
              placeholder="Ex: Frente 2" 
              className="w-full bg-agro-dark border border-agro-border rounded-xl p-2.5 text-slate-200 outline-none focus:border-green-500/50" 
            />
            <datalist id="lista-frentes-db">
              {frentesZilor.map(f => (
                <option key={f} value={f} />
              ))}
            </datalist>
          </div>
          
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Operação *</label>
            <input 
              type="text" 
              required 
              list="lista-equipamentos-db"
              value={atividade} 
              onChange={e => setAtividade(e.target.value)} 
              placeholder="Ex: Transbordo" 
              className="w-full bg-agro-dark border border-agro-border rounded-xl p-2.5 text-slate-200 outline-none focus:border-green-500/50" 
            />
            <datalist id="lista-equipamentos-db">
              {equipamentosZilor.map(eq => (
                <option key={eq} value={eq} />
              ))}
            </datalist>
          </div>
        </div>

        {/* Linha 3: Usina Alocada e Setor do Chamado */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Usina Alocada *</label>
            <select 
              required
              value={usinaSelecionada}
              onChange={e => setUsinaSelecionada(e.target.value)}
              className="w-full bg-agro-dark border border-agro-border rounded-xl p-2.5 text-slate-200 outline-none focus:border-green-500/50 font-bold"
            >
              <option value="" disabled>Selecione a usina para este chamado...</option>
              {cidadesZilor.map(c => (
                <option key={c} value={c}>🏢 {c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Setor do chamado *</label>
            <select 
              required
              value={setorSelecionado}
              onChange={e => setSetorSelecionado(e.target.value as OrdemServicoAgro['triagemSetor'])}
              className="w-full bg-agro-dark border border-agro-border rounded-xl p-2.5 text-slate-200 outline-none focus:border-green-500/50 font-bold"
            >
              <option value="" disabled>Selecione o setor para este chamado...</option>
              {SetoresZilor.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Linha 4: Descrição do QRU */}
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Descrição do QRU *</label>
          <textarea required value={qru} onChange={e => setQru(e.target.value)} placeholder="Descreva o problema relatado..." rows={3} className="w-full bg-agro-dark border border-agro-border rounded-xl p-2.5 text-slate-200 outline-none resize-none focus:border-green-500/50" />
        </div>

        {/* Botões de Ação */}
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
