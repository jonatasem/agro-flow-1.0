import { useState, useMemo } from 'react';
import { ordensServicoIniciais } from './data/mockApi';
import type { OrdemServicoAgro } from './interface/index';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { RefreshCw, PlusCircle, LayoutDashboard, SlidersHorizontal } from 'lucide-react';

import FormularioOS from './components/FormularioOS';
import ColunaKanban from './components/ColunaKanban';
import ModalDetalhes from './components/ModalDetalhes';

export default function App() {
  const [ordens, setOrdens] = useState<OrdemServicoAgro[]>(ordensServicoIniciais);
  const [abaAtiva, setAbaAtiva] = useState<'dashboard' | 'criar'>('dashboard');
  const [osSelecionada, setOsSelecionada] = useState<OrdemServicoAgro | null>(null);
  const [idEmEdicao, setIdEmEdicao] = useState<string | null>(null);

  // Filtros de busca
  const [filtroFrota, setFiltroFrota] = useState('');
  const [filtroOperador, setFiltroOperador] = useState('');
  
  // Filtro de Visualização por Setor (Sua nova Fila da Oficina / Elétrica / AP)
  const [setorAtivo, setSetorAtivo] = useState<OrdemServicoAgro['triagemSetor']>('Agricultura de Precisão');

  const setoresDisponiveis: OrdemServicoAgro['triagemSetor'][] = [
    'Agricultura de Precisão',
    'Elétrica Automotiva',
    'Mecânica/Hidráulica'
  ];

  // Filtra as ordens por Frota, Operador E pelo Setor selecionado nas Abas
  const ordensFiltradas = useMemo(() => {
    return ordens.filter(os => (
      (filtroFrota === '' || os.prefixoTrator.includes(filtroFrota)) &&
      (filtroOperador === '' || os.idOperador.includes(filtroOperador)) &&
      (os.triagemSetor === setorAtivo)
    ));
  }, [ordens, filtroFrota, filtroOperador, setorAtivo]);

  const dadosGrafico = useMemo(() => {
    const contagem = { Hardware: 0, Operacional: 0, Sinal: 0 };
    ordens.forEach(os => {
      if (os.status === 'concluido') {
        if (os.tipoCausa === 'Hardware (Defeito Real)') contagem.Hardware++;
        if (os.tipoCausa === 'Erro Operacional (Falta de Treinamento)') contagem.Operacional++;
        if (os.tipoCausa === 'Infraestrutura/Sinal') contagem.Sinal++;
      }
    });
    return [
      { name: 'Hardware Real', qtd: contagem.Hardware, color: '#22c55e' },
      { name: 'Erro Operacional', qtd: contagem.Operacional, color: '#f59e0b' },
      { name: 'Falha de Sinal', qtd: contagem.Sinal, color: '#3b82f6' }
    ].filter(d => d.qtd > 0);
  }, [ordens]);

  const salvarOS = (dadosForm: Partial<OrdemServicoAgro>) => {
    const agora = new Date();
    const dataAtual = `${agora.getFullYear()}-${String(agora.getMonth()+1).padStart(2,'0')}-${String(agora.getDate()).padStart(2,'0')}`;
    const horaAtual = `${String(agora.getHours()).padStart(2,'0')}:${String(agora.getMinutes()).padStart(2,'0')}`;

    if (idEmEdicao) {
      setOrdens(prev => prev.map(o => o.id === idEmEdicao ? { ...o, ...dadosForm } as OrdemServicoAgro : o));
      setIdEmEdicao(null);
    } else {
      const novaOS: OrdemServicoAgro = {
        id: `OS-${dadosForm.prefixoTrator}-${Math.floor(1000 + Math.random() * 9000)}`,
        status: 'pendente',
        triagemSetor: 'Agricultura de Precisão', // Nasce por padrão na AP
        dataCriacao: dataAtual,
        horaCriacao: horaAtual,
        solucaoTecnico: '', 
        ...dadosForm
      } as OrdemServicoAgro;
      setOrdens(prev => [novaOS, ...prev]);
    }
    setAbaAtiva('dashboard');
  };

  return (
    <div className="min-h-screen bg-[#12141c] text-slate-100 font-sans">
      <nav className="bg-[#181b26] border-b border-[#2a3042] px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xl font-black text-white tracking-wider">ZILOR</span>
          <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-1.5 py-0.5 rounded">CORE OPERACIONAL</span>
        </div>

        <div className="flex bg-[#12141c] p-1 rounded-xl border border-[#2a3042]">
          <button onClick={() => setAbaAtiva('dashboard')} className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition cursor-pointer ${abaAtiva === 'dashboard' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}>
            <LayoutDashboard size={14} /> Dashboard Monitor
          </button>
          <button onClick={() => { setIdEmEdicao(null); setAbaAtiva('criar'); }} className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition cursor-pointer ${abaAtiva === 'criar' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}>
            <PlusCircle size={14} /> {idEmEdicao ? 'Editando OS' : 'Abrir Nova OS'}
          </button>
        </div>
      </nav>

      <div className="p-4 md:p-6">
        {abaAtiva === 'dashboard' ? (
          <>
            {/* Inputs de Filtro Superior */}
            <section className="bg-[#181b26] border border-[#2a3042]/80 rounded-2xl p-4 mb-4 grid grid-cols-1 sm:grid-cols-3 gap-4 items-end text-xs">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Filtrar por Frota</label>
                <input type="text" placeholder="Ex: 850002" value={filtroFrota} onChange={e => setFiltroFrota(e.target.value)} className="w-full bg-[#12141c] border border-[#2a3042] rounded-xl p-2 text-slate-200 outline-none" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Filtrar por Operador</label>
                <input type="text" placeholder="Ex: 23805" value={filtroOperador} onChange={e => setFiltroOperador(e.target.value)} className="w-full bg-[#12141c] border border-[#2a3042] rounded-xl p-2 text-slate-200 outline-none" />
              </div>
              <button onClick={() => { setFiltroFrota(''); setFiltroOperador(''); }} className="bg-[#1e2230] hover:bg-[#2a3042] text-slate-300 py-2 rounded-xl font-bold border border-[#2a3042] flex items-center justify-center gap-1 cursor-pointer"><RefreshCw size={12}/> Limpar Busca</button>
            </section>

            {/* SELETOR DE FILTRO DE SETOR (Com contador de pendentes por fila) */}
            <section className="bg-[#181b26] border border-[#2a3042]/40 p-2 rounded-2xl mb-6 flex flex-wrap gap-2 items-center">
              <span className="text-[10px] font-bold uppercase text-slate-500 px-2 flex items-center gap-1">
                <SlidersHorizontal size={12} /> Setor Ativo:
              </span>
              
              {setoresDisponiveis.map(setor => {
                // Conta quantas ordens globais estão com status 'pendente' neste setor específico
                const qtdPendentes = ordens.filter(os => os.triagemSetor === setor && os.status === 'pendente').length;

                return (
                  <button
                    key={setor}
                    onClick={() => setSetorAtivo(setor)}
                    className={`px-4 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
                      setorAtivo === setor 
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' 
                        : 'bg-[#12141c] text-slate-400 border border-[#2a3042] hover:text-white'
                    }`}
                  >
                    {/* Renderização do Nome + Ícone */}
                    <span>
                      {setor === 'Agricultura de Precisão' ? '📡 Ag. Precisão' : setor === 'Elétrica Automotiva' ? '⚡ Elétrica' : '🔧 Mecânica'}
                    </span>

                    {/* Badge numérico de pendentes (só aparece se for maior que 0 para não poluir, ou fixo se preferir) */}
                    {qtdPendentes > 0 && (
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-black ${
                        setorAtivo === setor ? 'bg-amber-500 text-slate-950' : 'bg-[#2a3042] text-slate-300'
                      }`}>
                        {qtdPendentes}
                      </span>
                    )}
                  </button>
                );
              })}
            </section>

            {/* O Kanban responde com base nas OS filtradas daquele setor específico */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <ColunaKanban titulo={`⏳ Fila - ${setorAtivo === 'Agricultura de Precisão' ? 'AP' : setorAtivo === 'Elétrica Automotiva' ? 'Elétrica' : 'Mecânica'}`} status="pendente" ordens={ordensFiltradas} onSelecionarCard={setOsSelecionada} onEditar={(os, e) => { e.stopPropagation(); setIdEmEdicao(os.id); setAbaAtiva('criar'); }} onExcluir={(id, e) => { e.stopPropagation(); if(confirm("Deletar OS?")) setOrdens(p => p.filter(o => o.id !== id)); }} />
              <ColunaKanban titulo="🛠️ Em Reparo" status="em_andamento" ordens={ordensFiltradas} onSelecionarCard={setOsSelecionada} onEditar={(os, e) => { e.stopPropagation(); setIdEmEdicao(os.id); setAbaAtiva('criar'); }} onExcluir={(id, e) => { e.stopPropagation(); if(confirm("Deletar OS?")) setOrdens(p => p.filter(o => o.id !== id)); }} />
              <ColunaKanban titulo="✅ Resolvido" status="concluido" ordens={ordensFiltradas} onSelecionarCard={setOsSelecionada} onEditar={(os, e) => { e.stopPropagation(); setIdEmEdicao(os.id); setAbaAtiva('criar'); }} onExcluir={(id, e) => { e.stopPropagation(); if(confirm("Deletar OS?")) setOrdens(p => p.filter(o => o.id !== id)); }} />
            </div>
          </>
        ) : (
          <FormularioOS idEmEdicao={idEmEdicao} ordens={ordens} onSalvar={salvarOS} onCancelar={() => setAbaAtiva('dashboard')} />
        )}
      </div>

      {osSelecionada && (
        <ModalDetalhes 
          os={osSelecionada} 
          onFechar={() => setOsSelecionada(null)} 
          onTransferirSetor={(id, proximoSetor) => {
            // AQUI MUDAMOS APENAS O SETOR! Mantém o status original intacto (Fila ou Em Reparo)
            setOrdens(p => p.map(o => o.id === id ? { ...o, triagemSetor: proximoSetor } : o));
            setOsSelecionada(null);
          }}
          onAvancarStatus={(id, prox, solucaoParcial, novoSetor) => { 
            setOrdens(p => p.map(o => o.id === id ? { 
              ...o, 
              status: prox, 
              solucaoTecnico: solucaoParcial,
              triagemSetor: novoSetor 
            } : o)); 
            setOsSelecionada(null); 
          }}
          onDarBaixaFinal={(id, laudo) => {
            setOrdens(p => p.map(o => o.id === id ? {
              ...o,
              status: 'concluido',
              tipoCausa: laudo.causa,
              triagemSetor: laudo.setor,
              solucaoTecnico: laudo.solucao || 'Resolvido no campo.',
              tecnicoResponsavel: 'Jonatas Moreira',
              tempoExecucaoMinutos: 30
            } : o));
            setOsSelecionada(null);
          }}
        />
      )}
    </div>
  );
}
