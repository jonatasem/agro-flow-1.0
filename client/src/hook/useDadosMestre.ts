import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext.js';
import type { Equipamento, Operador } from '../interface/index.js';

export function useDadosMestre() {
  const { token } = useAuth();
  const [frotasCadastradas, setFrotasCadastradas] = useState<Equipamento[]>([]);
  const [operadoresCadastrados, setOperadoresCadastrados] = useState<Operador[]>([]);
  const [carregando, setCarregando] = useState<boolean>(true);
  const [erro, setErro] = useState<unknown>(null);

  useEffect(() => {
    if (!token) {
      setCarregando(false);
      return;
    }

    let componenteAtivo = true;

    const carregarDados = async () => {
      try {
        setCarregando(true);
        
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
          console.error("Erro ao carregar dados mestre globais:", error);
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
  }, [token]);

  return { frotasCadastradas, operadoresCadastrados, carregando, erro };
}
