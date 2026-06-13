import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext.js'; // 🔥 IMPORTAÇÃO DO CONTEXTO DE AUTENTICAÇÃO
import type { Equipamento, Operador } from '../interface/index.js';

export function useDadosMestre() {
  const { token } = useAuth(); // 🔥 PEGA O TOKEN EM TEMPO REAL
  const [frotasCadastradas, setFrotasCadastradas] = useState<Equipamento[]>([]);
  const [operadoresCadastrados, setOperadoresCadastrados] = useState<Operador[]>([]);
  const [carregando, setCarregando] = useState<boolean>(true);
  const [erro, setErro] = useState<unknown>(null);

  useEffect(() => {
    // 🚨 SE NÃO HÁ TOKEN AINDA, NÃO ATIRA NA API PARA NÃO GERAR ERRO 401
    if (!token) {
      setCarregando(false);
      return;
    }

    let componenteAtivo = true;

    const carregarDados = async () => {
      try {
        setCarregando(true);
        
        // Garante que o cabeçalho está injetado localmente para essa chamada caso o App.tsx atrase
        const resposta = await Promise.all([
          api.get('/frotas-mestre', { headers: { Authorization: `Bearer ${token}` } }),
          api.get('/operadores-mestre', { headers: { Authorization: `Bearer ${token}` } })
        ]);
        
        if (componenteAtivo) {
          setFrotasCadastradas(resposta[0].data);
          setOperadoresCadastrados(resposta[1].data);
          setErro(null);
        }
      } catch (error) {
        if (componenteAtivo) {
          console.error("Erro ao carregar dados mestre globais Zilor:", error);
          setErro(error);
        }
      } finally {
        if (componenteAtivo) {
          setCarregando(false);
        }
      }
    };

    carregarDados();

    return () => {
      componenteAtivo = false;
    };
  }, [token]); // 🔥 ADICIONADO TOKEN COMO DEPENDÊNCIA REATIVA

  return { frotasCadastradas, operadoresCadastrados, carregando, erro };
}

