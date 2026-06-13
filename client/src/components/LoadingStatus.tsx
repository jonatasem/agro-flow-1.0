import { Loader2 } from 'lucide-react';
import type { LoadingStatusProps } from '../interface/index.js'; 

export default function LoadingStatus({ mensagem = "Conectando ao ecossistema Zilor Atlas..." }: LoadingStatusProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-75 p-8 bg-[#181b26] border border-agro-border/40 rounded-2xl">
      <Loader2 className="animate-spin text-green-500 mb-4" size={40} />
      
      <p className="text-sm font-medium text-slate-300 tracking-wide animate-pulse">
        {mensagem}
      </p>
      
      <span className="text-[10px] text-slate-500 uppercase mt-2 font-bold tracking-wider">
        Aguardando resposta do servidor
      </span>
    </div>
  );
}
