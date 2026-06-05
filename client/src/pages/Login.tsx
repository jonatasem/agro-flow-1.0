import { useState } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { useSubmit } from '../hook/useSubmit.js';
import { ShieldAlert, Loader2, Tractor } from 'lucide-react';

export default function Login() {
  const [matricula, setMatricula] = useState('');
  const [erro, setErro] = useState('');
  const { login } = useAuth();
  const { isSubmitting, handleSubmit } = useSubmit();

  const handleLoginSubmit = handleSubmit(async () => {
    setErro('');
    
    if (!matricula.trim()) {
      setErro('Por favor, insira a matrícula.');
      return;
    }

    // O login do AuthContext agora usa o Axios apontando para a rota certa
    const sucesso = await login(matricula.trim());
    
    if (!sucesso) {
      setErro('Matrícula não cadastrada ou sem autorização de acesso.');
    }
  });

  return (
    <div className="min-h-screen bg-agro-dark flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-[#181b26] border border-agro-border rounded-2xl p-8 shadow-2xl text-xs">
        
        {/* Topo do Card */}
        <div className="text-center mb-6 flex flex-col items-center">
          <div className="w-12 h-12 bg-green-500/10 border border-green-500/20 text-green-400 rounded-full flex items-center justify-center mb-3 shadow-lg shadow-green-500/5">
            <Tractor size={24} />
          </div>
          <h2 className="text-md font-black text-white uppercase tracking-wider">
            Zilor Core - Login
          </h2>
          <p className="text-slate-400 mt-1 text-[11px]">
            Insira seu código operacional autorizado para acessar.
          </p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1.5">
              Matrícula do Colaborador *
            </label>
            <input
              type="text"
              required
              disabled={isSubmitting}
              placeholder=""
              value={matricula}
              onChange={(e) => setMatricula(e.target.value)}
              className="w-full bg-agro-dark border border-agro-border rounded-xl p-3 text-sm text-slate-200 outline-none text-center font-black tracking-widest focus:border-green-500/50 transition disabled:opacity-50"
            />
          </div>

          {/* Alerta de Erro */}
          {erro && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl flex items-center justify-center gap-2 font-medium animate-fadeIn">
              <ShieldAlert size={16} className="shrink-0" />
              <span>{erro}</span>
            </div>
          )}

          {/* Botão de Entrada */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-green-500 hover:bg-green-600 disabled:bg-slate-700 disabled:text-slate-400 text-slate-950 py-3 rounded-xl font-black uppercase tracking-wider text-xs transition flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Autenticando...
              </>
            ) : (
              'Entrar no Painel'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}