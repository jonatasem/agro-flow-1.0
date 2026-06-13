import { useState, useCallback, useRef } from 'react';

export function useSubmit() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  // A Ref muda de forma síncrona e imediata, bloqueando cliques concorrentes no mesmo milissegundo
  const emAndamento = useRef(false);

  const handleSubmit = useCallback((callback: () => Promise<void> | void) => {
    return async (e?: React.FormEvent) => {
      if (e && typeof e.preventDefault === 'function') {
        e.preventDefault();
      }

      // Se a Ref ou o estado indicarem envio, ignora sumariamente
      if (emAndamento.current || isSubmitting) return;

      // Trava o gatilho imediatamente de forma síncrona
      emAndamento.current = true;
      setIsSubmitting(true);

      try {
        await callback();
      } catch (error) {
        console.error("Erro ao processar envio do formulário Agro:", error);
      } finally {
        // Libera os gatilhos para novos envios
        emAndamento.current = false;
        setIsSubmitting(false);
      }
    };
  }, [isSubmitting]); // Mantido para consistência de escopo do estado

  return { isSubmitting, handleSubmit };
}
