import { useState, useMemo, useEffect } from 'react';
import api from './services/api';
import type { OrdemServicoAgro } from './interface/index.js';
import { useDadosMestre } from './hook/useDadosMestre.js';
import { AuthProvider, useAuth } from './context/AuthContext.js';

import { 
  RefreshCw, 
  PlusCircle, 
  LayoutDashboard, 
  SlidersHorizontal, 
  History, 
  MapPin, 
  LogOut 
} from 'lucide-react';

import FormularioOS from './components/FormularioOS.js';
import ColunaKanban from './components/ColunaKanban.js';
import ModalDetalhes from './components/ModalDetalhes.js';
import Login from './pages/Login.js';
import TelaHistorico from './pages/TelaHistorico.js';
import LoadingStatus from './components/LoadingStatus.js';

function ConteudoApp() {
  const { usuario, token, logout } = useAuth();

  const [ordens, setOrdens] = useState<OrdemServicoAgro[]>([]);
  const [abaAtiva, setAbaAtiva] = useState<'dashboard' | 'criar' | 'historico' | 'cadastro_operadores'>('dashboard');
  const [osSelecionada, setOsSelecionada] = useState<OrdemServicoAgro | null>(null);
  const [idEmEdicao, setIdEmEdicao] = useState<string | null>(null);

  const [filtroFrota, setFiltroFrota] = useState('');
  const [filtroOperador, setFiltroOperador] = useState('');
  const [setorAtivo, setSetorAtivo] = useState<OrdemServicoAgro['setorOs'][number]['setor']>('Agricultura de Precisão');
  const [cidadeAtiva, setCidadeAtiva] = useState<string>('Salto Botelho');
  const [carregando, setCarregando] = useState<boolean>(true);

  const { frotasCadastradas, operadoresCadastrados } = useDadosMestre();

  const setoresDisponiveis: OrdemServicoAgro['setorOs'][number]['setor'][] = [
    'Agricultura de Precisão',
    'Elétrica',
    'Mecânica',
    'Borracharia'
  ];

  const cidadesDisponiveis = [
    'Salto Botelho',
    'Quatá',
    'São José',
    'Barra Grande'
  ];

  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  }, [token]);

  const carregarOrdens = async () => {
    try {
      const resposta = await api.get('/ordens');
      setOrdens(resposta.data);
    } catch (error) {
      console.error("Erro ao conectar ao banco agro Atlas:", error);
    }
  };

  useEffect(() => {
    if (!usuario) return;

    const inicializarPainel = async () => {
      setCarregando(true);
      try {
        await carregarOrdens();
      } catch (error) {
        console.error("Erro na carga inicial do ecossistema:", error);
      } finally {
        setCarregando(false);
      }
    };

    inicializarPainel();
  }, [usuario]);

  const ordensFiltradasKanban = useMemo(() => {
    return ordens.filter(os => {
      const atendeFiltroFrota = filtroFrota === '' || os.prefixoTrator.includes(filtroFrota);
      const atendeFiltroOperador = filtroOperador === '' || os.idOperador.includes(filtroOperador);
      const atendeUsina = os.usinaBase?.toLowerCase().trim() === cidadeAtiva.toLowerCase().trim();
      
      // Filtra para garantir que exibe a OS no Kanban se ela tiver o setor ativo e o status do setor bater com a coluna
      const possuiSetorAtivo = os.setorOs.some(s => s.setor === setorAtivo);

      return atendeFiltroFrota && atendeFiltroOperador && atendeUsina && possuiSetorAtivo;
    });
  }, [ordens, filtroFrota, filtroOperador, setorAtivo, cidadeAtiva]);
  
  const salvarOS = async (dadosForm: Partial<OrdemServicoAgro>) => {
    try {
      setCarregando(true);
      if (idEmEdicao) {
        await api.put(`/ordens/${idEmEdicao}`, dadosForm);
        setIdEmEdicao(null);
      } else {
        await api.post('/ordens', dadosForm);
      }
      
      await carregarOrdens();
      setAbaAtiva('dashboard');
    } catch (error: any) {
      console.error("Erro completo do Axios ao processar O.S.:", error);
      alert(error.response?.data?.error || "Erro ao salvar ordem de serviço no MongoDB.");
    } finally {
      setCarregando(false);
    }
  };

  const deletarOS = async (idCustomizado: string) => {
    if (confirm(`Deseja remover permanentemente do painel a ordem ${idCustomizado}?`)) {
      try {
        await api.delete(`/ordens/${idCustomizado}`);
        setOrdens(prev => prev.filter(o => o.idCustomizado !== idCustomizado));
      } catch (error) {
        console.error("Erro ao remover ordem:", error);
        alert("Erro ao eliminar a ordem de serviço do banco.");
      }
    }
  };

  if (!usuario) {
    return <Login />;
  }

  // Identifica dinamicamente os dados da oficina ativa dentro da O.S. selecionada
  // Suporta estruturas vindas do Prisma como .id ou ._id
  const oficinaAtivaNaOS = osSelecionada?.setorOs.find(s => s.setor === setorAtivo);
  const setorIdUnico = oficinaAtivaNaOS?.id || (oficinaAtivaNaOS as any)?._id;

  return (
    <div className="min-h-screen bg-agro-dark text-slate-100 font-sans">
      <nav className="bg-[#181b26] border-b border-agro-border px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div>
            <span className="text-xl font-black text-white tracking-wider">🚜 AgroFlow OS </span>
            <span className="bg-green-500 text-slate-950 text-[10px] font-black px-1.5 py-0.5 rounded ml-2">Painel de Controle e Monitoramento de Ativos.</span>
          </div>
          <div className="hidden md:flex items-center gap-2 border-l border-slate-700 pl-3 text-xs text-slate-400">
            <span>Operador logado:</span>
            <span className="font-bold text-slate-200 bg-agro-dark border border-agro-border px-2 py-0.5 rounded">
              {usuario.matricula} - {usuario.nome}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-agro-dark p-1 rounded-xl border border-agro-border">
            <button 
              onClick={() => setAbaAtiva('dashboard')} 
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${abaAtiva === 'dashboard' ? 'bg-green-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
            >
              <LayoutDashboard size={14} /> Monitor Realtime
            </button>
            <button 
              onClick={() => setAbaAtiva('historico')} 
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${abaAtiva === 'historico' ? 'bg-green-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
            >
              <History size={14} /> Histórico Analítico
            </button>
            <button 
              onClick={() => { setIdEmEdicao(null); setAbaAtiva('criar'); }} 
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${abaAtiva === 'criar' ? 'bg-green-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
            >
              <PlusCircle size={14} /> Nova OS
            </button>
          </div>
          <button 
            onClick={logout} 
            className="p-2 text-slate-400 hover:text-red-400 bg-agro-card border border-agro-border hover:border-red-500/30 rounded-xl transition cursor-pointer"
          >
            <LogOut size={15} />
          </button>
        </div>
      </nav>

      <div className="p-4 md:p-6">
        {abaAtiva === 'dashboard' && (
          <>
            <section className="bg-[#181b26] border border-agro-border/80 rounded-2xl p-4 mb-4 grid grid-cols-1 sm:grid-cols-3 gap-4 items-end text-xs">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Filtrar por Frota</label>
                <input 
                  type="text" 
                  list="filtro-frotas-db" 
                  placeholder="Ex: 850002" 
                  value={filtroFrota} 
                  onChange={e => setFiltroFrota(e.target.value)} 
                  className="w-full bg-agro-dark border border-agro-border rounded-xl p-2 text-slate-200 outline-none focus:border-green-500/30" 
                />
                <datalist id="filtro-frotas-db">
                  {frotasCadastradas.slice(0, 5).map(equip => <option key={equip.frota} value={equip.frota}>{equip.modelo}</option>)}
                </datalist>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Filtrar por Operador</label>
                <input 
                  type="text" 
                  list="filtro-operadores-db" 
                  placeholder="Ex: 23805" 
                  value={filtroOperador} 
                  onChange={e => setFiltroOperador(e.target.value)} 
                  className="w-full bg-agro-dark border border-agro-border rounded-xl p-2 text-slate-200 outline-none focus:border-green-500/30" 
                />
                <datalist id="filtro-operadores-db">
                  {operadoresCadastrados.slice(0, 5).map(op => <option key={op.codigo} value={op.codigo}>{op.nome}</option>)}
                </datalist>
              </div>
              
              <button 
                onClick={() => { setFiltroFrota(''); setFiltroOperador(''); }} 
                className="bg-agro-card hover:bg-agro-border text-slate-300 py-2 rounded-xl font-bold border border-agro-border flex items-center justify-center gap-1 cursor-pointer"
              >
                <RefreshCw size={12}/> Limpar Busca
              </button>
            </section>

            {carregando ? <LoadingStatus /> : (
              <>
                <section className="bg-[#181b26] border border-agro-border/40 p-2 rounded-2xl mb-3 flex flex-wrap gap-2 items-center">
                  <span className="text-[10px] font-bold uppercase text-slate-500 px-2 flex items-center gap-1"><MapPin size={12} />Usina Ativa:</span>
                  {cidadesDisponiveis.map(cidade => {
                    const qtdCidade = ordens.filter(os => os.usinaBase?.toLowerCase().trim() === cidade.toLowerCase().trim() && os.setorOs.some(s => s.status !== 'concluido')).length;
                    return (
                      <button 
                        key={cidade} 
                        onClick={() => setCidadeAtiva(cidade)} 
                        className={`px-4 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${cidadeAtiva === cidade ? 'bg-green-500/10 text-green-400 border border-green-500/30' : 'bg-agro-dark text-slate-400 border border-agro-border hover:text-white'}`}
                      >
                        <span>🏢 {cidade}</span> {qtdCidade > 0 && <span className="text-[10px] bg-green-500 text-slate-950 px-1.5 py-0.2 rounded-md font-black">{qtdCidade}</span>}
                      </button>
                    );
                  })}
                </section>

                <section className="bg-[#181b26] border border-agro-border/40 p-2 rounded-2xl mb-6 flex flex-wrap gap-2 items-center">
                  <span className="text-[10px] font-bold uppercase text-slate-500 px-2 flex items-center gap-1"><SlidersHorizontal size={12} /> Oficina sob Monitoria:</span>
                  {setoresDisponiveis.map(setor => (
                    <button 
                      key={setor} 
                      onClick={() => setSetorAtivo(setor)} 
                      className={`px-4 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${setorAtivo === setor ? 'bg-green-500/10 text-green-400 border border-green-500/30' : 'bg-agro-dark text-slate-400 border border-agro-border hover:text-white'}`}
                    >
                      {setor}
                    </button>
                  ))}
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <ColunaKanban titulo="⏳ Triagem" status="aguardando_manutencao" setorAtivo={setorAtivo} ordens={ordensFiltradasKanban} onSelecionarCard={setOsSelecionada} onEditar={(os, e) => { e.stopPropagation(); setIdEmEdicao(os.idCustomizado); setAbaAtiva('criar'); }} onExcluir={(id, e) => { e.stopPropagation(); deletarOS(id); }} />
                  <ColunaKanban titulo="🛠️ Em manutenção" status="em_manutencao" setorAtivo={setorAtivo} ordens={ordensFiltradasKanban} onSelecionarCard={setOsSelecionada} onEditar={(os, e) => { e.stopPropagation(); setIdEmEdicao(os.idCustomizado); setAbaAtiva('criar'); }} onExcluir={(id, e) => { e.stopPropagation(); deletarOS(id); }} />
                  <ColunaKanban titulo="✅ Liberado" status="concluido" setorAtivo={setorAtivo} ordens={ordensFiltradasKanban} onSelecionarCard={setOsSelecionada} onEditar={(os, e) => { e.stopPropagation(); setIdEmEdicao(os.idCustomizado); setAbaAtiva('criar'); }} onExcluir={(id, e) => { e.stopPropagation(); deletarOS(id); }} />
                </div>
              </>
            )}
          </>
        )}

        {abaAtiva === 'historico' && <TelaHistorico ordens={ordens} />}
        {abaAtiva === 'criar' && <FormularioOS idEmEdicao={idEmEdicao} ordens={ordens} onSalvar={salvarOS} onCancelar={() => { setIdEmEdicao(null); setAbaAtiva('dashboard'); }} />}
      </div>

      {osSelecionada && (
        <ModalDetalhes 
          os={osSelecionada} 
          setorContexto={setorAtivo}
          onFechar={() => setOsSelecionada(null)} 
          // 🔄 Injeta o setorId garantindo isolamento total contra duplicações
          onTransferirSetor={async (idCustomizado, _origem, destino) => {
            if (!setorIdUnico) return alert("Erro: Identificador da oficina ativa não localizado.");
            try {
              await api.put(`/ordens/${idCustomizado}/transferir`, { 
                setorId: setorIdUnico, 
                setorDestino: destino 
              });
              await carregarOrdens();
              setOsSelecionada(null);
            } catch (error) {
              console.error("Erro na transferência:", error);
            }
          }}
          // ⏳ Avança o status do card de forma unitária no subdocumento
          onAvancarStatus={async (id, proxStatus, solucao, causa) => { 
            if (!setorIdUnico) return alert("Erro: Identificador da oficina ativa não localizado.");
            await api.put(`/ordens/${id}/status`, { 
              setorId: setorIdUnico, 
              status: proxStatus, 
              solucaoTecnico: solucao, 
              tipoCausa: causa 
            }); 
            await carregarOrdens();
            setOsSelecionada(null);
          }}
          // ✅ Fecha a oficina ativa enviando o laudo técnico direto para o ID correspondente
          onDarBaixaFinal={async (id, laudo) => {
            if (!setorIdUnico) return alert("Erro: Identificador da oficina ativa não localizado.");
            await api.put(`/ordens/${id}/baixa`, { 
              setorId: setorIdUnico, 
              tipoCausa: laudo.causa, 
              solucaoTecnico: laudo.solucao, 
              tecnicoResponsavel: usuario?.nome 
            });
            await carregarOrdens();
            setOsSelecionada(null);
          }}
        />
      )}
    </div>
  );
}

export default function App() { 
  return (
    <AuthProvider>
      <ConteudoApp />
    </AuthProvider>
  ); 
}

