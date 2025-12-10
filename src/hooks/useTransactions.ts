/**
 * useTransactions.ts
 * 
 * Hook customizado para gerenciamento de transações financeiras
 * 
 * Funcionalidades:
 * - Carregar transações do Supabase
 * - Adicionar novas transações no Supabase
 * - Excluir transações do Supabase
 * - Sincronização com localStorage (fallback)
 * 
 * @author Vaidoso FC
 * @version 2.0.0
 */

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

/**
 * Interface de uma transação financeira
 */
export interface Transaction {
  id: string; // ID único da transação
  description: string; // Descrição da transação
  amount: number; // Valor da transação
  type: 'income' | 'expense'; // Tipo: entrada ou saída
  category: string; // Categoria da transação
  date: string; // Data da transação (ISO string)
  user_id: string; // ID do usuário (mock quando autenticação desativada)
}

/**
 * Hook para gerenciar transações financeiras
 * 
 * @returns {Object} Objeto com transações e funções de manipulação
 * @returns {Transaction[]} transactions - Lista de transações
 * @returns {boolean} isLoading - Estado de carregamento
 * @returns {null} error - Erros (sempre null atualmente)
 * @returns {Function} addTransaction - Função para adicionar transação
 * @returns {Function} deleteTransaction - Função para excluir transação
 * @returns {boolean} isAddingTransaction - Estado de adição (sempre false)
 * @returns {boolean} isDeletingTransaction - Estado de exclusão
 * 
 * @example
 * const { transactions, addTransaction, deleteTransaction } = useTransactions();
 */
/**
 * Verifica se o user_id é um UUID válido do Supabase
 */
