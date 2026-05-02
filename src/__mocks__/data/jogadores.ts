/**
 * Mock de Jogadores (Artilharia) — Vaidoso FC
 */

import { Jogador } from '@/hooks/useArtilharia';

export const mockJogadores: Jogador[] = [
  { id: 'jog-001', nome: 'Lucas Mendes',   gols: 12, posicao: 'Atacante' },
  { id: 'jog-002', nome: 'Rafael Gomes',   gols: 9,  posicao: 'Meia' },
  { id: 'jog-003', nome: 'João Silva',     gols: 7,  posicao: 'Atacante' },
  { id: 'jog-004', nome: 'André Souza',    gols: 5,  posicao: 'Meia' },
  { id: 'jog-005', nome: 'Pedro Costa',    gols: 3,  posicao: 'Lateral' },
  { id: 'jog-006', nome: 'Carlos Lima',    gols: 2,  posicao: 'Volante' },
  { id: 'jog-007', nome: 'Felipe Martins', gols: 1,  posicao: 'Zagueiro' },
  { id: 'jog-008', nome: 'Thiago Alves',   gols: 0,  posicao: 'Goleiro' },
];

/** Top 5 esperado nos testes do relatório */
export const expectedTop5 = mockJogadores.slice(0, 5);

/** Jogador líder da artilharia */
export const expectedArtilheiro = mockJogadores[0];
