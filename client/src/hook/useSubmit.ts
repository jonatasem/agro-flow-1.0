import { useState, useCallback } from 'react';

export function useSubmit() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = useCallback((callback: () => void | Promise<void>) => {
    return async (e: React.FormEvent) => {
      if (e && e.preventDefault) e.preventDefault();

      // Se já estiver enviando, ignora cliques repetidos
      if (isSubmitting) return;

      setIsSubmitting(true);

      try {
        // Aguarda a execução da função (importante que onSalvar retorne uma Promise)
        await callback();
      } catch (error) {
        console.error("Erro ao processar envio:", error);
      } finally {
        // Libera o botão novamente se necessário (caso precise corrigir algo)
        setIsSubmitting(false);
      }
    };
  }, [isSubmitting]);

  return { isSubmitting, handleSubmit };
}