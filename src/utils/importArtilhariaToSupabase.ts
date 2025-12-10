/**
 * Script para importar dados da artilharia para o Supabase
 * 
 * Este script importa os jogadores da artilharia para a tabela 'artilharia' no Supabase
 */

import { supabase } from '@/integrations/supabase/client';

export interface JogadorData {
  posicao: string;
  jogador: string;
  gols: number;
}

export const jogadoresData: JogadorData[] = [
  { posicao: "1º", jogador: "William", gols: 40 },
  { posicao: "1º", jogador: "Gabriel Chiclete", gols: 40 },
  { posicao: "2º", jogador: "Juninho", gols: 24 },
  { posicao: "3º", jogador: "Gabriel Moço", gols: 24 },
  { posicao: "4º", jogador: "Edson", gols: 22 },
  { posicao: "5º", jogador: "Gabriel Silva", gols: 18 },
  { posicao: "6º", jogador: "Riquelme", gols: 14 },
  { posicao: "6º", jogador: "Phelipe", gols: 14 },
  { posicao: "6º", jogador: "Brenek", gols: 14 },
  { posicao: "9º", jogador: "Fabinho", gols: 12 },
  { posicao: "10º", jogador: "Daniel", gols: 11 },
  { posicao: "11º", jogador: "Arthur", gols: 10 },
  { posicao: "12º", jogador: "Wermerson", gols: 9 },
  { posicao: "13º", jogador: "Bob", gols: 7 },
  { posicao: "14º", jogador: "Douglas", gols: 5 },
  { posicao: "15º", jogador: "João", gols: 4 },
  { posicao: "15º", jogador: "Patrick", gols: 4 },
  { posicao: "17º", jogador: "Mimose", gols: 3 },
  { posicao: "17º", jogador: "Alessandro", gols: 3 },
  { posicao: "17º", jogador: "Guilherme", gols: 3 },
  { posicao: "17º", jogador: "Checo", gols: 3 },
  { posicao: "21º", jogador: "Marquinho", gols: 2 },
  { posicao: "21º", jogador: "Piolho", gols: 2 },
  { posicao: "21º", jogador: "Otoniel", gols: 2 },
  { posicao: "21º", jogador: "Dario", gols: 2 },
  { posicao: "25º", jogador: "Alex", gols: 1 },
  { posicao: "25º", jogador: "Vitor", gols: 1 },
  { posicao: "25º", jogador: "Ari", gols: 1 },
  { posicao: "25º", jogador: "Bruno", gols: 1 },
  { posicao: "25º", jogador: "Diego", gols: 1 },
  { posicao: "25º", jogador: "George", gols: 1 },
  { posicao: "25º", jogador: "Jefferson G", gols: 1 },
  { posicao: "25º", jogador: "Giovani", gols: 1 },
  { posicao: "25º", jogador: "Leleco", gols: 1 },
  { posicao: "25º", jogador: "Diogenes", gols: 1 },
  { posicao: "36º", jogador: "Ezequiel", gols: 0 },
  { posicao: "36º", jogador: "Ivan", gols: 0 },
];

/**
 * Importa os jogadores para o Supabase
 * @param userId - ID do usuário autenticado (obrigatório para associar os dados)
 * @returns Promise com o resultado da importação
 */
export async function importArtilhariaToSupabase(userId: string) {
  try {
    // Prepara os dados para inserção
    const jogadoresToInsert = jogadoresData.map((data) => ({
      nome: data.jogador,
      gols: data.gols,
      posicao: null, // Posição no campo não está no JSON fornecido
      user_id: userId,
    }));

    // Verifica se já existem jogadores com os mesmos nomes para este usuário
    const { data: existingJogadores, error: fetchError } = await supabase
      .from('artilharia')
      .select('nome')
      .eq('user_id', userId);

    if (fetchError) {
      throw fetchError;
    }

    const existingNames = new Set(
      (existingJogadores || []).map((j) => j.nome.toLowerCase())
    );

    // Filtra apenas jogadores novos
    const newJogadores = jogadoresToInsert.filter(
      (j) => !existingNames.has(j.nome.toLowerCase())
    );

    if (newJogadores.length === 0) {
      return {
        success: false,
        message: 'Todos os jogadores já estão cadastrados para este usuário.',
        count: 0,
      };
    }

    // Insere os jogadores no banco de dados
    const { data, error } = await supabase
      .from('artilharia')
      .insert(newJogadores)
      .select();

    if (error) {
      throw error;
    }

    return {
      success: true,
      message: `${newJogadores.length} jogadores importados com sucesso!`,
      count: newJogadores.length,
      data,
    };
  } catch (error: any) {
    console.error('Erro ao importar artilharia:', error);
    return {
      success: false,
      message: `Erro ao importar: ${error.message}`,
      count: 0,
      error,
    };
  }
}

/**
 * Função para ser executada no console do navegador
 * Use: window.importArtilhariaToSupabase(userId) no console
 */
if (typeof window !== 'undefined') {
  (window as any).importArtilhariaToSupabase = importArtilhariaToSupabase;
}

