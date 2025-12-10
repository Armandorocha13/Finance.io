/**
 * useArtilharia.ts
 * 
 * Hook customizado para gerenciamento da artilharia do clube
 * 
 * Funcionalidades:
 * - Gerenciar lista de jogadores e seus gols
 * - Adicionar, editar e excluir jogadores
 * - Adicionar/remover gols individualmente
 * - Ordenação automática por número de gols
 * - Persistência no localStorage
 * 
 * @author Vaidoso FC
 * @version 1.0.0
 */

import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

/**
 * Interface de um jogador
 */
export interface Jogador {
  id: string; // ID único do jogador
  nome: string; // Nome completo do jogador
  gols: number; // Quantidade de gols marcados
  posicao?: string; // Posição do jogador (opcional)
  numero?: number; // Número da camisa (opcional, não usado atualmente)
}

/**
 * Hook para gerenciar a artilharia do clube
 * 
 * @returns {Object} Objeto com jogadores e funções de manipulação
 * @returns {Jogador[]} jogadores - Lista de jogadores ordenada por gols (maior para menor)
 * @returns {boolean} isLoading - Estado de carregamento
 * @returns {Function} addJogador - Função para adicionar jogador
 * @returns {Function} updateJogador - Função para atualizar jogador
 * @returns {Function} deleteJogador - Função para excluir jogador
 * @returns {Function} adicionarGol - Função para adicionar 1 gol a um jogador
 * @returns {Function} removerGol - Função para remover 1 gol de um jogador
 * 
 * @example
 * const { jogadores, addJogador, adicionarGol } = useArtilharia();
 */
export function useArtilharia() {
  // Hooks e estados
  const { toast } = useToast();
  const [jogadores, setJogadores] = useState<Jogador[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Carrega jogadores do localStorage ao montar o componente
   * 
   * Armazenamento:
   * - Chave: 'artilharia'
   * - Formato: JSON array de Jogador[]
   */
  useEffect(() => {
    const loadJogadores = () => {
      try {
        const savedJogadores = localStorage.getItem('artilharia');
        if (savedJogadores) {
          const parsed = JSON.parse(savedJogadores);
          setJogadores(parsed);
        }
      } catch (error) {
        console.error('Erro ao carregar artilharia do localStorage:', error);
        // Em caso de erro, mantém array vazio
      } finally {
        setIsLoading(false);
      }
    };

    loadJogadores();
  }, []);

  /**
   * Adiciona um novo jogador à artilharia
   * 
   * @param {Omit<Jogador, 'id'>} newJogador - Dados do jogador (sem id)
   * @returns {Promise<void>} Promise que resolve quando o jogador é adicionado
   */
  const addJogador = async (newJogador: Omit<Jogador, 'id'>) => {
    const jogador: Jogador = {
      ...newJogador,
      id: Date.now().toString(), // ID único baseado em timestamp
    };

    setJogadores(prev => {
      const updated = [...prev, jogador];
      localStorage.setItem('artilharia', JSON.stringify(updated));
      toast.success("Jogador adicionado com sucesso!");
      return updated;
    });
  };

  /**
   * Atualiza os dados de um jogador existente
   * 
   * @param {string} id - ID do jogador a ser atualizado
   * @param {Partial<Jogador>} updatedJogador - Dados parciais para atualização
   * @returns {Promise<void>} Promise que resolve quando o jogador é atualizado
   */
  const updateJogador = async (id: string, updatedJogador: Partial<Jogador>) => {
    setJogadores(prev => {
      const updated = prev.map(j => 
        j.id === id ? { ...j, ...updatedJogador } : j
      );
      localStorage.setItem('artilharia', JSON.stringify(updated));
      toast.success("Jogador atualizado com sucesso!");
      return updated;
    });
  };

  /**
   * Remove um jogador da artilharia
   * 
   * @param {string} id - ID do jogador a ser removido
   * @returns {Promise<void>} Promise que resolve quando o jogador é removido
   */
  const deleteJogador = async (id: string) => {
    setJogadores(prev => {
      const updated = prev.filter(j => j.id !== id);
      localStorage.setItem('artilharia', JSON.stringify(updated));
      toast.success("Jogador removido com sucesso!");
      return updated;
    });
  };

  /**
   * Adiciona 1 gol a um jogador
   * 
   * @param {string} id - ID do jogador
   * @returns {Promise<void>} Promise que resolve quando o gol é adicionado
   */
  const adicionarGol = async (id: string) => {
    setJogadores(prev => {
      const updated = prev.map(j => 
        j.id === id ? { ...j, gols: j.gols + 1 } : j
      );
      localStorage.setItem('artilharia', JSON.stringify(updated));
      toast.success("Gol adicionado!");
      return updated;
    });
  };

  /**
   * Remove 1 gol de um jogador (não permite valores negativos)
   * 
   * @param {string} id - ID do jogador
   * @returns {Promise<void>} Promise que resolve quando o gol é removido
   */
  const removerGol = async (id: string) => {
    setJogadores(prev => {
      const updated = prev.map(j => 
        j.id === id ? { ...j, gols: Math.max(0, j.gols - 1) } : j
      );
      localStorage.setItem('artilharia', JSON.stringify(updated));
      toast.success("Gol removido!");
      return updated;
    });
  };

  /**
   * Ordena jogadores por número de gols (maior para menor)
   * Usado para exibir o ranking da artilharia
   */
  const jogadoresOrdenados = [...jogadores].sort((a, b) => b.gols - a.gols);

  return {
    jogadores: jogadoresOrdenados,
    isLoading,
    addJogador,
    updateJogador,
    deleteJogador,
    adicionarGol,
    removerGol,
  };
}

