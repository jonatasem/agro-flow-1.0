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
                      <span className="font-medium truncate block text-slate-300">{os.setorOs?.[0]?.setor}</span>
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
                          <span className="text-slate-300 font-medium">{os.setorOs?.[0]?.criadoPor || 'Zilor'}</span>
                        </div>
                      </div>

                      {os.setorOs?.[0]?.tempoManutencao && (
                        <div className="flex items-center gap-1.5 text-emerald-400 font-bold border-b border-agro-border/30 pb-2">
                          <Clock size={12}/>
                          <span>Tempo total de Reparo: {os.setorOs?.[0]?.tempoManutencao}</span>
                        </div>
                      )}

                      <div>
                        <span className="text-[9px] font-bold text-slate-500 block uppercase">Causa Real</span>
                        <span className={`font-bold text-[11px] ${
                          os.setorOs?.[0].status !== 'concluido' 
                            ? 'text-slate-500' 
                            : os.setorOs?.[0].tipoCausa === 'Hardware (Defeito Real)' 
                            ? 'text-emerald-400' 
                            : os.setorOs?.[0].tipoCausa === 'Erro Operacional' 
                            ? 'text-amber-400' 
                            : 'text-blue-400'
                        }`}>
                          {os.setorOs?.[0].status !== 'concluido' ? '⚠️ Em aberto' : os.setorOs?.[0].tipoCausa}
                        </span>
                      </div>
                      
                      <div className="border-t pt-2 border-agro-border/30">
                        <span className="text-[9px] font-bold text-slate-500 block uppercase">Problema Informado (QRU)</span>
                        <p className="text-slate-400 italic">"{os.setorOs?.[0].qruDescricao || 'Sem descrição registrada.'}"</p>
                      </div>

                      {os.setorOs?.[0].solucaoTecnico && (
                        <div className="border-t pt-2 border-agro-border/30">
                          <span className="text-[9px] font-bold text-slate-400 block uppercase">Ação Corretiva do Técnico</span>
                          <p className="text-emerald-400 font-medium font-mono bg-emerald-950/20 p-2 rounded-lg border border-emerald-500/10">{os.setorOs?.[0].solucaoTecnico}</p>
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
              <tr className="bg-agro-dark text-slate-400 font-extrabold border-b border-agro-border text-[11px] uppercase tracking-wider">
                <th className="p-3 w-[15%]">Identificação</th>
                <th className="p-3 w-[12%]">Equipamento</th>
                <th className="p-3 w-[13%]">Usina</th>
                <th className="p-3 w-[20%]">Setores Atendidos</th>
                <th className="p-3 w-[20%]">Causas Diagnosticadas</th>
                <th className="p-3 w-[20%]">Histórico Técnico</th>
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
                        {/* 1. Identificação */}
                        <td className="p-3 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 font-bold text-[11px] text-white">
                            {estaAberto ? <ChevronUp size={12} className="text-amber-500 shrink-0"/> : <ChevronDown size={12} className="text-slate-500 shrink-0"/>}
                            {os.idCustomizado}
                          </div>
                          <div className="text-[10px] text-slate-500 mt-0.5 ml-3.5">{formatarDataBR(os.dataCriacao)} - {os.horaCriacao}</div>
                        </td>
                        
                        {/* 2. Equipamento */}
                        <td className="p-3 font-bold text-amber-500 whitespace-nowrap">
                          🚜 {os.prefixoTrator}
                        </td>
                        
                        {/* 3. Usina */}
                        <td className="p-3 truncate" title={os.usinaBase || 'Geral'}>
                          {os.usinaBase || 'Geral'}
                        </td>
                        
                        {/* 4. Múltiplos Setores Atendidos */}
                        <td className="p-3 space-y-1">
                          {os.setorOs?.map((s, idx) => (
                            <div key={idx} className="font-bold text-slate-200 truncate flex items-center gap-1.5">
                              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${s.status === 'concluido' ? 'bg-green-500' : 'bg-amber-500'}`} />
                              {s.setor}
                            </div>
                          ))}
                        </td>
                        
                        {/* 5. Múltiplas Causas Concorrentes */}
                        <td className="p-3 space-y-1">
                          {os.setorOs?.map((s, idx) => (
                            <div key={idx} className="truncate">
                              <span className={`font-bold text-[10px] ${
                                s.status !== 'concluido' 
                                  ? 'text-slate-500' 
                                  : s.tipoCausa === 'Hardware (Defeito Real)' 
                                  ? 'text-emerald-400' 
                                  : 'text-amber-400'
                              }`}>
                                {s.status !== 'concluido' ? '⚠️ Em aberto' : s.tipoCausa}
                              </span>
                            </div>
                          ))}
                        </td>
                        
                        {/* 6. Múltiplos Históricos Técnicos resumidos */}
                        <td className="p-3 space-y-1 text-slate-400 italic">
                          {os.setorOs?.map((s, idx) => (
                            <div key={idx} className="truncate" title={s.solucaoTecnico || s.qruDescricao}>
                              {s.solucaoTecnico ? `✓ ${s.solucaoTecnico}` : `⚙️ QRU: ${s.qruDescricao}`}
                            </div>
                          ))}
                        </td>
                      </tr>

                      {/* Linha Subterrânea Expandida Dinâmica */}
                      {estaAberto && (
                        <tr className="bg-agro-dark/60 border-t-0">
                          <td colSpan={6} className="p-4 border-l-2 border-amber-500 bg-agro-dark/40">
                            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 text-[11px] text-slate-300">
                              
                              {/* Painel Esquerdo Fixo: Metadados da O.S */}
                              <div className="space-y-2 border-r border-agro-border/30 pr-4 lg:col-span-1">
                                <h5 className="font-black text-[10px] uppercase text-slate-500 tracking-wider">Metadados Gerais</h5>
                                <div><strong>Operador Frota:</strong> <span className="text-slate-200">{os.idOperador}</span></div>
                                <div><strong>Frente Trabalho:</strong> <span className="text-slate-200">{os.frente}</span></div>
                                <div><strong>Atividade Fim:</strong> <span className="text-slate-200">{os.atividade}</span></div>
                                <div className="text-[10px] text-slate-500 font-mono mt-2 pt-2 border-t border-agro-border/20">
                                  Sync Atlas: {os.atualizadoEm}
                                </div>
                              </div>

                              {/* Painel Central/Direito: Loop Dinâmico de todas as Oficinas Injetadas */}
                              <div className="lg:col-span-3 space-y-3">
                                <h5 className="font-black text-[10px] uppercase text-amber-500 tracking-wider">Histórico de Fluxo por Oficina</h5>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  {os.setorOs?.map((setor, sIdx) => (
                                    <div key={sIdx} className="bg-agro-card border border-agro-border rounded-xl p-3 flex flex-col justify-between space-y-2 shadow-inner">
                                      
                                      <div className="flex justify-between items-center border-b border-agro-border/30 pb-1.5">
                                        <span className="font-black text-white text-[11px]">{setor.setor}</span>
                                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                                          setor.status === 'concluido' 
                                            ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                        }`}>
                                          {setor.status === 'aguardando_manutencao' ? 'Aguardando' : setor.status}
                                        </span>
                                      </div>

                                      <div className="space-y-1">
                                        <div className="text-[10px] text-slate-500 uppercase font-bold">Problema Relatado (QRU)</div>
                                        <p className="text-slate-300 italic">"{setor.qruDescricao}"</p>
                                        <div className="text-[9px] text-slate-500 font-medium">Aberto por: {setor.criadoPor} | {setor.dataCriacao} - {setor.horaCriacao}</div>
                                      </div>

                                      {setor.status === 'concluido' ? (
                                        <div className="border-t border-dashed border-agro-border/50 pt-2 space-y-1 bg-emerald-950/10 p-2 rounded-lg mt-1">
                                          <div className="text-[10px] text-emerald-400 uppercase font-bold">Ação Técnica Realizada</div>
                                          <p className="text-slate-200 font-mono text-[10px]">{setor.solucaoTecnico}</p>
                                          
                                          <div className="grid grid-cols-2 text-[9px] text-slate-500 font-medium pt-1">
                                            <span>Responsável: <span className="text-slate-400">{setor.tecnicoResponsavel}</span></span>
                                            <span className="text-right flex items-center justify-end gap-1"><Clock size={10}/> {setor.tempoManutencao}</span>
                                          </div>
                                        </div>
                                      ) : (
                                        <div className="text-slate-500 text-[10px] italic p-1.5 bg-slate-900/30 border border-dashed border-agro-border/40 rounded-lg text-center font-medium">
                                          Aguardando diagnóstico e encerramento técnico da oficina.
                                        </div>
                                      )}

                                    </div>
                                  ))}
                                </div>
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