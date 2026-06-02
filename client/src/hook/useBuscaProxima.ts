import { useMemo } from 'react';

interface OpcaoBusca {
  [key: string]: any;
}

/**
 * Hook para filtrar e ordenar uma lista baseado no input do usuário por proximidade estrita.
 * @param lista Coleção de dados vinda do banco mestre
 * @param termoDigitado O estado do input atual
 * @param chaveFiltro A propriedade do objeto usada para a busca (ex: 'frota' ou 'codigo')
 * @param limite Quantidade máxima de sugestões no datalist (padrão: 5)
 */
export function useBuscaProxima<T extends OpcaoBusca>(
  lista: T[],
  termoDigitado: string,
  chaveFiltro: keyof T,
  limite: number = 5
) {
  return useMemo(() => {
    const busca = termoDigitado.trim().toLowerCase();

    if (!busca) {
      // Se não digitou nada, retorna os primeiros elementos da lista até o limite
      return lista.slice(0, limite);
    }

    return lista
      .filter(item => {
        const valorCampo = String(item[chaveFiltro]).toLowerCase();
        return valorCampo.includes(busca);
      })
      .sort((a, b) => {
        const valorA = String(a[chaveFiltro]).toLowerCase();
        const valorB = String(b[chaveFiltro]).toLowerCase();

        // 🥇 Regra de ouro: Quem começa com o termo digitado vai pro topo
        const aComecaCom = valorA.startsWith(busca);
        const bComecaCom = valorB.startsWith(busca);

        if (aComecaCom && !bComecaCom) return -1;
        if (!aComecaCom && bComecaCom) return 1;

        // 🥈 Se ambos começam ou ambos contêm no meio, ordena pelo comprimento
        return valorA.length - valorB.length || valorA.localeCompare(valorB);
      })
      .slice(0, limite);
  }, [lista, termoDigitado, chaveFiltro, limite]);
}
