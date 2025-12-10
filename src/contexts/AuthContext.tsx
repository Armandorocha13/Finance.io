/**
 * AuthContext.tsx
 * 
 * Contexto de autenticação da aplicação Vaidoso FC
 * 
 * Gerencia autenticação usando Supabase Auth:
 * - Login e cadastro de usuários
 * - Gerenciamento de sessão
 * - Verificação de autenticação
 * - Logout
 * 
 * @author Vaidoso FC
 * @version 2.0.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

/**
 * Tipo do contexto de autenticação
 * Define todas as propriedades e métodos disponíveis
 */
interface AuthContextType {
  user: User | null; // Usuário atual autenticado
  session: Session | null; // Sessão do Supabase
  loading: boolean; // Estado de carregamento inicial
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
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
 * Gerencia autenticação real usando Supabase Auth.
 * Monitora mudanças de sessão e atualiza o estado automaticamente.
 * 
 * @param {React.ReactNode} children - Componentes filhos
 * @returns {JSX.Element} Provider de autenticação
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Carrega a sessão atual ao montar o componente
   * e monitora mudanças de autenticação
   */
  useEffect(() => {
    // Carrega sessão inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Monitora mudanças de autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  /**
   * Função de cadastro de novo usuário
   * 
   * @param {string} email - Email do usuário
   * @param {string} password - Senha do usuário
   * @param {string} fullName - Nome completo (opcional)
   * @returns {Promise<{ error: any }>} Retorna erro se houver, null se sucesso
   */
  const signUp = async (email: string, password: string, fullName?: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName || '',
            name: fullName || '',
          },
        },
      });

      if (error) {
        return { error };
      }

      // Atualiza estado local
      if (data.session) {
        setSession(data.session);
        setUser(data.user);
      }

      return { error: null };
    } catch (error: any) {
      return { error };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Função de login
   * 
   * @param {string} email - Email do usuário
   * @param {string} password - Senha do usuário
   * @returns {Promise<{ error: any }>} Retorna erro se houver, null se sucesso
   */
  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Erro no signIn:', error);
        return { error };
      }

      // Atualiza estado local
      if (data.session) {
        setSession(data.session);
        setUser(data.user);
      } else {
        // Se não há sessão, pode ser que o email não esteja confirmado
        console.warn('Login realizado mas sem sessão. Verifique se o email foi confirmado.');
        return { 
          error: { 
            message: 'Email não confirmado. Verifique sua caixa de entrada.' 
          } 
        };
      }

      return { error: null };
    } catch (error: any) {
      console.error('Exceção no signIn:', error);
      return { error };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Função de logout
   * 
   * @returns {Promise<void>} Promise que resolve quando logout é concluído
   */
  const signOut = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        toast({
          title: "Erro",
          description: "Erro ao fazer logout. Tente novamente.",
          variant: "destructive",
        });
        return;
      }

      // Limpa estado local
      setSession(null);
      setUser(null);

      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      toast({
        title: "Erro",
        description: "Erro ao fazer logout. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
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
