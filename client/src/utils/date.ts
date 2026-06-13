/**
 * Formata de forma segura strings de datas vindas do banco de dados para o padrão brasileiro (DD/MM/AAAA)
 */
export const formatarDataBR = (dataString: string | undefined): string => {
  if (!dataString) return '---';
  
  // ⚡ Atalho de Performance: Se o backend já gravou como DD/MM/AAAA, retorna de imediato
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dataString)) {
    return dataString;
  }

  // Tratamento caso a string seja um ISO simples (AAAA-MM-DD)
  const partesISO = dataString.split(/[-/]/);
  if (partesISO.length === 3 && partesISO[0].length === 4) {
    return `${partesISO[2]}/${partesISO[1]}/${partesISO[0]}`;
  }

  const data = new Date(dataString);
  
  // Se mesmo assim o Date falhar, devolve o fallback bruto enviado
  if (isNaN(data.getTime())) {
    return dataString;
  }

  // Formatação segura isolando o fuso horário (UTC) para objetos de data nativos
  const dia = String(data.getUTCDate()).padStart(2, '0');
  const mes = String(data.getUTCMonth() + 1).padStart(2, '0');
  const ano = data.getUTCFullYear();
  
  return `${dia}/${mes}/${ano}`;
};