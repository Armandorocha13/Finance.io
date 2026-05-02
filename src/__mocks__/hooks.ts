/**
 * Mock dos hooks principais — Vaidoso FC
 *
 * Permite controlar o retorno de useTransactions e useArtilharia
 * em testes de componentes sem precisar de Supabase real.
 */

import { mockTransactions, mockJogadores, mockAuthContext } from '@/__mocks__/data';

// ── useAuth ──────────────────────────────────────────────────────────────────

export const mockUseAuth = vi.fn(() => mockAuthContext);

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: mockUseAuth,
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// ── useTransactions ───────────────────────────────────────────────────────────

export const mockAddTransaction    = vi.fn().mockResolvedValue(undefined);
export const mockDeleteTransaction = vi.fn().mockResolvedValue(undefined);

export const mockUseTransactions = vi.fn(() => ({
  transactions: mockTransactions,
  isLoading: false,
  error: null,
  addTransaction: mockAddTransaction,
  deleteTransaction: mockDeleteTransaction,
  isAddingTransaction: false,
  isDeletingTransaction: false,
}));

vi.mock('@/hooks/useTransactions', () => ({
  useTransactions: mockUseTransactions,
}));

// ── useArtilharia ────────────────────────────────────────────────────────────

export const mockAdicionarGol = vi.fn();
export const mockRemoverGol   = vi.fn();
export const mockAddJogador   = vi.fn();
export const mockUpdateJogador = vi.fn();
export const mockDeleteJogador = vi.fn();
export const mockResetArtilharia = vi.fn();

export const mockUseArtilharia = vi.fn(() => ({
  jogadores: mockJogadores,
  isLoading: false,
  addJogador: mockAddJogador,
  updateJogador: mockUpdateJogador,
  deleteJogador: mockDeleteJogador,
  adicionarGol: mockAdicionarGol,
  removerGol: mockRemoverGol,
  resetArtilharia: mockResetArtilharia,
}));

vi.mock('@/hooks/useArtilharia', () => ({
  useArtilharia: mockUseArtilharia,
}));

// ── useToast ──────────────────────────────────────────────────────────────────

export const mockToast = vi.fn();

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: mockToast }),
  toast: mockToast,
}));

// ── jsPDF ─────────────────────────────────────────────────────────────────────

export const mockPdfSave    = vi.fn();
export const mockPdfAddPage = vi.fn();
export const mockPdfText    = vi.fn();

vi.mock('jspdf', () => ({
  default: vi.fn().mockImplementation(() => ({
    internal: {
      pageSize: { getWidth: () => 210, getHeight: () => 297 },
      getNumberOfPages: () => 1,
    },
    setFontSize: vi.fn(),
    setFont: vi.fn(),
    setTextColor: vi.fn(),
    setFillColor: vi.fn(),
    setDrawColor: vi.fn(),
    setLineWidth: vi.fn(),
    splitTextToSize: vi.fn((t: string) => [t]),
    text: mockPdfText,
    line: vi.fn(),
    rect: vi.fn(),
    addPage: mockPdfAddPage,
    getTextWidth: vi.fn(() => 20),
    setPage: vi.fn(),
    save: mockPdfSave,
  })),
}));
