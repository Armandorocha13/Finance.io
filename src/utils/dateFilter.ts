/**
 * dateFilter.ts
 * 
 * Funções utilitárias para filtrar transações por data
 */

import { Transaction } from '@/hooks/useTransactions';
import { FilterType } from '@/components/DateFilter';

/**
 * Filtra transações baseado no tipo de filtro selecionado
 * 
 * @param transactions - Array de transações
 * @param filterType - Tipo de filtro ('all', 'today', 'last7days', 'last15days', 'last30days', 'currentMonth', 'month')
 * @param year - Ano selecionado (usado quando filterType é 'month')
 * @param month - Mês selecionado (usado quando filterType é 'month')
 * @returns Array de transações filtradas
 */
export function filterTransactionsByDate(
  transactions: Transaction[],
  filterType: FilterType,
  year?: number,
  month?: number
): Transaction[] {
  if (filterType === 'all') {
    return transactions;
  }

  let startDate: Date;
  let endDate: Date;

  switch (filterType) {
    case 'year':
      // Ano específico
      if (year) {
        startDate = new Date(year, 0, 1);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(year, 11, 31);
        endDate.setHours(23, 59, 59, 999);
      } else {
        return transactions;
      }
      break;

    case 'month':
      // Mês e ano específicos
      if (year && month) {
        startDate = new Date(year, month - 1, 1);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(year, month, 0);
        endDate.setHours(23, 59, 59, 999);
      } else {
        return transactions;
      }
      break;

    default:
      return transactions;
  }

  return transactions.filter((transaction) => {
    // Parse da data da transação sem problemas de timezone
    let transactionDate: Date;
    if (transaction.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [y, m, d] = transaction.date.split('-').map(Number);
      transactionDate = new Date(y, m - 1, d);
      transactionDate.setHours(12, 0, 0, 0);
    } else {
      transactionDate = new Date(transaction.date + 'T12:00:00');
    }
    return transactionDate >= startDate && transactionDate <= endDate;
  });
}

/**
 * Obtém o texto descritivo do filtro atual
 */
export function getFilterDescription(
  filterType: FilterType,
  year?: number,
  month?: number
): string {
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  switch (filterType) {
    case 'all':
      return 'Todos os dados';
    case 'year':
      return year ? `Ano de ${year}` : 'Ano selecionado';
    case 'month':
      if (year && month) {
        return `${monthNames[month - 1]} de ${year}`;
      }
      return 'Mês selecionado';
    default:
      return 'Período selecionado';
  }
}

