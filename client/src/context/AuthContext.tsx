import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import api from '../services/api'; 

interface UsuarioLogado {
  matricula: string;
  nome: string;
}

interface AuthContextType {
  usuario: UsuarioLogado | null;
  token: string | null;
  login: (matricula: string) => Promise<boolean>;
  logout: () => void;
  carregando: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<UsuarioLogado | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const tokenSalvo = localStorage.getItem('agro_os_token');
    const usuarioSalvo = localStorage.getItem('agro_os_user');
    const expiracao = localStorage.getItem('agro_os_exp');

    if (tokenSalvo && usuarioSalvo && expiracao) {
      // Verifica se o tempo atual ainda é menor que o timestamp de expiração salvo
      if (Date.now() < Number(expiracao)) {
        setToken(tokenSalvo);
        setUsuario(JSON.parse(usuarioSalvo));
      } else {
        efetuarLogout();
      }
    }
    setCarregando(false);
  }, []);

  const efetuarLogout = () => {
    localStorage.removeItem('agro_os_token');
    localStorage.removeItem('agro_os_user');
    localStorage.removeItem('agro_os_exp');
    setUsuario(null);
    setToken(null);
  };

  const login = async (matricula: string): Promise<boolean> => {
    try {
      const response = await api.post('/autorizados', { matricula });
      const dados = response.data; 
      
      // Ajustado para 8 horas (8 * 60 * 60 * 1000) para alinhar perfeitamente com a validade do JWT do Backend
      const tempoExpiracao = Date.now() + 8 * 60 * 60 * 1000;

      localStorage.setItem('agro_os_token', dados.token);
      localStorage.setItem('agro_os_user', JSON.stringify(dados.usuario));
      localStorage.setItem('agro_os_exp', tempoExpiracao.toString());

      setToken(dados.token);
      setUsuario(dados.usuario);
      return true;
    } catch (error) {
      console.error("Erro no login estratégico Zilor:", error);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ usuario, token, login, logout: efetuarLogout, carregando }}>
      {!carregando && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  return context;
}
