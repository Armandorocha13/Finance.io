/**
 * Mock de Jogadores (Artilharia) — Vaidoso FC
 */

import { Jogador } from '@/hooks/useArtilharia';

export const mockJogadores: Jogador[] = [
  { id: 'jog-001', nome: 'Lucas Mendes',   gols: 12, posicao: 'Atacante', user_id: 'mock-user-uuid-0001' },
  { id: 'jog-002', nome: 'Rafael Gomes',   gols: 9,  posicao: 'Meia',     user_id: 'mock-user-uuid-0001' },
  { id: 'jog-003', nome: 'João Silva',     gols: 7,  posicao: 'Atacante', user_id: 'mock-user-uuid-0001' },
  { id: 'jog-004', nome: 'André Souza',    gols: 5,  posicao: 'Meia',     user_id: 'mock-user-uuid-0001' },
  { id: 'jog-005', nome: 'Pedro Costa',    gols: 3,  posicao: 'Lateral',  user_id: 'mock-user-uuid-0001' },
  { id: 'jog-006', nome: 'Carlos Lima',    gols: 2,  posicao: 'Volante',  user_id: 'mock-user-uuid-0001' },
  { id: 'jog-007', nome: 'Felipe Martins', gols: 1,  posicao: 'Zagueiro', user_id: 'mock-user-uuid-0001' },
  { id: 'jog-008', nome: 'Thiago Alves',   gols: 0,  posicao: 'Goleiro',  user_id: 'mock-user-uuid-0001' },
];

/** Top 5 esperado nos testes do relatório */
export const expectedTop5 = mockJogadores.slice(0, 5);

/** Jogador líder da artilharia */
export const expectedArtilheiro = mockJogadores[0];