const isValidUUID = (str: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

export function useTransactions() {
  // Hooks e estados
  const { user } = useAuth();
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeletingTransaction, setIsDeletingTransaction] = useState(false);

  /**
   * Carrega transações do Supabase ao montar o componente
   * 
   * Processo:
   * 1. Tenta carregar do Supabase
   * 2. Se falhar, tenta carregar do localStorage (fallback)
   * 3. Se não houver dados, mantém array vazio
   */
  useEffect(() => {
    const loadTransactions = async () => {
      if (!user?.id) {
        // Se não há usuário, tenta carregar do localStorage
        try {
          const savedTransactions = localStorage.getItem('transactions');
      if (savedTransactions) {
          const parsed = JSON.parse(savedTransactions);
          setTransactions(parsed);
        }
      } catch (error) {
        console.error('Erro ao carregar transações do localStorage:', error);
      } finally {
        setIsLoading(false);
      }
        return;
      }

      // Para desenvolvimento: usa UUID fixo se não houver usuário real
      const DEV_USER_ID = '00000000-0000-0000-0000-000000000001';
      const queryUserId = isValidUUID(user.id) ? user.id : DEV_USER_ID;

      try {
        // Carrega do Supabase (agora sempre tenta, mesmo com usuário mock)
        const { data, error } = await supabase
          .from('transactions')
          .select('*')
          .eq('user_id', queryUserId)
          .order('date', { ascending: false })
          .order('created_at', { ascending: false });

        if (error) {
          // Só loga erro se não for erro de autenticação/RLS esperado
          if (!error.message?.includes('JWT') && !error.message?.includes('permission')) {
            console.error('Erro ao carregar transações do Supabase:', error);
          }
          // Fallback para localStorage
          const savedTransactions = localStorage.getItem('transactions');
          if (savedTransactions) {
            const parsed = JSON.parse(savedTransactions);
            // Remove duplicatas do localStorage também
            const uniqueParsed = parsed.filter((transaction: Transaction, index: number, self: Transaction[]) =>
              index === self.findIndex(t => t.id === transaction.id)
            );
            setTransactions(uniqueParsed);
          }
        } else {
          // Converte os dados do Supabase para o formato Transaction
          // Garante que a data está no formato YYYY-MM-DD
          const formattedData: Transaction[] = (data || []).map((item: any) => {
            let dateStr = item.date;
            // Se a data vier como objeto Date ou string com timezone, converte para YYYY-MM-DD
            if (dateStr instanceof Date) {
              const year = dateStr.getFullYear();
              const month = String(dateStr.getMonth() + 1).padStart(2, '0');
              const day = String(dateStr.getDate()).padStart(2, '0');
              dateStr = `${year}-${month}-${day}`;
            } else if (typeof dateStr === 'string' && dateStr.includes('T')) {
              // Remove hora e timezone, mantém apenas a data
              dateStr = dateStr.split('T')[0];
            }
            return {
              id: item.id,
              description: item.description || '',
              amount: item.amount,
              type: item.type as 'income' | 'expense',
              category: item.category,
              date: dateStr,
              user_id: item.user_id,
            };
          });
          // Remove duplicatas baseado no ID antes de definir
          const uniqueData = formattedData.filter((transaction, index, self) =>
            index === self.findIndex(t => t.id === transaction.id)
          );
          
          setTransactions(uniqueData);
          // Sincroniza com localStorage como backup
          if (uniqueData.length > 0) {
            localStorage.setItem('transactions', JSON.stringify(uniqueData));
          }
        }
      } catch (error: any) {
        // Só loga erro se não for erro de autenticação/RLS esperado
        if (!error?.message?.includes('JWT') && !error?.message?.includes('permission')) {
          console.error('Erro ao carregar transações:', error);
        }
        // Fallback para localStorage
        try {
          const savedTransactions = localStorage.getItem('transactions');
          if (savedTransactions) {
            const parsed = JSON.parse(savedTransactions);
            // Remove duplicatas do localStorage também
            const uniqueParsed = parsed.filter((transaction: Transaction, index: number, self: Transaction[]) =>
              index === self.findIndex(t => t.id === transaction.id)
            );
            setTransactions(uniqueParsed);
          }
        } catch (localError) {
          console.error('Erro ao carregar do localStorage:', localError);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadTransactions();

    // Subscribe para mudanças em tempo real
    // Para desenvolvimento: usa UUID fixo se não houver usuário real
    const DEV_USER_ID = '00000000-0000-0000-0000-000000000001';
    const subscribeUserId = user?.id && isValidUUID(user.id) ? user.id : DEV_USER_ID;
    
    if (user?.id) {
      const channel = supabase
        .channel('transactions-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'transactions',
            filter: `user_id=eq.${subscribeUserId}`,
          },
          (payload) => {
            if (payload.eventType === 'INSERT') {
              setTransactions((prev) => {
                // Verifica se a transação já existe antes de adicionar
                const exists = prev.some(t => t.id === (payload.new as any).id);
                if (exists) return prev; // Não adiciona se já existe
                return [payload.new as Transaction, ...prev];
              });
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
    }
    
    // Retorna função vazia se não criar subscription
    return () => {};
  }, [user?.id]);

  /**
   * Adiciona uma nova transação no Supabase
   * 
   * @param {Omit<Transaction, 'id' | 'user_id'>} newTransaction - Dados da transação (sem id e user_id)
   * @returns {Promise<void>} Promise que resolve quando a transação é adicionada
   * 
   * Processo:
   * 1. Tenta salvar no Supabase (apenas se user_id for UUID válido)
   * 2. Se falhar, salva no localStorage como fallback
   * 3. Atualiza o estado local
   * 4. Exibe notificação de sucesso ou erro
   */
  const addTransaction = async (newTransaction: Omit<Transaction, 'id' | 'user_id'>) => {
    // Para desenvolvimento: usa um UUID fixo se não houver usuário real
    // Este UUID será usado para todas as transações de desenvolvimento
    const DEV_USER_ID = '00000000-0000-0000-0000-000000000001';
    const userId = user?.id && isValidUUID(user.id) ? user.id : DEV_USER_ID;

    // Tenta salvar no Supabase (agora sempre tenta, mesmo com usuário mock)
    try {
      // Garante que a data está no formato YYYY-MM-DD (sem timezone)
      // Remove qualquer informação de hora/timezone que possa ter sido adicionada
      let dateToSave = newTransaction.date;
      if (dateToSave.includes('T')) {
        // Se tiver hora, pega apenas a parte da data
        dateToSave = dateToSave.split('T')[0];
      }
      // Garante formato YYYY-MM-DD
      if (!dateToSave.match(/^\d{4}-\d{2}-\d{2}$/)) {
        // Se não estiver no formato correto, tenta converter
        const date = new Date(dateToSave);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        dateToSave = `${year}-${month}-${day}`;
      }

      const { data, error } = await supabase
        .from('transactions')
        .insert({
          description: newTransaction.description,
          amount: newTransaction.amount,
          type: newTransaction.type,
          category: newTransaction.category,
          date: dateToSave, // Usa a data formatada corretamente
          user_id: userId,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

        // Sucesso no Supabase - formata os dados
        const formattedTransaction: Transaction = {
          id: data.id,
          description: data.description || '',
          amount: data.amount,
          type: data.type as 'income' | 'expense',
          category: data.category,
          date: data.date,
          user_id: data.user_id,
        };

        setTransactions((prev) => {
          const updated = [...prev, formattedTransaction];
          // Sincroniza com localStorage como backup
          localStorage.setItem('transactions', JSON.stringify(updated));
          return updated;
        });

      toast.success("Sua transação foi salva com sucesso no banco de dados.");
      return;
    } catch (error: any) {
      console.error('Erro ao salvar no Supabase:', error);
      
      // Fallback: salva no localStorage se Supabase falhar
      const transaction: Transaction = {
        ...newTransaction,
        id: Date.now().toString(),
        user_id: userId,
      };

      setTransactions((prev) => {
        const updated = [...prev, transaction];
        localStorage.setItem('transactions', JSON.stringify(updated));
        return updated;
      });

      toast.warning("Transação salva localmente. Erro ao conectar com o banco de dados.");
    }
  };

  /**
   * Exclui uma transação pelo ID do Supabase
   * 
   * @param {string} transactionId - ID da transação a ser excluída
   * @returns {Promise<void>} Promise que resolve quando a transação é excluída
   * 
   * Processo:
   * 1. Tenta excluir do Supabase
   * 2. Se falhar, exclui do localStorage como fallback
   * 3. Atualiza o estado local
   * 4. Exibe notificação de sucesso ou erro
   */
  const deleteTransaction = async (transactionId: string) => {
    setIsDeletingTransaction(true);
    
    try {
      // Para desenvolvimento: usa UUID fixo se não houver usuário real
      const DEV_USER_ID = '00000000-0000-0000-0000-000000000001';
      const deleteUserId = user?.id && isValidUUID(user.id) ? user.id : DEV_USER_ID;

      // Tenta excluir do Supabase
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', transactionId)
        .eq('user_id', deleteUserId);

      if (error) {
        throw error;
      }

      // Sucesso no Supabase
      setTransactions((prev) => {
        const updated = prev.filter(t => t.id !== transactionId);
        // Sincroniza com localStorage
        localStorage.setItem('transactions', JSON.stringify(updated));
        return updated;
      });

      toast.success("A transação foi excluída com sucesso do banco de dados.");
      return;
    } catch (error: any) {
      console.error('Erro ao excluir transação:', error);
      
      // Tenta excluir do localStorage como último recurso
      try {
        setTransactions((prev) => {
          const updated = prev.filter(t => t.id !== transactionId);
          localStorage.setItem('transactions', JSON.stringify(updated));
          return updated;
        });
        toast.warning("Transação excluída localmente. Erro ao conectar com o banco de dados.");
      } catch (localError) {
        toast.error("Erro ao excluir transação. Tente novamente.");
      }
    } finally {
      setIsDeletingTransaction(false);
    }
  };

  return {
    transactions,
    isLoading,
    error: null,
    addTransaction,
    deleteTransaction,
    isAddingTransaction: false,
    isDeletingTransaction,
  };
}
