/**
 * Teste de Conexão com Supabase Client
 * 
 * Este script testa a conexão usando o Supabase JavaScript Client
 * que é a forma recomendada de conectar com o Supabase.
 * 
 * Execute: npm run test:db:supabase
 * 
 * @author Vaidoso FC
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://zmowanlowqpioxbycead.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inptb3dhbmxvd3FwaW94YnljZWFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzNDMzODcsImV4cCI6MjA4MDkxOTM4N30.mzmj1nD7zPvFRnwhJ7Q5KGEzMhqkGQFkZFC3jFe0HGI";

console.log('\n🔌 Testando conexão com Supabase...\n');
console.log(`URL: ${SUPABASE_URL}`);
console.log(`Key: ${SUPABASE_ANON_KEY.substring(0, 30)}...\n`);

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testConnection() {
  try {
    // Teste 1: Verificar se consegue conectar
    console.log('1️⃣ Testando conexão básica...');
    
    // Tenta fazer uma query simples
    const { data, error } = await supabase
      .from('transactions')
      .select('count', { count: 'exact', head: true });
    
    if (error) {
      if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
        console.log('   ⚠️  Tabela "transactions" não encontrada.');
        console.log('   ✅ Mas a conexão está funcionando!');
        console.log('   💡 Execute: supabase/migrations/001_initial_schema.sql\n');
      } else if (error.message.includes('Invalid API key') || error.message.includes('JWT')) {
        console.log('   ❌ Erro: Chave anon inválida ou expirada');
        console.log('   💡 Verifique a chave em: https://zmowanlowqpioxbycead.supabase.co/project/_/settings/api\n');
        throw error;
      } else {
        throw error;
      }
    } else {
      console.log('   ✅ Conexão estabelecida com sucesso!');
      console.log(`   📊 Total de transações: ${data || 0}\n`);
    }
    
    // Teste 2: Verificar todas as tabelas
    console.log('2️⃣ Verificando tabelas...\n');
    
    const tables = [
      { name: 'categories', description: 'Categorias de transações' },
      { name: 'transactions', description: 'Transações financeiras' },
      { name: 'artilharia', description: 'Jogadores e gols' }
    ];
    
    const results = [];
    
    for (const table of tables) {
      try {
        const { error: tableError } = await supabase
          .from(table.name)
          .select('count', { count: 'exact', head: true });
        
        if (tableError) {
          if (tableError.code === 'PGRST116' || tableError.message.includes('does not exist')) {
            results.push({ name: table.name, exists: false, error: null });
          } else {
            results.push({ name: table.name, exists: false, error: tableError.message });
          }
        } else {
          results.push({ name: table.name, exists: true, error: null });
        }
      } catch (err) {
        results.push({ name: table.name, exists: false, error: err.message });
      }
    }
    
    // Exibe resultados
    for (const result of results) {
      const table = tables.find(t => t.name === result.name);
      if (result.exists) {
        console.log(`   ✅ ${result.name.padEnd(15)} - OK`);
      } else {
        console.log(`   ❌ ${result.name.padEnd(15)} - Não encontrada`);
        if (result.error && !result.error.includes('does not exist')) {
          console.log(`      Erro: ${result.error}`);
        }
      }
    }
    
    const existingTables = results.filter(r => r.exists).length;
    console.log(`\n   📊 ${existingTables}/3 tabelas encontradas\n`);
    
    // Teste 3: Verificar autenticação
    console.log('3️⃣ Verificando autenticação...');
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    
    if (authError) {
      console.log('   ⚠️  Erro ao verificar sessão:', authError.message);
    } else if (session) {
      console.log('   ✅ Usuário autenticado:', session.user.email);
    } else {
      console.log('   ℹ️  Nenhum usuário autenticado (normal para teste)');
    }
    console.log('');
    
    // Resumo final
    console.log('========================================');
    console.log('  Resumo do Teste');
    console.log('========================================');
    console.log('✅ Conexão: OK');
    console.log(`📊 Tabelas: ${existingTables}/3`);
    
    if (existingTables === 3) {
      console.log('🎉 Banco de dados configurado corretamente!');
    } else {
      console.log('⚠️  Execute as migrações para criar as tabelas:');
      console.log('   supabase/migrations/001_initial_schema.sql');
    }
    
    console.log('========================================\n');
    
    if (existingTables < 3) {
      console.log('📝 Próximos passos:');
      console.log('   1. Acesse: https://zmowanlowqpioxbycead.supabase.co');
      console.log('   2. Vá em SQL Editor');
      console.log('   3. Execute: supabase/migrations/001_initial_schema.sql');
      console.log('   4. Execute: supabase/verify_setup.sql para verificar\n');
    }
    
  } catch (error) {
    console.error('\n❌ Erro no teste:', error.message);
    
    if (error.message.includes('Invalid API key') || error.message.includes('JWT')) {
      console.error('\n💡 A chave anon está incorreta ou expirada.');
      console.error('   Obtenha uma nova chave em:');
      console.error('   https://zmowanlowqpioxbycead.supabase.co/project/_/settings/api\n');
    } else if (error.message.includes('fetch')) {
      console.error('\n💡 Erro de rede. Verifique:');
      console.error('   - Sua conexão com a internet');
      console.error('   - Se a URL está correta\n');
    }
    
    process.exit(1);
  }
}

testConnection();

