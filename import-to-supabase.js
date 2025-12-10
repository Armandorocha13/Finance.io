/**
 * Script para importar dados da artilharia para o Supabase
 * 
 * INSTRUÇÕES:
 * 1. Abra a aplicação no navegador e faça login
 * 2. Abra o Console do Desenvolvedor (F12)
 * 3. Cole e execute este script completo
 * 
 * NOTA: Este script requer que você esteja autenticado
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

// Função para importar para o Supabase
async function importToSupabase() {
  try {
    // Verifica se o supabase está disponível
    if (typeof window === 'undefined' || !window.supabase) {
      console.error('❌ Supabase não está disponível. Certifique-se de estar na aplicação.');
      return;
    }

    // Obtém o usuário atual
    const { data: { user }, error: userError } = await window.supabase.auth.getUser();
    
    if (userError || !user) {
      console.error('❌ Você precisa estar autenticado para importar os dados.');
      console.error('Por favor, faça login na aplicação primeiro.');
      return;
    }

    console.log(`✅ Usuário autenticado: ${user.email}`);

    // Prepara os dados
    const jogadoresToInsert = jogadoresData.map((data) => ({
      nome: data.jogador,
      gols: data.gols,
      posicao: null,
      user_id: user.id,
    }));

    // Verifica jogadores existentes
    const { data: existingJogadores, error: fetchError } = await window.supabase
      .from('artilharia')
      .select('nome')
      .eq('user_id', user.id);

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
      console.log('⚠️ Todos os jogadores já estão cadastrados para este usuário.');
      return;
    }

    console.log(`📊 Importando ${newJogadores.length} jogadores...`);

    // Insere no banco
    const { data, error } = await window.supabase
      .from('artilharia')
      .insert(newJogadores)
      .select();

    if (error) {
      throw error;
    }

    console.log(`✅ ${newJogadores.length} jogadores importados com sucesso!`);
    console.log('🔄 Recarregue a página para ver os jogadores na lista.');
    
    return data;
  } catch (error) {
    console.error('❌ Erro ao importar:', error);
    throw error;
  }
}

// Executa a função
console.log('🚀 Iniciando importação para o Supabase...');
importToSupabase()
  .then(() => console.log('✅ Importação concluída!'))
  .catch((error) => console.error('❌ Erro na importação:', error));

