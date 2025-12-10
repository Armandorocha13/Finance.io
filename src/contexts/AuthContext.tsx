/**
 * AuthContext.tsx
 * 
 * Contexto de autenticação da aplicação Vaidoso FC
 * 
 * NOTA: Autenticação está desativada temporariamente.
 * Este contexto fornece um usuário mock para permitir
 * o funcionamento da aplicação sem necessidade de login.
 * 
 * Quando a autenticação for reativada, este arquivo deve
 * ser atualizado para usar o Supabase corretamente.
 * 
 * @author Vaidoso FC
 * @version 1.0.0
 */

import React, { createContext, useContext, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

/**
 * Interface do usuário da aplicação
 */
interface User {
  id: string;
  email: string;
  user_metadata?: {
    name?: string;
  };
}

/**
 * Tipo do contexto de autenticação
 * Define todas as propriedades e métodos disponíveis
 */
interface AuthContextType {
  user: User | null; // Usuário atual (mock quando autenticação desativada)
  session: Session | null; // Sessão do Supabase (null quando desativada)
  loading: boolean; // Estado de carregamento
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  isLoading: boolean; // Estado de carregamento adicional
}

// Criação do contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Hook para acessar o contexto de autenticação
 * 
 * @returns {AuthContextType} Contexto de autenticação
 * @throws {Error} Se usado fora do AuthProvider
 * 
 * @example
 * const { user, signOut } = useAuth();
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

/**
 * Provider de autenticação
 * 
 * ATENÇÃO: Autenticação está DESATIVADA.
 * Retorna sempre um usuário mock para permitir o funcionamento
 * da aplicação sem necessidade de login real.
 * 
 * @param {React.ReactNode} children - Componentes filhos
 * @returns {JSX.Element} Provider de autenticação
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Usuário mock - usado quando autenticação está desativada
  const mockUser: User = {
    id: '1',
    email: 'usuario@demo.com',
    user_metadata: {
      name: 'Usuário Demo',
    },
  };

  // Estados do contexto (valores fixos quando autenticação está desativada)
  const [user] = useState<User | null>(mockUser);
  const [session] = useState<Session | null>(null);
  const [loading] = useState(false);
  const [isLoading] = useState(false);

  /**
   * Função de cadastro (desativada)
   * 
   * @param {string} email - Email do usuário
   * @param {string} password - Senha do usuário
   * @param {string} fullName - Nome completo (opcional)
   * @returns {Promise<{ error: null }>} Sempre retorna sem erro
   */
  const signUp = async (email: string, password: string, fullName?: string) => {
    // TODO: Implementar quando autenticação for reativada
    return { error: null };
  };

  /**
   * Função de login (desativada)
   * 
   * @param {string} email - Email do usuário
   * @param {string} password - Senha do usuário
   * @returns {Promise<void>} Promise vazia
   */
  const signIn = async (email: string, password: string) => {
    // TODO: Implementar quando autenticação for reativada
  };

  /**
   * Função de logout (desativada)
   * 
   * @returns {Promise<void>} Promise vazia
   */
  const signOut = async () => {
    // TODO: Implementar quando autenticação for reativada
  };

  // Valor do contexto
  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    isLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
