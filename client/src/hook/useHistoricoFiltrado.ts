import { useState, useMemo } from 'react';
import type { OrdemServicoAgro } from '../interface/index.js';

export function useHistoricoFiltrado(ordens: OrdemServicoAgro[]) {
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [setor, setSetor] = useState<string>('TODOS');
  const [usina, setUsina] = useState<string>('TODOS');
  const [equipamento, setEquipamento] = useState('');
  const [operador, setOperador] = useState('');
  const [idExpandido, setIdExpandido] = useState<string | null>(null);

  const alternarExpansao = (id: string) => setIdExpandido(idExpandido === id ? null : id);
  
  const resetarFiltros = () => {
    setDataInicio(''); setDataFim(''); setSetor('TODOS');
    setUsina('TODOS'); setEquipamento(''); setOperador(''); setIdExpandido(null);
  };

  const dadosFiltrados = useMemo(() => {
    return ordens.filter(os => {
      if (dataInicio && os.dataCriacao < dataInicio) return false;
      if (dataFim && os.dataCriacao > dataFim) return false;
      if (setor !== 'TODOS' && !os.setorOs.some(s => s.setor === setor)) return false;
      if (usina !== 'TODOS' && os.usinaBase?.toLowerCase().trim() !== usina.toLowerCase().trim()) return false;
      if (equipamento && !os.prefixoTrator.toLowerCase().includes(equipamento.toLowerCase())) return false;
      if (operador && !os.idOperador.toLowerCase().includes(operador.toLowerCase())) return false;
      return true;
    });
  }, [ordens, dataInicio, dataFim, setor, usina, equipamento, operador]);

  const analiseMetricas = useMemo(() => {
    let hardware = 0, operacional = 0, sinal = 0;
    let totalSetores = 0;

    dadosFiltrados.forEach(os => {
      os.setorOs.forEach(s => {
        if (setor === 'TODOS' || s.setor === setor) {
          totalSetores++;
          
          if (s.status === 'concluido' && s.tipoCausa) {
            if (s.tipoCausa === 'Hardware (Defeito Real)') hardware++;
            else if (s.tipoCausa === 'Erro Operacional') operacional++;
            else if (s.tipoCausa === 'Infraestrutura (Sinal)') sinal++;
          }
        }
      });
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
      totalChamados: totalSetores,
      totalConcluidos,
      erroOperacionalQtd: operacional,
      porcentagemOperacional: totalConcluidos > 0 ? ((operacional / totalConcluidos) * 100).toFixed(1) : '0'
    };
  }, [dadosFiltrados, setor]);

  const listaUsinas = useMemo(() => {
    const usinas = new Set(ordens.map(o => o.usinaBase?.trim()).filter(Boolean));
    return ['TODOS', ...Array.from(usinas)];
  }, [ordens]);

  return {
    filtros: { dataInicio, setDataInicio, dataFim, setDataFim, setor, setSetor, usina, setUsina, equipamento, setEquipamento, operador, setOperador },
    idExpandido, alternarExpansao, resetarFiltros, dadosFiltrados, analiseMetricas, listaUsinas
  };
}