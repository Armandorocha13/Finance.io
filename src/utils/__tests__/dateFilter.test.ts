/**
 * Testes Unitários — dateFilter.ts
 * Valida filtros de data sem renderizar nenhum componente.
 */

import { describe, it, expect } from 'vitest';
import { filterTransactionsByDate, getFilterDescription } from '@/utils/dateFilter';
import { mockTransactions, mockTransactionsMay2026 } from '@/__mocks__/data';

describe('filterTransactionsByDate', () => {

  it('retorna todas as transações quando filterType é "all"', () => {
    const result = filterTransactionsByDate(mockTransactions, 'all');
    expect(result).toHaveLength(mockTransactions.length);
  });

  it('filtra corretamente por mês e ano (maio/2026)', () => {
    const result = filterTransactionsByDate(mockTransactions, 'month', 2026, 5);
    const expected = mockTransactions.filter(t => t.date.startsWith('2026-05'));
    expect(result).toHaveLength(expected.length);
    result.forEach(t => {
      expect(t.date).toMatch(/^2026-05/);
    });
  });

  it('filtra corretamente por ano (2024)', () => {
    const result = filterTransactionsByDate(mockTransactions, 'year', 2024);
    result.forEach(t => {
      expect(t.date).toMatch(/^2024/);
    });
    expect(result.length).toBeGreaterThan(0);
  });

  it('filtra corretamente por ano (2025)', () => {
    const result = filterTransactionsByDate(mockTransactions, 'year', 2025);
    result.forEach(t => expect(t.date).toMatch(/^2025/));
    expect(result.length).toBeGreaterThan(0);
  });

  it('não mistura transações de anos diferentes', () => {
    const result2024 = filterTransactionsByDate(mockTransactions, 'year', 2024);
    const result2025 = filterTransactionsByDate(mockTransactions, 'year', 2025);
    const ids2024 = new Set(result2024.map(t => t.id));
    result2025.forEach(t => expect(ids2024.has(t.id)).toBe(false));
  });

  it('retorna array vazio para mês sem transações', () => {
    const result = filterTransactionsByDate(mockTransactions, 'month', 2026, 7); // julho/2026 sem dados
    expect(result).toHaveLength(0);
  });

  it('inclui transações no primeiro e último dia do mês', () => {
    // txn-003 = 2026-05-04, txn-001 = 2026-05-01
    const result = filterTransactionsByDate(mockTransactions, 'month', 2026, 5);
    const ids = result.map(t => t.id);
    expect(ids).toContain('txn-001');
    expect(ids).toContain('txn-003');
  });

  it('retorna todas quando filterType é "year" mas year não é fornecido', () => {
    const result = filterTransactionsByDate(mockTransactions, 'year');
    // sem year → retorna todas (comportamento defensivo do util)
    expect(result).toEqual(mockTransactions);
  });

  it('retorna todas quando filterType é "month" mas month não é fornecido', () => {
    const result = filterTransactionsByDate(mockTransactions, 'month', 2026);
    expect(result).toEqual(mockTransactions);
  });
});

describe('getFilterDescription', () => {

  it('retorna "Todos os dados" para filterType "all"', () => {
    expect(getFilterDescription('all')).toBe('Todos os dados');
  });

  it('retorna o ano correto para filterType "year"', () => {
    expect(getFilterDescription('year', 2026)).toBe('Ano de 2026');
  });

  it('retorna o mês e ano para filterType "month"', () => {
    expect(getFilterDescription('month', 2026, 5)).toBe('Maio de 2026');
  });

  it('retorna string de fallback quando year/month não fornecidos', () => {
    expect(getFilterDescription('year')).toBe('Ano selecionado');
    expect(getFilterDescription('month')).toBe('Mês selecionado');
  });
});
