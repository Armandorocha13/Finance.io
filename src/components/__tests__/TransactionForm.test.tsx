/**
 * Testes de Formulário — TransactionForm
 * Valida campos obrigatórios, submissão e cancelamento.
 * Os testes de seleção de categoria usam abordagem direta
 * pois componentes Radix Select têm suporte limitado em jsdom.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TransactionForm from '@/components/TransactionForm';
import { mockCategories } from '@/__mocks__/data';

beforeEach(() => {
  localStorage.setItem('categories', JSON.stringify(mockCategories));
  vi.clearAllMocks();
});

const onSubmitMock = vi.fn();
const onCancelMock = vi.fn();

const renderForm = () =>
  render(<TransactionForm onSubmit={onSubmitMock} onCancel={onCancelMock} />);

describe('TransactionForm — renderização', () => {

  it('exibe o título "Nova Transação"', () => {
    renderForm();
    expect(screen.getByText(/nova transação/i)).toBeInTheDocument();
  });

  it('exibe campo Descrição', () => {
    renderForm();
    expect(screen.getByLabelText(/descrição/i)).toBeInTheDocument();
  });

  it('exibe campo Valor', () => {
    renderForm();
    expect(screen.getByLabelText(/valor/i)).toBeInTheDocument();
  });

  it('exibe campo Data', () => {
    renderForm();
    expect(screen.getByLabelText(/data/i)).toBeInTheDocument();
  });

  it('exibe botões Salvar e Cancelar', () => {
    renderForm();
    expect(screen.getByRole('button', { name: /salvar/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancelar/i })).toBeInTheDocument();
  });

  it('campo Data já vem preenchido com a data atual', () => {
    renderForm();
    const today = new Date().toISOString().split('T')[0];
    expect(screen.getByLabelText(/data/i)).toHaveValue(today);
  });
});

describe('TransactionForm — validação HTML5', () => {

  it('NÃO chama onSubmit quando descrição está vazia', async () => {
    renderForm();
    // Sem preencher nada — o HTML5 required impede a submissão
    screen.getByRole('button', { name: /salvar/i }).click();
    expect(onSubmitMock).not.toHaveBeenCalled();
  });

  it('NÃO chama onSubmit quando valor está vazio', async () => {
    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByLabelText(/descrição/i), 'Teste');
    screen.getByRole('button', { name: /salvar/i }).click();
    expect(onSubmitMock).not.toHaveBeenCalled();
  });

  it('chama onCancel ao clicar no botão Cancelar', async () => {
    const user = userEvent.setup();
    renderForm();
    await user.click(screen.getByRole('button', { name: /cancelar/i }));
    expect(onCancelMock).toHaveBeenCalledTimes(1);
  });
});

describe('TransactionForm — preenchimento de campos', () => {

  it('aceita texto no campo Descrição', async () => {
    const user = userEvent.setup();
    renderForm();
    const input = screen.getByLabelText(/descrição/i);
    await user.type(input, 'Mensalidade Teste');
    expect(input).toHaveValue('Mensalidade Teste');
  });

  it('aceita número no campo Valor', async () => {
    const user = userEvent.setup();
    renderForm();
    const input = screen.getByLabelText(/valor/i);
    await user.type(input, '80.50');
    expect(input).toHaveValue(80.50);
  });

  it('aceita data no campo Data', async () => {
    const user = userEvent.setup();
    renderForm();
    const input = screen.getByLabelText(/data/i);
    await user.clear(input);
    await user.type(input, '2026-01-15');
    expect(input).toHaveValue('2026-01-15');
  });

  it('toggle de visibilidade de senha não existe (sem campo senha)', () => {
    renderForm();
    // O TransactionForm não tem campo senha
    expect(screen.queryByLabelText(/senha/i)).not.toBeInTheDocument();
  });
});

describe('TransactionForm — estado de labels', () => {

  it('exibe label "Tipo"', () => {
    renderForm();
    // O label Tipo existe no formulário
    expect(screen.getByText(/^tipo$/i)).toBeInTheDocument();
  });

  it('exibe label "Categoria"', () => {
    renderForm();
    expect(screen.getByText(/^categoria$/i)).toBeInTheDocument();
  });

  it('exibe placeholder no select de categoria', () => {
    renderForm();
    expect(
      screen.getByText(/selecione uma categoria/i)
    ).toBeInTheDocument();
  });
});
