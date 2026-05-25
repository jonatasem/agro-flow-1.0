import { useState, useMemo } from 'react';
import type { OrdemServicoAgro } from '../interface/index';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { Calendar, SlidersHorizontal, Sliders, Truck, User, Building } from 'lucide-react';

interface TelaHistoricoProps {
  ordens: OrdemServicoAgro[];
}

export default function TelaHistorico({ ordens }: TelaHistoricoProps) {
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [setor, setSetor] = useState<string>('TODOS');
  const [usina, setUsina] = useState<string>('TODOS');
  const [equipamento, setEquipamento] = useState('');
  const [operador, setOperador] = useState('');

  // Processamento do Multi-filtro Acumulativo
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

  // Cálculos Estatísticos de Porcentagem
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
    <div className="space-y-6 text-xs">
      {/* SEÇÃO DE FILTROS AVANÇADOS */}
      <section className="bg-[#181b26] border border-[#2a3042] rounded-2xl p-5 shadow-lg">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2 uppercase tracking-wider">
          <Sliders size={14} className="text-amber-500" /> Painel de Filtros Avançados
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 items-end">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1 flex items-center gap-1"><Calendar size={10}/> Data Inicial</label>
            <input type="date" value={dataInicio} onChange={e => setDataInicio(e.target.value)} className="w-full bg-[#12141c] border border-[#2a3042] rounded-xl p-2 text-slate-200 outline-none" />
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1 flex items-center gap-1"><Calendar size={10}/> Data Final</label>
            <input type="date" value={dataFim} onChange={e => setDataFim(e.target.value)} className="w-full bg-[#12141c] border border-[#2a3042] rounded-xl p-2 text-slate-200 outline-none" />
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1 flex items-center gap-1"><SlidersHorizontal size={10}/> Filtrar Setor</label>
            <select value={setor} onChange={e => setSetor(e.target.value)} className="w-full bg-[#12141c] border border-[#2a3042] rounded-xl p-2 text-slate-220 outline-none">
              <option value="TODOS">⚡ TODOS OS SETORES</option>
              <option value="Agricultura de Precisão">📡 Agricultura de Precisão</option>
              <option value="Elétrica Automotiva">⚡ Elétrica Automotiva</option>
              <option value="Mecânica/Hidráulica">🔧 Mecânica/Hidráulica</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1 flex items-center gap-1"><Building size={10}/> Filtrar Usina</label>
            <select value={usina} onChange={e => setUsina(e.target.value)} className="w-full bg-[#12141c] border border-[#2a3042] rounded-xl p-2 text-slate-200 outline-none">
              {listaUsinas.map(u => (
                <option key={u} value={u}>{u === 'TODOS' ? '🏭 TODAS AS USINAS' : `🏭 ${u}`}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1 flex items-center gap-1"><Truck size={10}/> Equipamento</label>
            <input type="text" placeholder="Ex: 8500" value={equipamento} onChange={e => setEquipamento(e.target.value)} className="w-full bg-[#12141c] border border-[#2a3042] rounded-xl p-2 text-slate-200 outline-none" />
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1 flex items-center gap-1"><User size={10}/> Operador</label>
            <input type="text" placeholder="Ex: 23805" value={operador} onChange={e => setOperador(e.target.value)} className="w-full bg-[#12141c] border border-[#2a3042] rounded-xl p-2 text-slate-200 outline-none" />
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button 
            onClick={() => { setDataInicio(''); setDataFim(''); setSetor('TODOS'); setUsina('TODOS'); setEquipamento(''); setOperador(''); }}
            className="bg-[#1e2230] hover:bg-[#2a3042] border border-[#2a3042] text-slate-300 font-bold px-4 py-2 rounded-xl transition cursor-pointer"
          >
            Resetar Filtros
          </button>
        </div>
      </section>

      {/* MÉTRICAS E PORCENTAGEM POR GRÁFICO */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-4">
          <div className="bg-[#181b26] border border-[#2a3042] p-4 rounded-2xl flex flex-col justify-center min-h-[90px]">
            <span className="text-[10px] font-bold uppercase text-slate-400">Total O.S. Filtradas</span>
            <span className="text-3xl font-black text-white mt-1">{analiseMetricas.totalChamados}</span>
          </div>

          <div className="bg-[#181b26] border border-amber-500/20 p-4 rounded-2xl flex flex-col justify-center min-h-[90px]">
            <span className="text-[10px] font-bold uppercase text-amber-500">Porcentagem de Erro Operacional</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black text-amber-400">{analiseMetricas.porcentagemOperacional}%</span>
              <span className="text-slate-400 font-bold text-xs">({analiseMetricas.erroOperacionalQtd} O.S.)</span>
            </div>
          </div>
        </div>

        <div className="bg-[#181b26] border border-[#2a3042] p-5 rounded-2xl lg:col-span-2 shadow-md flex flex-col justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">Impacto Percentual por Tipo de Causa (O.S. Concluídas)</h4>
          
          {analiseMetricas.totalConcluidos > 0 ? (
            <div className="flex flex-col sm:flex-row items-center justify-around h-[160px]">
              <div className="w-[160px] h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={analiseMetricas.dadosGrafico} cx="50%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={4} dataKey="value">
                      {analiseMetricas.dadosGrafico.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1e2230', borderColor: '#2a3042', borderRadius: '10px' }}/>
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-2 text-xs font-bold text-slate-300 w-full sm:w-auto">
                {analiseMetricas.dadosGrafico.map((item, index) => (
                  <div key={index} className="flex items-center justify-between gap-6 bg-[#12141c]/40 p-2 rounded-xl border border-[#2a3042]/30">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span>{item.name}</span>
                    </div>
                    <span className="text-white font-black">{item.porcentagem}%</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-[160px] flex items-center justify-center text-slate-500 italic">
              Nenhum dado concluído para calcular gráficos no filtro selecionado.
            </div>
          )}
        </div>
      </div>

      {/* RELATÓRIO IMPRESSO EM TABELA */}
      <section className="bg-[#181b26] border border-[#2a3042] rounded-2xl overflow-hidden shadow-lg">
        <div className="p-4 border-b border-[#2a3042] bg-[#1a1e2b]">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Registros Gerais do Histórico</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#12141c] text-slate-400 text-[10px] font-bold uppercase tracking-wider border-b border-[#2a3042]">
                <th className="p-3">Identificação</th>
                <th className="p-3">Equipamento</th>
                <th className="p-3">Usina / Frente</th>
                <th className="p-3">Setor Responsável</th>
                <th className="p-3">Causa Real</th>
                <th className="p-3">Histórico Técnico</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a3042]/50 text-slate-300">
              {dadosFiltrados.map(os => (
                <tr key={os.id} className="hover:bg-[#1e2230]/40 transition text-[11px]">
                  <td className="p-3">
                    <div className="font-bold text-white">{os.id}</div>
                    <div className="text-[10px] text-slate-500">{os.dataCriacao} - {os.horaCriacao}</div>
                  </td>
                  <td className="p-3 font-bold text-amber-500">🚜 {os.prefixoTrator}</td>
                  <td className="p-3">
                    <div>{os.usinaBase || 'Geral'}</div>
                  </td>
                  <td className="p-3">
                    <span className="bg-[#12141c] border border-[#2a3042] px-2 py-0.5 rounded text-slate-400">
                      {os.triagemSetor}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={`font-bold ${os.status !== 'concluido' ? 'text-slate-500' : os.tipoCausa === 'Hardware (Defeito Real)' ? 'text-emerald-400' : os.tipoCausa === 'Erro Operacional (Falta de Treinamento)' ? 'text-amber-400' : 'text-blue-400'}`}>
                      {os.status !== 'concluido' ? '⚠️ Em aberto' : os.tipoCausa}
                    </span>
                  </td>
                  <td className="p-3 max-w-xs truncate italic text-slate-400">
                    {os.solucaoTecnico || os.qruDescricao}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
