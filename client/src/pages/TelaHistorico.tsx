import { useState, useMemo, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { Calendar, SlidersHorizontal, Sliders, Truck, User, Building, FileText } from 'lucide-react';

// 📡 Conexão com a API e tipos do banco de dados
import api from '../services/api';
import type { Equipamento, Operador } from '../interface/index.js';

interface TelaHistoricoProps {
  ordens: any[];
}

export default function TelaHistorico({ ordens }: TelaHistoricoProps) {
  // Estados dos Filtros Avançados
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [setor, setSetor] = useState<string>('TODOS');
  const [usina, setUsina] = useState<string>('TODOS');
  const [equipamento, setEquipamento] = useState('');
  const [operador, setOperador] = useState('');

  // 📦 Estados dinâmicos alimentados via API do MongoDB Atlas
  const [frotasCadastradas, setFrotasCadastradas] = useState<Equipamento[]>([]);
  const [operadoresCadastrados, setOperadoresCadastrados] = useState<Operador[]>([]);

  // 🔄 Carrega os dados mestre do MongoDB para habilitar o autocomplete buscador
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
    <div className="space-y-6 text-xs antialiased text-slate-200">
      {/* SEÇÃO DE FILTROS AVANÇADOS */}
      <section className="bg-[#181b26] border border-agro-border rounded-2xl p-5 shadow-lg">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2 uppercase tracking-wider">
          <Sliders size={14} className="text-amber-500" /> Painel de Filtros Avançados
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 items-end">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 flex items-center gap-1"><Calendar size={10}/> Data Inicial</label>
            <input type="date" value={dataInicio} onChange={e => setDataInicio(e.target.value)} className="w-full bg-agro-dark border border-agro-border rounded-xl p-2 text-slate-200 outline-none focus:border-amber-500/50 transition shadow-inner" />
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 flex items-center gap-1"><Calendar size={10}/> Data Final</label>
            <input type="date" value={dataFim} onChange={e => setDataFim(e.target.value)} className="w-full bg-agro-dark border border-agro-border rounded-xl p-2 text-slate-200 outline-none focus:border-amber-500/50 transition shadow-inner" />
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 flex items-center gap-1"><SlidersHorizontal size={10}/> Filtrar Setor</label>
            <select value={setor} onChange={e => setSetor(e.target.value)} className="w-full bg-agro-dark border border-agro-border rounded-xl p-2 text-slate-200 outline-none focus:border-amber-500/50 transition">
              <option value="TODOS">⚡ TODOS OS SETORES</option>
              <option value="Agricultura de Precisão">📡 Agricultura de Precisão</option>
              <option value="Elétrica">⚡ Elétrica</option>
              <option value="Mecânica">🔧 Mecânica</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 flex items-center gap-1"><Building size={10}/> Filtrar Usina</label>
            <select value={usina} onChange={e => setUsina(e.target.value)} className="w-full bg-agro-dark border border-agro-border rounded-xl p-2 text-slate-200 outline-none focus:border-amber-500/50 transition">
              {listaUsinas.map(u => (
                <option key={u} value={u}>{u === 'TODOS' ? '🏭 TODAS AS USINAS' : `🏭 ${u}`}</option>
              ))}
            </select>
          </div>

          {/* Autocomplete Buscador de Frotas/Equipamentos */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 flex items-center gap-1"><Truck size={10}/> Equipamento</label>
            <input 
              type="text" 
              list="lista-equipamentos-db"
              placeholder="Ex: 8500" 
              value={equipamento} 
              onChange={e => setEquipamento(e.target.value)} 
              className="w-full bg-agro-dark border border-agro-border rounded-xl p-2 text-slate-200 outline-none focus:border-amber-500/50 transition" 
            />
            <datalist id="lista-equipamentos-db">
              {frotasCadastradas.map(frota => (
                <option key={frota.prefixo} value={frota.prefixo}>
                  {frota.modeloEquipamento} ({frota.usinaAlocada})
                </option>
              ))}
            </datalist>
          </div>

          {/* Autocomplete Buscador de Operadores */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 flex items-center gap-1"><User size={10}/> Operador</label>
            <input 
              type="text" 
              list="lista-operadores-db"
              placeholder="Ex: 23805" 
              value={operador} 
              onChange={e => setOperador(e.target.value)} 
              className="w-full bg-agro-dark border border-agro-border rounded-xl p-2 text-slate-200 outline-none focus:border-amber-500/50 transition" 
            />
            <datalist id="lista-operadores-db">
              {operadoresCadastrados.map(op => (
                <option key={op.codigo} value={op.codigo}>
                  {op.nome}
                </option>
              ))}
            </datalist>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button 
            onClick={() => { setDataInicio(''); setDataFim(''); setSetor('TODOS'); setUsina('TODOS'); setEquipamento(''); setOperador(''); }}
            className="bg-agro-card hover:bg-agro-border border border-agro-border text-slate-300 font-bold px-4 py-2 rounded-xl transition cursor-pointer"
          >
            Resetar Filtros
          </button>
        </div>
      </section>

      {/* MÉTRICAS E PORCENTAGEM POR GRÁFICO */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
          <div className="bg-[#181b26] border border-agro-border p-5 rounded-2xl flex flex-col justify-center h-full min-h-23.75 shadow-md">
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Total O.S. Filtradas</span>
            <span className="text-3xl font-black text-white mt-1">{analiseMetricas.totalChamados}</span>
          </div>

          <div className="bg-[#181b26] border border-amber-500/20 p-5 rounded-2xl flex flex-col justify-center h-full min-h-23.75 shadow-md">
            <span className="text-[10px] font-bold uppercase text-amber-500 tracking-wider">Índice Erro Operacional</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black text-amber-400">{analiseMetricas.porcentagemOperacional}%</span>
              <span className="text-slate-400 font-bold text-xs">({analiseMetricas.erroOperacionalQtd} O.S.)</span>
            </div>
          </div>
        </div>

        <div className="bg-[#181b26] border border-agro-border p-5 rounded-2xl lg:col-span-2 shadow-md flex flex-col justify-between min-h-50">
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-4">Impacto Percentual por Tipo de Causa (O.S. Concluídas)</h4>
          
          {analiseMetricas.totalConcluidos > 0 ? (
            <div className="flex flex-col sm:flex-row items-center gap-6 justify-start w-full h-full">
              <div className="w-35 h-35 shrink-0 relative mx-auto sm:mx-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={analiseMetricas.dadosGrafico} cx="50%" cy="50%" innerRadius={42} outerRadius={60} paddingAngle={4} dataKey="value">
                      {analiseMetricas.dadosGrafico.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1e2230', borderColor: '#2a3042', borderRadius: '10px', fontSize: '11px' }}/>
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-1 gap-2 w-full">
                {analiseMetricas.dadosGrafico.map((item, index) => (
                  <div key={index} className="flex items-center justify-between gap-4 bg-agro-dark/50 p-2.5 rounded-xl border border-agro-border/30 w-full">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="text-slate-300 font-medium truncate">{item.name}</span>
                    </div>
                    <span className="text-white font-black shrink-0">{item.porcentagem}%</span>
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
      <section className="bg-[#181b26] border border-agro-border rounded-2xl overflow-hidden shadow-lg">
        <div className="p-4 border-b border-agro-border bg-[#1a1e2b] flex items-center gap-2">
          <FileText size={14} className="text-slate-400" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Registros Gerais do Histórico</h4>
        </div>

        {/* 1. LAYOUT ADAPTADO PARA MOBILE (CARDS) */}
        <div className="block md:hidden divide-y divide-agro-border/60 bg-[#151822]">
          {dadosFiltrados.length > 0 ? (
            dadosFiltrados.map(os => (
              <div key={os.idCustomizado} className="p-4 space-y-3 hover:bg-agro-card/30 transition">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 block uppercase">Identificação</span>
                    <span className="font-bold text-white text-xs">{os.idCustomizado}</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">{os.dataCriacao} às {os.horaCriacao}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-slate-500 block uppercase">Equipamento</span>
                    <span className="font-bold text-amber-500 text-xs block">🚜 {os.prefixoTrator}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                  <div>
                    <span className="text-[9px] font-bold text-slate-500 block uppercase">Usina</span>
                    <span className="text-slate-300 font-medium truncate block">{os.usinaBase || 'Geral'}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-500 block uppercase">Setor Responsável</span>
                    <span className="text-slate-300 font-medium truncate block">{os.triagemSetor}</span>
                  </div>
                </div>

                <div className="bg-agro-dark/60 p-2.5 rounded-xl border border-agro-border/40 space-y-1.5">
                  <div>
                    <span className="text-[9px] font-bold text-slate-500 block uppercase">Causa Real</span>
                    <span className={`font-bold text-[11px] ${os.status !== 'concluido' ? 'text-slate-500' : os.tipoCausa === 'Hardware (Defeito Real)' ? 'text-emerald-400' : os.tipoCausa === 'Erro Operacional (Falta de Treinamento)' ? 'text-amber-400' : 'text-blue-400'}`}>
                      {os.status !== 'concluido' ? '⚠️ Em aberto' : os.tipoCausa}
                    </span>
                  </div>
                  <div className="border-t border-agro-border/30 pt-1.5">
                    <span className="text-[9px] font-bold text-slate-500 block uppercase">Histórico Técnico</span>
                    <p className="text-slate-400 italic text-[11px] wrap-break-word line-clamp-3">
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
              <tr className="bg-agro-dark text-slate-400 text-[10px] font-bold uppercase tracking-wider border-b border-agro-border">
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
                dadosFiltrados.map(os => (
                  <tr key={os.idCustomizado} className="hover:bg-agro-card/40 transition text-[11px]">
                    <td className="p-3 whitespace-nowrap">
                      <div className="font-bold text-white text-[11px]">{os.idCustomizado}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{os.dataCriacao} - {os.horaCriacao}</div>
                    </td>
                    <td className="p-3 font-bold text-amber-500 whitespace-nowrap">
                      🚜 {os.prefixoTrator}
                    </td>
                    <td className="p-3 truncate" title={os.usinaBase || 'Geral'}>
                      {os.usinaBase || 'Geral'}
                    </td>
                    <td className="p-3">
                      <span className="bg-agro-dark border border-agro-border px-2 py-0.5 rounded text-slate-400 block text-center truncate" title={os.triagemSetor}>
                        {os.triagemSetor}
                      </span>
                    </td>
                    <td className="p-3 truncate">
                      <span className={`font-bold ${os.status !== 'concluido' ? 'text-slate-500' : os.tipoCausa === 'Hardware (Defeito Real)' ? 'text-emerald-400' : os.tipoCausa === 'Erro Operacional (Falta de Treinamento)' ? 'text-amber-400' : 'text-blue-400'}`} title={os.status !== 'concluido' ? 'Em aberto' : os.tipoCausa}>
                        {os.status !== 'concluido' ? '⚠️ Em aberto' : os.tipoCausa}
                      </span>
                    </td>
                    <td className="p-3 text-slate-400 italic truncate" title={os.solucaoTecnico || os.qruDescricao}>
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
