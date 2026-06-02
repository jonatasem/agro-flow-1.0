import { useState, useMemo, useEffect } from 'react';

// API Real com Axios
import api from './services/api';

// interface (Mantendo a extensão estrita exigida pelo tsconfig)
import type { OrdemServicoAgro } from './interface/index.js';

// Importação do custom hook
import { useDadosMestre } from './hook/useDadosMestre';

// icons
import { RefreshCw, PlusCircle, LayoutDashboard, SlidersHorizontal, History, MapPin } from 'lucide-react';

// components
import FormularioOS from './components/FormularioOS';
import ColunaKanban from './components/ColunaKanban';
import ModalDetalhes from './components/ModalDetalhes';
import TelaHistorico from './pages/TelaHistorico';
import LoadingStatus from './components/LoadingStatus';

export default function App() {
  const [ordens, setOrdens] = useState<OrdemServicoAgro[]>([]);
  const [abaAtiva, setAbaAtiva] = useState<'dashboard' | 'criar' | 'historico'>('dashboard');
  const [osSelecionada, setOsSelecionada] = useState<OrdemServicoAgro | null>(null);
  const [idEmEdicao, setIdEmEdicao] = useState<string | null>(null);

  const [filtroFrota, setFiltroFrota] = useState('');
  const [filtroOperador, setFiltroOperador] = useState('');
  const [setorAtivo, setSetorAtivo] = useState<OrdemServicoAgro['triagemSetor']>('Agricultura de Precisão');

  // Filtro de Cidade/Usina com o padrão 'Salto Botelho'
  const [cidadeAtiva, setCidadeAtiva] = useState<string>('Salto Botelho');

  // Estado de controle para o componente de Carregamento (Loading)
  const [carregando, setCarregando] = useState<boolean>(true);

  // Utilizando os dados vindo do custom hook personalizado
  const { frotasCadastradas: frotasFiltro, operadoresCadastrados: operadoresFiltro } = useDadosMestre();

  const setoresDisponiveis: OrdemServicoAgro['triagemSetor'][] = [
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

  // Função para carregar as ordens reais do MongoDB Atlas via API
  const carregarOrdens = async () => {
    try {
      const resposta = await api.get('/ordens');
      setOrdens(resposta.data);
    } catch (error) {
      console.error("Erro ao conectar ao banco Zilor Atlas:", error);
    }
  };

  // Carrega tudo em paralelo ao montar o componente
  useEffect(() => {
    const inicializarPainel = async () => {
      setCarregando(true);
      try {
        await Promise.all([
          carregarOrdens()
        ]);
      } catch (error) {
        console.error("Erro na carga inicial do ecossistema:", error);
      } finally {
        setCarregando(false);
      }
    };

    inicializarPainel();
  }, []);

  // Filtro estrutural do monitor Kanbam
  const ordensFiltradasKanban = useMemo(() => {
    return ordens.filter(os => (
      (filtroFrota === '' || os.prefixoTrator.includes(filtroFrota)) &&
      (filtroOperador === '' || os.idOperador.includes(filtroOperador)) &&
      (os.triagemSetor === setorAtivo) &&
      (os.usinaBase?.toLowerCase().trim() === cidadeAtiva.toLowerCase().trim())
    ));
  }, [ordens, filtroFrota, filtroOperador, setorAtivo, cidadeAtiva]);

  // Criar ou Atualizar uma Ordem no Banco de Dados
  const salvarOS = async (dadosForm: Partial<OrdemServicoAgro>) => {
    try {
      if (idEmEdicao) {
        const resposta = await api.put(`/ordens/${idEmEdicao}`, dadosForm);
        setOrdens(prev => prev.map(o => o.idCustomizado === idEmEdicao ? resposta.data : o));
        setIdEmEdicao(null);
      } else {
        const payloadZilorAtlas = {
          ...dadosForm,
          triagemSetor: setorAtivo
        };

        const resposta = await api.post('/ordens', payloadZilorAtlas);
        setOrdens(prev => [resposta.data, ...prev]);
      }
      setAbaAtiva('dashboard');
    } catch (error: any) {
      console.error("Erro ao salvar ordem de serviço:", error);
      if (error.response && error.response.data) {
        console.error("Resposta de rejeição do Express:", error.response.data);
      }
      alert("Não foi possível salvar a O.S. no servidor.");
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

  return (
    <div className="min-h-screen bg-agro-dark text-slate-100 font-sans">
      <nav className="bg-[#181b26] border-b border-agro-border px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xl font-black text-white tracking-wider">ZILOR</span>
          <span className="bg-green-500 text-slate-950 text-[10px] font-black px-1.5 py-0.5 rounded">CORE OPERACIONAL</span>
        </div>

        <div className="flex bg-agro-dark p-1 rounded-xl border border-agro-border">
          <button onClick={() => setAbaAtiva('dashboard')} className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${abaAtiva === 'dashboard' ? 'bg-green-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}>
            <LayoutDashboard size={14} /> Monitor Realtime
          </button>
          <button onClick={() => setAbaAtiva('historico')} className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${abaAtiva === 'historico' ? 'bg-green-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}>
            <History size={14} /> Histórico Analítico
          </button>
          <button onClick={() => { setIdEmEdicao(null); setAbaAtiva('criar'); }} className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${abaAtiva === 'criar' ? 'bg-green-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}>
            <PlusCircle size={14} /> Nova OS
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
                  {frotasFiltro
                    .slice(0, 5) 
                    .map(equip => (
                      <option key={equip.frota} value={equip.frota}>
                        {equip.modelo}
                      </option>
                    ))
                  }
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
                  {operadoresFiltro
                    .slice(0, 5) 
                    .map(op => (
                      <option key={op.codigo} value={op.codigo}>
                        {op.nome}
                      </option>
                    ))
                  }
                </datalist>
              </div>
              
              <button onClick={() => { setFiltroFrota(''); setFiltroOperador(''); }} className="bg-agro-card hover:bg-agro-border text-slate-300 py-2 rounded-xl font-bold border border-agro-border flex items-center justify-center gap-1 cursor-pointer"><RefreshCw size={12}/> Limpar Busca</button>
            </section>

            {carregando ? (
              <LoadingStatus />
            ) : (
              <>
                <section className="bg-[#181b26] border border-agro-border/40 p-2 rounded-2xl mb-3 flex flex-wrap gap-2 items-center">
                  <span className="text-[10px] font-bold uppercase text-slate-500 px-2 flex items-center gap-1">
                    <MapPin size={12} />Usina Ativa:
                  </span>
                  {cidadesDisponiveis.map(cidade => {
                    const qtdCidade = ordens.filter(os => os.usinaBase?.toLowerCase().trim() === cidade.toLowerCase().trim() && os.status !== 'concluido').length;
                    return (
                      <button 
                        key={cidade} 
                        onClick={() => setCidadeAtiva(cidade)} 
                        className={`px-4 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${cidadeAtiva === cidade ? 'bg-green-500/10 text-green-400 border border-green-500/30' : 'bg-agro-dark text-slate-400 border border-agro-border hover:text-white'}`}
                      >
                        <span>🏢 {cidade}</span>
                        {qtdCidade > 0 && <span className="text-[10px] bg-green-500 text-slate-950 px-1.5 py-0.2 rounded-md font-black">{qtdCidade}</span>}
                      </button>
                    );
                  })}
                </section>

                <section className="bg-[#181b26] border border-agro-border/40 p-2 rounded-2xl mb-6 flex flex-wrap gap-2 items-center">
                  <span className="text-[10px] font-bold uppercase text-slate-500 px-2 flex items-center gap-1">
                    <SlidersHorizontal size={12} /> Setor Ativo:
                  </span>
                  {setoresDisponiveis.map(setor => {
                    const qtdPendentes = ordens.filter(os => os.triagemSetor === setor && os.status === 'pendente' && os.usinaBase?.toLowerCase().trim() === cidadeAtiva.toLowerCase().trim()).length;
                    return (
                      <button key={setor} onClick={() => setSetorAtivo(setor)} className={`px-4 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${setorAtivo === setor ? 'bg-green-500/10 text-green-400 border border-green-500/30' : 'bg-agro-dark text-slate-400 border border-agro-border hover:text-white'}`}>
                        <span>{setor === 'Agricultura de Precisão' ? '📡 Ag. Precisão' : setor === 'Elétrica' ? '⚡ Elétrica' : setor === 'Mecânica' ? '🔧 Mecânica' : ' 🚚 Borracharia'}</span>
                        {qtdPendentes > 0 && <span className="text-[10px] bg-green-500 text-slate-950 px-1.5 py-0.2 rounded-md font-black">{qtdPendentes}</span>}
                      </button>
                    );
                  })}
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <ColunaKanban 
                    titulo="⏳ Triagem" 
                    status="pendente" 
                    ordens={ordensFiltradasKanban} 
                    onSelecionarCard={setOsSelecionada} 
                    onEditar={(os, e) => { e.stopPropagation(); setIdEmEdicao(os.idCustomizado); setAbaAtiva('criar'); }} 
                    onExcluir={(idCustomizado, e) => { e.stopPropagation(); deletarOS(idCustomizado); }} 
                  />
                  <ColunaKanban 
                    titulo="🛠️ Em manutenção" 
                    status="em_andamento" 
                    ordens={ordensFiltradasKanban} 
                    onSelecionarCard={setOsSelecionada} 
                    onEditar={(os, e) => { e.stopPropagation(); setIdEmEdicao(os.idCustomizado); setAbaAtiva('criar'); }} 
                    onExcluir={(idCustomizado, e) => { e.stopPropagation(); deletarOS(idCustomizado); }} 
                  />
                  <ColunaKanban 
                    titulo="✅ Liberado" 
                    status="concluido" 
                    ordens={ordensFiltradasKanban} 
                    onSelecionarCard={setOsSelecionada} 
                    onEditar={(os, e) => { e.stopPropagation(); setIdEmEdicao(os.idCustomizado); setAbaAtiva('criar'); }} 
                    onExcluir={(idCustomizado, e) => { e.stopPropagation(); deletarOS(idCustomizado); }} 
                  />
                </div>
              </>
            )}
          </>
        )}

        {abaAtiva === 'historico' && <TelaHistorico ordens={ordens} />}

        {abaAtiva === 'criar' && <FormularioOS idEmEdicao={idEmEdicao} ordens={ordens} onSalvar={salvarOS} onCancelar={() => setAbaAtiva('dashboard')} />}
      </div>

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
