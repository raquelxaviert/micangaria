import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface CepData {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
  erro?: boolean;
}

export type CepStatus = 'idle' | 'loading' | 'found' | 'invalid' | 'error';

export function useCepLookup() {
  const [status, setStatus] = useState<CepStatus>('idle');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const lookupCep = useCallback(async (cep: string): Promise<CepData | null> => {
    const cleanCep = cep.replace(/\D/g, '');
    
    if (cleanCep.length !== 8) {
      setStatus('invalid');
      return null;
    }

    setIsLoading(true);
    setStatus('loading');

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      
      if (!response.ok) {
        throw new Error('Erro na requisição');
      }

      const data: CepData = await response.json();
      
      if (data.erro) {
        setStatus('invalid');
        toast({
          title: "CEP não encontrado",
          description: "Verifique se o CEP está correto e tente novamente.",
          variant: "destructive",
        });
        return null;
      }

      setStatus('found');
      toast({
        title: "✅ Endereço encontrado!",
        description: `${data.localidade}/${data.uf} - ${data.bairro}`,
      });
      
      return data;
      
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
      setStatus('error');
      toast({
        title: "Erro ao buscar CEP",
        description: "Verifique sua conexão com a internet e tente novamente.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const resetStatus = useCallback(() => {
    setStatus('idle');
  }, []);

  return {
    lookupCep,
    status,
    isLoading,
    resetStatus,
  };
}
