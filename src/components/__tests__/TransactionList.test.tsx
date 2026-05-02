/**
 * Testes de Componente — TransactionList
 * Verifica renderização, estados e interações.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TransactionList from '@/components/TransactionList';
import { mockTransactionsMay2026 } from '@/__mocks__/data';

// Mock do useToast
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

const onDeleteMock = vi.fn().mockResolvedValue(undefined);

describe('TransactionList', () => {

  beforeEach(() => vi.clearAllMocks());

  it('exibe mensagem quando não há transações', () => {
    render(
      <TransactionList
        transactions={[]}
        onDelete={onDeleteMock}
        isDeleting={false}
      />
    );
    expect(screen.getByText(/nenhuma transação encontrada/i)).toBeInTheDocument();
  });

  it('renderiza as transações do mock corretamente', () => {
    render(
      <TransactionList
        transactions={mockTransactionsMay2026}
        onDelete={onDeleteMock}
        isDeleting={false}
      />
    );
    // Verifica primeira transação
    expect(screen.getByText('Mensalidade Abril - João Silva')).toBeInTheDocument();
    expect(screen.getByText('Aluguel campo São Paulo Arena')).toBeInTheDocument();
  });

  it('exibe valores de entradas com sinal "+" e cor verde', () => {
    const incomeOnly = [mockTransactionsMay2026[0]]; // txn-001 income R$80
    render(
      <TransactionList
        transactions={incomeOnly}
        onDelete={onDeleteMock}
        isDeleting={false}
      />
    );
    const valueEl = screen.getByText(/\+R\$/);
    expect(valueEl).toHaveClass('text-green-600');
  });

  it('exibe valores de saídas com sinal "-" e cor vermelha', () => {
    const expenseOnly = [mockTransactionsMay2026[3]]; // txn-004 expense campo
    render(
      <TransactionList
        transactions={expenseOnly}
        onDelete={onDeleteMock}
        isDeleting={false}
      />
    );
    const valueEl = screen.getByText(/-R\$/);
    expect(valueEl).toHaveClass('text-red-600');
  });

  it('chama onDelete após confirmar exclusão', async () => {
    const user = userEvent.setup();
    window.confirm = vi.fn(() => true);

    render(
      <TransactionList
        transactions={mockTransactionsMay2026}
        onDelete={onDeleteMock}
        isDeleting={false}
      />
    );

    // O botão de excluir aparece no hover (group-hover) — simula hover no item
    const listItems = screen.getAllByRole('button');
    await user.click(listItems[0]);
    expect(onDeleteMock).toHaveBeenCalledTimes(1);
  });

  it('NÃO chama onDelete quando usuário cancela a confirmação', async () => {
    const user = userEvent.setup();
    window.confirm = vi.fn(() => false);

    render(
      <TransactionList
        transactions={[mockTransactionsMay2026[0]]}
        onDelete={onDeleteMock}
        isDeleting={false}
      />
    );

    const deleteBtn = screen.getByRole('button');
    await user.click(deleteBtn);
    expect(onDeleteMock).not.toHaveBeenCalled();
  });

  it('desabilita botão de excluir quando isDeleting=true', () => {
    render(
      <TransactionList
        transactions={[mockTransactionsMay2026[0]]}
        onDelete={onDeleteMock}
        isDeleting={true}
      />
    );
    const deleteBtn = screen.getByRole('button');
    expect(deleteBtn).toBeDisabled();
  });

  it('formata a data no padrão brasileiro (dd/mm/yyyy)', () => {
    render(
      <TransactionList
        transactions={[mockTransactionsMay2026[0]]} // date: '2026-05-01'
        onDelete={onDeleteMock}
        isDeleting={false}
      />
    );
    expect(screen.getByText(/01\/05\/2026/)).toBeInTheDocument();
  });

  it('exibe a categoria da transação', () => {
    render(
      <TransactionList
        transactions={[mockTransactionsMay2026[0]]} // MENSALIDADE
        onDelete={onDeleteMock}
        isDeleting={false}
      />
    );
    expect(screen.getByText(/MENSALIDADE/)).toBeInTheDocument();
  });
});
