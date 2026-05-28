import { useState, useMemo, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { Calendar, SlidersHorizontal, Sliders, Truck, User, Building, FileText } from 'lucide-react';

// Conexão com a API e tipos do banco de dados
import api from '../services/api';
import type { Equipamento } from '../interface/index.js';
import { useTheme } from '../context/ThemeContext';

interface TelaHistoricoProps {
  ordens: any[];
}

export default function TelaHistorico({ ordens }: TelaHistoricoProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Mapeamento dinâmico de classes para alternância de tema
  const classes = {
    textoPrincipal: isDark ? 'text-slate-200' : 'text-slate-700',
    sessaoBg: isDark ? 'bg-[#181b26] border-agro-border' : 'bg-white border-emerald-100 shadow-md',
    titulo: isDark ? 'text-white' : 'text-emerald-900',
    labels: isDark ? 'text-slate-400' : 'text-emerald-800 font-bold',
    inputs: isDark ? 'bg-agro-dark border-agro-border text-slate-200 focus:border-amber-500/50' : 'bg-emerald-50/40 border-emerald-200 text-emerald-950 focus:border-emerald-600',
    btnReset: isDark ? 'bg-agro-card hover:bg-agro-border border-agro-border text-slate-300' : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700',
    cardMetrica: isDark ? 'bg-[#181b26] border-agro-border' : 'bg-white border-emerald-100 shadow-md',
    cardMetricaDestaque: isDark ? 'bg-[#181b26] border-amber-500/20' : 'bg-white border-amber-200 shadow-md',
    headerTabela: isDark ? 'border-b border-agro-border bg-[#1a1e2b]' : 'border-b border-emerald-100 bg-emerald-50/40',
    linhaMobile: isDark ? 'divide-agro-border/60 bg-[#151822]' : 'divide-emerald-100/60 bg-white',
    bgCardMobile: isDark ? 'bg-agro-dark/60 border-agro-border/40' : 'bg-emerald-50/20 border-emerald-100/70',
    thTabela: isDark ? 'bg-agro-dark text-slate-400 border-b border-agro-border' : 'bg-emerald-50/70 text-emerald-900 font-extrabold border-b border-emerald-100',
    tbodyTabela: isDark ? 'divide-agro-border/40 text-slate-300' : 'divide-emerald-100/40 text-slate-700',
    trHover: isDark ? 'hover:bg-agro-card/40' : 'hover:bg-emerald-50/30',
    tagSetor: isDark ? 'bg-agro-dark border-agro-border text-slate-400' : 'bg-white border-emerald-100 text-emerald-800 font-medium'
  };

  // Estados dos Filtros Avançados
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [setor, setSetor] = useState<string>('TODOS');
  const [usina, setUsina] = useState<string>('TODOS');
  const [equipamento, setEquipamento] = useState('');
  const [operador, setOperador] = useState('');

  // Estados dinâmicos alimentados via API do MongoDB Atlas
  const [frotasCadastradas, setFrotasCadastradas] = useState<Equipamento[]>([]);
  const [operadoresCadastrados, setOperadoresCadastrados] = useState<any[]>([]);

  // Carrega os dados mestre do MongoDB para habilitar o autocomplete buscador
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
        console.error("Erro ao carregar dados mestre na Tela de Histórico:", error);
      }
    };

    carregarDadosMestre();
  }, []);

  // Processamento do Multi-filtro Acumulativo Real
  const dadosFiltrados = useMemo(() => {
    return ordens.filter(os => {
      if (dataInicio && os.dataCriacao < dataInicio) return false;
      if (dataFim && os.dataCriacao > dataFim) return false;
      if (setor !== 'TODOS' && os.triagemSetor !== setor) return false;
      if (usina !== 'TODOS' && os.usinaBase !== usina) return false;
      if (equipamento && !os.prefixoTrator.toLowerCase().includes(equipamento.toLowerCase())) return false;
      if (operador && !os.idOperador.toLowerCase().includes(operador.toLowerCase())) return false;
      return true;
    });
  }, [ordens, dataInicio, dataFim, setor, usina, equipamento, operador]);

  // Cálculos Estatísticos de Porcentagem baseados no Atlas
  const analiseMetricas = useMemo(() => {
    let hardware = 0;
    let operacional = 0;
    let sinal = 0;

    dadosFiltrados.forEach(os => {
      if (os.status === 'concluido') {
        if (os.tipoCausa === 'Hardware (Defeito Real)') hardware++;
        else if (os.tipoCausa === 'Erro Operacional (Falta de Treinamento)') operacional++;
        else if (os.tipoCausa === 'Infraestrutura/Sinal') sinal++;
      }
    });

    const totalConcluidos = hardware + operacional + sinal;

    const dadosPizza = [
      { name: '🔧 Hardware Real', value: hardware, color: '#22c55e' },
      { name: '⚠️ Erro Operacional', value: operacional, color: '#f59e0b' },
      { name: '📡 Falha de Sinal', value: sinal, color: '#3b82f6' }
    ].filter(d => d.value > 0);

    const dadosPorcentagem = dadosPizza.map(item => ({
      ...item,
      porcentagem: totalConcluidos > 0 ? ((item.value / totalConcluidos) * 100).toFixed(1) : '0'
    }));

    return {
      dadosGrafico: dadosPorcentagem,
      totalChamados: dadosFiltrados.length,
      totalConcluidos,
      erroOperacionalQtd: operacional,
      porcentagemOperacional: totalConcluidos > 0 ? ((operacional / totalConcluidos) * 100).toFixed(1) : '0'
    };
  }, [dadosFiltrados]);

  const listaUsinas = useMemo(() => {
    const usinas = new Set(ordens.map(o => o.usinaBase).filter(Boolean));
    return ['TODOS', ...Array.from(usinas)];
  }, [ordens]);

  return (
    <div className={`space-y-6 text-xs antialiased transition-colors duration-200 ${classes.textoPrincipal}`}>
      {/* SEÇÃO DE FILTROS AVANÇADOS */}
      <section className={`border rounded-2xl p-5 ${classes.sessaoBg}`}>
        <h3 className={`text-sm font-bold mb-4 flex items-center gap-2 uppercase tracking-wider ${classes.titulo}`}>
          <Sliders size={14} className="text-amber-500" /> Painel de Filtros Avançados
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 items-end">
          <div>
            <label className={`text-[10px] uppercase mb-1 flex items-center gap-1 ${classes.labels}`}><Calendar size={10}/> Data Inicial</label>
            <input type="date" value={dataInicio} onChange={e => setDataInicio(e.target.value)} className={`w-full rounded-xl p-2 outline-none transition shadow-inner ${classes.inputs}`} />
          </div>

          <div>
            <label className={`text-[10px] uppercase mb-1 flex items-center gap-1 ${classes.labels}`}><Calendar size={10}/> Data Final</label>
            <input type="date" value={dataFim} onChange={e => setDataFim(e.target.value)} className={`w-full rounded-xl p-2 outline-none transition shadow-inner ${classes.inputs}`} />
          </div>

          <div>
            <label className={`text-[10px] uppercase mb-1 flex items-center gap-1 ${classes.labels}`}><SlidersHorizontal size={10}/> Filtrar Setor</label>
            <select value={setor} onChange={e => setSetor(e.target.value)} className={`w-full rounded-xl p-2 outline-none transition ${classes.inputs}`}>
              <option value="TODOS" className="text-slate-900">⚡ TODOS OS SETORES</option>
              <option value="Agricultura de Precisão" className="text-slate-900">📡 Agricultura de Precisão</option>
              <option value="Elétrica" className="text-slate-900">⚡ Elétrica</option>
              <option value="Mecânica" className="text-slate-900">🔧 Mecânica</option>
              <option value="Borracharia" className="text-slate-900">🔧 Borracharia</option>
            </select>
          </div>

          <div>
            <label className={`text-[10px] uppercase mb-1 flex items-center gap-1 ${classes.labels}`}><Building size={10}/> Filtrar Usina</label>
            <select value={usina} onChange={e => setUsina(e.target.value)} className={`w-full rounded-xl p-2 outline-none transition ${classes.inputs}`}>
              {listaUsinas.map(u => (
                <option key={u} value={u} className="text-slate-900">{u === 'TODOS' ? '🏭 TODAS AS USINAS' : `🏭 ${u}`}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={`text-[10px] uppercase mb-1 flex items-center gap-1 ${classes.labels}`}><Truck size={10}/> Equipamento</label>
            <input 
              type="text" 
              list="lista-equipamentos-db"
              placeholder="Ex: 8500" 
              value={equipamento} 
              onChange={e => setEquipamento(e.target.value)} 
              className={`w-full rounded-xl p-2 outline-none transition ${classes.inputs}`} 
            />
            <datalist id="lista-equipamentos-db">
              {frotasCadastradas
                .filter(frota => frota.prefixo.toLowerCase().includes(equipamento.toLowerCase()))
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
            <label className={`text-[10px] uppercase mb-1 flex items-center gap-1 ${classes.labels}`}><User size={10}/> Operador</label>
            <input 
              type="text" 
              list="lista-operadores-db"
              placeholder="Ex: 23805" 
              value={operador} 
              onChange={e => setOperador(e.target.value)} 
              className={`w-full rounded-xl p-2 outline-none transition ${classes.inputs}`} 
            />
            <datalist id="lista-operadores-db">
              {operadoresCadastrados
                .filter(op => op.codigo.includes(operador) || op.nome.toLowerCase().includes(operador.toLowerCase()))
                .slice(0, 15) 
                .map(op => (
                  <option key={op.codigo} value={op.codigo}>
                    {op.nome}
                  </option>
                ))
              }
            </datalist>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button 
            onClick={() => { setDataInicio(''); setDataFim(''); setSetor('TODOS'); setUsina('TODOS'); setEquipamento(''); setOperador(''); }}
            className={`border font-bold px-4 py-2 rounded-xl transition cursor-pointer ${classes.btnReset}`}
          >
            Resetar Filtros
          </button>
        </div>
      </section>
            {/* MÉTRICAS E PORCENTAGEM POR GRÁFICO */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
          <div className={`border p-5 rounded-2xl flex flex-col justify-center h-full min-h-23.75 transition-colors duration-200 ${classes.cardMetrica}`}>
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Total O.S. Filtradas</span>
            <span className={`text-3xl font-black mt-1 ${isDark ? 'text-white' : 'text-slate-800'}`}>{analiseMetricas.totalChamados}</span>
          </div>

          <div className={`border p-5 rounded-2xl flex flex-col justify-center h-full min-h-23.75 transition-colors duration-200 ${classes.cardMetricaDestaque}`}>
            <span className="text-[10px] font-bold uppercase text-amber-500 tracking-wider">Índice Erro Operacional</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black text-amber-500 dark:text-amber-400">{analiseMetricas.porcentagemOperacional}%</span>
              <span className="text-slate-400 font-bold text-xs">({analiseMetricas.erroOperacionalQtd} O.S.)</span>
            </div>
          </div>
        </div>

        <div className={`border p-5 rounded-2xl lg:col-span-2 flex flex-col justify-between min-h-50 transition-colors duration-200 ${classes.cardMetrica}`}>
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-4">Impacto Percentual por Tipo de Causa (O.S. Concluídas)</h4>
          
          {analiseMetricas.totalConcluidos > 0 ? (
            <div className="flex flex-col sm:flex-row items-center gap-6 justify-start w-full h-full">
              <div className="w-35 h-35 shrink-0 relative mx-auto sm:mx-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={analiseMetricas.dadosGrafico} cx="50%" cy="50%" innerRadius={42} outerRadius={60} paddingAngle={4} dataKey="value">
                      {analiseMetricas.dadosGrafico.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: isDark ? '#1e2230' : '#ffffff', borderColor: isDark ? '#2a3042' : '#e2e8f0', borderRadius: '10px', fontSize: '11px', color: isDark ? '#ffffff' : '#000000' }}/>
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-1 gap-2 w-full">
                {analiseMetricas.dadosGrafico.map((item, index) => (
                  <div key={index} className={`flex items-center justify-between gap-4 p-2.5 rounded-xl border w-full ${isDark ? 'bg-agro-dark/50 border-agro-border/30' : 'bg-slate-50 border-slate-100'}`}>
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <span className={`font-medium truncate ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{item.name}</span>
                    </div>
                    <span className={`font-black shrink-0 ${isDark ? 'text-white' : 'text-slate-900'}`}>{item.porcentagem}%</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-35 flex items-center justify-center text-slate-500 italic w-full">
              Nenhum dado concluído para calcular gráficos no filtro selecionado.
            </div>
          )}
        </div>
      </div>

      {/* REGISTROS GERAIS DO HISTÓRICO */}
      <section className={`border rounded-2xl overflow-hidden ${classes.sessaoBg}`}>
        <div className={`p-4 flex items-center gap-2 ${classes.headerTabela}`}>
          <FileText size={14} className="text-slate-400" />
          <h4 className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-emerald-950'}`}>Registros Gerais do Histórico</h4>
        </div>

        {/* 1. LAYOUT ADAPTADO PARA MOBILE (CARDS) */}
        <div className={`block md:hidden divide-y ${classes.linhaMobile}`}>
          {dadosFiltrados.length > 0 ? (
            dadosFiltrados.map(os => (
              <div key={os.idCustomizado} className={`p-4 space-y-3 transition ${isDark ? 'hover:bg-agro-card/30' : 'hover:bg-emerald-50/10'}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 block uppercase">Identificação</span>
                    <span className={`font-bold text-xs ${isDark ? 'text-white' : 'text-slate-900'}`}>{os.idCustomizado}</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">{os.dataCriacao} às {os.horaCriacao}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-slate-500 block uppercase">Equipamento</span>
                    <span className="font-bold text-amber-600 dark:text-amber-500 text-xs block">🚜 {os.prefixoTrator}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                  <div>
                    <span className="text-[9px] font-bold text-slate-500 block uppercase">Usina</span>
                    <span className={`font-medium truncate block ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{os.usinaBase || 'Geral'}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-500 block uppercase">Setor Responsável</span>
                    <span className={`font-medium truncate block ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{os.triagemSetor}</span>
                  </div>
                </div>

                <div className={`p-2.5 rounded-xl border space-y-1.5 ${classes.bgCardMobile}`}>
                  <div>
                    <span className="text-[9px] font-bold text-slate-500 block uppercase">Causa Real</span>
                    <span className={`font-bold text-[11px] ${os.status !== 'concluido' ? 'text-slate-400 dark:text-slate-500' : os.tipoCausa === 'Hardware (Defeito Real)' ? 'text-emerald-600 dark:text-emerald-400' : os.tipoCausa === 'Erro Operacional (Falta de Treinamento)' ? 'text-amber-600 dark:text-amber-400' : 'text-blue-600 dark:text-blue-400'}`}>
                      {os.status !== 'concluido' ? '⚠️ Em aberto' : os.tipoCausa}
                    </span>
                  </div>
                  <div className={`border-t pt-1.5 ${isDark ? 'border-agro-border/30' : 'border-emerald-100/60'}`}>
                    <span className="text-[9px] font-bold text-slate-500 block uppercase">Histórico Técnico</span>
                    <p className="text-slate-500 dark:text-slate-400 italic text-[11px] wrap-break-word line-clamp-3">
                      {os.solucaoTecnico || os.qruDescricao || 'Sem descrição registrada.'}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-slate-500 italic">Nenhum registro encontrado.</div>
          )}
        </div>

        {/* 2. LAYOUT ADAPTADO PARA DESKTOP (TABELA ROBUSTA) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left table-fixed border-collapse">
            <thead>
              <tr className={classes.thTabela}>
                <th className="p-3 w-[15%]">Identificação</th>
                <th className="p-3 w-[12%]">Equipamento</th>
                <th className="p-3 w-[15%]">Usina</th>
                <th className="p-3 w-[18%]">Setor Responsável</th>
                <th className="p-3 w-[18%]">Causa Real</th>
                <th className="p-3 w-[22%]">Histórico Técnico</th>
              </tr>
            </thead>
            <tbody className={classes.tbodyTabela}>
              {dadosFiltrados.length > 0 ? (
                dadosFiltrados.map(os => (
                  <tr key={os.idCustomizado} className={`transition text-[11px] ${classes.trHover}`}>
                    <td className="p-3 whitespace-nowrap">
                      <div className={`font-bold text-[11px] ${isDark ? 'text-white' : 'text-slate-900'}`}>{os.idCustomizado}</div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{os.dataCriacao} - {os.horaCriacao}</div>
                    </td>
                    <td className="p-3 font-bold text-amber-600 dark:text-amber-500 whitespace-nowrap">
                      🚜 {os.prefixoTrator}
                    </td>
                    <td className="p-3 truncate" title={os.usinaBase || 'Geral'}>
                      {os.usinaBase || 'Geral'}
                    </td>
                    <td className="p-3">
                      <span className={`border px-2 py-0.5 rounded block text-center truncate ${classes.tagSetor}`} title={os.triagemSetor}>
                        {os.triagemSetor}
                      </span>
                    </td>
                    <td className="p-3 truncate">
                      <span className={`font-bold ${os.status !== 'concluido' ? 'text-slate-400 dark:text-slate-500' : os.tipoCausa === 'Hardware (Defeito Real)' ? 'text-emerald-600 dark:text-emerald-400' : os.tipoCausa === 'Erro Operacional (Falta de Treinamento)' ? 'text-amber-600 dark:text-amber-400' : 'text-blue-600 dark:text-blue-400'}`} title={os.status !== 'concluido' ? 'Em aberto' : os.tipoCausa}>
                        {os.status !== 'concluido' ? '⚠️ Em aberto' : os.tipoCausa}
                      </span>
                    </td>
                    <td className="p-3 text-slate-500 dark:text-slate-400 italic truncate" title={os.solucaoTecnico || os.qruDescricao}>
                      {os.solucaoTecnico || os.qruDescricao || '---'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500 italic">
                    Nenhum registro encontrado com os filtros aplicados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}