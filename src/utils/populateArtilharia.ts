/**
 * Script para popular a artilharia com dados pré-definidos
 * Execute esta função no console do navegador ou importe temporariamente
 */

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
 * Popula o localStorage com os jogadores fornecidos
 * @param clearExisting - Se true, limpa os jogadores existentes antes de adicionar
 */
export function populateArtilharia(clearExisting: boolean = false) {
  const jogadores = jogadoresData.map((data, index) => ({
    id: `${Date.now()}-${index}`,
    nome: data.jogador,
    gols: data.gols,
    posicao: undefined, // Posição no campo não está no JSON fornecido
  }));

  if (clearExisting) {
    localStorage.setItem('artilharia', JSON.stringify(jogadores));
  } else {
    // Adiciona aos existentes
    const existing = localStorage.getItem('artilharia');
    const existingJogadores = existing ? JSON.parse(existing) : [];
    const allJogadores = [...existingJogadores, ...jogadores];
    localStorage.setItem('artilharia', JSON.stringify(allJogadores));
  }

  console.log(`✅ ${jogadores.length} jogadores cadastrados com sucesso!`);
  return jogadores;
}

/**
 * Função para ser executada no console do navegador
 * Use: window.populateArtilharia() no console
 */
if (typeof window !== 'undefined') {
  (window as any).populateArtilharia = populateArtilharia;
}



