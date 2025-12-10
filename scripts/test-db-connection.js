/**
 * Script de Teste de Conexão com Supabase (JavaScript)
 * 
 * Versão simplificada em JavaScript para execução rápida
 * 
 * Uso: node scripts/test-db-connection.js
 */

const SUPABASE_URL = "https://zmowanlowqpioxbycead.supabase.co";
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || "SUA_CHAVE_AQUI";

async function testConnection() {
  console.log('\n🔌 Testando conexão com Supabase...\n');
  console.log(`URL: ${SUPABASE_URL}`);
  console.log(`Key: ${SUPABASE_ANON_KEY.substring(0, 20)}...\n`);
  
  if (SUPABASE_ANON_KEY === 'SUA_CHAVE_AQUI') {
    console.error('❌ ERRO: Chave anon não configurada!');
    console.error('\n💡 Configure a variável VITE_SUPABASE_ANON_KEY');
    console.error('   Ou edite este arquivo com sua chave.\n');
    process.exit(1);
  }
  
  try {
    // Importa dinamicamente (se disponível)
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Teste básico
    const { data, error } = await supabase
      .from('transactions')
      .select('count', { count: 'exact', head: true });
    
    if (error) {
      if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
        console.log('⚠️  Tabela "transactions" não encontrada.');
        console.log('   Execute: supabase/migrations/001_initial_schema.sql\n');
        console.log('✅ Mas a conexão está funcionando!\n');
        return;
      }
      throw error;
    }
    
    console.log('✅ Conexão estabelecida com sucesso!');
    console.log(`   Total de transações: ${data || 0}\n`);
  } catch (error) {
    console.error('❌ Erro:', error.message);
    if (error.message.includes('Invalid API key')) {
      console.error('\n💡 Verifique a chave anon em:');
      console.error('   https://zmowanlowqpioxbycead.supabase.co/project/_/settings/api\n');
    }
    process.exit(1);
  }
}

testConnection();

