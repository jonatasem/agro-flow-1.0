import { useMemo } from 'react';

interface OpcaoBusca {
  [key: string]: any;
}

export function useBuscaProxima<T extends OpcaoBusca>(
  lista: T[],
  termoDigitado: string,
  chaveFiltro: keyof T,
  limite: number = 5
) {
  return useMemo(() => {
    const listaValida = Array.isArray(lista) ? lista : [];
    const busca = termoDigitado.trim().toLowerCase();

    if (!busca) {
      return listaValida.slice(0, limite);
    }

    return listaValida
      .filter(item => {
        if (!item || item[chaveFiltro] === undefined || item[chaveFiltro] === null) return false;
        
        const valorCampo = String(item[chaveFiltro]).toLowerCase();
        return valorCampo.includes(busca);
      })
      .sort((a, b) => {
        const valorA = String(a[chaveFiltro] ?? '').toLowerCase();
        const valorB = String(b[chaveFiltro] ?? '').toLowerCase();

        const aComecaCom = valorA.startsWith(busca);
        const bComecaCom = valorB.startsWith(busca);

        if (aComecaCom && !bComecaCom) return -1;
        if (!aComecaCom && bComecaCom) return 1;

        return valorA.length - valorB.length || valorA.localeCompare(valorB);
      })
      .slice(0, limite);
  }, [lista, termoDigitado, chaveFiltro, limite]);
}