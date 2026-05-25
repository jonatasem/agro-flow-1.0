import { useState, useMemo } from 'react';
import { ordensServicoIniciais,  } from './data/mockApi';
import type { OrdemServicoAgro } from './interface/index';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { RefreshCw, PlusCircle, LayoutDashboard } from 'lucide-react';

import FormularioOS from './components/FormularioOS';
import ColunaKanban from './components/ColunaKanban';
import ModalDetalhes from './components/ModalDetalhes';

export default function App() {
  const [ordens, setOrdens] = useState<OrdemServicoAgro[]>(ordensServicoIniciais);
  const [abaAtiva, setAbaAtiva] = useState<'dashboard' | 'criar'>('dashboard');
  const [osSelecionada, setOsSelecionada] = useState<OrdemServicoAgro | null>(null);
  const [idEmEdicao, setIdEmEdicao] = useState<string | null>(null);

  const [filtroFrota, setFiltroFrota] = useState('');
  const [filtroOperador, setFiltroOperador] = useState('');

  const ordensFiltradas = useMemo(() => {
    return ordens.filter(os => (
      (filtroFrota === '' || os.prefixoTrator.includes(filtroFrota)) &&
      (filtroOperador === '' || os.idOperador.includes(filtroOperador))
    ));
  }, [ordens, filtroFrota, filtroOperador]);

  const dadosGrafico = useMemo(() => {
    const contagem = { Hardware: 0, Operacional: 0, Sinal: 0 };
    ordensFiltradas.forEach(os => {
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
  }, [ordensFiltradas]);

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
        triagemSetor: 'Agricultura de Precisão',
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
            <section className="bg-[#181b26] border border-[#2a3042]/80 rounded-2xl p-4 mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4 items-end text-xs">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Filtrar por Frota</label>
                <input type="text" placeholder="Ex: 850002" value={filtroFrota} onChange={e => setFiltroFrota(e.target.value)} className="w-full bg-[#12141c] border border-[#2a3042] rounded-xl p-2 text-slate-200 outline-none" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Filtrar por Operador</label>
                <input type="text" placeholder="Ex: 23805" value={filtroOperador} onChange={e => setFiltroOperador(e.target.value)} className="w-full bg-[#12141c] border border-[#2a3042] rounded-xl p-2 text-slate-200 outline-none" />
              </div>
              <button onClick={() => { setFiltroFrota(''); setFiltroOperador(''); }} className="bg-[#1e2230] hover:bg-[#2a3042] text-slate-300 py-2 rounded-xl font-bold border border-[#2a3042] flex items-center justify-center gap-1 cursor-pointer"><RefreshCw size={12}/> Limpar</button>
            </section>

            {dadosGrafico.length > 0 && (
              <section className="bg-[#181b26] border border-[#2a3042]/60 p-4 rounded-2xl mb-6">
                <div className="h-[150px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dadosGrafico}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#2a3042" />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
                      <YAxis stroke="#94a3b8" fontSize={10} allowDecimals={false} />
                      <Tooltip contentStyle={{ backgroundColor: '#1e2230', borderColor: '#2a3042' }} />
                      <Bar dataKey="qtd" fill="#f59e0b" radius={[4, 4, 0, 0]}>
                        {dadosGrafico.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </section>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <ColunaKanban titulo="⏳ Fila COA" status="pendente" ordens={ordensFiltradas} onSelecionarCard={setOsSelecionada} onEditar={(os, e) => { e.stopPropagation(); setIdEmEdicao(os.id); setAbaAtiva('criar'); }} onExcluir={(id, e) => { e.stopPropagation(); if(confirm("Deletar OS?")) setOrdens(p => p.filter(o => o.id !== id)); }} />
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
          onAvancarStatus={(id, prox, solucaoParcial) => { 
            setOrdens(p => p.map(o => o.id === id ? { ...o, status: prox, solucaoTecnico: solucaoParcial } : o)); 
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