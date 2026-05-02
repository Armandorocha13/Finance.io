/**
 * Mock do cliente Supabase
 *
 * Substitui todas as chamadas reais ao Supabase durante os testes.
 * Cada método retorna dados mockados controlados nos testes.
 */

import { mockTransactions } from '@/__mocks__/data/transactions';

/** Builder encadeável que imita a API do Supabase */
const createQueryBuilder = (defaultData: any[] = [], defaultError: any = null) => {
  const builder: any = {
    _data: defaultData,
    _error: defaultError,
    _single: false,

    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    neq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    single() { this._single = true; return this; },

    then(resolve: Function) {
      const result = this._single
        ? { data: this._data[0] ?? null, error: this._error }
        : { data: this._data, error: this._error };
      return Promise.resolve(result).then(resolve);
    },
  };
  return builder;
};

export const mockSupabaseClient = {
  auth: {
    getSession: vi.fn().mockResolvedValue({
      data: { session: null },
      error: null,
    }),
    onAuthStateChange: vi.fn().mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    }),
    signInWithPassword: vi.fn().mockResolvedValue({
      data: { session: null, user: null },
      error: null,
    }),
    signUp: vi.fn().mockResolvedValue({
      data: { session: null, user: null },
      error: null,
    }),
    signOut: vi.fn().mockResolvedValue({ error: null }),
    signInWithOAuth: vi.fn().mockResolvedValue({ error: null }),
    signInWithOtp: vi.fn().mockResolvedValue({ error: null }),
  },

  from: vi.fn((table: string) => {
    switch (table) {
      case 'transactions':
        return createQueryBuilder(mockTransactions);
      case 'artilharia':
        return createQueryBuilder([]);
      default:
        return createQueryBuilder([]);
    }
  }),

  channel: vi.fn().mockReturnValue({
    on: vi.fn().mockReturnThis(),
    subscribe: vi.fn().mockReturnValue({ unsubscribe: vi.fn() }),
  }),

  removeChannel: vi.fn(),
};

/** Reseta todos os mocks do Supabase (use no beforeEach) */
export const resetSupabaseMocks = () => {
  vi.clearAllMocks();
};
