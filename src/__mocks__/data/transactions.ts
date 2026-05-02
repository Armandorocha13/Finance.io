/**
 * Mock de Transações — Vaidoso FC
 *
 * Cobre cenários reais do clube:
 * - Entradas: mensalidades, cartões amarelos/vermelhos
 * - Saídas: campo, juiz, materiais, uniformes, etc.
 * - Múltiplos anos (2024, 2025, 2026) para testar filtros
 * - Casos extremos: valores zerados, descrições longas
 */

import { Transaction } from '@/hooks/useTransactions';

const USER_ID = 'mock-user-uuid-0001';

export const mockTransactions: Transaction[] = [
  // ── 2026 / MAIO ───────────────────────────────────────────────
  {
    id: 'txn-001',
    description: 'Mensalidade Abril - João Silva',
    amount: 80,
    type: 'income',
    category: 'MENSALIDADE',
    date: '2026-05-01',
    user_id: USER_ID,
  },
  {
    id: 'txn-002',
    description: 'Mensalidade Abril - Pedro Costa',
    amount: 80,
    type: 'income',
    category: 'MENSALIDADE',
    date: '2026-05-02',
    user_id: USER_ID,
  },
  {
    id: 'txn-003',
    description: 'Cartão Amarelo - Lucas Mendes (jogo 04/05)',
    amount: 20,
    type: 'income',
    category: 'CARTÃO AMARELO',
    date: '2026-05-04',
    user_id: USER_ID,
  },
  {
    id: 'txn-004',
    description: 'Aluguel campo São Paulo Arena',
    amount: 350,
    type: 'expense',
    category: 'CAMPO',
    date: '2026-05-04',
    user_id: USER_ID,
  },
  {
    id: 'txn-005',
    description: 'Pagamento árbitro - jogo 04/05',
    amount: 150,
    type: 'expense',
    category: 'JUIZ',
    date: '2026-05-04',
    user_id: USER_ID,
  },
  {
    id: 'txn-006',
    description: 'Cartão Vermelho - Rafael Gomes (jogo 04/05)',
    amount: 50,
    type: 'income',
    category: 'CARTÃO VERMELHO',
    date: '2026-05-04',
    user_id: USER_ID,
  },

  // ── 2026 / ABRIL ──────────────────────────────────────────────
  {
    id: 'txn-007',
    description: 'Mensalidade Março - Carlos Lima',
    amount: 80,
    type: 'income',
    category: 'MENSALIDADE',
    date: '2026-04-05',
    user_id: USER_ID,
  },
  {
    id: 'txn-008',
    description: 'Mensalidade Março - André Souza',
    amount: 80,
    type: 'income',
    category: 'MENSALIDADE',
    date: '2026-04-06',
    user_id: USER_ID,
  },
  {
    id: 'txn-009',
    description: 'Compra bolas treino (4 un.)',
    amount: 280,
    type: 'expense',
    category: 'BOLA',
    date: '2026-04-10',
    user_id: USER_ID,
  },
  {
    id: 'txn-010',
    description: 'Lavagem uniformes abril',
    amount: 90,
    type: 'expense',
    category: 'LAVAGEM DE ROUPA',
    date: '2026-04-20',
    user_id: USER_ID,
  },
  {
    id: 'txn-011',
    description: 'Aluguel campo - jogo 20/04',
    amount: 350,
    type: 'expense',
    category: 'CAMPO',
    date: '2026-04-20',
    user_id: USER_ID,
  },
  {
    id: 'txn-012',
    description: 'Passagem goleiro reserva',
    amount: 30,
    type: 'expense',
    category: 'PASSAGEM GOLEIRO',
    date: '2026-04-20',
    user_id: USER_ID,
  },

  // ── 2026 / MARÇO ──────────────────────────────────────────────
  {
    id: 'txn-013',
    description: 'Mensalidade Fevereiro - Felipe Martins',
    amount: 80,
    type: 'income',
    category: 'MENSALIDADE',
    date: '2026-03-03',
    user_id: USER_ID,
  },
  {
    id: 'txn-014',
    description: 'Mensalidade Fevereiro - Thiago Alves',
    amount: 80,
    type: 'income',
    category: 'MENSALIDADE',
    date: '2026-03-04',
    user_id: USER_ID,
  },
  {
    id: 'txn-015',
    description: 'Festa confraternização março',
    amount: 450,
    type: 'expense',
    category: 'FESTAS',
    date: '2026-03-15',
    user_id: USER_ID,
  },
  {
    id: 'txn-016',
    description: 'Compra materiais (fita, spray, meias)',
    amount: 120,
    type: 'expense',
    category: 'MATERIAIS',
    date: '2026-03-20',
    user_id: USER_ID,
  },

  // ── 2025 / DEZEMBRO ───────────────────────────────────────────
  {
    id: 'txn-017',
    description: 'Mensalidade Dezembro - João Silva',
    amount: 80,
    type: 'income',
    category: 'MENSALIDADE',
    date: '2025-12-05',
    user_id: USER_ID,
  },
  {
    id: 'txn-018',
    description: 'Uniformes novos temporada 2026 (20 un.)',
    amount: 1800,
    type: 'expense',
    category: 'UNIFORMES',
    date: '2025-12-20',
    user_id: USER_ID,
  },
  {
    id: 'txn-019',
    description: 'Festa de fim de ano do clube',
    amount: 800,
    type: 'expense',
    category: 'FESTAS',
    date: '2025-12-28',
    user_id: USER_ID,
  },

  // ── 2025 / JUNHO ──────────────────────────────────────────────
  {
    id: 'txn-020',
    description: 'Mensalidade Junho - Pedro Costa',
    amount: 80,
    type: 'income',
    category: 'MENSALIDADE',
    date: '2025-06-10',
    user_id: USER_ID,
  },
  {
    id: 'txn-021',
    description: 'Aluguel campo campeonato amador',
    amount: 500,
    type: 'expense',
    category: 'CAMPO',
    date: '2025-06-14',
    user_id: USER_ID,
  },

  // ── 2024 / MARÇO ──────────────────────────────────────────────
  {
    id: 'txn-022',
    description: 'Mensalidade Março/2024 - Carlos Lima',
    amount: 70,
    type: 'income',
    category: 'MENSALIDADE',
    date: '2024-03-05',
    user_id: USER_ID,
  },
  {
    id: 'txn-023',
    description: 'Arbitragem torneio regional 2024',
    amount: 300,
    type: 'expense',
    category: 'JUIZ',
    date: '2024-03-22',
    user_id: USER_ID,
  },

  // ── Casos extremos ─────────────────────────────────────────────
  {
    id: 'txn-edge-zero',
    description: 'Transação de teste com valor zero',
    amount: 0,
    type: 'income',
    category: 'MENSALIDADE',
    date: '2026-04-01',
    user_id: USER_ID,
  },
  {
    id: 'txn-edge-large',
    description: 'Doação grande patrocinador - MEGA PATROCÍNIO VAIDOSO FC TEMPORADA 2026',
    amount: 5000,
    type: 'income',
    category: 'MENSALIDADE',
    date: '2026-01-15',
    user_id: USER_ID,
  },
];

/** Apenas transações do mês de maio/2026 */
export const mockTransactionsMay2026 = mockTransactions.filter(
  t => t.date.startsWith('2026-05')
);

/** Apenas transações de 2026 */
export const mockTransactions2026 = mockTransactions.filter(
  t => t.date.startsWith('2026')
);

/** Apenas entradas */
export const mockIncomeTransactions = mockTransactions.filter(
  t => t.type === 'income'
);

/** Apenas saídas */
export const mockExpenseTransactions = mockTransactions.filter(
  t => t.type === 'expense'
);

/** Totais esperados para testes de assertion */
export const expectedTotals = {
  may2026: {
    income: mockTransactionsMay2026
      .filter(t => t.type === 'income')
      .reduce((s, t) => s + t.amount, 0),
    expense: mockTransactionsMay2026
      .filter(t => t.type === 'expense')
      .reduce((s, t) => s + t.amount, 0),
  },
  year2026: {
    income: mockTransactions2026
      .filter(t => t.type === 'income')
      .reduce((s, t) => s + t.amount, 0),
    expense: mockTransactions2026
      .filter(t => t.type === 'expense')
      .reduce((s, t) => s + t.amount, 0),
  },
};
