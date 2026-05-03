/**
 * Mock do usuário autenticado — Vaidoso FC
 */

import { User, Session } from '@supabase/supabase-js';

export const mockUser: Partial<User> = {
  id: 'mock-user-uuid-0001',
  email: 'admin@vaidosofc.com',
  user_metadata: {
    full_name: 'Admin Vaidoso FC',
    name: 'Admin Vaidoso FC',
  },
  created_at: '2024-01-01T00:00:00.000Z',
  role: 'authenticated',
};

export const mockSession: Partial<Session> = {
  access_token: 'mock-access-token-abc123',
  token_type: 'bearer',
  expires_in: 3600,
  user: mockUser as User,
};

/** Contexto de auth mockado para uso em testes */
export const mockAuthContext = {
  user: mockUser as User,
  session: mockSession as Session,
  loading: false,
  isLoading: false,
  signIn: vi.fn().mockResolvedValue({ error: null }),
  signUp: vi.fn().mockResolvedValue({ error: null }),
  signInWithGoogle: vi.fn().mockResolvedValue({ error: null }),
  signInWithMagicLink: vi.fn().mockResolvedValue({ error: null }),
  signOut: vi.fn().mockResolvedValue(undefined),
};

/** Auth sem usuário (não autenticado) */
export const mockAuthContextUnauthenticated = {
  ...mockAuthContext,
  user: null,
  session: null,
};

/** Auth com erro de login */
export const mockAuthContextLoginError = {
  ...mockAuthContext,
  signIn: vi.fn().mockResolvedValue({
    error: { message: 'Invalid login credentials' },
  }),
};
import { vi } from 'vitest';
