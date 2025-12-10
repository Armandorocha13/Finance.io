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

  const now = new Date();
  let startDate: Date;
  let endDate: Date = new Date(now);
  endDate.setHours(23, 59, 59, 999);

  switch (filterType) {
    case 'today':
      // Apenas hoje
      startDate = new Date(now);
      startDate.setHours(0, 0, 0, 0);
      break;

    case 'last7days':
      // Últimos 7 dias
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
      startDate.setHours(0, 0, 0, 0);
      break;

    case 'last15days':
      // Últimos 15 dias
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 15);
      startDate.setHours(0, 0, 0, 0);
      break;

    case 'last30days':
      // Últimos 30 dias
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 30);
      startDate.setHours(0, 0, 0, 0);
      break;

    case 'currentMonth':
      // Mês atual
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      endDate.setHours(23, 59, 59, 999);
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
    // Se a data está no formato YYYY-MM-DD, faz parse manual
    let transactionDate: Date;
    if (transaction.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = transaction.date.split('-').map(Number);
      transactionDate = new Date(year, month - 1, day);
      transactionDate.setHours(12, 0, 0, 0); // Usa meio-dia para evitar problemas de timezone
    } else {
      // Fallback para outros formatos
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
  switch (filterType) {
    case 'all':
      return 'Todos os dados';
    case 'today':
      return 'Hoje';
    case 'last7days':
      return 'Últimos 7 dias';
    case 'last15days':
      return 'Últimos 15 dias';
    case 'last30days':
      return 'Últimos 30 dias';
    case 'currentMonth': {
      const monthNames = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
      ];
      const now = new Date();
      return `${monthNames[now.getMonth()]} de ${now.getFullYear()}`;
    }
    case 'month':
      if (year && month) {
        const monthNames = [
          'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
          'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
        ];
        return `${monthNames[month - 1]} de ${year}`;
      }
      return 'Período selecionado';
    default:
      return 'Período selecionado';
  }
}

