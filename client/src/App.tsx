import { useState, useMemo, useEffect } from 'react';

// API Real com Axios
import api from './services/api';

// interface (Mantendo a extensão estrita exigida pelo tsconfig)
import type { OrdemServicoAgro, Equipamento, Operador } from './interface/index.js';

// icons
import { RefreshCw, PlusCircle, LayoutDashboard, SlidersHorizontal, History, MapPin } from 'lucide-react';

// components
import FormularioOS from './components/FormularioOS';
import ColunaKanban from './components/ColunaKanban';
import ModalDetalhes from './components/ModalDetalhes';
import TelaHistorico from './pages/TelaHistorico';
import LoadingStatus from './components/LoadingStatus'; 
import { useTheme } from './context/ThemeContext.js';
import { ThemeProvider } from './context/ThemeContext.js';
import ThemeToggle from './components/ThemeToggle.js';

function ConteudoApp() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Dicionário de Classes Semânticas para Inversão de Cores (Dark vs Light/Verde)
  const classes = {
    corpoLayout: isDark ? 'bg-agro-dark text-slate-100' : 'bg-slate-50 text-slate-800',
    navbar: isDark ? 'bg-[#181b26] border-agro-border' : 'bg-white border-emerald-100 shadow-sm',
    containerFiltros: isDark ? 'bg-[#181b26] border-agro-border/80' : 'bg-white border-emerald-100 shadow-md',
    labels: isDark ? 'text-slate-400' : 'text-emerald-800/80 font-bold',
    inputs: isDark ? 'bg-agro-dark border-agro-border text-slate-200 focus:border-green-500/30' : 'bg-emerald-50/40 border-emerald-200 text-emerald-950 focus:border-emerald-500',
    subContainers: isDark ? 'bg-[#181b26] border-agro-border/40' : 'bg-white border-emerald-100/80 shadow-sm',
    btnLimpar: isDark ? 'bg-agro-card hover:bg-agro-border text-slate-300 border-agro-border' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
  };

  const [ordens, setOrdens] = useState<OrdemServicoAgro[]>([]);
  const [abaAtiva, setAbaAtiva] = useState<'dashboard' | 'criar' | 'historico'>('dashboard');
  const [osSelecionada, setOsSelecionada] = useState<OrdemServicoAgro | null>(null);
  const [idEmEdicao, setIdEmEdicao] = useState<string | null>(null);

  const [filtroFrota, setFiltroFrota] = useState('');
  const [filtroOperador, setFiltroOperador] = useState('');
  const [setorAtivo, setSetorAtivo] = useState<OrdemServicoAgro['triagemSetor']>('Agricultura de Precisão');
  const [cidadeAtiva, setCidadeAtiva] = useState<string>('Salto Botelho');
  const [carregando, setCarregando] = useState<boolean>(true);

  const [frotasFiltro, setFrotasFiltro] = useState<Equipamento[]>([]);
  const [operadoresFiltro, setOperadoresFiltro] = useState<Operador[]>([]);

  const setoresDisponiveis: OrdemServicoAgro['triagemSetor'][] = [
    'Agricultura de Precisão',
    'Elétrica',
    'Mecânica',
    'Borracharia'
  ];

  const cidadesDisponiveis = [
    'Salto Botelho',
    'Quatá',
    'Barra Grande',
    'Lençóis Paulista'
  ];

  const carregarOrdens = async () => {
    try {
      const resposta = await api.get('/ordens');
      setOrdens(resposta.data);
    } catch (error) {
      console.error("Erro ao conectar ao banco Zilor Atlas:", error);
    }
  };

  const carregarDadosMestreFiltro = async () => {
    try {
      const [resFrotas, resOperadores] = await Promise.all([
        api.get('/frotas-mestre'),
        api.get('/operadores-mestre')
      ]);
      setFrotasFiltro(resFrotas.data);
      setOperadoresFiltro(resOperadores.data);
    } catch (error) {
      console.error("Erro ao carregar dados mestre para o filtro:", error);
    }
  };

  useEffect(() => {
    const inicializarPainel = async () => {
      setCarregando(true);
      try {
        await Promise.all([carregarOrdens(), carregarDadosMestreFiltro()]);
      } catch (error) {
        console.error("Erro na carga inicial:", error);
      } finally {
        setCarregando(false);
      }
    };
    inicializarPainel();
  }, []);

  const ordensFiltradasKanban = useMemo(() => {
    return ordens.filter(os => (
      (filtroFrota === '' || os.prefixoTrator.includes(filtroFrota)) &&
      (filtroOperador === '' || os.idOperador.includes(filtroOperador)) &&
      (os.triagemSetor === setorAtivo) &&
      (os.usinaBase?.toLowerCase().trim() === cidadeAtiva.toLowerCase().trim())
    ));
  }, [ordens, filtroFrota, filtroOperador, setorAtivo, cidadeAtiva]);

  const salvarOS = async (dadosForm: Partial<OrdemServicoAgro>) => {
    try {
      if (idEmEdicao) {
        const resposta = await api.put(`/ordens/${idEmEdicao}`, dadosForm);
        setOrdens(prev => prev.map(o => o.idCustomizado === idEmEdicao ? resposta.data : o));
        setIdEmEdicao(null);
      } else {
        const payloadZilorAtlas = { ...dadosForm, triagemSetor: setorAtivo };
        const resposta = await api.post('/ordens', payloadZilorAtlas);
        setOrdens(prev => [resposta.data, ...prev]);
      }
      setAbaAtiva('dashboard');
    } catch (error) {
      alert("Não foi possível salvar a O.S. no servidor.");
    }
  };

  const deletarOS = async (idCustomizado: string) => {
    if (confirm(`Deseja remover permanentemente a ordem ${idCustomizado}?`)) {
      try {
        await api.delete(`/ordens/${idCustomizado}`);
        setOrdens(prev => prev.filter(o => o.idCustomizado !== idCustomizado));
      } catch (error) {
        alert("Erro ao eliminar a ordem de serviço do banco.");
      }
    }
  };

  return (
    <div className={`min-h-screen font-sans transition-colors duration-200 ${classes.corpoLayout}`}>
      
      {/* HEADER PRINCIPAL */}
      <nav className={`border-b px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4 transition-colors ${classes.navbar}`}>
        <div className="flex items-center gap-3">
          <span className={`text-xl font-black tracking-wider ${isDark ? 'text-white' : 'text-emerald-900'}`}>ZILOR</span>
          <span className="bg-emerald-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded shadow-sm">CORE OPERACIONAL</span>
          
          {/* Seletor de Tema posicionado estrategicamente */}
          <ThemeToggle />
        </div>

        <div className={`flex p-1 rounded-xl border ${isDark ? 'bg-agro-dark border-agro-border' : 'bg-emerald-50/50 border-emerald-100'}`}>
          <button onClick={() => setAbaAtiva('dashboard')} className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${abaAtiva === 'dashboard' ? 'bg-emerald-600 text-white' : isDark ? 'text-slate-400 hover:text-white' : 'text-emerald-800/70 hover:text-emerald-900'}`}>
            <LayoutDashboard size={14} /> Monitor Realtime
          </button>
          <button onClick={() => setAbaAtiva('historico')} className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${abaAtiva === 'historico' ? 'bg-emerald-600 text-white' : isDark ? 'text-slate-400 hover:text-white' : 'text-emerald-800/70 hover:text-emerald-900'}`}>
            <History size={14} /> Histórico Analítico
          </button>
          <button onClick={() => { setIdEmEdicao(null); setAbaAtiva('criar'); }} className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${abaAtiva === 'criar' ? 'bg-emerald-600 text-white' : isDark ? 'text-slate-400 hover:text-white' : 'text-emerald-800/70 hover:text-emerald-900'}`}>
            <PlusCircle size={14} /> Nova OS
          </button>
        </div>
      </nav>

      {/* ÁREA DE CONTEÚDO */}
      <div className="p-4 md:p-6">
        {abaAtiva === 'dashboard' && (
          <>
            {/* PAINEL DE BUSCA POR COMPONENTES MESTRE */}
            <section className={`border rounded-2xl p-4 mb-4 grid grid-cols-1 sm:grid-cols-3 gap-4 items-end text-xs transition-colors ${classes.containerFiltros}`}>
              <div>
                <label className={`text-[10px] uppercase block mb-1 ${classes.labels}`}>Filtrar por Frota</label>
                <input 
                  type="text" 
                  list="filtro-frotas-db"
                  placeholder="Ex: 850002" 
                  value={filtroFrota} 
                  onChange={e => setFiltroFrota(e.target.value)} 
                  className={`w-full border rounded-xl p-2 outline-none transition ${classes.inputs}`} 
                />
                <datalist id="filtro-frotas-db">
                  {frotasFiltro
                    .filter(frota => frota.prefixo.toLowerCase().includes(filtroFrota.toLowerCase()))
                    .slice(0, 10) 
                    .map(frota => (
                      <option key={frota.prefixo} value={frota.prefixo}>
                        {frota.modeloEquipamento} ({frota.usinaAlocada})
                      </option>
                    ))
                  }
                </datalist>
              </div>

              <div>
                <label className={`text-[10px] uppercase block mb-1 ${classes.labels}`}>Filtrar por Operador</label>
                <input 
                  type="text" 
                  list="filtro-operadores-db"
                  placeholder="Ex: 23805" 
                  value={filtroOperador} 
                  onChange={e => setFiltroOperador(e.target.value)} 
                  className={`w-full border rounded-xl p-2 outline-none transition ${classes.inputs}`} 
                />
                <datalist id="filtro-operadores-db">
                  {operadoresFiltro
                    .filter(op => op.codigo.toLowerCase().includes(filtroOperador.toLowerCase()) || op.nome.toLowerCase().includes(filtroOperador.toLowerCase()))
                    .slice(0, 10) 
                    .map(op => (
                      <option key={op.codigo} value={op.codigo}>{op.nome}</option>
                    ))
                  }
                </datalist>
              </div>
              
              <button onClick={() => { setFiltroFrota(''); setFiltroOperador(''); }} className={`py-2 rounded-xl font-bold border flex items-center justify-center gap-1 cursor-pointer transition ${classes.btnLimpar}`}><RefreshCw size={12}/> Limpar Busca</button>
            </section>

            {carregando ? (
              <LoadingStatus />
            ) : (
              <>
                {/* FILTRO DE CIDADES / USINAS */}
                <section className={`border p-2 rounded-2xl mb-3 flex flex-wrap gap-2 items-center transition-colors ${classes.subContainers}`}>
                  <span className="text-[10px] font-bold uppercase text-slate-500 px-2 flex items-center gap-1">
                    <MapPin size={12} className={isDark ? 'text-slate-400' : 'text-emerald-700'} /> Cidade / Usina Base:
                  </span>
                  {cidadesDisponiveis.map(cidade => {
                    const qtdCidade = ordens.filter(os => os.usinaBase?.toLowerCase().trim() === cidade.toLowerCase().trim() && os.status !== 'concluido').length;
                    return (
                      <button 
                        key={cidade} 
                        onClick={() => setCidadeAtiva(cidade)} 
                        className={`px-4 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 
                          ${cidadeAtiva === cidade 
                            ? 'bg-emerald-600 text-white shadow-sm' 
                            : isDark ? 'bg-agro-dark text-slate-400 border border-agro-border hover:text-white' : 'bg-emerald-50/60 text-emerald-800 border border-emerald-100 hover:bg-emerald-100/50'}`}
                      >
                        <span>🏢 {cidade}</span>
                        {qtdCidade > 0 && <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-black ${cidadeAtiva === cidade ? 'bg-white text-emerald-950' : 'bg-emerald-600 text-white'}`}>{qtdCidade}</span>}
                      </button>
                    );
                  })}
                </section>

                {/* FILTRO DE SETORES ATIVOS */}
                <section className={`border p-2 rounded-2xl mb-6 flex flex-wrap gap-2 items-center transition-colors ${classes.subContainers}`}>
                  <span className="text-[10px] font-bold uppercase text-slate-500 px-2 flex items-center gap-1">
                    <SlidersHorizontal size={12} className={isDark ? 'text-slate-400' : 'text-emerald-700'} /> Setor Ativo:
                  </span>
                  {setoresDisponiveis.map(setor => {
                    const qtdPendentes = ordens.filter(os => os.triagemSetor === setor && os.status === 'pendente' && os.usinaBase?.toLowerCase().trim() === cidadeAtiva.toLowerCase().trim()).length;
                    return (
                      <button 
                        key={setor} 
                        onClick={() => setSetorAtivo(setor)} 
                        className={`px-4 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2
                          ${setorAtivo === setor 
                            ? 'bg-emerald-600 text-white shadow-sm' 
                            : isDark ? 'bg-agro-dark text-slate-400 border border-agro-border hover:text-white' : 'bg-emerald-50/60 text-emerald-800 border border-emerald-100 hover:bg-emerald-100/50'}`}
                      >
                        <span>{setor === 'Agricultura de Precisão' ? '📡 Ag. Precisão' : setor === 'Elétrica' ? '⚡ Elétrica' : setor === 'Mecânica' ? '🔧 Mecânica' : '🔧 Borracharia'}</span>
                        {qtdPendentes > 0 && <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-black ${setorAtivo === setor ? 'bg-white text-emerald-950' : 'bg-emerald-600 text-white'}`}>{qtdPendentes}</span>}
                      </button>
                    );
                  })}
                </section>

                {/* MONITOR KANBAN */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <ColunaKanban titulo="⏳ Fila Setor" status="pendente" ordens={ordensFiltradasKanban} onSelecionarCard={setOsSelecionada} onEditar={(os, e) => { e.stopPropagation(); setIdEmEdicao(os.idCustomizado); setAbaAtiva('criar'); }} onExcluir={(idCustomizado, e) => { e.stopPropagation(); deletarOS(idCustomizado); }} />
                  <ColunaKanban titulo="🛠️ Em Reparo" status="em_andamento" ordens={ordensFiltradasKanban} onSelecionarCard={setOsSelecionada} onEditar={(os, e) => { e.stopPropagation(); setIdEmEdicao(os.idCustomizado); setAbaAtiva('criar'); }} onExcluir={(idCustomizado, e) => { e.stopPropagation(); deletarOS(idCustomizado); }} />
                  <ColunaKanban titulo="✅ Resolvido" status="concluido" ordens={ordensFiltradasKanban} onSelecionarCard={setOsSelecionada} onEditar={(os, e) => { e.stopPropagation(); setIdEmEdicao(os.idCustomizado); setAbaAtiva('criar'); }} onExcluir={(idCustomizado, e) => { e.stopPropagation(); deletarOS(idCustomizado); }} />
                </div>
              </>
            )}
          </>
        )}

        {abaAtiva === 'historico' && <TelaHistorico ordens={ordens} />}

        {abaAtiva === 'criar' && <FormularioOS idEmEdicao={idEmEdicao} ordens={ordens} onSalvar={salvarOS} onCancelar={() => setAbaAtiva('dashboard')} />}
      </div>

      {/* MODAL DETALHES */}
      {osSelecionada && (
        <ModalDetalhes 
          os={osSelecionada} 
          onFechar={() => setOsSelecionada(null)} 
          onTransferirSetor={async (idCustomizado, proximoSetor) => {
            try {
              await api.put(`/ordens/${idCustomizado}`, { triagemSetor: proximoSetor });
              await carregarOrdens();
              setOsSelecionada(null);
            } catch (err) {
              alert("Erro ao transferir setor.");
            }
          }}
          onAvancarStatus={async (idCustomizado, prox, solucaoParcial, causaDefinida) => { 
            try {
              await api.put(`/ordens/${idCustomizado}`, { status: prox, solucaoTecnico: solucaoParcial, tipoCausa: causaDefinida }); 
              await carregarOrdens();
              setOsSelecionada(null); 
            } catch (err) {
              alert("Erro ao atualizar status.");
            }
          }}
          onDarBaixaFinal={async (idCustomizado, laudo) => {
            try {
              await api.put(`/ordens/${idCustomizado}`, { 
                status: 'concluido', 
                tipoCausa: laudo.causa, 
                triagemSetor: laudo.setor, 
                solucaoTecnico: laudo.solucao || 'Resolvido no campo.', 
                tecnicoResponsavel: 'Jonatas Moreira' 
              });
              await carregarOrdens();
              setOsSelecionada(null);
            } catch (err) {
              alert("Erro ao dar baixa final na O.S.");
            }
          }}
        />
      )}
    </div>
  );
}

// Envelopamento com o Contexto para que os Hooks funcionem corretamente
export default function App() {
  return (
    <ThemeProvider>
      <ConteudoApp />
    </ThemeProvider>
  );
}
