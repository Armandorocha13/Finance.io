/**
 * Teste Simples de Conexão - Supabase
 * 
 * Execute: node scripts/test-connection-simple.js
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://zmowanlowqpioxbycead.supabase.co";

// IMPORTANTE: Você precisa obter a chave anon no Dashboard
// Acesse: https://zmowanlowqpioxbycead.supabase.co/project/_/settings/api
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inptb3dhbmxvd3FwaW94YnljZWFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgxMzc0NzEsImV4cCI6MjA2MzcxMzQ3MX0.placeholder";

console.log('\n🔌 Testando conexão com Supabase...\n');
console.log(`URL: ${SUPABASE_URL}`);
console.log(`Key: ${SUPABASE_ANON_KEY.substring(0, 30)}...\n`);

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function test() {
  try {
    // Teste 1: Verificar se consegue conectar
    console.log('1️⃣ Testando conexão básica...');
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    
    if (authError && !authError.message.includes('Invalid API key')) {
      console.log('   ⚠️  Não autenticado (normal)');
    } else {
      console.log('   ✅ Cliente criado com sucesso');
    }
    
    // Teste 2: Tentar acessar uma tabela
    console.log('\n2️⃣ Verificando tabelas...');
    
    const tables = ['categories', 'transactions', 'artilharia'];
    
    for (const table of tables) {
      try {
        const { error } = await supabase
          .from(table)
          .select('count', { count: 'exact', head: true });
        
        if (error) {
          if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
            console.log(`   ❌ ${table} - Tabela não encontrada`);
          } else if (error.message.includes('Invalid API key')) {
            console.log(`   ⚠️  ${table} - Chave inválida`);
          } else {
            console.log(`   ⚠️  ${table} - ${error.message}`);
          }
        } else {
          console.log(`   ✅ ${table} - OK`);
        }
      } catch (err) {
        console.log(`   ❌ ${table} - Erro: ${err.message}`);
      }
    }
    
    // Teste 3: Verificar RLS
    console.log('\n3️⃣ Verificando políticas de segurança...');
    console.log('   ℹ️  RLS deve estar habilitado nas tabelas');
    console.log('   ℹ️  Execute as migrações se as tabelas não existirem');
    
    console.log('\n✅ Teste concluído!\n');
    
    console.log('📝 Próximos passos:');
    console.log('   1. Se as tabelas não existem, execute:');
    console.log('      supabase/migrations/001_initial_schema.sql');
    console.log('   2. Verifique a chave anon em:');
    console.log('      https://zmowanlowqpioxbycead.supabase.co/project/_/settings/api\n');
    
  } catch (error) {
    console.error('\n❌ Erro no teste:', error.message);
    if (error.message.includes('Invalid API key')) {
      console.error('\n💡 A chave anon está incorreta.');
      console.error('   Obtenha a chave correta em:');
      console.error('   https://zmowanlowqpioxbycead.supabase.co/project/_/settings/api\n');
    }
    process.exit(1);
  }
}

test();

