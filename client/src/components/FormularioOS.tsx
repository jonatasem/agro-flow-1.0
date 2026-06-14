import { useState, useEffect } from 'react';
import { useDadosMestre } from '../hook/useDadosMestre.js';
import { useSubmit } from '../hook/useSubmit.js';
import { useBuscaProxima } from '../hook/useBuscaProxima.js';
import { useAuth } from '../context/AuthContext.js';
import type { FormularioOSProps, OrdemServicoAgro } from '../interface/index.js';

export default function FormularioOS({ idEmEdicao, ordens, onSalvar, onCancelar }: FormularioOSProps) {
  const { usuario } = useAuth();

  const [prefixo, setPrefixo] = useState('');
  const [operador, setOperador] = useState('');
  const [criador, setCriador] = useState('');
  const [frente, setFrente] = useState('');
  const [atividade, setAtividade] = useState('');
  const [qru, setQru] = useState('');
  
  const [usinaSelecionada, setUsinaSelecionada] = useState('');
  const [setorSelecionado, setSetorSelecionado] = useState<OrdemServicoAgro['setorOs'][number]['setor'] | ''>('');

  const { frotasCadastradas, operadoresCadastrados } = useDadosMestre();
  const { isSubmitting, handleSubmit } = useSubmit();

  const cidadesZilor = ['Salto Botelho', 'Quatá', 'São José', 'Barra Grande'];
  const SetoresZilor: OrdemServicoAgro['setorOs'][number]['setor'][] = ['Agricultura de Precisão', 'Elétrica', 'Mecânica', 'Borracharia'];
  const equipamentosZilor = ["Colhedora", "Transbordo", "Caminhão Canavieiro", "Caminhão Prancha", "Carretel", "Eletro/Moto Bomba", "Estação Meteorológica", "Plantadora", "Pluviômetro"];
  const frentesZilor = ["Frente 1", "Frente 2", "Frente 3", "Frente 4", "Frente 92", "Frente 65", "Frente 66", "Frente 98"];

  useEffect(() => {
    if (idEmEdicao) {
      const os = ordens.find(o => o.idCustomizado === idEmEdicao);
      if (os) {
        setPrefixo(os.prefixoTrator || '');
        setOperador(os.idOperador || '');
        setFrente(os.frente || '');
        setAtividade(os.atividade || '');
        setUsinaSelecionada(os.usinaBase || '');
        
        if (os.setorOs && os.setorOs.length > 0) {
          const primeiroAtendimento = os.setorOs[0];
          setSetorSelecionado(primeiroAtendimento.setor);
          setQru(primeiroAtendimento.qruDescricao || '');
          setCriador(primeiroAtendimento.criadoPor || '');
        }
      }
    } else if (usuario) {
      setCriador(`${usuario.matricula} - ${usuario.nome}`);
      setPrefixo('');
      setOperador('');
      setFrente('');
      setAtividade('');
      setUsinaSelecionada('');
      setSetorSelecionado('');
      setQru('');
    }
  }, [idEmEdicao, ordens, usuario]);

  const frotasSugestao = useBuscaProxima(frotasCadastradas, prefixo, 'frota', 5);
  const operadoresSugestao = useBuscaProxima(operadoresCadastrados, operador, 'codigo', 5);

  const onSubmitForm = handleSubmit(async () => {
    const cityFinal = usinaSelecionada || 'Geral Zilor';
    const agora = new Date();
    
    const dataString = agora.toLocaleDateString('pt-BR');
    const horaString = agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    const payloadForm: Partial<OrdemServicoAgro> = {
      prefixoTrator: prefixo.trim(),
      idOperador: operador.trim(),
      frente: frente.trim(),
      atividade: atividade.trim(),
      usinaBase: cityFinal,
    };

    if (idEmEdicao) {
      payloadForm.setorOs = [
        {
          qruDescricao: qru.trim()
        }
      ] as any;
    } else {
      payloadForm.setorOs = [
        {
          setor: setorSelecionado as OrdemServicoAgro['setorOs'][number]['setor'],
          status: 'aguardando_manutencao',
          qruDescricao: qru.trim(),
          criadoPor: criador.trim(),
          dataCriacao: dataString,
          horaCriacao: horaString,
          solucaoTecnico: ''
        }
      ];
    }

    await onSalvar(payloadForm);
  });

  return (
    <section className="max-w-2xl mx-auto bg-[#181b26] border border-agro-border rounded-2xl p-6 shadow-xl text-xs animate-fade-in">
      <h2 className="text-lg font-black text-white mb-1">
        {idEmEdicao ? '📝 Editar Registro de Chamado' : '🚀 Registrar Nova O.S. Operacional'}
      </h2>
      <p className="text-slate-400 mb-6">Insira os dados do equipamento ativo para sincronia no MongoDB.</p>

      <form onSubmit={onSubmitForm} className="space-y-4">
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
              className="w-full bg-agro-dark border border-agro-border rounded-xl p-2.5 text-slate-200 outline-none focus:border-green-500/50 font-bold" 
            />
            <datalist id="lista-frotas-db">
              {frotasSugestao.map(equip => (
                <option key={equip.frota} value={equip.frota}>
                  {equip.modelo}
                </option>
              ))}
            </datalist>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Código do Operador / Motorista *</label>
            <input 
              type="text" 
              required 
              list="lista-operadores-db"
              value={operador} 
              onChange={e => setOperador(e.target.value)} 
              placeholder="Digite ou selecione o operador..." 
              className="w-full bg-agro-dark border border-agro-border rounded-xl p-2.5 text-slate-200 outline-none focus:border-green-500/50 font-bold" 
            />
            <datalist id="lista-operadores-db">
              {operadoresSugestao.map(op => (
                <option key={op.codigo} value={op.codigo}>
                  {op.nome}
                </option>
              ))}
            </datalist>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-[10px] font-bold text-green-400 uppercase block mb-1">Quem está abrindo a OS? *</label>
            <input 
              type="text" 
              required 
              readOnly 
              value={criador} 
              className="w-full bg-agro-dark/60 border border-agro-border rounded-xl p-2.5 text-slate-400 outline-none select-none font-semibold cursor-not-allowed border-dashed" 
            />
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
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Setor Inicial do chamado *</label>
            <select 
              required
              disabled={!!idEmEdicao} 
              value={setorSelecionado}
              onChange={e => setSetorSelecionado(e.target.value as OrdemServicoAgro['setorOs'][number]['setor'])}
              className="w-full bg-agro-dark border border-agro-border rounded-xl p-2.5 text-slate-200 outline-none focus:border-green-500/50 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="" disabled>Selecione o setor inicial...</option>
              {SetoresZilor.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Descrição do QRU *</label>
          <textarea required value={qru} onChange={e => setQru(e.target.value)} placeholder="Descreva o problem relatado..." rows={3} className="w-full bg-agro-dark border border-agro-border rounded-xl p-2.5 text-slate-200 outline-none resize-none focus:border-green-500/50 text-sm" />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button 
            type="button" 
            onClick={onCancelar} 
            disabled={isSubmitting}
            className="bg-agro-card hover:bg-agro-border text-slate-300 font-bold px-5 py-2.5 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
          
          <button 
            type="submit" 
            disabled={isSubmitting}
            className={`font-black px-5 py-2.5 rounded-xl transition flex items-center gap-1 ${
              isSubmitting 
                ? 'bg-slate-600 text-slate-400 cursor-not-allowed opacity-70' 
                : 'bg-green-500 hover:bg-green-600 text-slate-950 cursor-pointer'
            }`}
          >
            {isSubmitting ? (
              <>⏳ Salvando...</>
            ) : idEmEdicao ? (
              'Atualizar O.S.'
            ) : (
              'Salvar O.S.'
            )}
          </button>
        </div>
      </form>
    </section>
  );
}
