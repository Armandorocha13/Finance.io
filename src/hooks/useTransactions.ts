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

/**
 * Remove duplicatas de transações baseado no ID
 */
const removeDuplicates = (transactions: Transaction[]): Transaction[] => {
  const seen = new Map<string, Transaction>();
  for (const transaction of transactions) {
    if (!seen.has(transaction.id)) {
      seen.set(transaction.id, transaction);
    }
  }
  return Array.from(seen.values());
};

/**
 * Formata um item bruto do Supabase para o tipo Transaction
 */
const formatTransaction = (item: any): Transaction => {
  let dateStr = item.date;
  if (dateStr && typeof dateStr === 'object' && 'getFullYear' in dateStr) {
    const dateObj = dateStr as unknown as Date;
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    dateStr = `${year}-${month}-${day}`;
  } else if (typeof dateStr === 'string' && dateStr.includes('T')) {
    dateStr = dateStr.split('T')[0];
  } else if (typeof dateStr !== 'string') {
    dateStr = String(dateStr);
  }

  return {
    id: item.id,
    description: item.description || '',
    amount: typeof item.amount === 'number' ? item.amount : Number(item.amount) || 0,
    type: item.type as 'income' | 'expense',
    category: item.category,
    date: dateStr,
    user_id: item.user_id,
  };
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
            // Remove duplicatas do localStorage
            const uniqueParsed = removeDuplicates(parsed);

            // Debug: Verificar transações de entrada do localStorage
            const incomeFromLocalStorage = uniqueParsed.filter((t: Transaction) => t.type === 'income');
            const totalIncomeFromLocalStorage = incomeFromLocalStorage.reduce((sum: number, t: Transaction) => sum + (t.amount || 0), 0);

            console.log('💾 Transações carregadas do localStorage:', {
              total: parsed.length,
              unicas: uniqueParsed.length,
              duplicatasRemovidas: parsed.length - uniqueParsed.length,
              entradas: incomeFromLocalStorage.length,
              totalEntradas: totalIncomeFromLocalStorage,
              detalhesEntradas: incomeFromLocalStorage.map((t: Transaction) => ({
                id: t.id,
                description: t.description,
                amount: t.amount,
                date: t.date
              }))
            });

            setTransactions(uniqueParsed);
            // Atualiza o localStorage com dados sem duplicatas
            if (uniqueParsed.length > 0) {
              localStorage.setItem('transactions', JSON.stringify(uniqueParsed));
            }
          }
        } catch (error) {
          console.error('Erro ao carregar transações do localStorage:', error);
          localStorage.removeItem('transactions');
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
            try {
              const parsed = JSON.parse(savedTransactions);
              // Remove duplicatas do localStorage usando a função auxiliar
              const uniqueParsed = removeDuplicates(parsed);
              setTransactions(uniqueParsed);
              // Atualiza o localStorage com dados sem duplicatas
              if (uniqueParsed.length > 0) {
                localStorage.setItem('transactions', JSON.stringify(uniqueParsed));
              }
            } catch (error) {
              console.error('Erro ao parsear transações do localStorage:', error);
              localStorage.removeItem('transactions');
            }
          }
        } else {
          // Converte os dados do Supabase para o formato Transaction
          const formattedData: Transaction[] = (data || []).map(formatTransaction);

          // Remove duplicatas baseado no ID antes de definir usando a função auxiliar
          // Remove duplicatas baseado no ID antes de definir usando a função auxiliar
          const uniqueData = removeDuplicates(formattedData);

          // Debug: Verificar transações de entrada carregadas do Supabase
          const incomeFromSupabase = uniqueData.filter(t => t.type === 'income');
          const totalIncomeFromSupabase = incomeFromSupabase.reduce((sum, t) => sum + (t.amount || 0), 0);

          console.log('📊 Transações carregadas do Supabase:', {
            total: formattedData.length,
            unicas: uniqueData.length,
            duplicatasRemovidas: formattedData.length - uniqueData.length,
            entradas: incomeFromSupabase.length,
            totalEntradas: totalIncomeFromSupabase,
            detalhesEntradas: incomeFromSupabase.map(t => ({
              id: t.id,
              description: t.description,
              amount: t.amount,
              date: t.date
            }))
          });

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
            // Remove duplicatas do localStorage usando a função auxiliar
            const uniqueParsed = removeDuplicates(parsed);
            setTransactions(uniqueParsed);
            // Atualiza o localStorage com dados sem duplicatas
            if (uniqueParsed.length > 0) {
              localStorage.setItem('transactions', JSON.stringify(uniqueParsed));
            }
          }
        } catch (localError) {
          console.error('Erro ao carregar do localStorage:', localError);
          localStorage.removeItem('transactions');
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
                const newTransaction = payload.new as any;
                const exists = prev.some(t => t.id === newTransaction.id);
                if (exists) {
                  console.log('⚠️ Transação duplicada detectada na subscription:', newTransaction.id);
                  return prev;
                }

                const formattedTransaction = formatTransaction(newTransaction);

                const updated = [formattedTransaction, ...prev];
                // Remove duplicatas após adicionar
                const unique = updated.filter((t, index, self) =>
                  index === self.findIndex(tr => tr.id === t.id)
                );

                // Sincroniza com localStorage
                if (unique.length > 0) {
                  localStorage.setItem('transactions', JSON.stringify(unique));
                }

                return unique;
              });
            } else if (payload.eventType === 'UPDATE') {
              setTransactions((prev) => {
                const updatedTransaction = payload.new as any;
                const formattedTransaction = formatTransaction(updatedTransaction);

                const updated = prev.map((t) => (t.id === formattedTransaction.id ? formattedTransaction : t));

                // Remove duplicatas após atualizar
                const unique = updated.filter((t, index, self) =>
                  index === self.findIndex(tr => tr.id === t.id)
                );

                // Sincroniza com localStorage
                if (unique.length > 0) {
                  localStorage.setItem('transactions', JSON.stringify(unique));
                }

                return unique;
              });
            } else if (payload.eventType === 'DELETE') {
              setTransactions((prev) => {
                const updated = prev.filter((t) => t.id !== payload.old.id);
                // Sincroniza com localStorage
                if (updated.length > 0) {
                  localStorage.setItem('transactions', JSON.stringify(updated));
                } else {
                  localStorage.removeItem('transactions');
                }
                return updated;
              });
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }

    // Retorna função vazia se não criar subscription
    return () => { };
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

      if (data) {
        const formattedTransaction = formatTransaction(data);

        setTransactions((prev) => {
          // Verifica se a transação já existe antes de adicionar
          const exists = prev.some(t => t.id === formattedTransaction.id);
          if (exists) {
            console.log('⚠️ Transação duplicada detectada ao adicionar:', formattedTransaction.id);
            // Se já existe, atualiza ao invés de adicionar
            const updated = prev.map(t => t.id === formattedTransaction.id ? formattedTransaction : t);
            localStorage.setItem('transactions', JSON.stringify(updated));
            return updated;
          }

          // Adiciona ao TOPO da lista (importante para visibilidade imediata)
          const updated = [formattedTransaction, ...prev];
          // Remove duplicatas antes de salvar
          const unique = updated.filter((t, index, self) =>
            index === self.findIndex(tr => tr.id === t.id)
          );

          // Sincroniza com localStorage como backup
          localStorage.setItem('transactions', JSON.stringify(unique));
          return unique;
        });

        toast.success("Sua transação foi salva com sucesso no banco de dados.");
      }
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
        // Verifica se a transação já existe antes de adicionar
        const exists = prev.some(t => t.id === transaction.id);
        if (exists) {
          console.log('⚠️ Transação duplicada detectada no fallback:', transaction.id);
          // Se já existe, atualiza ao invés de adicionar
          const updated = prev.map(t => t.id === transaction.id ? transaction : t);
          localStorage.setItem('transactions', JSON.stringify(updated));
          return updated;
        }

        const updated = [...prev, transaction];
        // Remove duplicatas antes de salvar
        const unique = removeDuplicates(updated);
        localStorage.setItem('transactions', JSON.stringify(unique));
        return unique;
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
