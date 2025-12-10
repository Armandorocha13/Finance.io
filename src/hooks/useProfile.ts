/**
 * useProfile.ts
 * 
 * Hook customizado para gerenciamento de perfil de usuário
 * 
 * Funcionalidades:
 * - Carregar perfil do usuário atual
 * - Atualizar informações do perfil
 * - Sincronizar com a tabela profiles do Supabase
 * 
 * @author Vaidoso FC
 * @version 1.0.0
 */

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

/**
 * Interface do perfil de usuário
 */
export interface UserProfile {
  id: string; // ID do usuário (mesmo do auth.users)
  full_name: string | null; // Nome completo
  avatar_url: string | null; // URL do avatar
  created_at: string; // Data de criação
  updated_at: string; // Data da última atualização
}

/**
 * Hook para gerenciar perfil de usuário
 * 
 * @returns {Object} Objeto com perfil e funções de manipulação
 * @returns {UserProfile | null} profile - Perfil do usuário atual
 * @returns {boolean} isLoading - Estado de carregamento
 * @returns {Function} updateProfile - Função para atualizar perfil
 * @returns {Function} refreshProfile - Função para recarregar perfil
 * 
 * @example
 * const { profile, updateProfile, isLoading } = useProfile();
 */
export function useProfile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Carrega o perfil do usuário atual do Supabase
   */
  const loadProfile = async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        // Se o perfil não existe, tenta criar um
        if (error.code === 'PGRST116') {
          // Perfil não encontrado - cria um novo
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              full_name: user.user_metadata?.full_name || 
                        user.user_metadata?.name || 
                        user.email?.split('@')[0] || 
                        null,
            })
            .select()
            .single();

          if (createError) {
            console.error('Erro ao criar perfil:', createError);
            toast({
              title: "Aviso",
              description: "Não foi possível criar o perfil. Tente novamente.",
              variant: "destructive",
            });
          } else {
            setProfile(newProfile as UserProfile);
          }
        } else {
          console.error('Erro ao carregar perfil:', error);
        }
      } else {
        setProfile(data as UserProfile);
      }
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Carrega o perfil quando o usuário muda
   */
  useEffect(() => {
    loadProfile();
  }, [user?.id]);

  /**
   * Atualiza o perfil do usuário
   * 
   * @param {Partial<UserProfile>} updates - Campos a serem atualizados
   * @returns {Promise<boolean>} True se atualizado com sucesso
   */
  const updateProfile = async (updates: Partial<Pick<UserProfile, 'full_name' | 'avatar_url'>>) => {
    if (!user?.id) {
      toast({
        title: "Erro",
        description: "Você precisa estar autenticado para atualizar o perfil.",
        variant: "destructive",
      });
      return false;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      setProfile(data as UserProfile);
      toast({
        title: "Perfil atualizado!",
        description: "Suas informações foram salvas com sucesso.",
      });
      return true;
    } catch (error: any) {
      console.error('Erro ao atualizar perfil:', error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível atualizar o perfil. Tente novamente.",
        variant: "destructive",
      });
      return false;
    }
  };

  /**
   * Recarrega o perfil do banco de dados
   */
  const refreshProfile = async () => {
    setIsLoading(true);
    await loadProfile();
  };

  return {
    profile,
    isLoading,
    updateProfile,
    refreshProfile,
  };
}

