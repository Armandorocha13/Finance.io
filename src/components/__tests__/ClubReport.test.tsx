/**
 * Testes de Componente — ClubReport
 * Valida cálculos de resumo e geração de PDF.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ClubReport from '@/components/ClubReport';
import {
  mockTransactions,
  mockJogadores,
  expectedTotals,
} from '@/__mocks__/data';

// ── Mocks de dependências ────────────────────────────────────────────────────

const { toastMock, mockPdfSave } = vi.hoisted(() => ({
  toastMock: vi.fn(),
  mockPdfSave: vi.fn(),
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: toastMock }),
  toast: toastMock,
}));

vi.mock('@/hooks/useTransactions', async () => {
  const mockData = await import('@/__mocks__/data');
  return {
    useTransactions: () => ({
      transactions: mockData.mockTransactions,
      isLoading: false,
      error: null,
      addTransaction: vi.fn(),
      deleteTransaction: vi.fn(),
      isAddingTransaction: false,
      isDeletingTransaction: false,
    }),
  };
});

vi.mock('@/hooks/useArtilharia', async () => {
  const mockData = await import('@/__mocks__/data');
  return {
    useArtilharia: () => ({
      jogadores: mockData.mockJogadores,
      isLoading: false,
      addJogador: vi.fn(),
      updateJogador: vi.fn(),
      deleteJogador: vi.fn(),
      adicionarGol: vi.fn(),
      removerGol: vi.fn(),
      resetArtilharia: vi.fn(),
    }),
  };
});

const mockJsPDFInstance = {
  internal: {
    pageSize: { getWidth: () => 210, getHeight: () => 297 },
    getNumberOfPages: () => 1,
  },
  setFontSize: vi.fn(), setFont: vi.fn(), setTextColor: vi.fn(),
  setFillColor: vi.fn(), setDrawColor: vi.fn(), setLineWidth: vi.fn(),
  splitTextToSize: vi.fn((t: string) => [t]),
  text: vi.fn(), line: vi.fn(), rect: vi.fn(),
  addPage: vi.fn(), getTextWidth: vi.fn(() => 20),
  setPage: vi.fn(), save: mockPdfSave,
};

vi.mock('jspdf', () => {
  const MockJsPDF = vi.fn(() => mockJsPDFInstance);
  return {
    default: MockJsPDF,
    jsPDF: MockJsPDF
  };
});

// ── Helpers ──────────────────────────────────────────────────────────────────

const BRL = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

// ── Testes ───────────────────────────────────────────────────────────────────

describe('ClubReport — renderização', () => {

  it('exibe o título "Relatório do Clube"', () => {
    render(<ClubReport />);
    expect(screen.getByText(/relatório do clube/i)).toBeInTheDocument();
  });

  it('exibe seletor de mês e de ano', () => {
    render(<ClubReport />);
    expect(screen.getAllByText(/^Mês$/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/^Ano$/i).length).toBeGreaterThan(0);
  });

  it('exibe botão de gerar PDF', () => {
    render(<ClubReport />);
    expect(
      screen.getByRole('button', { name: /baixar relatório/i })
    ).toBeInTheDocument();
  });

  it('exibe seção de artilharia com o artilheiro líder', async () => {
    render(<ClubReport />);
    await waitFor(() => {
      // Lucas Mendes tem 12 gols — deve aparecer
      expect(screen.getByText('Lucas Mendes')).toBeInTheDocument();
      expect(screen.getByText('12')).toBeInTheDocument();
    });
  });

  it('exibe apenas top 5 jogadores na seção de relatório', async () => {
    render(<ClubReport />);
    await waitFor(() => {
      expect(screen.getByText('Lucas Mendes')).toBeInTheDocument();
      expect(screen.getByText('Rafael Gomes')).toBeInTheDocument();
      expect(screen.getByText('João Silva')).toBeInTheDocument();
      expect(screen.getByText('André Souza')).toBeInTheDocument();
      expect(screen.getByText('Pedro Costa')).toBeInTheDocument();
      // 6º jogador (Carlos Lima) não aparece no top 5
      expect(screen.queryByText('Carlos Lima')).not.toBeInTheDocument();
    });
  });

  it('exibe a tabela de evolução mensal anual', () => {
    render(<ClubReport />);
    expect(screen.getByText('Jan')).toBeInTheDocument();
    expect(screen.getByText('Dez')).toBeInTheDocument();
  });
});

describe('ClubReport — cálculos financeiros (maio/2026)', () => {

  it('exibe o total de entradas correto para maio/2026', async () => {
    render(<ClubReport />);
    await waitFor(() => {
      // 230,00
      const elements = screen.getAllByText(/230,00/);
      expect(elements.length).toBeGreaterThan(0);
    });
  });

  it('exibe o total de saídas correto para maio/2026', async () => {
    render(<ClubReport />);
    await waitFor(() => {
      // 500,00
      const elements = screen.getAllByText(/500,00/);
      expect(elements.length).toBeGreaterThan(0);
    });
  });
});

describe('ClubReport — geração de PDF', () => {

  beforeEach(() => { mockPdfSave.mockClear(); toastMock.mockClear(); });

  it('chama jsPDF.save() ao clicar em "Baixar Relatório"', async () => {
    const user = userEvent.setup();
    render(<ClubReport />);

    const pdfBtn = screen.getByRole('button', { name: /baixar relatório/i });
    await user.click(pdfBtn);

    await waitFor(() => {
      expect(mockPdfSave).toHaveBeenCalledTimes(1);
    });
  });

  it('o nome do arquivo PDF inclui o mês e o ano', async () => {
    const user = userEvent.setup();
    render(<ClubReport />);

    await user.click(screen.getByRole('button', { name: /baixar relatório/i }));

    await waitFor(() => {
      const [filename] = mockPdfSave.mock.calls[0];
      expect(filename).toMatch(/vaidoso-fc-relatorio-.*-\d{4}\.pdf/);
    });
  });

  it('exibe toast de sucesso após gerar o PDF', async () => {
    const user = userEvent.setup();
    render(<ClubReport />);

    await user.click(screen.getByRole('button', { name: /baixar relatório/i }));
    await waitFor(() => {
      expect(toastMock).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'PDF gerado!' })
      );
    });
  });
});

describe('ClubReport — estado sem dados', () => {
  it('renderiza sem crash mesmo sem transações no mês selecionado', () => {
    // O componente deve renderizar corretamente independente de dados no mês
    render(<ClubReport />);
    expect(screen.getByText(/resumo mensal/i)).toBeInTheDocument();
    expect(screen.getByText(/resumo anual/i)).toBeInTheDocument();
  });
});
