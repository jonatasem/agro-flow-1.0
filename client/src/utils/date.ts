/**
 * Formata uma string de data para o padrão brasileiro (DD/MM/AAAA)
 */
export const formatarDataBR = (dataString: string | undefined): string => {
  if (!dataString) return '---';
  
  const data = new Date(dataString);
  
  // Tratamento caso a string seja um ISO simples (AAAA-MM-DD) e o Date() falhe/aplique fuso incorreto
  if (isNaN(data.getTime())) {
    const partes = dataString.split(/[-/]/);
    if (partes.length === 3 && partes[0].length === 4) {
      return `${partes[2]}/${partes[1]}/${partes[0]}`;
    }
    return dataString;
  }

  // Formatação segura isolando o fuso horário (UTC)
  const dia = String(data.getUTCDate()).padStart(2, '0');
  const mes = String(data.getUTCMonth() + 1).padStart(2, '0');
  const ano = data.getUTCFullYear();
  
  return `${dia}/${mes}/${ano}`;
};
