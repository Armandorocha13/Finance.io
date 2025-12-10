/**
 * Script de Teste de Conexão com Supabase
 * 
 * Este script testa a conexão com o banco de dados Supabase
 * e verifica se as tabelas foram criadas corretamente.
 * 
 * Uso: npm run test:db ou npx tsx scripts/test-db-connection.ts
 * 
 * @author Vaidoso FC
 */

import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const SUPABASE_URL = "https://zmowanlowqpioxbycead.supabase.co";
// NOTA: Você precisa obter a chave anon no Dashboard
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || "SUA_CHAVE_AQUI";

// Cria cliente Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Testa a conexão básica
 */
async function testBasicConnection() {
  console.log('\n🔌 Testando conexão básica...\n');
  
  try {
    // Teste simples de conexão
    const { data, error } = await supabase
      .from('transactions')
      .select('count', { count: 'exact', head: true });
    
    if (error) {
      // Se a tabela não existe, ainda é uma conexão válida
      if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
        console.log('⚠️  Tabela "transactions" não encontrada.');
        console.log('   Isso é normal se você ainda não executou as migrações.\n');
        return true; // Conexão OK, mas tabela não existe
      }
      throw error;
    }
    
    console.log('✅ Conexão estabelecida com sucesso!');
    console.log(`   Total de transações: ${data || 0}\n`);
    return true;
  } catch (error: any) {
    console.error('❌ Erro na conexão:', error.message);
    if (error.message.includes('Invalid API key')) {
      console.error('\n💡 Dica: Verifique se a chave anon está correta.');
      console.error('   Obtenha em: https://zmowanlowqpioxbycead.supabase.co/project/_/settings/api\n');
    }
    return false;
  }
}

/**
 * Verifica se as tabelas existem
 */
async function checkTables() {
  console.log('📊 Verificando tabelas...\n');
  
  const tables = ['categories', 'transactions', 'artilharia'];
  const results: { [key: string]: boolean } = {};
  
  for (const table of tables) {
    try {
      const { error } = await supabase
        .from(table)
        .select('count', { count: 'exact', head: true });
      
      if (error) {
        if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
          results[table] = false;
        } else {
          throw error;
        }
      } else {
        results[table] = true;
      }
    } catch (error: any) {
      console.error(`❌ Erro ao verificar tabela ${table}:`, error.message);
      results[table] = false;
    }
  }
  
  // Exibe resultados
  for (const [table, exists] of Object.entries(results)) {
    if (exists) {
      console.log(`✅ ${table} - OK`);
    } else {
      console.log(`❌ ${table} - Não encontrada`);
    }
  }
  
  const allExist = Object.values(results).every(v => v === true);
  console.log('');
  
  if (!allExist) {
    console.log('💡 Execute as migrações em: supabase/migrations/001_initial_schema.sql\n');
  }
  
  return allExist;
}

/**
 * Testa inserção e leitura (se autenticado)
 */
async function testInsertRead() {
  console.log('🧪 Testando inserção e leitura...\n');
  
  // Verifica se está autenticado
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    console.log('⚠️  Usuário não autenticado.');
    console.log('   Teste de inserção/leitura pulado.\n');
    return false;
  }
  
  try {
    // Tenta inserir uma categoria de teste
    const testCategory = {
      user_id: user.id,
      name: 'TESTE CONEXÃO',
      type: 'income' as const,
      is_default: false,
    };
    
    const { data: inserted, error: insertError } = await supabase
      .from('categories')
      .insert(testCategory)
      .select()
      .single();
    
    if (insertError) {
      // Se já existe, tenta buscar
      if (insertError.code === '23505') {
        console.log('ℹ️  Categoria de teste já existe. Buscando...');
        
        const { data: existing, error: selectError } = await supabase
          .from('categories')
          .select('*')
          .eq('user_id', user.id)
          .eq('name', 'TESTE CONEXÃO')
          .single();
        
        if (selectError) throw selectError;
        
        console.log('✅ Leitura funcionando!');
        console.log(`   Categoria encontrada: ${existing.name}\n`);
        return true;
      }
      throw insertError;
    }
    
    console.log('✅ Inserção funcionando!');
    console.log(`   Categoria criada: ${inserted.name}`);
    
    // Limpa o teste
    await supabase
      .from('categories')
      .delete()
      .eq('id', inserted.id);
    
    console.log('✅ Leitura funcionando!');
    console.log('✅ Limpeza concluída.\n');
    return true;
  } catch (error: any) {
    console.error('❌ Erro no teste:', error.message);
    console.log('');
    return false;
  }
}

/**
 * Função principal
 */
async function main() {
  console.log('========================================');
  console.log('  Teste de Conexão - Supabase');
  console.log('========================================');
  console.log(`URL: ${SUPABASE_URL}`);
  console.log(`Key: ${SUPABASE_ANON_KEY.substring(0, 20)}...`);
  console.log('========================================\n');
  
  // Verifica se a chave foi configurada
  if (SUPABASE_ANON_KEY === 'SUA_CHAVE_AQUI') {
    console.error('❌ ERRO: Chave anon não configurada!');
    console.error('\n💡 Como configurar:');
    console.error('   1. Acesse: https://zmowanlowqpioxbycead.supabase.co');
    console.error('   2. Settings → API → anon public key');
    console.error('   3. Configure a variável VITE_SUPABASE_ANON_KEY');
    console.error('   4. Ou edite este arquivo diretamente\n');
    process.exit(1);
  }
  
  // Executa testes
  const connectionOk = await testBasicConnection();
  if (!connectionOk) {
    console.error('\n❌ Falha na conexão básica. Verifique as credenciais.\n');
    process.exit(1);
  }
  
  const tablesOk = await checkTables();
  const insertOk = await testInsertRead();
  
  // Resumo
  console.log('========================================');
  console.log('  Resumo dos Testes');
  console.log('========================================');
  console.log(`Conexão:        ${connectionOk ? '✅ OK' : '❌ FALHOU'}`);
  console.log(`Tabelas:        ${tablesOk ? '✅ OK' : '⚠️  Execute migrações'}`);
  console.log(`Inserção/Leitura: ${insertOk ? '✅ OK' : '⚠️  Requer autenticação'}`);
  console.log('========================================\n');
  
  if (connectionOk && tablesOk) {
    console.log('🎉 Banco de dados configurado corretamente!\n');
    process.exit(0);
  } else {
    console.log('⚠️  Alguns testes falharam. Verifique acima.\n');
    process.exit(1);
  }
}

// Executa se chamado diretamente
if (require.main === module) {
  main().catch(console.error);
}

export { testBasicConnection, checkTables, testInsertRead };

