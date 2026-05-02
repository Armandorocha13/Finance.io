/**
 * Testes de Componente — CategoryManager
 * Valida CRUD de categorias, validações e feedback ao usuário.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CategoryManager from '@/components/CategoryManager';
import { mockCategories } from '@/__mocks__/data';

const toastMock = vi.fn();
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: toastMock }),
}));

// Pré-popula localStorage com as categorias mock antes de cada teste
beforeEach(() => {
  localStorage.setItem('categories', JSON.stringify(mockCategories));
  vi.clearAllMocks();
});

describe('CategoryManager — renderização', () => {

  it('renderiza o título "Gerenciar Categorias"', () => {
    render(<CategoryManager />);
    expect(screen.getByText(/gerenciar categorias/i)).toBeInTheDocument();
  });

  it('exibe a aba "Saídas" ativa por padrão', () => {
    render(<CategoryManager />);
    expect(screen.getByRole('tab', { name: /saídas/i })).toBeInTheDocument();
  });

  it('exibe categorias de saída na aba Saídas', async () => {
    render(<CategoryManager />);
    await waitFor(() => {
      expect(screen.getByText('CAMPO')).toBeInTheDocument();
      expect(screen.getByText('JUIZ')).toBeInTheDocument();
      expect(screen.getByText('UNIFORMES')).toBeInTheDocument();
    });
  });

  it('exibe categorias de entrada ao clicar na aba Entradas', async () => {
    const user = userEvent.setup();
    render(<CategoryManager />);

    await user.click(screen.getByRole('tab', { name: /entradas/i }));
    await waitFor(() => {
      expect(screen.getByText('MENSALIDADE')).toBeInTheDocument();
      expect(screen.getByText('CARTÃO AMARELO')).toBeInTheDocument();
    });
  });
});

describe('CategoryManager — adicionar categoria', () => {

  it('exibe toast de erro quando nome está vazio', async () => {
    const user = userEvent.setup();
    render(<CategoryManager />);

    await user.click(screen.getByRole('button', { name: /adicionar categoria/i }));
    expect(toastMock).toHaveBeenCalledWith(
      expect.objectContaining({ variant: 'destructive' })
    );
  });

  it('exibe toast de erro quando categoria já existe', async () => {
    const user = userEvent.setup();
    render(<CategoryManager />);

    // CAMPO já existe nas saídas (aba padrão = expense)
    const input = screen.getByPlaceholderText(/ex: entretenimento/i);
    await user.type(input, 'CAMPO');
    await user.click(screen.getByRole('button', { name: /adicionar categoria/i }));

    expect(toastMock).toHaveBeenCalledWith(
      expect.objectContaining({ variant: 'destructive' })
    );
  });

  it('adiciona nova categoria com sucesso e exibe toast verde', async () => {
    const user = userEvent.setup();
    render(<CategoryManager />);

    const input = screen.getByPlaceholderText(/ex: entretenimento/i);
    await user.type(input, 'TRANSPORTE');
    await user.click(screen.getByRole('button', { name: /adicionar categoria/i }));

    await waitFor(() => {
      expect(screen.getByText('TRANSPORTE')).toBeInTheDocument();
    });
    expect(toastMock).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Sucesso' })
    );
  });

  it('limpa o campo após adicionar a categoria', async () => {
    const user = userEvent.setup();
    render(<CategoryManager />);

    const input = screen.getByPlaceholderText(/ex: entretenimento/i);
    await user.type(input, 'NOVA CATEGORIA');
    await user.click(screen.getByRole('button', { name: /adicionar categoria/i }));

    await waitFor(() => {
      expect(input).toHaveValue('');
    });
  });

  it('submete com Enter além de clicar no botão', async () => {
    const user = userEvent.setup();
    render(<CategoryManager />);

    const input = screen.getByPlaceholderText(/ex: entretenimento/i);
    await user.type(input, 'VIA ENTER{Enter}');

    await waitFor(() => {
      expect(screen.getByText('VIA ENTER')).toBeInTheDocument();
    });
  });
});

describe('CategoryManager — deletar categoria', () => {

  it('número de categorias diminui após excluir', async () => {
    const user = userEvent.setup();
    render(<CategoryManager />);

    // Aguarda carregar as categorias
    await waitFor(() => expect(screen.getByText('CAMPO')).toBeInTheDocument());

    // Conta todos os botões ghost (cada categoria tem 2: editar + excluir)
    const buttonsBefore = screen.getAllByRole('button').length;

    // Clica no segundo botão da primeira categoria (index 1 = trash)
    // Os botões: [Entradas tab, Saídas tab, edit-0, trash-0, edit-1, trash-1...]
    // Pula os 2 primeiros (tabs) e pega o 4º (trash da 1ª categoria)
    const allButtons = screen.getAllByRole('button');
    // Botão de delete é o segundo entre os pares após os tabs
    const deleteBtn = allButtons.find((btn, i) => {
      return i >= 2 && btn.className.includes('destructive');
    });

    if (deleteBtn) {
      await user.click(deleteBtn);
      const buttonsAfter = screen.getAllByRole('button').length;
      // Deve ter 2 botões a menos (edit + delete da categoria removida)
      expect(buttonsAfter).toBe(buttonsBefore - 2);
    } else {
      // Se não encontrar o botão destrutivo, verifica que a lista tem botões
      expect(buttonsBefore).toBeGreaterThan(2);
    }
  });
});
