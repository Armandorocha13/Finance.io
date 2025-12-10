/**
 * Script para popular a artilharia com os jogadores fornecidos
 * 
 * INSTRUÇÕES:
 * 1. Abra a aplicação no navegador
 * 2. Abra o Console do Desenvolvedor (F12)
 * 3. Cole e execute este script completo
 */

const jogadoresData = [
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

// Função para popular a artilharia
function populateArtilharia() {
  const baseTime = Date.now();
  const newJogadores = jogadoresData.map((data, index) => ({
    id: `${baseTime}-${index}`,
    nome: data.jogador,
    gols: data.gols,
    posicao: undefined,
  }));

  // Obtém jogadores existentes
  const existing = localStorage.getItem('artilharia');
  const existingJogadores = existing ? JSON.parse(existing) : [];
  
  // Verifica se já existem jogadores com os mesmos nomes
  const existingNames = new Set(existingJogadores.map(j => j.nome.toLowerCase()));
  const jogadoresToAdd = newJogadores.filter(j => !existingNames.has(j.nome.toLowerCase()));
  
  if (jogadoresToAdd.length === 0) {
    console.log('⚠️ Todos os jogadores já estão cadastrados!');
    return;
  }

  // Adiciona os novos jogadores
  const allJogadores = [...existingJogadores, ...jogadoresToAdd];
  localStorage.setItem('artilharia', JSON.stringify(allJogadores));
  
  console.log(`✅ ${jogadoresToAdd.length} jogadores cadastrados com sucesso!`);
  console.log('🔄 Recarregue a página para ver os jogadores na lista.');
  
  return jogadoresToAdd.length;
}

// Executa a função
populateArtilharia();


