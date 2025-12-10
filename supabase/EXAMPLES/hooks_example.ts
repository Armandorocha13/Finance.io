/**
 * EXEMPLOS DE HOOKS ATUALIZADOS PARA SUPABASE
 * 
 * Estes são exemplos de como os hooks devem ser atualizados
 * para usar Supabase ao invés de localStorage.
 * 
 * IMPORTANTE: Estes são apenas exemplos. Não substitua os arquivos
 * originais até testar completamente.
 * 
 * @author Vaidoso FC
 */

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

// ============================================================================
// EXEMPLO: useTransactions com Supabase
// ============================================================================

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
  user_id: string;
}

export function useTransactionsSupabase() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Carrega transações do Supabase
   */
  useEffect(() => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    const loadTransactions = async () => {
      try {
        const { data, error } = await supabase
          .from('transactions')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false });

        if (error) throw error;

        setTransactions(data || []);
      } catch (error) {
        console.error('Erro ao carregar transações:', error);
        toast.error('Erro ao carregar transações');
      } finally {
        setIsLoading(false);
      }
    };

    loadTransactions();

    // Subscribe para mudanças em tempo real
    const channel = supabase
      .channel('transactions-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transactions',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setTransactions((prev) => [payload.new as Transaction, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setTransactions((prev) =>
              prev.map((t) => (t.id === payload.new.id ? payload.new as Transaction : t))
            );
          } else if (payload.eventType === 'DELETE') {
            setTransactions((prev) => prev.filter((t) => t.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, toast]);

  /**
   * Adiciona uma nova transação no Supabase
   */
  const addTransaction = async (newTransaction: Omit<Transaction, 'id' | 'user_id'>) => {
    if (!user?.id) {
      toast.error('Usuário não autenticado');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert({
          ...newTransaction,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Transação adicionada com sucesso!');
      return data;
    } catch (error: any) {
      console.error('Erro ao adicionar transação:', error);
      toast.error(error.message || 'Erro ao adicionar transação');
      throw error;
    }
  };

  /**
   * Exclui uma transação do Supabase
   */
  const deleteTransaction = async (transactionId: string) => {
    if (!user?.id) {
      toast.error('Usuário não autenticado');
      return;
    }

    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', transactionId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success('Transação excluída com sucesso!');
    } catch (error: any) {
      console.error('Erro ao excluir transação:', error);
      toast.error(error.message || 'Erro ao excluir transação');
      throw error;
    }
  };

  return {
    transactions,
    isLoading,
    error: null,
    addTransaction,
    deleteTransaction,
    isAddingTransaction: false,
    isDeletingTransaction: false,
  };
}

// ============================================================================
// EXEMPLO: useArtilharia com Supabase
// ============================================================================

export interface Jogador {
  id: string;
  nome: string;
  gols: number;
  posicao?: string;
  user_id: string;
}

export function useArtilhariaSupabase() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [jogadores, setJogadores] = useState<Jogador[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Carrega jogadores do Supabase
   */
  useEffect(() => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    const loadJogadores = async () => {
      try {
        const { data, error } = await supabase
          .from('artilharia')
          .select('*')
          .eq('user_id', user.id)
          .order('gols', { ascending: false });

        if (error) throw error;

        setJogadores(data || []);
      } catch (error) {
        console.error('Erro ao carregar artilharia:', error);
        toast.error('Erro ao carregar artilharia');
      } finally {
        setIsLoading(false);
      }
    };

    loadJogadores();

    // Subscribe para mudanças em tempo real
    const channel = supabase
      .channel('artilharia-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'artilharia',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setJogadores((prev) => {
              const updated = [...prev, payload.new as Jogador];
              return updated.sort((a, b) => b.gols - a.gols);
            });
          } else if (payload.eventType === 'UPDATE') {
            setJogadores((prev) => {
              const updated = prev.map((j) =>
                j.id === payload.new.id ? payload.new as Jogador : j
              );
              return updated.sort((a, b) => b.gols - a.gols);
            });
          } else if (payload.eventType === 'DELETE') {
            setJogadores((prev) => prev.filter((j) => j.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, toast]);

  /**
   * Adiciona um novo jogador
   */
  const addJogador = async (newJogador: Omit<Jogador, 'id' | 'user_id'>) => {
    if (!user?.id) {
      toast.error('Usuário não autenticado');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('artilharia')
        .insert({
          ...newJogador,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Jogador adicionado com sucesso!');
      return data;
    } catch (error: any) {
      console.error('Erro ao adicionar jogador:', error);
      toast.error(error.message || 'Erro ao adicionar jogador');
      throw error;
    }
  };

  /**
   * Atualiza um jogador
   */
  const updateJogador = async (id: string, updatedJogador: Partial<Jogador>) => {
    if (!user?.id) {
      toast.error('Usuário não autenticado');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('artilharia')
        .update(updatedJogador)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      toast.success('Jogador atualizado com sucesso!');
      return data;
    } catch (error: any) {
      console.error('Erro ao atualizar jogador:', error);
      toast.error(error.message || 'Erro ao atualizar jogador');
      throw error;
    }
  };

  /**
   * Exclui um jogador
   */
  const deleteJogador = async (id: string) => {
    if (!user?.id) {
      toast.error('Usuário não autenticado');
      return;
    }

    try {
      const { error } = await supabase
        .from('artilharia')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success('Jogador removido com sucesso!');
    } catch (error: any) {
      console.error('Erro ao remover jogador:', error);
      toast.error(error.message || 'Erro ao remover jogador');
      throw error;
    }
  };

  /**
   * Adiciona 1 gol a um jogador
   */
  const adicionarGol = async (id: string) => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase.rpc('increment_gol', {
        jogador_id: id,
        user_id: user.id,
      });

      if (error) {
        // Fallback: buscar jogador, incrementar e atualizar
        const jogador = jogadores.find((j) => j.id === id);
        if (jogador) {
          await updateJogador(id, { gols: jogador.gols + 1 });
        }
      } else {
        toast.success('Gol adicionado!');
      }
    } catch (error: any) {
      console.error('Erro ao adicionar gol:', error);
      toast.error('Erro ao adicionar gol');
    }
  };

  /**
   * Remove 1 gol de um jogador
   */
  const removerGol = async (id: string) => {
    if (!user?.id) return;

    try {
      const jogador = jogadores.find((j) => j.id === id);
      if (jogador && jogador.gols > 0) {
        await updateJogador(id, { gols: jogador.gols - 1 });
        toast.success('Gol removido!');
      }
    } catch (error: any) {
      console.error('Erro ao remover gol:', error);
      toast.error('Erro ao remover gol');
    }
  };

  return {
    jogadores,
    isLoading,
    addJogador,
    updateJogador,
    deleteJogador,
    adicionarGol,
    removerGol,
  };
}

