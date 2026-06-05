import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  Calendar, 
  SlidersHorizontal, 
  Sliders, 
  Truck, 
  User, 
  Building, 
  FileText, 
  ChevronDown, 
  ChevronUp, 
  Clock, 
  ShieldAlert 
} from 'lucide-react';
import { useDadosMestre } from '../hook/useDadosMestre.js';
import { useHistoricoFiltrado } from '../hook/useHistoricoFiltrado.js';
import type { OrdemServicoAgro } from '../interface/index.js';
import { formatarDataBR } from '../utils/date.js';

interface TelaHistoricoProps {
  ordens: OrdemServicoAgro[];
}

export default function TelaHistorico({ ordens }: TelaHistoricoProps) {
  // 🚀 Consome toda a lógica pesada de estados, filtros e cálculos do nosso hook customizado
  const {
    filtros,
    idExpandido,
    alternarExpansao,
    resetarFiltros,
    dadosFiltrados,
    analiseMetricas,
    listaUsinas
  } = useHistoricoFiltrado(ordens);

  // Consome as tabelas mestre para popular as sugestões dos datalists
  const { frotasCadastradas, operadoresCadastrados } = useDadosMestre();

  // 📡 FILTRO PREDITIVO: Equipamentos (Frotas) mais próximos baseados no input
  const frotasSugestao = useMemo(() => {
    const busca = filtros.equipamento.trim().toLowerCase();
    if (!busca) return frotasCadastradas.slice(0, 5);

    return frotasCadastradas
      .filter(equip => equip.frota.toLowerCase().includes(busca))
      .sort((a, b) => {
        const aComecaCom = a.frota.toLowerCase().startsWith(busca);
        const bComecaCom = b.frota.toLowerCase().startsWith(busca);
        
        if (aComecaCom && !bComecaCom) return -1;
        if (!aComecaCom && bComecaCom) return 1;
        
        return a.frota.length - b.frota.length || a.frota.localeCompare(b.frota);
      })
      .slice(0, 5);
  }, [filtros.equipamento, frotasCadastradas]);

  // 🚜 FILTRO PREDITIVO: Operadores mais próximos baseados no input
  const operadoresSugestao = useMemo(() => {
    const busca = filtros.operador.trim().toLowerCase();
    if (!busca) return operadoresCadastrados.slice(0, 5);

    return operadoresCadastrados
      .filter(op => op.codigo.toLowerCase().includes(busca))
      .sort((a, b) => {
        const aComecaCom = a.codigo.toLowerCase().startsWith(busca);
        const bComecaCom = b.codigo.toLowerCase().startsWith(busca);

        if (aComecaCom && !bComecaCom) return -1;
        if (!aComecaCom && bComecaCom) return 1;

        return a.codigo.length - b.codigo.length || a.codigo.localeCompare(b.codigo);
      })
      .slice(0, 5);
  }, [filtros.operador, operadoresCadastrados]);

  return (
    <div className="space-y-6 text-xs antialiased text-slate-200">
      
      {/* SEÇÃO DE FILTROS AVANÇADOS */}
      <section className="bg-[#181b26] border border-agro-border rounded-2xl p-5 shadow-lg">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2 uppercase tracking-wider">
          <Sliders size={14} className="text-amber-500" /> Painel de Filtros Avançados
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 items-end">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 flex items-center gap-1">
              <Calendar size={10}/> Data Inicial
            </label>
            <input 
              type="date" 
              value={filtros.dataInicio} 
              onChange={e => filtros.setDataInicio(e.target.value)} 
              className="w-full bg-agro-dark border border-agro-border rounded-xl p-2 text-slate-200 outline-none focus:border-amber-500/50 transition shadow-inner" 
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 flex items-center gap-1">
              <Calendar size={10}/> Data Final
            </label>
            <input 
              type="date" 
              value={filtros.dataFim} 
              onChange={e => filtros.setDataFim(e.target.value)} 
              className="w-full bg-agro-dark border border-agro-border rounded-xl p-2 text-slate-200 outline-none focus:border-amber-500/50 transition shadow-inner" 
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 flex items-center gap-1">
              <SlidersHorizontal size={10}/> Filtrar Setor
            </label>
            <select 
              value={filtros.setor} 
              onChange={e => filtros.setSetor(e.target.value)} 
              className="w-full bg-agro-dark border border-agro-border rounded-xl p-2 text-slate-200 outline-none focus:border-amber-500/50 transition"
            >
              <option value="TODOS">⚡ TODOS OS SETORES</option>
              <option value="Agricultura de Precisão">📡 Agricultura de Precisão</option>
              <option value="Elétrica">⚡ Elétrica</option>
              <option value="Mecânica">🔧 Mecânica</option>
              <option value="Borracharia">🚚 Borracharia</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 flex items-center gap-1">
              <Building size={10}/> Filtrar Usina
            </label>
            <select 
              value={filtros.usina} 
              onChange={e => filtros.setUsina(e.target.value)} 
              className="w-full bg-agro-dark border border-agro-border rounded-xl p-2 text-slate-200 outline-none focus:border-amber-500/50 transition"
            >
              {listaUsinas.map(u => (
                <option key={u} value={u}>{u === 'TODOS' ? '🏭 TODAS AS USINAS' : `🏭 ${u}`}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 flex items-center gap-1">
              <Truck size={10}/> Equipamento
            </label>
            <input 
              type="text" 
              list="lista-equipamentos-db"
              placeholder="Ex: 8500" 
              value={filtros.equipamento} 
              onChange={e => filtros.setEquipamento(e.target.value)} 
              className="w-full bg-agro-dark border border-agro-border rounded-xl p-2 text-slate-200 outline-none focus:border-amber-500/50 transition" 
            />
            <datalist id="lista-equipamentos-db">
              {frotasSugestao.map(equip => (
                <option key={equip.frota} value={equip.frota}>{equip.modelo}</option>
              ))}
            </datalist>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 flex items-center gap-1">
              <User size={10}/> Operador
            </label>
            <input 
              type="text" 
              list="lista-operadores-db"
              placeholder="Ex: 23805" 
              value={filtros.operador} 
              onChange={e => filtros.setOperador(e.target.value)} 
              className="w-full bg-agro-dark border border-agro-border rounded-xl p-2 text-slate-200 outline-none focus:border-amber-500/50 transition" 
            />
            <datalist id="lista-operadores-db">
              {operadoresSugestao.map(op => (
                <option key={op.codigo} value={op.codigo}>{op.nome}</option>
              ))}
            </datalist>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button 
            onClick={resetarFiltros} 
            className="bg-agro-card hover:bg-agro-border border border-agro-border text-slate-300 font-bold px-4 py-2 rounded-xl transition cursor-pointer"
          >
            Resetar Filtros
          </button>
        </div>
      </section>
      {/* SEÇÃO DE MÉTRICAS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
          <div className="bg-[#181b26] border border-agro-border p-5 rounded-2xl flex flex-col justify-center h-full min-h-23.75 shadow-md">
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Total O.S. Filtradas</span>
            <span className="text-3xl font-black mt-1 text-white">{analiseMetricas.totalChamados}</span>
          </div>

          <div className="bg-[#181b26] border border-amber-500/20 p-5 rounded-2xl flex flex-col justify-center h-full min-h-23.75 shadow-md">
            <span className="text-[10px] font-bold uppercase text-amber-500 tracking-wider">Índice Erro Operacional</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black text-amber-400">{analiseMetricas.porcentagemOperacional}%</span>
              <span className="text-amber-500 font-bold text-xs">
                {analiseMetricas.erroOperacionalQtd}
                <span className='text-white ml-1'>O.S.</span>
              </span>
            </div>
          </div>
        </div>

        {/* GRÁFICO RECHARTS */}
        <div className="bg-[#181b26] border border-agro-border p-5 rounded-2xl lg:col-span-2 flex flex-col justify-between min-h-50 shadow-md">
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-4">Impacto Percentual por Tipo de Causa (O.S. Concluídas)</h4>
          
          {analiseMetricas.totalConcluidos > 0 ? (
            <div className="flex flex-col sm:flex-row items-center gap-6 justify-start w-full h-full">
              <div className="w-35 h-35 shrink-0 relative mx-auto sm:mx-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={analiseMetricas.dadosGrafico} cx="50%" cy="50%" innerRadius={42} outerRadius={60} paddingAngle={4} dataKey="value">
                      {analiseMetricas.dadosGrafico.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1e2230', borderColor: '#2a3042', borderRadius: '10px', fontSize: '11px', color: '#ffffff' }}/>
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-1 gap-2 w-full">
                {analiseMetricas.dadosGrafico.map((item, index) => (
                  <div key={index} className="flex items-center justify-between gap-4 p-2.5 rounded-xl border w-full bg-agro-dark/50 border-agro-border/30">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="font-medium truncate text-slate-300">{item.name}</span>
                    </div>
                    <span className="font-black shrink-0 text-white">{item.porcentagem}%</span>
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
      <section className="bg-[#181b26] border border-agro-border rounded-2xl overflow-hidden shadow-md">
        <div className="p-4 flex items-center gap-2 border-b border-agro-border bg-[#1a1e2b]">
          <FileText size={14} className="text-slate-400" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Registros Gerais do Histórico</h4>
        </div>

        {/* LAYOUT MOBILE */}
        <div className="block md:hidden divide-y divide-agro-border/60 bg-[#151822]">
          {dadosFiltrados.length > 0 ? (
            dadosFiltrados.map(os => {
              const estaAberto = idExpandido === os.idCustomizado;
              return (
                <div 
                  key={os.idCustomizado} 
                  onClick={() => alternarExpansao(os.idCustomizado)}
                  className={`p-4 space-y-3 transition cursor-pointer ${estaAberto ? 'bg-agro-card/40' : 'hover:bg-agro-card/20'}`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 block uppercase">Identificação</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-white">{os.idCustomizado}</span>
                        {estaAberto ? <ChevronUp size={12} className="text-amber-500" /> : <ChevronDown size={12} className="text-slate-400" />}
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-0.5">{formatarDataBR(os.dataCriacao)} às {os.horaCriacao}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-slate-500 block uppercase">Equipamento</span>
                      <span className="font-bold text-amber-500 text-xs block">🚜 {os.prefixoTrator}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                    <div>
                      <span className="text-[9px] font-bold text-slate-500 block uppercase">Usina</span>
                      <span className="font-medium truncate block text-slate-300">{os.usinaBase || 'Geral'}</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-slate-500 block uppercase">Setor Responsável</span>
                      <span className="font-medium truncate block text-slate-300">{os.triagemSetor}</span>
                    </div>
                  </div>

                  {/* Detalhes do Mobile Expandido */}
                  {estaAberto && (
                    <div className="p-3 rounded-xl border space-y-2.5 bg-agro-dark/80 border-agro-border/50 text-[11px] text-slate-300 border-t border-dashed mt-2">
                      <div className="grid grid-cols-2 gap-2 border-b border-agro-border/30 pb-2">
                        <div>
                          <span className="text-[9px] font-bold text-slate-500 uppercase flex items-center gap-1"><User size={9}/> Operador</span>
                          <span className="text-slate-300 font-medium">{os.idOperador}</span>
                        </div>
                        <div>
                          <span className="text-[9px] font-bold text-slate-500 uppercase flex items-center gap-1"><ShieldAlert size={9}/> Aberto Por</span>
                          <span className="text-slate-300 font-medium">{os.criadoPor || 'Zilor'}</span>
                        </div>
                      </div>

                      {os.tempoManutencao && (
                        <div className="flex items-center gap-1.5 text-emerald-400 font-bold border-b border-agro-border/30 pb-2">
                          <Clock size={12}/>
                          <span>Tempo total de Reparo: {os.tempoManutencao}</span>
                        </div>
                      )}

                      <div>
                        <span className="text-[9px] font-bold text-slate-500 block uppercase">Causa Real</span>
                        <span className={`font-bold text-[11px] ${
                          os.status !== 'concluido' 
                            ? 'text-slate-500' 
                            : os.tipoCausa === 'Hardware (Defeito Real)' 
                            ? 'text-emerald-400' 
                            : os.tipoCausa === 'Erro Operacional' 
                            ? 'text-amber-400' 
                            : 'text-blue-400'
                        }`}>
                          {os.status !== 'concluido' ? '⚠️ Em aberto' : os.tipoCausa}
                        </span>
                      </div>
                      
                      <div className="border-t pt-2 border-agro-border/30">
                        <span className="text-[9px] font-bold text-slate-500 block uppercase">Problema Informado (QRU)</span>
                        <p className="text-slate-400 italic">"{os.qruDescricao || 'Sem descrição registrada.'}"</p>
                      </div>

                      {os.solucaoTecnico && (
                        <div className="border-t pt-2 border-agro-border/30">
                          <span className="text-[9px] font-bold text-slate-400 block uppercase">Ação Corretiva do Técnico</span>
                          <p className="text-emerald-400 font-medium font-mono bg-emerald-950/20 p-2 rounded-lg border border-emerald-500/10">{os.solucaoTecnico}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-slate-500 italic">Nenhum registro encontrado.</div>
          )}
        </div>

        {/* LAYOUT DESKTOP */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left table-fixed border-collapse">
            <thead>
              <tr className="bg-agro-dark text-slate-400 font-extrabold border-b border-agro-border">
                <th className="p-3 w-[15%]">Identificação</th>
                <th className="p-3 w-[12%]">Equipamento</th>
                <th className="p-3 w-[15%]">Usina</th>
                <th className="p-3 w-[18%]">Setor Responsável</th>
                <th className="p-3 w-[18%]">Causa Real</th>
                <th className="p-3 w-[22%]">Histórico Técnico</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-agro-border/40 text-slate-300">
              {dadosFiltrados.length > 0 ? (
                dadosFiltrados.map(os => {
                  const estaAberto = idExpandido === os.idCustomizado;
                  return (
                    <React.Fragment key={os.idCustomizado}>
                      {/* Linha Principal clicável */}
                      <tr 
                        onClick={() => alternarExpansao(os.idCustomizado)}
                        className={`transition text-[11px] cursor-pointer ${estaAberto ? 'bg-agro-card/50' : 'hover:bg-agro-card/30'}`}
                      >
                        <td className="p-3 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 font-bold text-[11px] text-white">
                            {estaAberto ? <ChevronUp size={12} className="text-amber-500 shrink-0"/> : <ChevronDown size={12} className="text-slate-500 shrink-0"/>}
                            {os.idCustomizado}
                          </div>
                          <div className="text-[10px] text-slate-500 mt-0.5 ml-3.5">{formatarDataBR(os.dataCriacao)} - {os.horaCriacao}</div>
                        </td>
                        <td className="p-3 font-bold text-amber-500 whitespace-nowrap">
                          🚜 {os.prefixoTrator}
                        </td>
                        <td className="p-3 truncate" title={os.usinaBase || 'Geral'}>
                          {os.usinaBase || 'Geral'}
                        </td>
                        <td className="p-3">
                          <span className="border px-2 py-0.5 rounded block text-center truncate bg-agro-dark border-agro-border text-slate-400 font-medium" title={os.triagemSetor}>
                            {os.triagemSetor}
                          </span>
                        </td>
                        <td className="p-3 truncate">
                          <span className={`font-bold ${
                            os.status !== 'concluido' 
                              ? 'text-slate-500' 
                              : os.tipoCausa === 'Hardware (Defeito Real)' 
                              ? 'text-emerald-400' 
                              : os.tipoCausa === 'Erro Operacional' 
                              ? 'text-amber-400' 
                              : 'text-blue-400'
                          }`}>
                            {os.status !== 'concluido' ? '⚠️ Em aberto' : os.tipoCausa}
                          </span>
                        </td>
                        <td className="p-3 truncate italic text-slate-400" title={os.solucaoTecnico || os.qruDescricao || 'Sem descrição.'}>
                          {os.solucaoTecnico ? `Ação: ${os.solucaoTecnico}` : `QRU: ${os.qruDescricao}`}
                        </td>
                      </tr>

                      {/* Linha Subterrânea Expandida */}
                      {estaAberto && (
                        <tr className="bg-agro-dark/60 border-t-0">
                          <td colSpan={6} className="p-4 border-l-2 border-amber-500 bg-agro-dark/20">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-[11px] text-slate-300 leading-relaxed">
                              
                              {/* Painel Relacional Esquerdo */}
                              <div className="space-y-2 border-r border-agro-border/30 pr-4">
                                <h5 className="font-bold text-[10px] uppercase text-slate-500 tracking-wider">Metadados de Log</h5>
                                <div className="flex items-center gap-2"><User size={12} className="text-slate-500"/> <span><strong>Operador:</strong> {os.idOperador}</span></div>
                                <div className="flex items-center gap-2"><ShieldAlert size={12} className="text-slate-500"/> <span><strong>Identificado por:</strong> {os.criadoPor || 'Zilor'}</span></div>
                                <div className="flex items-center gap-2"><ShieldAlert size={12} className="text-slate-500"/> <span><strong>Resolvido por:</strong> {os.tecnicoResponsavel || 'Zilor'}</span></div>
                                {os.tempoManutencao && (
                                  <div className="flex items-center gap-2 mt-1 bg-emerald-500/10 text-emerald-400 font-bold p-1.5 rounded-lg border border-emerald-500/20 w-fit">
                                    <Clock size={12}/> <span>Duração: {os.tempoManutencao}</span>
                                  </div>
                                )}
                              </div>

                              {/* Painel Central: QRU */}
                              <div className="space-y-1">
                                <h5 className="font-bold text-[10px] uppercase text-amber-500 tracking-wider">Descrição do Problema (QRU)</h5>
                                <p className="text-slate-400 italic bg-agro-dark/40 p-2.5 rounded-xl border border-agro-border/30">
                                  "{os.qruDescricao || 'Nenhuma observação descrita no chamado inicial.'}"
                                </p>
                              </div>

                              {/* Painel Direito: Ação Técnica */}
                              <div className="space-y-1">
                                <h5 className="font-bold text-[10px] uppercase text-emerald-400 tracking-wider">Ação Corretiva Realizada</h5>
                                {os.solucaoTecnico ? (
                                  <p className="text-slate-200 bg-emerald-950/20 border border-emerald-500/20 p-2.5 rounded-xl font-mono">
                                    {os.solucaoTecnico}
                                  </p>
                                ) : (
                                  <p className="text-slate-500 italic p-2">Nenhuma solução ou encerramento técnico registrado ainda.</p>
                                )}
                              </div>

                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500 italic">Nenhum registro encontrado.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
