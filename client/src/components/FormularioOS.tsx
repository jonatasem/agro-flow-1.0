import React, { useState, useEffect } from 'react';
import api from '../services/api';
import type { FormularioOSProps, Equipamento, Operador } from '../interface/index.js';
import { useTheme } from '../context/ThemeContext';

export default function FormularioOS({ idEmEdicao, ordens, onSalvar, onCancelar }: FormularioOSProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const classes = {
    formBg: isDark ? 'bg-[#181b26] border-agro-border' : 'bg-white border-emerald-100 shadow-xl',
    titulo: isDark ? 'text-white' : 'text-emerald-900',
    labels: isDark ? 'text-slate-400' : 'text-emerald-800 font-bold',
    inputs: isDark ? 'bg-agro-dark border-agro-border text-slate-200 focus:border-green-500/50' : 'bg-emerald-50/40 border-emerald-200 text-emerald-950 focus:border-emerald-600',
    btnCancelar: isDark ? 'bg-agro-card hover:bg-agro-border text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
  };

  const [prefixo, setPrefixo] = useState('');
  const [operador, setOperador] = useState('');
  const [criador, setCriador] = useState('');
  const [frente, setFrente] = useState('');
  const [atividade, setAtividade] = useState('');
  const [qru, setQru] = useState('');
  const [usinaSelecionada, setUsinaSelecionada] = useState('');

  const [frotasCadastradas, setFrotasCadastradas] = useState<Equipamento[]>([]);
  const [operadoresCadastrados, setOperadoresCadastrados] = useState<Operador[]>([]);

  const cidadesZilor = ['Salto Botelho', 'Quatá', 'Barra Grande', 'Lençóis Paulista'];

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
    if (!idEmEdicao && prefixo.trim()) {
      const tratorEncontrado = frotasCadastradas.find(
        f => f.prefixo.trim().toLowerCase() === prefixo.trim().toLowerCase()
      );
      if (tratorEncontrado) {
        setUsinaSelecionada(tratorEncontrado.usinaAlocada);
      }
    }
  }, [prefixo, frotasCadastradas, idEmEdicao]);

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
      criadoPor: criador,
      frente: frente,
      atividade: atividade,
      modeloPiloto: equipamentoInfo ? equipamentoInfo.modeloPilotoPadrao : 'Não Identificado',
      usinaBase: cidadeFinal,
      qruDescricao: qru
    });
  };

  return (
    <section className={`max-w-2xl mx-auto border rounded-2xl p-6 text-xs transition-all duration-200 ${classes.formBg}`}>
      <h2 className={`text-lg font-black mb-1 ${classes.titulo}`}>
        {idEmEdicao ? '📝 Editar Registro de Chamado' : '🚀 Registrar Nova O.S. Operacional'}
      </h2>
      <p className="text-slate-400 mb-6">Insira os dados do equipamento ativo para sincronia no MongoDB.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={`text-[10px] uppercase block mb-1 ${classes.labels}`}>Prefixo do Trator / Equipamento *</label>
            <input 
              type="text" 
              required 
              list="lista-frotas-db"
              value={prefixo} 
              onChange={e => setPrefixo(e.target.value)} 
              placeholder="Digite ou selecione a frota..." 
              className={`w-full rounded-xl p-2.5 outline-none transition ${classes.inputs}`} 
            />
            <datalist id="lista-frotas-db">
              {frotasCadastradas
                .filter(frota => frota.prefixo.toLowerCase().includes(prefixo.toLowerCase()))
                .slice(0, 15) 
                .map(frota => (
                  <option key={frota.prefixo} value={frota.prefixo}>
                    {frota.modeloEquipamento} ({frota.usinaAlocada})
                  </option>
                ))
              }
            </datalist>
          </div>

          <div>
            <label className={`text-[10px] uppercase block mb-1 ${classes.labels}`}>Código do Operador *</label>
            <input 
              type="text" 
              required 
              list="lista-operadores-db"
              value={operador} 
              onChange={e => setOperador(e.target.value)} 
              placeholder="Digite ou selecione o operador..." 
              className={`w-full rounded-xl p-2.5 outline-none transition ${classes.inputs}`} 
            />
            <datalist id="lista-operadores-db">
              {operadoresCadastrados
                .filter(op => op.codigo.includes(operador) || op.nome.toLowerCase().includes(operador.toLowerCase()))
                .slice(0, 15) 
                .map(op => (
                  <option key={op.codigo} value={op.codigo}>{op.nome}</option>
                ))
              }
            </datalist>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className={`text-[10px] uppercase block mb-1 ${classes.labels}`}>Quem está abrindo a OS? *</label>
            <input type="text" required value={criador} onChange={e => setCriador(e.target.value)} placeholder="Ex: COA - Central" className={`w-full rounded-xl p-2.5 outline-none transition ${classes.inputs}`} />
          </div>
          <div>
            <label className={`text-[10px] uppercase block mb-1 ${classes.labels}`}>Frente *</label>
            <input type="text" required value={frente} onChange={e => setFrente(e.target.value)} placeholder="Ex: Frente 2" className={`w-full rounded-xl p-2.5 outline-none transition ${classes.inputs}`} />
          </div>
          <div>
            <label className={`text-[10px] uppercase block mb-1 ${classes.labels}`}>Atividade *</label>
            <input type="text" required value={atividade} onChange={e => setAtividade(e.target.value)} placeholder="Ex: Transbordo" className={`w-full rounded-xl p-2.5 outline-none transition ${classes.inputs}`} />
          </div>
        </div>

        <div>
          <label className={`text-[10px] uppercase block mb-1 ${classes.labels}`}>Cidade / Usina Base *</label>
          <select 
            required
            value={usinaSelecionada}
            onChange={e => setUsinaSelecionada(e.target.value)}
            className={`w-full rounded-xl p-2.5 outline-none font-bold transition ${classes.inputs}`}
          >
            <option value="" disabled>Selecione a usina para este chamado...</option>
            {cidadesZilor.map(c => (
              <option key={c} value={c} className="text-slate-900">🏢 {c}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={`text-[10px] uppercase block mb-1 ${classes.labels}`}>Descrição do QRU *</label>
          <textarea required value={qru} onChange={e => setQru(e.target.value)} placeholder="Descreva o problema relatado..." rows={3} className={`w-full rounded-xl p-2.5 outline-none resize-none transition ${classes.inputs}`} />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onCancelar} className={`font-bold px-5 py-2.5 rounded-xl transition cursor-pointer ${classes.btnCancelar}`}>
            Cancelar
          </button>
          <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-5 py-2.5 rounded-xl shadow transition cursor-pointer flex items-center gap-1">
            {idEmEdicao ? 'Atualizar O.S.' : 'Salvar no MongoDB Atlas 🚀'}
          </button>
        </div>
      </form>
    </section>
  );
}