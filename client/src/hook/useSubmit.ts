import { useState, useCallback, useRef } from 'react';

export function useSubmit() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const emAndamento = useRef(false);

  const handleSubmit = useCallback((callback: () => Promise<void> | void) => {
    return async (e?: React.FormEvent) => {
      if (e && typeof e.preventDefault === 'function') {
        e.preventDefault();
      }

      if (emAndamento.current || isSubmitting) return;

      emAndamento.current = true;
      setIsSubmitting(true);

      try {
        await callback();
      } catch (error) {
        console.error("Erro ao processar envio do formulário Agro:", error);
      } finally {
        emAndamento.current = false;
        setIsSubmitting(false);
      }
    };
  }, [isSubmitting]);

  return { isSubmitting, handleSubmit };
}
