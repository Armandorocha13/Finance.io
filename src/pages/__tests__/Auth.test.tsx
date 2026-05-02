/**
 * Testes de Integração — Página de Autenticação (Auth.tsx)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { mockAuthContext, mockAuthContextLoginError } from '@/__mocks__/data';

// ── Mocks ─────────────────────────────────────────────────────────────────────

const navigateMock = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...(actual as object), useNavigate: () => navigateMock };
});

const toastMock = vi.fn();
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: toastMock }),
  toast: toastMock,
}));

const mockUseAuth = vi.fn(() => ({ ...mockAuthContext, user: null }));
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

const { default: Auth } = await import('@/pages/Auth');

const renderAuth = () =>
  render(<MemoryRouter><Auth /></MemoryRouter>);

// ── Testes ────────────────────────────────────────────────────────────────────

describe('Auth — renderização inicial', () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({ ...mockAuthContext, user: null });
    vi.clearAllMocks();
  });

  it('exibe o título do formulário de login ("Login")', () => {
    renderAuth();
    // CardTitle exibe 'Login' quando isLogin=true
    expect(screen.getByText('Login')).toBeInTheDocument();
  });

  it('exibe campo de email', () => {
    renderAuth();
    expect(screen.getByLabelText(/^email$/i)).toBeInTheDocument();
  });

  it('exibe campo de senha', () => {
    renderAuth();
    expect(screen.getByLabelText(/^senha$/i)).toBeInTheDocument();
  });

  it('exibe botão de alternar para criar conta', () => {
    renderAuth();
    expect(screen.getByRole('button', { name: /criar conta/i })).toBeInTheDocument();
  });

  it('exibe botão de magic link', () => {
    renderAuth();
    expect(
      screen.getByRole('button', { name: /entrar sem senha/i })
    ).toBeInTheDocument();
  });
});

describe('Auth — alternância Login / Cadastro', () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({ ...mockAuthContext, user: null });
    vi.clearAllMocks();
  });

  it('alterna para o formulário de cadastro ao clicar em "Criar conta"', async () => {
    const user = userEvent.setup();
    renderAuth();

    const toggleBtn = screen.getByRole('button', { name: 'Criar conta' });
    await user.click(toggleBtn);
    await waitFor(() => {
      // Pelo menos um elemento com 'Criar Conta' (CardTitle ou botão submit)
      expect(screen.getAllByText('Criar Conta').length).toBeGreaterThan(0);
    });
  });

  it('retorna ao login ao clicar em "Fazer login"', async () => {
    const user = userEvent.setup();
    renderAuth();

    await user.click(screen.getByRole('button', { name: 'Criar conta' }));
    await waitFor(() => expect(screen.getAllByText('Criar Conta').length).toBeGreaterThan(0));

    await user.click(screen.getByRole('button', { name: 'Fazer login' }));
    await waitFor(() => {
      expect(screen.getByText('Login')).toBeInTheDocument();
    });
  });

  it('exibe campo Nome Completo apenas no cadastro', async () => {
    const user = userEvent.setup();
    renderAuth();

    expect(screen.queryByLabelText(/nome completo/i)).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /criar conta/i }));
    await waitFor(() => {
      expect(screen.getByLabelText(/nome completo/i)).toBeInTheDocument();
    });
  });
});

describe('Auth — login com email e senha', () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({ ...mockAuthContext, user: null });
    vi.clearAllMocks();
  });

  it('chama signIn com email e senha corretos', async () => {
    const user = userEvent.setup();
    renderAuth();

    await user.type(screen.getByLabelText(/^email$/i), 'admin@vaidosofc.com');
    await user.type(screen.getByLabelText(/^senha$/i), 'senha123');
    await user.click(screen.getByRole('button', { name: /^entrar$/i }));

    await waitFor(() => {
      expect(mockAuthContext.signIn).toHaveBeenCalledWith(
        'admin@vaidosofc.com',
        'senha123'
      );
    });
  });

  it('exibe toast de erro quando credenciais estão erradas', async () => {
    mockUseAuth.mockReturnValue({ ...mockAuthContextLoginError, user: null });
    const user = userEvent.setup();
    renderAuth();

    await user.type(screen.getByLabelText(/^email$/i), 'errado@email.com');
    await user.type(screen.getByLabelText(/^senha$/i), 'senhaerrada');
    await user.click(screen.getByRole('button', { name: /^entrar$/i }));

    await waitFor(() => {
      expect(toastMock).toHaveBeenCalledWith(
        expect.objectContaining({ variant: 'destructive' })
      );
    });
  });
});

describe('Auth — Magic Link', () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({ ...mockAuthContext, user: null });
    vi.clearAllMocks();
  });

  it('exibe formulário de Magic Link ao clicar no botão', async () => {
    const user = userEvent.setup();
    renderAuth();

    await user.click(
      screen.getByRole('button', { name: /entrar sem senha/i })
    );
    await waitFor(() => {
      expect(screen.getByText(/link por email/i)).toBeInTheDocument();
    });
  });

  it('volta para login ao clicar em "Voltar para login com senha"', async () => {
    const user = userEvent.setup();
    renderAuth();

    await user.click(screen.getByRole('button', { name: /entrar sem senha/i }));
    await waitFor(() => expect(screen.getByText(/link por email/i)).toBeInTheDocument());

    await user.click(screen.getByRole('button', { name: /voltar para login/i }));
    await waitFor(() => {
      expect(screen.getByText('Login')).toBeInTheDocument();
    });
  });
});

describe('Auth — usuário já autenticado', () => {
  it('redireciona para "/" quando usuário já está logado', async () => {
    mockUseAuth.mockReturnValue({ ...mockAuthContext, user: mockAuthContext.user });
    renderAuth();

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith('/', expect.anything());
    });
  });
});
