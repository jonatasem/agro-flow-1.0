import { useState, useEffect } from 'react';
import api from '../services/api';
import type { Equipamento, Operador } from '../interface/index.js';

export function useDadosMestre() {
  const [frotasCadastradas, setFrotasCadastradas] = useState<Equipamento[]>([]);
  const [operadoresCadastrados, setOperadoresCadastrados] = useState<Operador[]>([]);
  const [carregando, setCarregando] = useState<boolean>(true);
  const [erro, setErro] = useState<unknown>(null);

  useEffect(() => {
    const carregarDados = async () => {
      try {
        setCarregando(true);
        const [resFrotas, resOperadores] = await Promise.all([
          api.get('/frotas-mestre'),
          api.get('/operadores-mestre')
        ]);
        setFrotasCadastradas(resFrotas.data);
        setOperadoresCadastrados(resOperadores.data);
      } catch (error) {
        console.error("Erro ao carregar dados mestre globais:", error);
        setErro(error);
      } finally {
        setCarregando(false);
      }
    };

    carregarDados();
  }, []); // Executa apenas uma vez quando o app ou componente que o chama monta

  return { frotasCadastradas, operadoresCadastrados, carregando, erro };
}
